import type { APIRoute } from 'astro';
import { verifyResendToken } from '../../../../server/dashboard';
import { requireOperatorAccess } from '../../../../server/access';
import { json } from '../../../../server/http';

// GET /api/operator/resend/confirm (spec §7.1). Cloudflare Access-gated;
// verifies the emailed resend token's signature + expiry WITHOUT consuming
// it — safe for the operator to load this page before committing to resend.
export const prerender = false;

export const GET: APIRoute = async ({ request, url, locals }) => {
  const env = locals.runtime?.env;
  if (!env?.OP_STORE) return json({ error: 'not_configured' }, 503);

  const secret = env.RESEND_TOKEN_SECRET;
  if (!secret) return json({ error: 'not_configured' }, 503);

  const op = requireOperatorAccess(request);
  if (!op) return json({ error: 'forbidden' }, 403);

  const token = url.searchParams.get('token');
  const result = await verifyResendToken(token, secret, Date.now());
  return json(result, result.ok ? 200 : 400);
};

export const POST: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
