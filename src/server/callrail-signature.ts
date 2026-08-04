// CallRail webhook signature verification (spec §3.2, §5.3 ANI-passthrough
// gate). CallRail signs post-call webhooks with `X-CallRail-Signature: <hex
// HMAC-SHA256 of the raw request body>` using the company's webhook secret —
// same shape as Cal.com's `X-Cal-Signature-256`. Pure so it unit-tests
// without a Worker runtime.
//
// // SPEC-AMBIGUITY: the exact header name/casing and hex-vs-base64 encoding
// aren't independently confirmed against a live CallRail account (no vendor
// key in this environment — spec §5.3 names ANI-passthrough itself, not the
// signature scheme, as the Phase-0 gate). This mirrors the documented
// HMAC-SHA256 scheme; re-verify against a real delivery once CallRail keys
// exist in Doppler, same as the other webhook verifiers in this file group.

export type CallrailSignatureFailure = 'missing' | 'bad_signature';
export type CallrailSignatureResult = { ok: true } | { ok: false; reason: CallrailSignatureFailure };

export async function verifyCallrailSignature(
  secret: string,
  header: string | null | undefined,
  rawBody: string,
): Promise<CallrailSignatureResult> {
  if (!header) return { ok: false, reason: 'missing' };
  const expected = await computeCallrailSignature(secret, rawBody);
  if (!timingSafeEqual(expected, header.trim().toLowerCase())) {
    return { ok: false, reason: 'bad_signature' };
  }
  return { ok: true };
}

/** Compute the expected signature — exported for tests to sign a fixture body. */
export async function computeCallrailSignature(secret: string, rawBody: string): Promise<string> {
  return hmacHex(secret, rawBody);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function ab(u8: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buf).set(u8);
  return buf;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    ab(enc.encode(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, ab(enc.encode(message))));
  return Array.from(sig).map((b) => b.toString(16).padStart(2, '0')).join('');
}
