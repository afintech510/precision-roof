import { describe, it, expect, afterEach, vi } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { scheduled } from './review-request-cron';

// Adapter test for the review-request Cron Trigger's "never fail closed on
// missing config" guard (spec §5.5, F-013): any of the 8 required secrets
// being absent must skip the tick without touching D1. The sweep itself is
// covered by review-request-sweep.test.ts against the pure core — this only
// exercises the adapter's guard, using a D1 stub that throws on any query so
// a guard bypass would fail loudly.
function throwingD1(): D1Database {
  return {
    prepare() {
      throw new Error('D1 should not be touched when config is missing');
    },
  } as unknown as D1Database;
}

const fullEnv = {
  OP_STORE: throwingD1(),
  TWILIO_ACCOUNT_SID: 'AC1', TWILIO_AUTH_TOKEN: 'tok', TWILIO_FROM_NUMBER: '+15165550199',
  POSTMARK_SERVER_TOKEN: 'pm-tok', EMAIL_FROM_ADDRESS: 'noreply@example.com',
  UNSUBSCRIBE_TOKEN_SECRET: 'shh', REVIEW_URL: 'https://example.com/review', SITE_ORIGIN: 'https://example.com',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('review-request-cron — missing config guard', () => {
  it.each(Object.keys(fullEnv).filter((k) => k !== 'OP_STORE'))(
    'skips without touching D1 when %s is absent',
    async (missingKey) => {
      const env = { ...fullEnv, [missingKey]: undefined };
      await expect(scheduled(env as never)).resolves.toBeUndefined();
    },
  );

  it('proceeds (touches D1) once all required config is present', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: true }))));
    await expect(scheduled({ ...fullEnv } as never)).rejects.toThrow(
      'D1 should not be touched when config is missing',
    );
  });
});
