import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createRepositories } from '../../../../db/repositories';
import { d1Executor } from '../../../../db/executor';
import { authorizeResend } from '../../../../server/dashboard';
import { requireOperatorAccess } from '../../../../server/access';
import { SPEED_TO_LEAD_BODY } from '../../../../server/slo-sweep';
import { json } from '../../../../server/http';

// POST /api/operator/resend (spec §7.1). Cloudflare Access-gated; performs the
// single-use claim on the emailed resend token via `authorizeResend`, then
// dispatches through the same DO-reserve + Queue-enqueue path as /api/lead
// (spec: "identical ... primary send path") — never a synchronous Twilio call
// here, same as intake. The DO/Queue aren't live-bound in wrangler.toml yet
// (see the addendum in docs/build/PROPOSAL-api-wiring.md), so `env.SMS_AUTHORITY`/
// `env.SMS_QUEUE` are undefined today and this degrades to `dispatched: false`
// exactly like /api/lead does — never fails the request over an unwired binding.
export const prerender = false;

interface ResendBody {
  token?: unknown;
}

export const POST: APIRoute = async ({ request }) => {
  if (!env.OP_STORE) return json({ error: 'not_configured' }, 503);

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

  // Authorization is single-use-claimed (see resend_token) regardless of
  // dispatch outcome below — a stranded reservation here is exactly what
  // slo-sweep's `no_reservation` fallback path picks back up.
  const lead = await repos.lead.getById(auth.claims.leadId);
  let dispatched = false;
  if (lead && env.SMS_AUTHORITY && env.SMS_QUEUE) {
    const stub = env.SMS_AUTHORITY.get(env.SMS_AUTHORITY.idFromName('global'));
    const reservation = await stub.reserve(lead.phone_e164, lead.id);
    if (reservation.allow) {
      await env.SMS_QUEUE.send({
        leadId: lead.id,
        phoneE164: lead.phone_e164,
        body: SPEED_TO_LEAD_BODY,
        allowToken: reservation.token,
      });
      dispatched = true;
    }
  }
  return json({ ...auth, dispatched }, 202);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
