import { describe, it, expect } from 'vitest';
import { verifyTwilioSignature, computeTwilioSignature } from './twilio-signature';

// Canonical example from Twilio's request-validation documentation, used to
// prove our HMAC-SHA1 implementation matches Twilio's exactly.
const AUTH_TOKEN = '12345';
const URL = 'https://example.com/myapp.php?foo=1&bar=2';
const PARAMS = {
  CallSid: 'CA1234567890ABCDE',
  Caller: '+14158675310',
  Digits: '1234',
  From: '+14158675310',
  To: '+18005551212',
};
const EXPECTED_SIGNATURE = 'L/OH5YylLD5NRKLltdqwSvS0BnU=';

describe('Twilio signature', () => {
  it('matches Twilio\'s documented example vector', async () => {
    const sig = await computeTwilioSignature(AUTH_TOKEN, URL, PARAMS);
    expect(sig).toBe(EXPECTED_SIGNATURE);
  });

  it('verifies a correctly signed request', async () => {
    const res = await verifyTwilioSignature(AUTH_TOKEN, EXPECTED_SIGNATURE, URL, PARAMS);
    expect(res).toEqual({ ok: true });
  });

  it('rejects a missing header', async () => {
    const res = await verifyTwilioSignature(AUTH_TOKEN, null, URL, PARAMS);
    expect(res).toEqual({ ok: false, reason: 'missing' });
  });

  it('rejects a tampered param', async () => {
    const res = await verifyTwilioSignature(AUTH_TOKEN, EXPECTED_SIGNATURE, URL, { ...PARAMS, Digits: '9999' });
    expect(res).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('rejects the wrong auth token', async () => {
    const res = await verifyTwilioSignature('wrong-token', EXPECTED_SIGNATURE, URL, PARAMS);
    expect(res).toEqual({ ok: false, reason: 'bad_signature' });
  });
});
