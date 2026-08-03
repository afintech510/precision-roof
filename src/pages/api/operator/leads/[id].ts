import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createRepositories } from '../../../../db/repositories';
import { d1Executor } from '../../../../db/executor';
import { viewLead } from '../../../../server/dashboard';
import { requireOperatorAccess } from '../../../../server/access';
import { json } from '../../../../server/http';

// GET /api/operator/leads/:id (spec §7.1). Cloudflare Access-gated audited
// read: every PII exposure writes an operator_access_log row (in `viewLead`).
export const prerender = false;

export const GET: APIRoute = async ({ request, params, clientAddress }) => {
  if (!env.OP_STORE) return json({ error: 'not_configured' }, 503);

  const op = requireOperatorAccess(request);
  if (!op) return json({ error: 'forbidden' }, 403);

  const id = params.id;
  if (typeof id !== 'string' || !id) return json({ error: 'bad_request' }, 400);

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const lead = await viewLead(repos, { operatorId: op.operatorId, ip: clientAddress }, id, {
    now: Date.now(),
    newId: () => crypto.randomUUID(),
  });
  if (!lead) return json({ error: 'not_found' }, 404);
  return json({ lead }, 200);
};

export const POST: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
