import type { createRepositories } from '../db/repositories';
import type { ReserveOutcome, ClaimOutcome } from './sms-authority';
import type { SendSms } from './twilio-send';

// Async speed-to-lead SMS dispatch (spec §3.1, BUILDPLAN Phase 05b Task 2/6).
// The Queue consumer and `cron: slo-sweep` both funnel through this module so
// the send-time re-check is identical across both paths, per spec: "the
// primary queue-worker send AND cron: slo-sweep both obtain the authoritative
// per-phone/budget reservation by invoking the same Durable Object at send
// time... and re-consult suppression inside the atomic sms_claimed_at claim
// immediately before dispatch." The DO stub is the authority; the D1
// `claimForSms` call right after it is the cheap idempotency/evidence claim —
// never the gate.

type Repos = ReturnType<typeof createRepositories>;

/** The RPC surface a `SmsAuthorityDO` stub exposes — the shape shared by the
 * production DO binding and test doubles. */
export interface SmsAuthorityStub {
  reserve(phoneE164: string, leadId: string): Promise<ReserveOutcome>;
  claimSend(leadId: string, phoneE164: string): Promise<ClaimOutcome>;
}

/** The Queue message body. `allowToken` is carried for observability/audit —
 * the actual dedupe/authority check is the DO claim by leadId, not the token
 * string itself (spec §3.1: "the allow-token is the Queue dedupe key"). */
export interface SmsDispatchMessage {
  leadId: string;
  phoneE164: string;
  body: string;
  allowToken: string;
}

export interface DispatchDeps {
  now: number;
  newId: () => string;
  sendSms: SendSms;
}

export type DispatchResult =
  | { dispatched: true; messageSid: string }
  | { dispatched: false; reason: string };

/**
 * Primary path: the Queue consumer for a lead whose reservation was already
 * made at `/api/lead` intake time. Re-checks the reservation (and, inside it,
 * suppression) through the DO immediately before dispatch — this is what
 * aborts an in-flight send when a STOP arrives after the allow-token was
 * issued but before the queue delivers the message.
 */
export async function dispatchSmsFromQueue(
  msg: SmsDispatchMessage,
  repos: Repos,
  authority: SmsAuthorityStub,
  deps: DispatchDeps,
): Promise<DispatchResult> {
  const claim = await authority.claimSend(msg.leadId, msg.phoneE164);
  if (!claim.allow) return { dispatched: false, reason: claim.reason };
  return sendAndRecord(msg, repos, deps);
}

/**
 * Shared by slo-sweep once it has confirmed (or freshly obtained) a
 * reservation for a lead: takes the D1 idempotency claim, sends, and records
 * the outcome. Never called before the DO authority has said `allow`.
 */
export async function sendAndRecord(
  msg: SmsDispatchMessage,
  repos: Repos,
  deps: DispatchDeps,
): Promise<DispatchResult> {
  const claimed = await repos.lead.claimForSms(msg.leadId, deps.now);
  if (!claimed) return { dispatched: false, reason: 'already_claimed' };

  const result = await deps.sendSms(msg.phoneE164, msg.body);
  if (!result.ok) {
    await repos.messageLog.insert({
      id: deps.newId(), leadId: msg.leadId, channel: 'sms', status: 'failed_permanent',
      toContact: msg.phoneE164, createdAt: deps.now,
    });
    await repos.lead.setStatus(msg.leadId, 'failed_followup', deps.now);
    return { dispatched: false, reason: 'send_failed' };
  }

  await repos.messageLog.insert({
    id: deps.newId(), leadId: msg.leadId, channel: 'sms', providerMessageId: result.messageSid,
    status: 'queued', statusRank: 1, toContact: msg.phoneE164, createdAt: deps.now,
  });
  await repos.lead.markSpeedToLeadSent(msg.leadId, deps.now);
  return { dispatched: true, messageSid: result.messageSid };
}
