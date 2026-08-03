import type { createRepositories } from '../db/repositories';

// Twilio webhook core (spec §3.2, F-009). Pure logic over the repos: status
// callbacks are keyed MessageSid:MessageStatus and advance monotonically;
// inbound STOP/START drive (sms, phone) suppression. The API route (added with
// the SSR/deploy wiring) verifies the Twilio signature and supplies D1 repos.

type Repos = ReturnType<typeof createRepositories>;
export interface TwilioDeps { now: number }

// Monotonic rank so an out-of-order "sent" after "delivered" is ignored.
const STATUS_RANK: Record<string, number> = {
  queued: 1, sending: 2, sent: 3, delivered: 4, undelivered: 4, failed: 4,
};

export interface TwilioStatusInput {
  messageSid: string;
  messageStatus: string;
  errorCode?: number | null;
}

export async function handleTwilioStatus(
  input: TwilioStatusInput,
  repos: Repos,
  deps: TwilioDeps,
): Promise<{ processed: boolean; applied: boolean }> {
  const key = `${input.messageSid}:${input.messageStatus}`;
  const fresh = await repos.webhookEvents.claim(key, 'twilio', deps.now, input.messageStatus);
  if (!fresh) return { processed: false, applied: false };

  const rank = STATUS_RANK[input.messageStatus] ?? 0;
  // A hard failure with a carrier error is terminal.
  const status = input.errorCode && /^(failed|undelivered)$/.test(input.messageStatus)
    ? 'failed_permanent'
    : input.messageStatus;
  const applied = await repos.messageLog.advanceStatus(
    input.messageSid, status, rank, deps.now, input.errorCode ?? null,
  );
  await repos.webhookEvents.markProcessed(key, deps.now);
  return { processed: true, applied };
}

const STOP_WORDS = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']);
const START_WORDS = new Set(['START', 'YES', 'UNSTOP']);

export interface TwilioInboundInput {
  messageSid: string;
  from: string; // E.164
  body: string;
}
export type InboundAction = 'suppressed' | 'opted_in' | 'none';

export async function handleTwilioInbound(
  input: TwilioInboundInput,
  repos: Repos,
  deps: TwilioDeps,
): Promise<{ processed: boolean; action: InboundAction }> {
  const fresh = await repos.webhookEvents.claim(input.messageSid, 'twilio', deps.now, 'inbound');
  if (!fresh) return { processed: false, action: 'none' };

  const keyword = input.body.trim().toUpperCase().split(/\s+/)[0] ?? '';
  let action: InboundAction = 'none';
  if (STOP_WORDS.has(keyword)) {
    await repos.suppression.suppress('sms', input.from, deps.now, keyword);
    action = 'suppressed';
  } else if (START_WORDS.has(keyword)) {
    await repos.suppression.optIn('sms', input.from, deps.now);
    action = 'opted_in';
  }
  await repos.webhookEvents.markProcessed(input.messageSid, deps.now);
  return { processed: true, action };
}
