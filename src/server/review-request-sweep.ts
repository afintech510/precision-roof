import type { createRepositories } from '../db/repositories';
import type { SendSms } from './twilio-send';
import type { SendEmail } from './email-send';
import { mintUnsubscribeToken } from './unsubscribe';

// `cron: review-request-sweep` (spec §2.5, §5.5, BUILDPLAN Phase 09 Task 2/3,
// F-013). Sends the identical, ungated review ask to every `pending`
// review_request row, honoring suppression on both channels first.
//
// "Ungated" (spec §5.5, the Google review-gating ban): there is deliberately
// no satisfaction/rating pre-filter here or anywhere upstream — every
// pending row gets the same ask, full stop. Exactly-once delivery is owned
// by review_request's own pending→sent CAS (reviewRequestRepo.markSent),
// the same pattern message_log/lead use elsewhere; a crash after a partial
// batch just leaves the remaining rows pending for the next tick.
//
// SMS reuses the Phase-05b transport (twilioSender/SendSms — "no second
// pipeline" per BUILDPLAN), NOT the SmsAuthorityDO reservation/budget
// authority: that DO exists to serialize the *speed-to-lead* per-phone 24h
// window and anomaly budget for a completely different lifecycle (a fresh
// inbound lead), and has no notion of a `review_request` row. Gating this
// send on suppression (checked fresh, immediately before send, same as the
// DO's own claimSend re-check) is the actual compliance requirement here —
// reusing the DO's lead-shaped concurrency machinery would just be
// coincidental coupling, not a real shared concern.

type Repos = ReturnType<typeof createRepositories>;

export const REVIEW_REQUEST_SMS_BODY =
  "Thanks for choosing Premium Roofing Solutions! We'd love a quick review of your experience: {reviewUrl} Reply STOP to opt out.";

export interface ReviewRequestSweepDeps {
  now: number;
  sendSms: SendSms;
  sendEmail: SendEmail;
  /** Where the ask links out to leave a review (same URL for every customer). */
  reviewUrl: string;
  /** Origin the one-click unsubscribe link is built against, e.g. `https://premiumroofsolutions.com`. */
  unsubscribeBaseUrl: string;
  unsubscribeSecret: string;
  smsBody?: string;
}

export interface ReviewRequestSweepResult {
  swept: number;
  sent: number;
  suppressed: number;
  failed: number;
}

export async function runReviewRequestSweep(
  repos: Repos,
  deps: ReviewRequestSweepDeps,
  limit = 50,
): Promise<ReviewRequestSweepResult> {
  const pending = await repos.reviewRequest.listPending(limit);
  let sent = 0;
  let suppressed = 0;
  let failed = 0;

  for (const row of pending) {
    if (await repos.suppression.isSuppressed(row.channel, row.customer_contact)) {
      if (await repos.reviewRequest.markSuppressed(row.id)) suppressed++;
      continue;
    }

    const ok =
      row.channel === 'sms'
        ? await sendSmsAsk(row.customer_contact, deps)
        : await sendEmailAsk(row.customer_contact, deps);

    if (ok) {
      if (await repos.reviewRequest.markSent(row.id, deps.now)) sent++;
    } else {
      if (await repos.reviewRequest.markFailed(row.id)) failed++;
    }
  }

  return { swept: pending.length, sent, suppressed, failed };
}

async function sendSmsAsk(phoneE164: string, deps: ReviewRequestSweepDeps): Promise<boolean> {
  const body = (deps.smsBody ?? REVIEW_REQUEST_SMS_BODY).replace('{reviewUrl}', deps.reviewUrl);
  const result = await deps.sendSms(phoneE164, body);
  return result.ok;
}

async function sendEmailAsk(email: string, deps: ReviewRequestSweepDeps): Promise<boolean> {
  const token = await mintUnsubscribeToken(email, { secret: deps.unsubscribeSecret, now: deps.now });
  const unsubscribeUrl = `${deps.unsubscribeBaseUrl}/unsubscribe?token=${encodeURIComponent(token)}`;
  const result = await deps.sendEmail({
    to: email,
    subject: 'How did we do?',
    textBody:
      `Thanks for choosing Premium Roofing Solutions! We'd love to hear about your experience: ${deps.reviewUrl}\n\n` +
      `Don't want these emails? Unsubscribe: ${unsubscribeUrl}`,
    htmlBody:
      `<p>Thanks for choosing Premium Roofing Solutions! We'd love to hear about your experience.</p>` +
      `<p><a href="${deps.reviewUrl}">Leave a review</a></p>` +
      `<p style="font-size:12px;color:#666"><a href="${unsubscribeUrl}">Unsubscribe</a> from these emails.</p>`,
    unsubscribeUrl,
  });
  return result.ok;
}
