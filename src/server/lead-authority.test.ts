import { describe, it, expect } from 'vitest';
import { reserveSmsSlot, shardIdForPhone, type AuthorityStorage } from './lead-authority';

// In-memory fake mirroring the subset of DurableObjectStorage the core uses —
// same get/put shape as the real `ctx.storage`, so these tests exercise the
// exact code path the DO adapter runs in production.
function fakeStorage(): AuthorityStorage {
  const map = new Map<string, unknown>();
  return {
    async get<T>(key: string) {
      return map.get(key) as T | undefined;
    },
    async put<T>(key: string, value: T) {
      map.set(key, value);
    },
  };
}

let tokenN = 0;
const genToken = () => `token-${++tokenN}`;

describe('reserveSmsSlot — suppression', () => {
  it('denies a suppressed phone without touching storage', async () => {
    const storage = fakeStorage();
    const result = await reserveSmsSlot(storage, { phoneE164: '+15165550100', now: 1000, isSuppressed: true }, { genToken });
    expect(result).toEqual({ allow: false, reason: 'suppressed' });
    expect(await storage.get('phone:+15165550100')).toBeUndefined();
  });
});

describe('reserveSmsSlot — per-phone 24h window', () => {
  it('allows the first reservation for a phone and returns a token', async () => {
    const storage = fakeStorage();
    const result = await reserveSmsSlot(storage, { phoneE164: '+15165550100', now: 1000, isSuppressed: false }, { genToken });
    expect(result.allow).toBe(true);
    if (result.allow) expect(result.token).toBeTruthy();
  });

  it('two concurrent (same-tick) reservations for the same phone → exactly one allow', async () => {
    const storage = fakeStorage();
    const input = { phoneE164: '+15165550100', now: 5000, isSuppressed: false };
    // Sequential calls simulate what the DO's single-threaded input gate
    // enforces for genuinely concurrent requests to the same DO instance.
    const first = await reserveSmsSlot(storage, input, { genToken });
    const second = await reserveSmsSlot(storage, input, { genToken });
    expect(first).toEqual({ allow: true, token: expect.any(String) });
    expect(second).toEqual({ allow: false, reason: 'rate_limited' });
  });

  it('denies a second send inside the 24h window, allows after it elapses', async () => {
    const storage = fakeStorage();
    const phoneE164 = '+15165550100';
    const t0 = 1_000_000;
    const windowMs = 24 * 60 * 60 * 1000;

    const first = await reserveSmsSlot(storage, { phoneE164, now: t0, isSuppressed: false }, { genToken });
    expect(first.allow).toBe(true);

    const tooSoon = await reserveSmsSlot(
      storage,
      { phoneE164, now: t0 + windowMs - 1, isSuppressed: false },
      { genToken },
    );
    expect(tooSoon).toEqual({ allow: false, reason: 'rate_limited' });

    const afterWindow = await reserveSmsSlot(
      storage,
      { phoneE164, now: t0 + windowMs + 1, isSuppressed: false },
      { genToken },
    );
    expect(afterWindow.allow).toBe(true);
  });

  it('does not consume the phone window when the reservation is denied on budget', async () => {
    const storage = fakeStorage();
    const phoneE164 = '+15165550100';
    // Exhaust the shared minute-bucket budget with other phones first.
    for (let i = 0; i < 5; i++) {
      const r = await reserveSmsSlot(storage, { phoneE164: `+1516555${1000 + i}`, now: 0, isSuppressed: false }, { genToken });
      expect(r.allow).toBe(true);
    }
    const denied = await reserveSmsSlot(storage, { phoneE164, now: 0, isSuppressed: false }, { genToken });
    expect(denied).toEqual({ allow: false, reason: 'budget_exceeded' });

    // Because the deny happened before any phone-state write, this phone's
    // very next attempt (once budget frees up) is evaluated fresh — not
    // treated as already having a live reservation.
    const nextMinute = await reserveSmsSlot(storage, { phoneE164, now: 60_000, isSuppressed: false }, { genToken });
    expect(nextMinute.allow).toBe(true);
  });
});

describe('reserveSmsSlot — sharded budget soft-cap', () => {
  it('allows up to minFloor sends per minute with no baseline yet', async () => {
    const storage = fakeStorage();
    for (let i = 0; i < 5; i++) {
      const r = await reserveSmsSlot(storage, { phoneE164: `+1516555${2000 + i}`, now: 0, isSuppressed: false }, { genToken });
      expect(r.allow).toBe(true);
    }
    const sixth = await reserveSmsSlot(storage, { phoneE164: '+15165552999', now: 0, isSuppressed: false }, { genToken });
    expect(sixth).toEqual({ allow: false, reason: 'budget_exceeded' });
  });

  it('raises the cap once a higher baseline is established (storm-surge headroom)', async () => {
    const storage = fakeStorage();
    // Establish a steady baseline of exactly minFloor (5) sends/minute across
    // several prior minutes — each minute's own cap is at least minFloor, so
    // these all succeed regardless of the ramping baseline.
    for (let minute = 1; minute <= 5; minute++) {
      for (let i = 0; i < 5; i++) {
        const r = await reserveSmsSlot(
          storage,
          { phoneE164: `+1516555${3000 + minute * 100 + i}`, now: minute * 60_000, isSuppressed: false },
          { genToken },
        );
        expect(r.allow).toBe(true);
      }
    }
    // Baseline ≈5, spikeMultiplier default 3 → cap ≈15 this minute — well above
    // the flat minFloor of 5, proving the cap actually raised with the baseline.
    const now = 6 * 60_000;
    let allowed = 0;
    for (let i = 0; i < 20; i++) {
      const r = await reserveSmsSlot(storage, { phoneE164: `+1516555${4000 + i}`, now, isSuppressed: false }, { genToken });
      if (r.allow) allowed++;
    }
    expect(allowed).toBeGreaterThan(5);
    expect(allowed).toBeLessThanOrEqual(15);
  });

  it('does not count denied attempts toward the current minute bucket', async () => {
    const storage = fakeStorage();
    for (let i = 0; i < 5; i++) {
      await reserveSmsSlot(storage, { phoneE164: `+1516555${5000 + i}`, now: 0, isSuppressed: false }, { genToken });
    }
    for (let i = 0; i < 10; i++) {
      await reserveSmsSlot(storage, { phoneE164: `+1516555${6000 + i}`, now: 0, isSuppressed: false }, { genToken });
    }
    const buckets = await storage.get<Array<{ bucket: number; count: number }>>('budget:buckets');
    expect(buckets).toEqual([{ bucket: 0, count: 5 }]);
  });
});

describe('shardIdForPhone', () => {
  it('is deterministic for the same phone', () => {
    expect(shardIdForPhone('+15165550100', 16)).toBe(shardIdForPhone('+15165550100', 16));
  });

  it('always returns an index within [0, shardCount)', () => {
    const phones = ['+15165550100', '+16315559999', '+19175551234', '+13475550000'];
    for (const phone of phones) {
      const shard = shardIdForPhone(phone, 8);
      expect(shard).toBeGreaterThanOrEqual(0);
      expect(shard).toBeLessThan(8);
    }
  });

  it('spreads distinct phones across more than one shard', () => {
    const shards = new Set(
      Array.from({ length: 50 }, (_, i) => shardIdForPhone(`+1516555${1000 + i}`, 16)),
    );
    expect(shards.size).toBeGreaterThan(1);
  });
});
