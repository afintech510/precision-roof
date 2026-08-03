import type { createRepositories } from '../db/repositories';
import type { SendSmsFn } from './twilio-send';

// Speed-to-lead SMS dispatch core (spec §3.1, §3.2, F-009) — what a
// LEAD_SMS_QUEUE consumer runs per message. `/api/lead` only reserves a slot
// and enqueues; this is where the send-time re-checks and the actual send
// happen, kept pure (repos + an injected `sendSms`) so it unit-tests without
// a Worker runtime or a live Twilio key.
//
// Two send-time re-checks close races the DO reservation can't (spec §3.1
// "send-time symmetry" — a STOP can land after the reservation but before
// this runs, e.g. a slow queue redelivery):
//  - `suppression.isSuppressed` re-reads the live opt-out ledger (a STOP
//    processed by /api/webhooks/twilio after intake, before this dispatch).
//  - `lead.claimForSms` atomically claims the lead for exactly one send AND
//    re-checks the lead-level policy suppression set at intake time
//    (turnstile_fallback/east_end_gate/opt_out-at-intake) — so a duplicate
//    queue delivery, or a job for a lead that intake already marked
//    suppressed, is a no-op rather than a double/errant send.

type Repos = ReturnType<typeof createRepositories>;

export interface SmsDispatchJob {
  leadId: string;
  phoneE164: string;
}

export interface DispatchDeps {
  now: number;
  newId: () => string;
  sendSms: SendSmsFn;
  /** The speed-to-lead SMS copy — injected so this core never hardcodes marketing copy. */
  messageBody: string;
}

export type DispatchOutcome =
  | 'sent'
  | 'send_failed'
  | 'skipped_suppressed'
  | 'skipped_claimed'
  | 'lead_not_found';

export interface DispatchResult {
  outcome: DispatchOutcome;
}

export async function dispatchSpeedToLeadSms(
  job: SmsDispatchJob,
  repos: Repos,
  deps: DispatchDeps,
): Promise<DispatchResult> {
  const lead = await repos.lead.getById(job.leadId);
  if (!lead) return { outcome: 'lead_not_found' };

  const suppressed = await repos.suppression.isSuppressed('sms', job.phoneE164);
  if (suppressed) return { outcome: 'skipped_suppressed' };

  const claimed = await repos.lead.claimForSms(job.leadId, deps.now);
  if (!claimed) return { outcome: 'skipped_claimed' };

  const result = await deps.sendSms(job.phoneE164, deps.messageBody);

  await repos.messageLog.insert({
    id: deps.newId(),
    leadId: job.leadId,
    channel: 'sms',
    providerMessageId: result.sent ? result.providerMessageId ?? null : null,
    status: result.sent ? 'sent' : 'failed_permanent',
    statusRank: result.sent ? 3 : 4,
    toContact: job.phoneE164,
    createdAt: deps.now,
  });

  if (result.sent) {
    await repos.lead.markSpeedToLeadSent(job.leadId, deps.now);
    return { outcome: 'sent' };
  }

  // Surfaces in the operator "failed sends" dashboard (listFailedSends) for
  // manual resend via the single-use signed-link path (spec §7.1).
  await repos.lead.setStatus(job.leadId, 'failed_followup', deps.now);
  return { outcome: 'send_failed' };
}

export const DEFAULT_SPEED_TO_LEAD_MESSAGE =
  'Thanks for reaching out to Premium Roofing Solutions! We got your request and ' +
  'a real person will call or text you shortly. Reply STOP to opt out.';
