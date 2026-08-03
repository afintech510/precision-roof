// Public-endpoint rate-limit hardening (spec §3.3, §8, Phase 08 Task 2). A
// pure fixed-window counter over a minimal KV-shaped store, so it unit-tests
// without a real Cloudflare binding. Fixed-window (not sliding/token-bucket)
// is deliberate: KV is eventually consistent, so anything relying on precise
// ordering across reads would be unreliable — a coarse per-minute cap is
// exactly the abuse-prevention granularity §3.3 asks for, and tolerates that.

export interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  now: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Epoch-ms the current window resets. */
  resetAt: number;
}

/** `${route}:${ip}` — call-site chooses the identity component; `ip` may be
 * `null` (no `clientAddress`, e.g. local dev) and is normalized to a single
 * shared bucket rather than silently exempting unidentified traffic. */
export function rateLimitKey(route: string, ip: string | null | undefined): string {
  return `ratelimit:${route}:${ip && ip.trim() !== '' ? ip : 'unknown'}`;
}

export async function checkRateLimit(
  store: RateLimitStore,
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const windowStart = Math.floor(opts.now / opts.windowMs) * opts.windowMs;
  const resetAt = windowStart + opts.windowMs;
  const storeKey = `${key}:${windowStart}`;

  const raw = await store.get(storeKey);
  const count = raw ? parseInt(raw, 10) || 0 : 0;

  if (count >= opts.max) {
    return { allowed: false, limit: opts.max, remaining: 0, resetAt };
  }

  const next = count + 1;
  const ttlSeconds = Math.max(1, Math.ceil((resetAt - opts.now) / 1000));
  await store.put(storeKey, String(next), { expirationTtl: ttlSeconds });
  return { allowed: true, limit: opts.max, remaining: opts.max - next, resetAt };
}
