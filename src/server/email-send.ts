// Outbound Postmark email send (spec §5.5, Phase 09 Task 3). Mirrors
// twilio-send.ts: a thin wrapper over the provider REST API, injected as a
// dependency everywhere it's used so the sweep core unit-tests with a fake
// sender and never makes a network call in tests.

export interface EmailSendConfig {
  serverToken: string;
  fromAddress: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  /** RFC 8058 one-click unsubscribe URL — set on the List-Unsubscribe header
   * alongside the mandatory List-Unsubscribe-Post header. */
  unsubscribeUrl: string;
}

export type EmailSendResult =
  | { ok: true; messageId: string }
  | { ok: false; errorCode?: number; message: string };

export type SendEmail = (msg: EmailMessage) => Promise<EmailSendResult>;

/** Build a real `SendEmail` against the Postmark REST API (spec §5.5). */
export function postmarkSender(config: EmailSendConfig): SendEmail {
  return async (msg: EmailMessage): Promise<EmailSendResult> => {
    try {
      const res = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-postmark-server-token': config.serverToken,
        },
        body: JSON.stringify({
          From: config.fromAddress,
          To: msg.to,
          Subject: msg.subject,
          TextBody: msg.textBody,
          HtmlBody: msg.htmlBody,
          MessageStream: 'outbound',
          Headers: [
            { Name: 'List-Unsubscribe', Value: `<${msg.unsubscribeUrl}>` },
            { Name: 'List-Unsubscribe-Post', Value: 'List-Unsubscribe=One-Click' },
          ],
        }),
      });
      const data = (await res.json()) as { MessageID?: string; ErrorCode?: number; Message?: string };
      if (!res.ok || !data.MessageID) {
        return { ok: false, errorCode: data.ErrorCode, message: data.Message ?? `postmark_http_${res.status}` };
      }
      return { ok: true, messageId: data.MessageID };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'network_error' };
    }
  };
}
