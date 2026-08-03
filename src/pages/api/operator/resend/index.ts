import type { APIRoute } from 'astro';
import { createRepositories } from '../../../../db/repositories';
import { d1Executor } from '../../../../db/executor';
import { authorizeResend } from '../../../../server/dashboard';
import { requireOperatorAccess } from '../../../../server/access';
import { json } from '../../../../server/http';

// POST /api/operator/resend (spec §7.1). Cloudflare Access-gated; performs the
// single-use claim on the emailed resend token via `authorizeResend`. The
// actual send goes through the Phase-05b DO+Queue dispatch path, which does
// not exist yet — authorization succeeds and is recorded, but nothing is sent.
export const prerender = false;

interface ResendBody {
  token?: unknown;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  if (!env?.OP_STORE) return json({ error: 'not_configured' }, 503);

  const secret = env.RESEND_TOKEN_SECRET;
  if (!secret) return json({ error: 'not_configured' }, 503);

  const op = requireOperatorAccess(request);
  if (!op) return json({ error: 'forbidden' }, 403);

  let body: ResendBody;
  try {
    body = (await request.json()) as ResendBody;
  } catch {
    return json({ error: 'bad_body' }, 400);
  }

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const auth = await authorizeResend(body.token, repos, { secret, now: Date.now() });
  if (auth.status !== 'ok') {
    return json(auth, auth.status === 'replayed' ? 409 : 401);
  }

  // BLOCKED: 05b send path — the DO+Queue SMS dispatch doesn't exist yet.
  // Authorization is single-use-claimed (see resend_token) so a retry after
  // 05b lands will need a freshly minted token, not a replay of this one.
  return json({ ...auth, dispatched: false }, 202);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
