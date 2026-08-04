import type { createRepositories } from '../db/repositories';

// Postmark bounce/complaint webhook core (spec §5.5, BUILDPLAN Phase 09 Task
// 3). Postmark posts one record per delivery event; the authoritative
// suppress signal is Postmark's own `Inactive` flag — Postmark deactivates an
// address on a hard bounce or spam complaint, but leaves `Inactive: false` on
// a soft/transient bounce, which must NOT suppress (the customer's inbox is
// still reachable). Idempotency keys off Postmark's numeric bounce/complaint
// `ID`, the same `webhook_events` ledger every other webhook in this codebase
// uses. The API route is a thin adapter: verify the configured Basic Auth
// credential, parse the JSON body, call this core.

type Repos = ReturnType<typeof createRepositories>;

const ACTIONABLE_RECORD_TYPES = new Set(['Bounce', 'SpamComplaint']);

export interface PostmarkWebhookEvent {
  RecordType: string;
  ID: number | string;
  Type?: string;
  Email: string;
  Inactive?: boolean;
}

export interface PostmarkWebhookDeps {
  now: number;
}

export type PostmarkWebhookResult =
  | { processed: false } // duplicate delivery, skipped
  | { processed: true; suppressed: false; reason: 'not_actionable' | 'still_active' }
  | { processed: true; suppressed: true };

export async function handlePostmarkWebhook(
  event: PostmarkWebhookEvent,
  repos: Repos,
  deps: PostmarkWebhookDeps,
): Promise<PostmarkWebhookResult> {
  const key = `postmark:${event.ID}`;
  const fresh = await repos.webhookEvents.claim(key, 'postmark', deps.now, event.RecordType);
  if (!fresh) return { processed: false };

  // Only bounces and spam complaints ever suppress; ignore Delivery/Open/Click.
  if (!ACTIONABLE_RECORD_TYPES.has(event.RecordType)) {
    await repos.webhookEvents.markProcessed(key, deps.now);
    return { processed: true, suppressed: false, reason: 'not_actionable' };
  }

  // A soft/transient bounce leaves the address active — never suppress it.
  if (event.Inactive !== true) {
    await repos.webhookEvents.markProcessed(key, deps.now);
    return { processed: true, suppressed: false, reason: 'still_active' };
  }

  await repos.suppression.suppress('email', event.Email, deps.now, event.Type ?? event.RecordType);
  await repos.webhookEvents.markProcessed(key, deps.now);
  return { processed: true, suppressed: true };
}
