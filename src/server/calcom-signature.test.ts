import { describe, it, expect } from 'vitest';
import { verifyCalcomSignature, computeCalcomSignature } from './calcom-signature';

// Direct unit coverage for the pure verifier, mirroring twilio-signature.test.ts —
// every route test signs fixtures with computeCalcomSignature but nothing exercises
// verifyCalcomSignature's own branches (missing header / good / tampered / wrong secret) in isolation.
const SECRET = 'whsec_test_calcom';
const BODY = JSON.stringify({ triggerEvent: 'BOOKING_CREATED', payload: { uid: 'abc123' } });

describe('Cal.com signature', () => {
  it('verifies a correctly signed request', async () => {
    const sig = await computeCalcomSignature(SECRET, BODY);
    const res = await verifyCalcomSignature(SECRET, sig, BODY);
    expect(res).toEqual({ ok: true });
  });

  it('is case-insensitive on the hex signature', async () => {
    const sig = await computeCalcomSignature(SECRET, BODY);
    const res = await verifyCalcomSignature(SECRET, sig.toUpperCase(), BODY);
    expect(res).toEqual({ ok: true });
  });

  it('rejects a missing header', async () => {
    const res = await verifyCalcomSignature(SECRET, null, BODY);
    expect(res).toEqual({ ok: false, reason: 'missing' });
  });

  it('rejects an empty header', async () => {
    const res = await verifyCalcomSignature(SECRET, undefined, BODY);
    expect(res).toEqual({ ok: false, reason: 'missing' });
  });

  it('rejects a tampered body', async () => {
    const sig = await computeCalcomSignature(SECRET, BODY);
    const res = await verifyCalcomSignature(SECRET, sig, BODY + 'tampered');
    expect(res).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('rejects the wrong secret', async () => {
    const sig = await computeCalcomSignature(SECRET, BODY);
    const res = await verifyCalcomSignature('wrong-secret', sig, BODY);
    expect(res).toEqual({ ok: false, reason: 'bad_signature' });
  });
});
