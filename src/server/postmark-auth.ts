// Postmark bounce/complaint webhook auth (spec §5.5, BUILDPLAN Phase 09 Task
// 3). Postmark has no request-signing scheme — the documented integration
// pattern is HTTP Basic Auth embedded in the webhook URL Postmark is
// configured to POST to (`https://<user>:<pass>@host/api/webhooks/postmark`),
// which arrives here as a normal `Authorization: Basic <base64>` header.
// `POSTMARK_WEBHOOK_SECRET` holds the full `user:pass` credential string we
// chose when configuring that URL in the Postmark UI.
//
// // SPEC-AMBIGUITY: not independently verified against a live Postmark
// account (no vendor key in this environment) — this is the vendor-documented
// mechanism, not a custom guess. Re-confirm once Postmark keys exist in
// Doppler, same as the other webhook verifiers in this file group.

export type PostmarkAuthFailure = 'missing' | 'bad_credentials';
export type PostmarkAuthResult = { ok: true } | { ok: false; reason: PostmarkAuthFailure };

export function verifyPostmarkWebhookAuth(
  secret: string,
  header: string | null | undefined,
): PostmarkAuthResult {
  if (!header) return { ok: false, reason: 'missing' };
  const expected = `Basic ${btoa(secret)}`;
  if (!timingSafeEqual(expected, header)) return { ok: false, reason: 'bad_credentials' };
  return { ok: true };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
