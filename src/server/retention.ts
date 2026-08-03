import type { createRepositories } from '../db/repositories';

// Retention/purge sweep core (Phase 08, spec §1.3, §8, C2-024, C2-031). Pure
// over the repos so it unit-tests with node:sqlite exactly like the other
// cores. The one invariant every threshold below must respect: `suppression`
// is NEVER touched here — restoring or purging must never resurrect an
// opted-out number (spec §1.3, C2-006). `consent_record` is purged (not just
// anonymized) because its own retention *is* exactly 4 years, not "forever".
//
// Sanity `job` PII purge (also named in C2-031) is out of scope here — it's a
// Sanity-side mutation needing SANITY_API_TOKEN, not a D1 concern.

type Repos = ReturnType<typeof createRepositories>;

export const DAY_MS = 24 * 60 * 60 * 1000;

export interface RetentionThresholdsMs {
  /** webhook_events: spec names a 30-90d provider-retry range; 90d keeps idempotency protection for the longest window named. */
  webhookEventsMs: number;
  /**
   * message_log: spec §8/C2-024 says "archive/rollup per TCPA window" without
   * a number. TCPA's own statute of limitations is 4 years, matching
   * consent_record's documented retention (spec §2.5) — message_log is the
   * delivery evidence for those same messages, so the same window applies.
   * `// SPEC-AMBIGUITY` exact figure not stated; confirm with Adam.
   */
  messageLogMs: number;
  /**
   * review_request.customer_contact: spec §8/C2-031 names this for purge
   * without a number. Aligned to the lead 24-mo purge window (spec §2.5) as
   * the nearest named PII-retention precedent. `// SPEC-AMBIGUITY` confirm with Adam.
   */
  reviewRequestContactMs: number;
  /** lead consent columns (ip/ua/source-url): spec §2.5 states 24-mo explicitly. */
  leadConsentColumnsMs: number;
  /** consent_record: spec §2.5 states 4-yr explicitly. */
  consentRecordMs: number;
}

export const DEFAULT_RETENTION_THRESHOLDS: RetentionThresholdsMs = {
  webhookEventsMs: 90 * DAY_MS,
  messageLogMs: 4 * 365 * DAY_MS,
  reviewRequestContactMs: 24 * 30 * DAY_MS,
  leadConsentColumnsMs: 24 * 30 * DAY_MS,
  consentRecordMs: 4 * 365 * DAY_MS,
};

export interface RetentionSweepResult {
  webhookEventsPruned: number;
  messageLogAnonymized: number;
  reviewRequestAnonymized: number;
  leadConsentScrubbed: number;
  consentRecordPurged: number;
}

export async function runRetentionSweep(
  repos: Repos,
  now: number,
  thresholds: RetentionThresholdsMs = DEFAULT_RETENTION_THRESHOLDS,
): Promise<RetentionSweepResult> {
  const webhookEventsPruned = await repos.webhookEvents.pruneOlderThan(now - thresholds.webhookEventsMs);
  const messageLogAnonymized = await repos.messageLog.anonymizeOlderThan(now - thresholds.messageLogMs);
  const reviewRequestAnonymized = await repos.reviewRequest.anonymizeOlderThan(now - thresholds.reviewRequestContactMs);
  const leadConsentScrubbed = await repos.lead.scrubConsentColumns(now - thresholds.leadConsentColumnsMs);
  const consentRecordPurged = await repos.consent.purgeOlderThan(now - thresholds.consentRecordMs);

  return {
    webhookEventsPruned,
    messageLogAnonymized,
    reviewRequestAnonymized,
    leadConsentScrubbed,
    consentRecordPurged,
  };
}
