// Cal.com webhook signature verification (spec §3.2). Cal.com signs with
// `X-Cal-Signature-256: <hex HMAC-SHA256 of the raw request body>` using the
// webhook secret. Pure so it unit-tests without a Worker runtime.

export type CalcomSignatureFailure = 'missing' | 'bad_signature';
export type CalcomSignatureResult = { ok: true } | { ok: false; reason: CalcomSignatureFailure };

export async function verifyCalcomSignature(
  secret: string,
  header: string | null | undefined,
  rawBody: string,
): Promise<CalcomSignatureResult> {
  if (!header) return { ok: false, reason: 'missing' };
  const expected = await computeCalcomSignature(secret, rawBody);
  if (!timingSafeEqual(expected, header.trim().toLowerCase())) {
    return { ok: false, reason: 'bad_signature' };
  }
  return { ok: true };
}

/** Compute the expected signature — exported for tests to sign a fixture body. */
export async function computeCalcomSignature(secret: string, rawBody: string): Promise<string> {
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
