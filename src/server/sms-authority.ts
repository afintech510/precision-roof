import type { SqlExecutor } from '../db/executor';

// SMS-send concurrency authority (spec §1.2, §3.1, [C2-001/003/004], BUILDPLAN
// Phase 05b Task 3). This is the pure core the Durable Object wraps — it owns
// ONLY the DO's own SQLite storage (never D1 directly); suppression is checked
// by calling the injected `isSuppressed` dependency, which the DO wires to a D1
// read. Because a DO instance serializes every call to itself, the
// check-then-write sequence below is the single point of atomicity spec calls
// for — even though suppression lives in a different store than the DO's own
// tables.
//
// Two operations, one row per lead in `allow_token`:
//   reserve()   — called once by /api/lead (or once by slo-sweep, standing in
//                 for a lead whose original reserve never happened/succeeded).
//                 Atomically checks suppression + the per-phone 24h window +
//                 the budget, and on success commits the phone-window claim and
//                 issues a token. This IS the honest channel (sms|callback)
//                 decision.
//   claimSend() — called at actual send time by BOTH the queue consumer and
//                 slo-sweep ("identical to the primary path", spec §3.1). Looks
//                 up the lead's stored token, re-consults suppression fresh
//                 (closing the STOP-after-reserve race), and consumes the token
//                 exactly once — a second caller (queue vs sweep racing the same
//                 lead) sees it already consumed and is denied. Never re-applies
//                 the phone-window rule (already granted by reserve()).

export const SMS_AUTHORITY_SCHEMA = `
CREATE TABLE IF NOT EXISTS phone_window (
  phone_e164  TEXT PRIMARY KEY,
  reserved_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS allow_token (
  lead_id     TEXT PRIMARY KEY,
  phone_e164  TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  issued_at   INTEGER NOT NULL,
  consumed_at INTEGER
);
CREATE TABLE IF NOT EXISTS budget_minute (
  minute_bucket INTEGER NOT NULL,
  shard         INTEGER NOT NULL,
  count         INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (minute_bucket, shard)
);
CREATE TABLE IF NOT EXISTS budget_override (
  id    INTEGER PRIMARY KEY CHECK (id = 1),
  state TEXT NOT NULL CHECK (state IN ('auto','disabled','forced_allow')) DEFAULT 'auto'
);
`;

/** Per-phone anti-spam / rate-limit window (spec §3.1 "per-phone 24h window"). */
export const PHONE_WINDOW_MS = 24 * 60 * 60 * 1000;
/** How long a reservation stays claimable before it's considered stale. Generous
 * relative to expected queue latency (seconds) — this is a safety bound, not the
 * primary defense (claimSend's consumed_at is what prevents double-send). */
export const RESERVATION_TTL_MS = 48 * 60 * 60 * 1000;

// Budget is an approximate, anomaly-based soft-cap (spec §3.1, [C2-012, C2-033])
// — sharded across N counters per minute-bucket so no single row is a write
// hotspot, and compared against a trailing baseline rather than a flat ceiling
// so storm-surge demand isn't throttled at exactly the moment it matters. This
// is NOT an exact global guarantee (BUILDPLAN Phase 05b Task 3) — the operator
// override is the true ceiling.
const BUDGET_SHARDS = 8;
const BASELINE_WINDOW_MINUTES = 30;
const SPIKE_MULTIPLIER = 5;
/** Floor so the very first minutes of an empty baseline don't trip on tiny absolute counts. */
const MIN_BASELINE_FLOOR = 5;

function shardFor(phoneE164: string): number {
  let h = 0;
  for (let i = 0; i < phoneE164.length; i++) h = (h * 31 + phoneE164.charCodeAt(i)) >>> 0;
  return h % BUDGET_SHARDS;
}

async function getOverrideState(storage: SqlExecutor): Promise<'auto' | 'disabled' | 'forced_allow'> {
  const row = await storage.get<{ state: 'auto' | 'disabled' | 'forced_allow' }>(
    `SELECT state FROM budget_override WHERE id = 1`,
  );
  return row?.state ?? 'auto';
}

/** Fast operator override (spec §3.1 "fast operator override"): 'disabled' blocks
 * every reservation regardless of anomaly math; 'forced_allow' grants storm-surge
 * headroom by skipping the anomaly check; 'auto' (default) runs the anomaly math. */
export async function setBudgetOverride(
  storage: SqlExecutor,
  state: 'auto' | 'disabled' | 'forced_allow',
): Promise<void> {
  await storage.run(
    `INSERT INTO budget_override (id, state) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET state = excluded.state`,
    [state],
  );
}

/**
 * Check the current minute against the trailing baseline and, if healthy,
 * increment this send's shard. Returns false (deny) without incrementing when
 * the override is 'disabled' or the anomaly threshold is exceeded.
 */
