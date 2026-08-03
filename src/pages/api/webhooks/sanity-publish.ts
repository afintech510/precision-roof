import type { APIRoute } from 'astro';
import { createRepositories } from '../../../db/repositories';
import { d1Executor } from '../../../db/executor';
import { handleSanityPublish, verifySanitySignature } from '../../../server/sanity-publish';
import { getPricingRows } from '../../../lib/content';
import { json } from '../../../server/http';

// POST /api/webhooks/sanity-publish (spec §3.2 [C2-023]). Verify signature →
// dedupe by document rev → rematerialize the pricing blob into KV. A GET has no
// effect; a redelivery is idempotent (handled by the core via webhook_events).
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  if (!env?.OP_STORE || !env.PRICING_KV) return json({ error: 'not_configured' }, 503);

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

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return json({ error: 'bad_body' }, 400);
  }
  const rev = String(payload._rev ?? payload.rev ?? payload._id ?? '');
  if (!rev) return json({ error: 'no_rev' }, 400);

  // Today the rows come from the content facade (sample data); once Sanity is
  // seeded the route fetches townPricing via SANITY_API_TOKEN — same row shape.
  const rows = await getPricingRows();
  const repos = createRepositories(d1Executor(env.OP_STORE));
  const result = await handleSanityPublish(
    { rev, rows },
    { repos, kv: env.PRICING_KV, deps: { now: Date.now() } },
  );
  return json(result, 200);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
