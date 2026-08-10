import { describe, it, expect } from 'vitest';
import { checkRateLimit, rateLimitKey, type RateLimitStore } from './rate-limit';

function fakeStore(): RateLimitStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    async get(key) {
      return data.get(key) ?? null;
    },
    async put(key, value) {
      data.set(key, value);
    },
  };
}

describe('rateLimitKey', () => {
  it('namespaces by route and ip', () => {
    expect(rateLimitKey('quote', '1.2.3.4')).toBe('ratelimit:quote:1.2.3.4');
  });

  it('buckets missing/empty ip into a shared "unknown" key rather than exempting it', () => {
    expect(rateLimitKey('quote', null)).toBe('ratelimit:quote:unknown');
    expect(rateLimitKey('quote', undefined)).toBe('ratelimit:quote:unknown');
    expect(rateLimitKey('quote', '')).toBe('ratelimit:quote:unknown');
  });
});

describe('checkRateLimit', () => {
  const windowMs = 60_000;

  it('allows requests under the cap and decrements remaining', async () => {
    const store = fakeStore();
    const r1 = await checkRateLimit(store, 'k', { windowMs, max: 3, now: 0 });
    expect(r1).toEqual({ allowed: true, limit: 3, remaining: 2, resetAt: windowMs });
    const r2 = await checkRateLimit(store, 'k', { windowMs, max: 3, now: 1000 });
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);
  });

  it('blocks once the cap is reached within the same window', async () => {
    const store = fakeStore();
    await checkRateLimit(store, 'k', { windowMs, max: 2, now: 0 });
    await checkRateLimit(store, 'k', { windowMs, max: 2, now: 100 });
    const blocked = await checkRateLimit(store, 'k', { windowMs, max: 2, now: 200 });
    expect(blocked).toEqual({ allowed: false, limit: 2, remaining: 0, resetAt: windowMs });
  });

  it('resets once a new fixed window starts', async () => {
    const store = fakeStore();
    await checkRateLimit(store, 'k', { windowMs, max: 1, now: 0 });
    const blocked = await checkRateLimit(store, 'k', { windowMs, max: 1, now: 500 });
    expect(blocked.allowed).toBe(false);
    const nextWindow = await checkRateLimit(store, 'k', { windowMs, max: 1, now: windowMs + 1 });
    expect(nextWindow.allowed).toBe(true);
  });

  it('treats a non-numeric stored value as zero rather than propagating NaN', async () => {
    const store = fakeStore();
    store.data.set('k:0', 'not-a-number');
    const result = await checkRateLimit(store, 'k', { windowMs, max: 3, now: 0 });
    expect(result).toEqual({ allowed: true, limit: 3, remaining: 2, resetAt: windowMs });
  });

  it('keeps distinct keys independent', async () => {
    const store = fakeStore();
    await checkRateLimit(store, 'a', { windowMs, max: 1, now: 0 });
    const other = await checkRateLimit(store, 'b', { windowMs, max: 1, now: 0 });
    expect(other.allowed).toBe(true);
  });

  it('sets a TTL that expires at (or after) the window reset', async () => {
    const store = fakeStore();
    let capturedTtl: number | undefined;
    const spyStore: RateLimitStore = {
      get: store.get,
      put: async (key, value, opts) => {
        capturedTtl = opts?.expirationTtl;
        await store.put(key, value, opts);
      },
    };
    await checkRateLimit(spyStore, 'k', { windowMs, max: 5, now: 100 });
    expect(capturedTtl).toBeGreaterThan(0);
    expect(capturedTtl).toBeLessThanOrEqual(60);
  });
});
