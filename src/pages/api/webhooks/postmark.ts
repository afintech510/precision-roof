import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createRepositories } from '../../../db/repositories';
import { d1Executor } from '../../../db/executor';
import { handlePostmarkWebhook, type PostmarkWebhookEvent } from '../../../server/postmark-webhook';
import { verifyPostmarkWebhookAuth } from '../../../server/postmark-auth';
import { json } from '../../../server/http';

// POST /api/webhooks/postmark (spec §5.5, BUILDPLAN Phase 09 Task 3). Thin
// adapter over the pure bounce/complaint core: verify the configured Basic
// Auth credential, then let `handlePostmarkWebhook` (idempotent by Postmark's
// bounce/complaint record id) suppress the address on a hard bounce or spam
// complaint — never on a soft/transient bounce.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!env.OP_STORE) return json({ error: 'not_configured' }, 503);

  const secret = env.POSTMARK_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'not_configured' }, 503);

  const auth = verifyPostmarkWebhookAuth(secret, request.headers.get('authorization'));
  if (!auth.ok) return json({ error: 'unauthorized', reason: auth.reason }, 401);

  let event: PostmarkWebhookEvent;
  try {
    event = (await request.json()) as PostmarkWebhookEvent;
  } catch {
    return json({ error: 'bad_body' }, 400);
  }
  if (
    typeof event?.RecordType !== 'string' ||
    (typeof event?.ID !== 'number' && typeof event?.ID !== 'string') ||
    typeof event?.Email !== 'string'
  ) {
    return json({ error: 'bad_body' }, 400);
  }

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const result = await handlePostmarkWebhook(event, repos, { now: Date.now() });
  return json(result, 200);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
