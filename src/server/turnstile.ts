// Cloudflare Turnstile server verification (spec §3.1 [C2-001, C2-015]). Used
// best-effort by /api/quote: a missing token/secret or a network failure returns
// `skipped`, and the caller still serves a (rate-limited) estimate — a
// transparency feature must never fail closed into invisibility [C2-008].

export interface TurnstileResult {
  verified: boolean;
  /** True when verification couldn't run (no secret/token, or siteverify failed). */
  skipped: boolean;
}

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  secret: string | undefined,
  token: unknown,
  remoteIp?: string,
): Promise<TurnstileResult> {
  if (!secret || typeof token !== 'string' || token === '') {
    return { verified: false, skipped: true };
  }
  try {
    const form = new URLSearchParams();
    form.set('secret', secret);
    form.set('response', token);
    if (remoteIp) form.set('remoteip', remoteIp);
    const res = await fetch(SITEVERIFY, { method: 'POST', body: form });
    const data = (await res.json()) as { success?: boolean };
    return { verified: data.success === true, skipped: false };
  } catch {
    return { verified: false, skipped: true }; // never block on a verifier outage
  }
}
