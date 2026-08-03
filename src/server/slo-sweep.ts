import type { createRepositories } from '../db/repositories';
import { sendAndRecord, type SmsAuthorityStub, type DispatchDeps } from './sms-dispatch';

// `cron: slo-sweep` (spec §3.2, BUILDPLAN Phase 05b Task 6). Safety net for
// leads that never got a speed-to-lead SMS out: either their original DO
// reservation was denied for a transient reason (per-phone window / budget
// anomaly — NOT suppression, which the D1 query already excludes) and is worth
// retrying now that conditions may have cleared, or the reservation succeeded
// but the queue dispatch never completed (lost message, worker crash).
//
// "identical to the primary path" (spec §3.1): for a lead with a stranded
// reservation, sweep just calls claimSend like the queue consumer does. For a
// lead that never got one, sweep stands in for the missing intake call and
// reserves fresh — through the SAME serialized DO, so it can't double-fire
// with a live same-phone submit racing it in the same tick.

type Repos = ReturnType<typeof createRepositories>;

export const SPEED_TO_LEAD_BODY =
  'Thanks for reaching out to Premium Roofing Solutions! We got your request and will call you shortly. Reply STOP to opt out.';

export interface SloSweepResult {
  swept: number;
  sent: number;
  skipped: Array<{ leadId: string; reason: string }>;
}

export async function runSloSweep(
  repos: Repos,
  authority: SmsAuthorityStub,
  deps: DispatchDeps,
  smsBody: string = SPEED_TO_LEAD_BODY,
): Promise<SloSweepResult> {
  const eligible = await repos.lead.listEligibleForSweep();
  const skipped: Array<{ leadId: string; reason: string }> = [];
  let sent = 0;

  for (const lead of eligible) {
    let claim = await authority.claimSend(lead.id, lead.phone_e164);
    if (!claim.allow && claim.reason === 'no_reservation') {
      const reserved = await authority.reserve(lead.phone_e164, lead.id);
      if (!reserved.allow) {
        skipped.push({ leadId: lead.id, reason: reserved.reason });
        continue;
      }
      claim = await authority.claimSend(lead.id, lead.phone_e164);
    }
    if (!claim.allow) {
      skipped.push({ leadId: lead.id, reason: claim.reason });
      continue;
    }

    const result = await sendAndRecord(
      { leadId: lead.id, phoneE164: lead.phone_e164, body: smsBody, allowToken: '' },
      repos,
      deps,
    );
    if (result.dispatched) sent++;
    else skipped.push({ leadId: lead.id, reason: result.reason });
  }

  return { swept: eligible.length, sent, skipped };
}
