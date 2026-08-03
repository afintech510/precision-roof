// Twilio REST send adapter (spec §3.1, §3.2, F-009). Isolated from the pure
// dispatch core (lead-dispatch.ts) so that core stays unit-testable with an
// injected `SendSmsFn` and never needs a mocked `fetch`/vendor key. This file
// is the one real network call — it degrades to `not_configured` rather than
// throwing when the Twilio secrets aren't provisioned yet (never fail closed
// into a 500; the queue consumer records the outcome and moves on).

export interface SendSmsResult {
  sent: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface TwilioSendEnv {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_MESSAGING_SERVICE_SID?: string;
}

export type SendSmsFn = (to: string, body: string) => Promise<SendSmsResult>;

export async function sendTwilioSms(
  env: TwilioSendEnv,
  to: string,
  body: string,
): Promise<SendSmsResult> {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_MESSAGING_SERVICE_SID: msid } = env;
  if (!sid || !token || !msid) return { sent: false, error: 'not_configured' };

  try {
    const form = new URLSearchParams({ To: to, MessagingServiceSid: msid, Body: body });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
    if (!res.ok) return { sent: false, error: `http_${res.status}` };
    const data = (await res.json()) as { sid?: string };
    return { sent: true, providerMessageId: data.sid };
  } catch {
    return { sent: false, error: 'network_error' };
  }
}
