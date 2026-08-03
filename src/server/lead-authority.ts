// Lead-authority core (spec §1.2, §3.1, [C2-003, C2-004, C2-033]) — the single
// concurrency authority `/api/lead` (and later the queue-worker send + the
// `slo-sweep` cron) calls once to atomically evaluate a phone's 24h send
// window and a sharded budget soft-cap, returning allow(+token)/deny. The
// `lead` table is evidence, never the gate — this is the gate.
//
// Storage is a tiny get/put seam (mirrors `SqlExecutor`) so the logic unit-tests
// with an in-memory fake; the production adapter is a thin Durable Object
// (`lead-authority-do.ts`) passing `this.ctx.storage` straight through — the
// DO's single-threaded input gate is what makes the read-then-write sequence
// below atomic per phone, without needing an explicit `transaction()` call.
//
// Suppression is NOT re-derived here: the caller reads `suppression` from D1
// and passes `isSuppressed` in, so a denied reservation never touches phone or
// budget state. The authoritative, race-closing suppression re-check happens
// at send time via `repos.lead.claimForSms` (src/db/repositories.ts) — that
// atomic D1 claim is what aborts an in-flight send if a STOP lands after the
// allow-token was issued but before queue delivery (spec §3.1 send-time
// symmetry). The DO does not need to duplicate that check to satisfy it.

export interface AuthorityStorage {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
}

const DEFAULT_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface BudgetConfig {
  /** How many trailing 1-minute buckets feed the rolling baseline. */
  windowMinutes: number;
  /** Cap = max(minFloor, round(baseline * spikeMultiplier)) — anomaly/rate-based, not a flat ceiling (spec §3.1). */
  spikeMultiplier: number;
  /** Always-allowed floor per minute regardless of baseline — storm-surge headroom. */
  minFloor: number;
}

const DEFAULT_BUDGET: BudgetConfig = { windowMinutes: 30, spikeMultiplier: 3, minFloor: 5 };

interface BudgetBucket {
  bucket: number; // Math.floor(epochMs / 60_000)
  count: number;
}

interface PhoneRecord {
  lastAllowedAt: number;
}

export interface ReserveInput {
  phoneE164: string;
  now: number;
  isSuppressed: boolean;
}

export interface ReserveDeps {
  genToken: () => string;
  windowMs?: number;
  budget?: BudgetConfig;
}

export type DenyReason = 'suppressed' | 'rate_limited' | 'budget_exceeded';
export type ReserveResult = { allow: true; token: string } | { allow: false; reason: DenyReason };

const phoneKey = (phoneE164: string) => `phone:${phoneE164}`;
const BUCKETS_KEY = 'budget:buckets';

/**
 * Atomically evaluate + reserve one SMS slot for a phone. Every check is a
 * read; state is only written once every check has passed, so a denial (e.g.
 * budget) never consumes the phone's window claim — a later, actually-sent
 * reservation for that phone still gets its full 24h window.
 */
export async function reserveSmsSlot(
  storage: AuthorityStorage,
  input: ReserveInput,
  deps: ReserveDeps,
): Promise<ReserveResult> {
  if (input.isSuppressed) return { allow: false, reason: 'suppressed' };

  const windowMs = deps.windowMs ?? DEFAULT_WINDOW_MS;
  const pKey = phoneKey(input.phoneE164);
  const phoneRec = await storage.get<PhoneRecord>(pKey);
  if (phoneRec && input.now - phoneRec.lastAllowedAt < windowMs) {
    return { allow: false, reason: 'rate_limited' };
  }

  const budget = deps.budget ?? DEFAULT_BUDGET;
  const bucket = Math.floor(input.now / 60_000);
  const buckets = (await storage.get<BudgetBucket[]>(BUCKETS_KEY)) ?? [];
  const recent = buckets.filter((b) => b.bucket < bucket && b.bucket > bucket - budget.windowMinutes);
  const baseline = recent.length ? recent.reduce((sum, b) => sum + b.count, 0) / recent.length : 0;
  const cap = Math.max(budget.minFloor, Math.round(baseline * budget.spikeMultiplier));
  const currentCount = buckets.find((b) => b.bucket === bucket)?.count ?? 0;
  if (currentCount + 1 > cap) {
    return { allow: false, reason: 'budget_exceeded' };
  }

  await storage.put(pKey, { lastAllowedAt: input.now } satisfies PhoneRecord);

  const kept = buckets.filter((b) => b.bucket >= bucket - budget.windowMinutes && b.bucket !== bucket);
  kept.push({ bucket, count: currentCount + 1 });
  await storage.put(BUCKETS_KEY, kept);

  return { allow: true, token: deps.genToken() };
}

/**
 * Deterministic phone → shard index, so the same phone always routes to the
 * same Durable Object instance (giving per-phone serialization for free from
 * the DO's input gate) while spreading the sharded budget soft-cap across
 * many instances instead of one hot global object (spec §1.2 [C2-033]).
 */
export function shardIdForPhone(phoneE164: string, shardCount: number): number {
  let hash = 0;
  for (let i = 0; i < phoneE164.length; i++) {
    hash = (Math.imul(hash, 31) + phoneE164.charCodeAt(i)) >>> 0;
  }
  return hash % shardCount;
}

/** Shard count for the LEAD_AUTHORITY DO namespace — shared by the route and its tests. */
export const DEFAULT_SHARD_COUNT = 16;

/**
 * The narrow surface `/api/lead` needs from the `LEAD_AUTHORITY` Durable Object
 * binding — deliberately NOT Cloudflare's generic `DurableObjectNamespace<T>`
 * RPC-branded type (that generic resolves through `Rpc.DurableObjectBranded`
 * plumbing that adds real typecheck risk for no benefit here, since this repo
 * hand-rolls its types rather than leaning on generics — see quote.ts/east-end-
 * gate.ts). A route test supplies a plain object shaped like this; the real
 * runtime binding satisfies it structurally.
 */
export interface LeadAuthorityBinding {
  idFromName(name: string): unknown;
  get(id: unknown): { reserve(input: ReserveInput): Promise<ReserveResult> };
}
