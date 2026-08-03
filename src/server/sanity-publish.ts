import type { createRepositories } from '../db/repositories';
import {
  buildPricingBlob,
  writePricingBlob,
  type KVStore,
  type SourcePricingRow,
} from './pricing-blob';

// sanity-publish webhook core (spec §3.2 [C2-023]). Verifies + dedupes the
// webhook, rematerializes the pricing blob into KV, and records blob_built_at.
// Pure logic over repos + a KVStore so it unit-tests with an in-memory KV; the
// route verifies the Sanity signature and supplies D1 repos + the KV binding.

type Repos = ReturnType<typeof createRepositories>;

export interface SanityPublishInput {
  /** Sanity document revision — the idempotency key so a redelivery is a no-op. */
  rev: string;
  /** Priced combos to rebuild the blob from (fetched by the route via Sanity API). */
  rows: SourcePricingRow[];
}

export interface SanityPublishDeps {
  now: number;
}

export interface SanityPublishResult {
  processed: boolean; // false = duplicate delivery, skipped
  builtAt?: number;
  combos?: number;
}

export async function handleSanityPublish(
  input: SanityPublishInput,
  ctx: { repos: Repos; kv: KVStore; deps: SanityPublishDeps },
): Promise<SanityPublishResult> {
  const { repos, kv, deps } = ctx;

  // 1) Idempotency — a redelivered publish for the same rev must not rebuild twice.
  const fresh = await repos.webhookEvents.claim(input.rev, 'sanity_publish', deps.now, 'publish');
  if (!fresh) return { processed: false };

  // 2) Rematerialize the blob and cache it (blob_built_at travels inside the blob).
  const blob = buildPricingBlob(input.rows, deps.now);
  await writePricingBlob(kv, blob);

  await repos.webhookEvents.markProcessed(input.rev, deps.now);
  return { processed: true, builtAt: blob.builtAt, combos: Object.keys(blob.ranges).length };
}

// ── Sanity webhook signature ─────────────────────────────────────────────────
// Sanity signs with `sanity-webhook-signature: t=<unixSeconds>,v1=<base64url hmac>`
// where the signed payload is `${t}.${rawBody}` (HMAC-SHA256 of the secret).

export type SignatureFailure = 'missing' | 'malformed' | 'bad_signature' | 'stale';
export type SignatureResult = { ok: true } | { ok: false; reason: SignatureFailure };

/** Default replay window: 5 minutes (spec §3.3 webhook verification). */
export const DEFAULT_SIG_TOLERANCE_MS = 5 * 60 * 1000;

export async function verifySanitySignature(
  secret: string,
  header: string | null | undefined,
  rawBody: string,
  now: number,
  toleranceMs: number = DEFAULT_SIG_TOLERANCE_MS,
): Promise<SignatureResult> {
  if (!header) return { ok: false, reason: 'missing' };
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const i = kv.indexOf('=');
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    }),
  );
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1 || !/^\d+$/.test(t)) return { ok: false, reason: 'malformed' };

  const tsMs = Number(t) * 1000;
  if (Math.abs(now - tsMs) > toleranceMs) return { ok: false, reason: 'stale' };

  const expected = await hmacB64url(secret, `${t}.${rawBody}`);
  // Constant-time-ish compare on equal-length base64url strings.
  if (!timingSafeEqual(expected, v1)) return { ok: false, reason: 'bad_signature' };
  return { ok: true };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacB64url(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const toBuf = (u8: Uint8Array): ArrayBuffer => {
    const buf = new ArrayBuffer(u8.byteLength);
    new Uint8Array(buf).set(u8);
    return buf;
  };
  const key = await crypto.subtle.importKey(
    'raw',
    toBuf(enc.encode(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, toBuf(enc.encode(message))));
  let s = '';
  for (const byte of sig) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
