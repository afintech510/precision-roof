// Outbound Twilio SMS send (spec §3.1/§5.2). A thin wrapper over the Twilio
// REST API, injected as a dependency everywhere it's used so the dispatch core
// unit-tests with a fake sender and never makes a network call in tests.

export interface TwilioSendConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export type TwilioSendResult =
  | { ok: true; messageSid: string }
  | { ok: false; errorCode?: number; message: string };

export type SendSms = (to: string, body: string) => Promise<TwilioSendResult>;

/** Build a real `SendSms` against the Twilio REST API. */
export function twilioSender(config: TwilioSendConfig): SendSms {
  return async (to: string, body: string): Promise<TwilioSendResult> => {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const form = new URLSearchParams({ To: to, From: config.fromNumber, Body: body });
    const auth = btoa(`${config.accountSid}:${config.authToken}`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { authorization: `Basic ${auth}`, 'content-type': 'application/x-www-form-urlencoded' },
        body: form,
      });
      const data = (await res.json()) as { sid?: string; code?: number; message?: string };
      if (!res.ok || !data.sid) {
        return { ok: false, errorCode: data.code, message: data.message ?? `twilio_http_${res.status}` };
      }
      return { ok: true, messageSid: data.sid };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'network_error' };
    }
  };
}
