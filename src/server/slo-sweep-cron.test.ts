import { describe, it, expect, afterEach, vi } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';

// Adapter test for the slo-sweep Cron Trigger's "never fail closed" guard
// (spec §3.2): a missing SMS_AUTHORITY binding or Twilio secret must skip the
// tick without touching D1, not throw. The sweep itself is covered by
// slo-sweep.test.ts against the pure core — this only exercises the adapter's
// wiring/guard, using a D1 stub that throws on any query so a guard bypass
// would fail loudly.
function throwingD1(): D1Database {
  return {
    prepare() {
      throw new Error('D1 should not be touched when config is missing');
    },
  } as unknown as D1Database;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('slo-sweep-cron — missing config guard', () => {
  it('skips without touching D1 when SMS_AUTHORITY is absent', async () => {
    const { scheduled } = await import('./slo-sweep-cron');
    const result = await scheduled({
      OP_STORE: throwingD1(),
      TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 'tok', TWILIO_FROM_NUMBER: '+15165550199',
    } as never);
    expect(result).toBeUndefined();
  });

  it('skips without touching D1 when Twilio secrets are absent', async () => {
    const { scheduled } = await import('./slo-sweep-cron');
    const result = await scheduled({
      OP_STORE: throwingD1(),
      SMS_AUTHORITY: { idFromName: () => 'id', get: () => ({}) },
    } as never);
    expect(result).toBeUndefined();
  });
});
