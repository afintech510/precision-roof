import { describe, it, expect } from 'vitest';
import { verifyCallrailSignature, computeCallrailSignature } from './callrail-signature';

// Direct unit coverage for the pure verifier, mirroring twilio-signature.test.ts —
// every route test signs fixtures with computeCallrailSignature but nothing exercises
// verifyCallrailSignature's own branches (missing header / good / tampered / wrong secret) in isolation.
const SECRET = 'cr_test_secret';
const BODY = JSON.stringify({ call_id: 'CAL123', duration: '45', answered: 'true' });

describe('CallRail signature', () => {
  it('verifies a correctly signed request', async () => {
    const sig = await computeCallrailSignature(SECRET, BODY);
    const res = await verifyCallrailSignature(SECRET, sig, BODY);
    expect(res).toEqual({ ok: true });
  });

  it('is case-insensitive on the hex signature', async () => {
    const sig = await computeCallrailSignature(SECRET, BODY);
    const res = await verifyCallrailSignature(SECRET, sig.toUpperCase(), BODY);
    expect(res).toEqual({ ok: true });
  });

  it('rejects a missing header', async () => {
    const res = await verifyCallrailSignature(SECRET, null, BODY);
    expect(res).toEqual({ ok: false, reason: 'missing' });
  });

  it('rejects an empty header', async () => {
    const res = await verifyCallrailSignature(SECRET, undefined, BODY);
    expect(res).toEqual({ ok: false, reason: 'missing' });
  });

  it('rejects a tampered body', async () => {
    const sig = await computeCallrailSignature(SECRET, BODY);
    const res = await verifyCallrailSignature(SECRET, sig, BODY + 'tampered');
    expect(res).toEqual({ ok: false, reason: 'bad_signature' });
  });

  it('rejects the wrong secret', async () => {
    const sig = await computeCallrailSignature(SECRET, BODY);
    const res = await verifyCallrailSignature('wrong-secret', sig, BODY);
    expect(res).toEqual({ ok: false, reason: 'bad_signature' });
  });
});
