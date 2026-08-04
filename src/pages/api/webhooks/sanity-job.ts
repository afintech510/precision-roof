import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createRepositories } from '../../../db/repositories';
import { d1Executor } from '../../../db/executor';
import { handleSanityJobWebhook, type SanityJobPayload } from '../../../server/sanity-job';
import { verifySanitySignature } from '../../../server/sanity-publish';
import { json } from '../../../server/http';

// POST /api/webhooks/sanity-job (Phase 09 Task 1, spec §3.2, §2.5). Verify
// signature → dedupe by job id → write pending review_request rows. Shares
// the Sanity signature scheme + secret with /api/webhooks/sanity-publish
// (both are Sanity webhooks on the same project).
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!env.OP_STORE) return json({ error: 'not_configured' }, 503);

  const secret = env.SANITY_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'not_configured' }, 503);

  const raw = await request.text();
  const sig = await verifySanitySignature(
    secret,
    request.headers.get('sanity-webhook-signature'),
    raw,
    Date.now(),
  );
  if (!sig.ok) return json({ error: 'invalid_signature', reason: sig.reason }, 401);

  let payload: SanityJobPayload;
  try {
    payload = JSON.parse(raw) as SanityJobPayload;
  } catch {
    return json({ error: 'bad_body' }, 400);
  }
  if (!payload._id) return json({ error: 'no_id' }, 400);

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const result = await handleSanityJobWebhook(payload, repos, {
    now: Date.now(),
    newId: () => crypto.randomUUID(),
  });
  return json(result, 200);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
