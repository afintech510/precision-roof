import type { createRepositories, LeadRow } from '../db/repositories';

// Operator dashboard core (spec §7.1, §2.5, F-023). Pure logic over the repos so
// it unit-tests without a Worker runtime; the auth-gated routes (Cloudflare
// Access/OIDC + MFA) added with the SSR/deploy wiring are thin adapters that
// supply D1 repos + the request ip/operator identity.
//
// CRITICALs enforced here:
//  - Every read of lead PII writes an `operator_access_log` row [C2-027].
//  - The emailed resend link is a single-use, short-TTL HMAC-signed token; a GET
//    must never resend. `verifyResendToken` is a pure read (safe for the confirm
//    page); `authorizeResend` performs the single-use claim and is called ONLY
//    from the authenticated POST. The actual send goes through the Phase-05b
//    DO+Queue path (which honors suppression/per-phone cap) — not from here.

type Repos = ReturnType<typeof createRepositories>;

export interface OperatorContext {
  operatorId: string;
  ip?: string | null;
}
export interface DashboardDeps {
  now: number;
  newId: () => string;
}

// ─── Audited PII reads ───────────────────────────────────────────────────────

/**
 * Read one lead's full record, writing an `operator_access_log` row whenever PII
 * is actually returned. Returns undefined (and logs nothing) when the lead does
 * not exist — no PII was exposed.
 */
export async function viewLead(
  repos: Repos,
  op: OperatorContext,
  leadId: string,
  deps: DashboardDeps,
): Promise<LeadRow | undefined> {
  const lead = await repos.lead.getById(leadId);
  if (!lead) return undefined;
  await logAccess(repos, op, 'view_lead', leadId, deps);
  return lead;
}

/**
 * The failed-send queue: leads stuck in `failed_followup` needing manual resend.
 * Each returned lead exposes PII (name/phone), so each gets its own access-log
 * row (spec §7.1, §8).
 */
export async function listFailedSends(
  repos: Repos,
  op: OperatorContext,
  deps: DashboardDeps,
): Promise<LeadRow[]> {
  const leads = await repos.lead.listByStatus('failed_followup');
  for (const lead of leads) {
    await logAccess(repos, op, 'view_failed_send', lead.id, deps);
  }
  return leads;
}

async function logAccess(
  repos: Repos,
  op: OperatorContext,
  action: string,
  leadId: string | null,
  deps: DashboardDeps,
): Promise<void> {
  await repos.operatorAccessLog.log({
    id: deps.newId(),
    operatorId: op.operatorId,
    action,
    leadId,
    accessedAt: deps.now,
    ip: op.ip ?? null,
  });
}

// ─── Single-use, short-TTL signed resend token ───────────────────────────────

/** Default short TTL for a resend link: 15 minutes (spec §7.1 "short-TTL"). */
export const DEFAULT_RESEND_TTL_MS = 15 * 60 * 1000;

export interface ResendTokenClaims {
  /** Unique token id — the single-use key claimed in `resend_token`. */
  jti: string;
  leadId: string;
  /** The failed message_log row this resend targets. */
  messageLogId: string;
  /** Absolute expiry, epoch-ms. */
  exp: number;
}

export interface MintResendTokenInput {
  leadId: string;
  messageLogId: string;
}
export interface MintResendTokenOpts {
  secret: string;
  now: number;
  newId: () => string;
  ttlMs?: number;
}

/** Mint a signed resend token (payload.signature, both base64url). */
export async function mintResendToken(
  input: MintResendTokenInput,
  opts: MintResendTokenOpts,
): Promise<{ token: string; claims: ResendTokenClaims }> {
  const claims: ResendTokenClaims = {
    jti: opts.newId(),
    leadId: input.leadId,
    messageLogId: input.messageLogId,
    exp: opts.now + (opts.ttlMs ?? DEFAULT_RESEND_TTL_MS),
  };
  const payload = b64urlEncode(utf8(JSON.stringify(claims)));
  const sig = b64urlEncode(await hmac(opts.secret, payload));
  return { token: `${payload}.${sig}`, claims };
}

export type TokenVerifyReason = 'malformed' | 'bad_signature' | 'expired';
export type TokenVerification =
  | { ok: true; claims: ResendTokenClaims }
  | { ok: false; reason: TokenVerifyReason };

/**
 * Verify signature + expiry WITHOUT consuming the token — pure/side-effect-free,
 * so the emailed link's GET confirm page can safely check validity before the
 * operator commits. It NEVER resends. Signature check is constant-time
 * (crypto.subtle.verify).
 */
export async function verifyResendToken(
  token: unknown,
  secret: string,
  now: number,
): Promise<TokenVerification> {
  if (typeof token !== 'string') return { ok: false, reason: 'malformed' };
  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return { ok: false, reason: 'malformed' };
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let sigBytes: Uint8Array;
  try {
    sigBytes = b64urlDecode(sig);
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  const valid = await hmacVerify(secret, payload, sigBytes);
  if (!valid) return { ok: false, reason: 'bad_signature' };

  let claims: ResendTokenClaims;
  try {
    claims = JSON.parse(utf8Decode(b64urlDecode(payload))) as ResendTokenClaims;
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (
    typeof claims?.jti !== 'string' ||
    typeof claims?.leadId !== 'string' ||
    typeof claims?.messageLogId !== 'string' ||
    typeof claims?.exp !== 'number'
  ) {
    return { ok: false, reason: 'malformed' };
  }
  if (now >= claims.exp) return { ok: false, reason: 'expired' };
  return { ok: true, claims };
}

export type ResendAuthorization =
  | { status: 'ok'; claims: ResendTokenClaims }
  | { status: 'invalid'; reason: TokenVerifyReason }
  | { status: 'replayed' };

/**
 * Authorize a resend from the authenticated POST ONLY. Verifies the token, then
 * atomically claims its jti so it can be used exactly once — a replay resolves
 * to `replayed` and MUST NOT resend. On `ok`, the caller dispatches through the
 * Phase-05b DO+Queue send path (suppression/per-phone cap enforced there).
 */
export async function authorizeResend(
  token: unknown,
  repos: Repos,
  deps: { secret: string; now: number },
): Promise<ResendAuthorization> {
  const v = await verifyResendToken(token, deps.secret, deps.now);
  if (!v.ok) return { status: 'invalid', reason: v.reason };
  const claimed = await repos.resendToken.claim(v.claims.jti, v.claims.leadId, deps.now);
  if (!claimed) return { status: 'replayed' };
  return { status: 'ok', claims: v.claims };
}

// ─── crypto + encoding helpers (portable: Workers + Node ≥20) ─────────────────

const utf8 = (s: string): Uint8Array => new TextEncoder().encode(s);
const utf8Decode = (b: Uint8Array): string => new TextDecoder().decode(b);

/** Copy into a fresh, non-shared ArrayBuffer so it satisfies the strict BufferSource type. */
function ab(u8: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buf).set(u8);
  return buf;
}

function b64urlEncode(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(str)) throw new Error('invalid base64url');
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    ab(utf8(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, ab(utf8(message)));
  return new Uint8Array(sig);
}

async function hmacVerify(secret: string, message: string, signature: Uint8Array): Promise<boolean> {
  const key = await importKey(secret);
  return crypto.subtle.verify('HMAC', key, ab(signature), ab(utf8(message)));
}
