import type { APIRoute } from 'astro';
import { createRepositories } from '../../../db/repositories';
import { d1Executor } from '../../../db/executor';
import { handleCalcomWebhook, type CalcomWebhook } from '../../../server/calcom';
import { verifyCalcomSignature } from '../../../server/calcom-signature';
import { json } from '../../../server/http';

// POST /api/webhooks/calcom (spec §3.2, F-008). Thin adapter over the pure
// booking core: verify the Cal.com signature, then let `handleCalcomWebhook`
// (idempotent by uid+trigger) do the rest.
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  if (!env?.OP_STORE) return json({ error: 'not_configured' }, 503);

  const secret = env.CALCOM_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'not_configured' }, 503);

  const raw = await request.text();
  const sig = await verifyCalcomSignature(secret, request.headers.get('x-cal-signature-256'), raw);
  if (!sig.ok) return json({ error: 'invalid_signature', reason: sig.reason }, 401);

  let hook: CalcomWebhook;
  try {
    hook = JSON.parse(raw) as CalcomWebhook;
  } catch {
    return json({ error: 'bad_body' }, 400);
  }
  if (typeof hook?.triggerEvent !== 'string' || typeof hook?.payload?.uid !== 'string') {
    return json({ error: 'bad_body' }, 400);
  }

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const result = await handleCalcomWebhook(hook, repos, { now: Date.now(), newId: () => crypto.randomUUID() });
  return json(result, 200);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
