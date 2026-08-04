import { createRepositories } from '../db/repositories';
import { d1Executor } from '../db/executor';
import { twilioSender } from './twilio-send';
import { postmarkSender } from './email-send';
import { runReviewRequestSweep } from './review-request-sweep';

// Thin Cron Trigger adapter over the pure `runReviewRequestSweep` core
// (Phase 09 Task 2/3, spec §2.5, §5.5). All the logic lives in
// review-request-sweep.ts so it stays unit-testable without a Worker
// runtime; this function only supplies the real transports + D1 repos.
//
// NOT YET WIRED, same root cause as retention-cron.ts, lead-authority-do.ts,
// and sms-queue-consumer.ts: the @astrojs/cloudflare adapter's generated
// Worker entry exports only `{ fetch: handle }` — no `scheduled()` handler
// hook, by the same grep-confirmed absence (see
// docs/build/PROPOSAL-api-wiring.md addendum). Wiring a Cron Trigger needs
// the same deploy-topology decision already deferred to Adam for the DO +
// Queue (custom worker-entry re-export vs. a separate small Worker); adding
// a `[triggers]` cron here without one of those in place would have nothing
// to invoke. Once that decision lands, this export is what it calls.
//
// Also requires provisioning secrets this env doesn't have yet:
// TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER (already used by
// /api/lead), POSTMARK_SERVER_TOKEN + EMAIL_FROM_ADDRESS (new, added to
// env.d.ts this phase), UNSUBSCRIBE_TOKEN_SECRET (new), and REVIEW_URL /
// SITE_ORIGIN for the ask's links — none of that blocks writing or testing
// the core itself.
export async function scheduled(env: Cloudflare.Env): Promise<void> {
  if (
    !env.TWILIO_ACCOUNT_SID ||
    !env.TWILIO_AUTH_TOKEN ||
    !env.TWILIO_FROM_NUMBER ||
    !env.POSTMARK_SERVER_TOKEN ||
    !env.EMAIL_FROM_ADDRESS ||
    !env.UNSUBSCRIBE_TOKEN_SECRET ||
    !env.REVIEW_URL ||
    !env.SITE_ORIGIN
  ) {
    return; // never fail closed on missing config — just skip this tick
  }

  const repos = createRepositories(d1Executor(env.OP_STORE));
  await runReviewRequestSweep(repos, {
    now: Date.now(),
    sendSms: twilioSender({
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      fromNumber: env.TWILIO_FROM_NUMBER,
    }),
    sendEmail: postmarkSender({
      serverToken: env.POSTMARK_SERVER_TOKEN,
      fromAddress: env.EMAIL_FROM_ADDRESS,
    }),
    reviewUrl: env.REVIEW_URL,
    unsubscribeBaseUrl: env.SITE_ORIGIN,
    unsubscribeSecret: env.UNSUBSCRIBE_TOKEN_SECRET,
  });
}
