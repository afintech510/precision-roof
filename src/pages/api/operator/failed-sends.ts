import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createRepositories } from '../../../db/repositories';
import { d1Executor } from '../../../db/executor';
import { listFailedSends } from '../../../server/dashboard';
import { requireOperatorAccess } from '../../../server/access';
import { json } from '../../../server/http';

// GET /api/operator/failed-sends (spec §7.1). Cloudflare Access-gated audited
// read: every returned lead exposes PII, so each gets its own access-log row
// (in `listFailedSends`).
export const prerender = false;

export const GET: APIRoute = async ({ request, clientAddress }) => {
  if (!env.OP_STORE) return json({ error: 'not_configured' }, 503);

  const op = requireOperatorAccess(request);
  if (!op) return json({ error: 'forbidden' }, 403);

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const leads = await listFailedSends(repos, { operatorId: op.operatorId, ip: clientAddress }, {
    now: Date.now(),
    newId: () => crypto.randomUUID(),
  });
  return json({ leads }, 200);
};

export const POST: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