async function checkAndReserveBudget(
  storage: SqlExecutor,
  phoneE164: string,
  now: number,
): Promise<boolean> {
  const override = await getOverrideState(storage);
  if (override === 'disabled') return false;
  if (override === 'forced_allow') {
    await incrementBudgetShard(storage, phoneE164, now);
    return true;
  }

  const minuteBucket = Math.floor(now / 60_000);
  const currentRows = await storage.all<{ count: number }>(
    `SELECT count FROM budget_minute WHERE minute_bucket = ?`,
    [minuteBucket],
  );
  const currentTotal = currentRows.reduce((s, r) => s + r.count, 0);

  const baselineRows = await storage.all<{ minute_bucket: number; count: number }>(
    `SELECT minute_bucket, count FROM budget_minute WHERE minute_bucket < ? AND minute_bucket >= ?`,
    [minuteBucket, minuteBucket - BASELINE_WINDOW_MINUTES],
  );
  const baselineTotal = baselineRows.reduce((s, r) => s + r.count, 0);
  const baselineAvgPerMinute = baselineTotal / BASELINE_WINDOW_MINUTES;
  const threshold = Math.max(MIN_BASELINE_FLOOR, baselineAvgPerMinute * SPIKE_MULTIPLIER);

  if (currentTotal + 1 > threshold) return false;

  await incrementBudgetShard(storage, phoneE164, now);
  return true;
}

async function incrementBudgetShard(storage: SqlExecutor, phoneE164: string, now: number): Promise<void> {
  const minuteBucket = Math.floor(now / 60_000);
  const shard = shardFor(phoneE164);
  await storage.run(
    `INSERT INTO budget_minute (minute_bucket, shard, count) VALUES (?,?,1)
     ON CONFLICT(minute_bucket, shard) DO UPDATE SET count = count + 1`,
    [minuteBucket, shard],
  );
}

export type ReserveDenyReason = 'suppressed' | 'per_phone_window' | 'budget_anomaly';
export type ReserveOutcome = { allow: true; token: string } | { allow: false; reason: ReserveDenyReason };

export type ClaimDenyReason = ReserveDenyReason | 'no_reservation' | 'already_sent';
export type ClaimOutcome = { allow: true } | { allow: false; reason: ClaimDenyReason };

export interface SmsAuthorityDeps {
  now: number;
  newId: () => string;
  isSuppressed: (phoneE164: string) => Promise<boolean>;
}

/**
 * Atomically evaluate + reserve a single-phone SMS send. Called once by the
 * lead-intake route (the honest channel decision) and, for a lead whose
 * original reservation never happened or was denied, once more by slo-sweep
 * standing in for that missed reservation (spec §3.1 "both reserve through the
 * DO"). A second reserve() for the same still-open phone window (e.g. a
 * concurrent same-phone submit, or a live submit racing slo-sweep) is denied —
 * that's the single-serialization-point guarantee.
 */
export async function reserveSmsSend(
  input: { phoneE164: string; leadId: string },
  storage: SqlExecutor,
  deps: SmsAuthorityDeps,
): Promise<ReserveOutcome> {
  if (await deps.isSuppressed(input.phoneE164)) return { allow: false, reason: 'suppressed' };

  const window = await storage.get<{ reserved_at: number }>(
    `SELECT reserved_at FROM phone_window WHERE phone_e164 = ?`,
    [input.phoneE164],
  );
  if (window && deps.now - window.reserved_at < PHONE_WINDOW_MS) {
    return { allow: false, reason: 'per_phone_window' };
  }

  const budgetOk = await checkAndReserveBudget(storage, input.phoneE164, deps.now);
  if (!budgetOk) return { allow: false, reason: 'budget_anomaly' };

  await storage.run(
    `INSERT INTO phone_window (phone_e164, reserved_at) VALUES (?,?)
     ON CONFLICT(phone_e164) DO UPDATE SET reserved_at = excluded.reserved_at`,
    [input.phoneE164, deps.now],
  );

  const token = deps.newId();
  await storage.run(
    `INSERT INTO allow_token (lead_id, phone_e164, token, issued_at) VALUES (?,?,?,?)
     ON CONFLICT(lead_id) DO UPDATE SET phone_e164 = excluded.phone_e164, token = excluded.token,
       issued_at = excluded.issued_at, consumed_at = NULL`,
    [input.leadId, input.phoneE164, token, deps.now],
  );
  return { allow: true, token };
}

/**
 * Consume a lead's stored reservation at actual send time — the "send-time
 * re-check" symmetric across the queue consumer and slo-sweep (spec §3.1). Re-
 * checks suppression fresh (closes the STOP-after-reserve race) and consumes
 * the token exactly once, so a queue-consumer/slo-sweep race on the same lead
 * yields exactly one `allow: true`.
 */
export async function claimSmsSend(
  input: { leadId: string; phoneE164: string },
  storage: SqlExecutor,
  deps: SmsAuthorityDeps,
): Promise<ClaimOutcome> {
  const row = await storage.get<{ phone_e164: string; consumed_at: number | null; issued_at: number }>(
    `SELECT phone_e164, consumed_at, issued_at FROM allow_token WHERE lead_id = ?`,
    [input.leadId],
  );
  if (!row || row.phone_e164 !== input.phoneE164) return { allow: false, reason: 'no_reservation' };
  if (row.consumed_at !== null) return { allow: false, reason: 'already_sent' };
  if (deps.now - row.issued_at > RESERVATION_TTL_MS) return { allow: false, reason: 'no_reservation' };

  if (await deps.isSuppressed(input.phoneE164)) {
    await storage.run(`UPDATE allow_token SET consumed_at = ? WHERE lead_id = ?`, [deps.now, input.leadId]);
    return { allow: false, reason: 'suppressed' };
  }

  const claim = await storage.run(
    `UPDATE allow_token SET consumed_at = ? WHERE lead_id = ? AND consumed_at IS NULL`,
    [deps.now, input.leadId],
  );
  if (claim.changes !== 1) return { allow: false, reason: 'already_sent' };
  return { allow: true };
}
