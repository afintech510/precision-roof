import { createRepositories } from '../db/repositories';
import { d1Executor } from '../db/executor';
import { twilioSender } from './twilio-send';
import { dispatchSmsFromQueue, type SmsDispatchMessage } from './sms-dispatch';

// Thin Queue consumer adapter over the pure `dispatchSmsFromQueue` core
// (Phase 05b Task 2, spec §3.1). All the logic lives in sms-dispatch.ts so it
// stays unit-testable without a Worker runtime; this function only supplies
// the real DO stub + D1 repos + Twilio sender, and translates the per-
// message result into ack/retry so a transient failure (send_failed) retries
// per the queue's own backoff while a terminal one (already_claimed,
// suppressed, budget/window denial) acks so it never redelivers.
export async function queue(
  batch: MessageBatch<SmsDispatchMessage>,
  env: Cloudflare.Env,
): Promise<void> {
  if (!env.SMS_AUTHORITY || !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
    return; // never fail closed — leave messages for retry/slo-sweep to pick up later
  }

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const authority = env.SMS_AUTHORITY.get(env.SMS_AUTHORITY.idFromName('global'));
  const sendSms = twilioSender({
    accountSid: env.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN,
    fromNumber: env.TWILIO_FROM_NUMBER,
  });

  for (const message of batch.messages) {
    const result = await dispatchSmsFromQueue(message.body, repos, authority, {
      now: Date.now(),
      newId: () => crypto.randomUUID(),
      sendSms,
    });
    if (result.dispatched || result.reason !== 'send_failed') {
      message.ack();
    } else {
      message.retry();
    }
  }
}
