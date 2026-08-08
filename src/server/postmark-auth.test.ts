import { describe, it, expect } from 'vitest';
import { verifyPostmarkWebhookAuth } from './postmark-auth';

// Direct unit coverage for the pure verifier — postmark-route.test.ts exercises this
// through the route adapter, but nothing hits verifyPostmarkWebhookAuth's own
// missing/good/wrong-credential branches in isolation, unlike the HMAC verifiers
// in this file group (twilio/calcom/callrail-signature.test.ts).
const SECRET = 'hookuser:hookpass';

describe('Postmark webhook auth', () => {
  it('verifies correct Basic credentials', () => {
    const header = `Basic ${btoa(SECRET)}`;
    const res = verifyPostmarkWebhookAuth(SECRET, header);
    expect(res).toEqual({ ok: true });
  });

  it('rejects a missing header', () => {
    const res = verifyPostmarkWebhookAuth(SECRET, null);
    expect(res).toEqual({ ok: false, reason: 'missing' });
  });

  it('rejects an empty header', () => {
    const res = verifyPostmarkWebhookAuth(SECRET, undefined);
    expect(res).toEqual({ ok: false, reason: 'missing' });
  });

  it('rejects the wrong credentials', () => {
    const header = `Basic ${btoa('wronguser:wrongpass')}`;
    const res = verifyPostmarkWebhookAuth(SECRET, header);
    expect(res).toEqual({ ok: false, reason: 'bad_credentials' });
  });

  it('rejects a non-Basic scheme', () => {
    const res = verifyPostmarkWebhookAuth(SECRET, `Bearer ${btoa(SECRET)}`);
    expect(res).toEqual({ ok: false, reason: 'bad_credentials' });
  });
});
