import type { createRepositories } from '../db/repositories';

// One-click email unsubscribe (spec §5.5, §7.3, SPEC-006, Phase 09 Task 3).
// A signed, stateless token carrying the email address — no server-side claim
// table needed, unlike the operator resend token: re-suppressing an address
// that's already suppressed is a harmless no-op (suppressionRepo.suppress is
// an upsert), so replay safety doesn't matter here the way it does for a
// side-effecting resend. GET verifies only (never suppresses — a mail
// scanner prefetching the link must not silently unsubscribe someone); POST
// is what both the automated List-Unsubscribe-Post one-click request and the
// confirm page's button use to actually suppress.

type Repos = ReturnType<typeof createRepositories>;

/** Generous TTL — this token rides inside an email that may sit unread for weeks. */
export const DEFAULT_UNSUBSCRIBE_TTL_MS = 180 * 24 * 60 * 60 * 1000;

export interface UnsubscribeTokenClaims {
  email: string;
  exp: number;
}

export interface MintUnsubscribeTokenOpts {
  secret: string;
  now: number;
  ttlMs?: number;
}

/** Mint a signed unsubscribe token (payload.signature, both base64url). */
export async function mintUnsubscribeToken(
  email: string,
  opts: MintUnsubscribeTokenOpts,
): Promise<string> {
  const claims: UnsubscribeTokenClaims = { email, exp: opts.now + (opts.ttlMs ?? DEFAULT_UNSUBSCRIBE_TTL_MS) };
  const payload = b64urlEncode(utf8(JSON.stringify(claims)));
  const sig = b64urlEncode(await hmac(opts.secret, payload));
  return `${payload}.${sig}`;
}

export type TokenVerifyReason = 'malformed' | 'bad_signature' | 'expired';
export type TokenVerification =
  | { ok: true; claims: UnsubscribeTokenClaims }
  | { ok: false; reason: TokenVerifyReason };

/** Verify signature + expiry WITHOUT suppressing — safe for a GET confirm page. */
export async function verifyUnsubscribeToken(
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

  let claims: UnsubscribeTokenClaims;
  try {
    claims = JSON.parse(utf8Decode(b64urlDecode(payload))) as UnsubscribeTokenClaims;
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (typeof claims?.email !== 'string' || typeof claims?.exp !== 'number') {
    return { ok: false, reason: 'malformed' };
  }
  if (now >= claims.exp) return { ok: false, reason: 'expired' };
  return { ok: true, claims };
}

export type UnsubscribeOutcome =
  | { status: 'ok'; email: string }
  | { status: 'invalid'; reason: TokenVerifyReason };

/** Authorize + apply the suppression. Called ONLY from POST (one-click or confirm-button). */
export async function authorizeUnsubscribe(
  token: unknown,
  repos: Repos,
  deps: { secret: string; now: number },
): Promise<UnsubscribeOutcome> {
  const v = await verifyUnsubscribeToken(token, deps.secret, deps.now);
  if (!v.ok) return { status: 'invalid', reason: v.reason };
  await repos.suppression.suppress('email', v.claims.email, deps.now, 'list_unsubscribe');
  return { status: 'ok', email: v.claims.email };
}

// ─── crypto + encoding helpers (portable: Workers + Node ≥20) ─────────────────
// Duplicated from dashboard.ts's resend-token helpers rather than shared —
// same small HMAC-token shape, different domain (email suppression vs.
// operator resend); not worth coupling two unrelated features to one module.

const utf8 = (s: string): Uint8Array => new TextEncoder().encode(s);
const utf8Decode = (b: Uint8Array): string => new TextDecoder().decode(b);

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
  return crypto.subtle.importKey('raw', ab(utf8(secret)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
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
