// Twilio request signature verification (spec §3.2). Twilio signs with
// `X-Twilio-Signature: base64(HMAC-SHA1(authToken, url + sorted-and-concatenated
// POST params))` — the exact algorithm from Twilio's request validation docs.
// Pure so it unit-tests without a Worker runtime.

export type TwilioSignatureFailure = 'missing' | 'bad_signature';
export type TwilioSignatureResult = { ok: true } | { ok: false; reason: TwilioSignatureFailure };

export async function verifyTwilioSignature(
  authToken: string,
  header: string | null | undefined,
  url: string,
  params: Record<string, string>,
): Promise<TwilioSignatureResult> {
  if (!header) return { ok: false, reason: 'missing' };
  const expected = await computeTwilioSignature(authToken, url, params);
  if (!timingSafeEqual(expected, header.trim())) return { ok: false, reason: 'bad_signature' };
  return { ok: true };
}

/** Compute the expected signature — exported for tests to sign a fixture request. */
export async function computeTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
): Promise<string> {
  let data = url;
  for (const key of Object.keys(params).sort()) data += key + params[key];
  return hmacBase64(authToken, data);
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

async function hmacBase64(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    ab(enc.encode(secret)),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, ab(enc.encode(message))));
  let s = '';
  for (const b of sig) s += String.fromCharCode(b);
  return btoa(s);
}
