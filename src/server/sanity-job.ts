import type { createRepositories } from '../db/repositories';

// sanity-job webhook core (Phase 09 Task 1, F-013, spec §3.2, §2.5). Fires
// when a Sanity `job` document is published with `completedAt` set (the
// webhook's GROQ filter, not this code's job — Sanity is configured to fire
// only on completion). Verifies + dedupes, then writes one `review_request`
// row per resolvable contact channel (phone → sms, email → email) as
// `pending`. The Task-2 cron (not built yet) does the actual ungated send.
//
// Idempotency is keyed on the job id alone, not `_id:_rev` — a job document
// can be edited again after completion (e.g. adding photos), which redelivers
// this webhook with a new rev. Keying on id-only means only the *first*
// completion delivery ever creates review_request rows, so a later edit never
// re-asks. This is what "marking a job complete triggers ... " (BUILDPLAN
// Phase 09) means: once, not once per edit.

type Repos = ReturnType<typeof createRepositories>;

export interface SanityJobPayload {
  _id: string;
  customerContact?: { phone?: string; email?: string };
}

export interface SanityJobDeps {
  now: number;
  newId: () => string;
}

export interface SanityJobResult {
  processed: boolean; // false = duplicate delivery (already handled), skipped
  skipped?: 'no_contact';
  requestIds?: string[];
}

export async function handleSanityJobWebhook(
  payload: SanityJobPayload,
  repos: Repos,
  deps: SanityJobDeps,
): Promise<SanityJobResult> {
  const fresh = await repos.webhookEvents.claim(payload._id, 'sanity_job', deps.now, 'job_completed');
  if (!fresh) return { processed: false };

  const phone = payload.customerContact?.phone?.trim() || undefined;
  const email = payload.customerContact?.email?.trim() || undefined;

  if (!phone && !email) {
    // CRITICAL (prior finding, Phase 01/09): never fabricate a contact.
    await repos.webhookEvents.markProcessed(payload._id, deps.now);
    return { processed: true, skipped: 'no_contact' };
  }

  const requestIds: string[] = [];
  if (phone) {
    const id = deps.newId();
    await repos.reviewRequest.createPending({
      id,
      jobId: payload._id,
      customerContact: phone,
      channel: 'sms',
      requestedAt: deps.now,
    });
    requestIds.push(id);
  }
  if (email) {
    const id = deps.newId();
    await repos.reviewRequest.createPending({
      id,
      jobId: payload._id,
      customerContact: email,
      channel: 'email',
      requestedAt: deps.now,
    });
    requestIds.push(id);
  }

  await repos.webhookEvents.markProcessed(payload._id, deps.now);
  return { processed: true, requestIds };
}
