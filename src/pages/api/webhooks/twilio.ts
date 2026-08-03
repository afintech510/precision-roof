import type { APIRoute } from 'astro';
import { createRepositories } from '../../../db/repositories';
import { d1Executor } from '../../../db/executor';
import { handleTwilioStatus, handleTwilioInbound } from '../../../server/twilio';
import { verifyTwilioSignature } from '../../../server/twilio-signature';
import { json } from '../../../server/http';

// POST /api/webhooks/twilio (spec §3.2, F-009). Thin adapter over the pure
// status/inbound cores: verify the Twilio request signature, then dispatch on
// whether the payload is a status callback (`MessageStatus`) or an inbound
// message (`Body` + `From`).
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  if (!env?.OP_STORE) return json({ error: 'not_configured' }, 503);

  const authToken = env.TWILIO_AUTH_TOKEN;
  if (!authToken) return json({ error: 'not_configured' }, 503);

  const raw = await request.text();
  const params = Object.fromEntries(new URLSearchParams(raw));
  const sig = await verifyTwilioSignature(
    authToken,
    request.headers.get('x-twilio-signature'),
    request.url,
    params,
  );
  if (!sig.ok) return json({ error: 'invalid_signature', reason: sig.reason }, 401);

  if (typeof params.MessageSid !== 'string') return json({ error: 'bad_body' }, 400);

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const now = Date.now();

  if (typeof params.MessageStatus === 'string') {
    const result = await handleTwilioStatus(
      {
        messageSid: params.MessageSid,
        messageStatus: params.MessageStatus,
        errorCode: params.ErrorCode ? Number(params.ErrorCode) : null,
      },
      repos,
      { now },
    );
    return json(result, 200);
  }

  if (typeof params.Body === 'string' && typeof params.From === 'string') {
    const result = await handleTwilioInbound(
      { messageSid: params.MessageSid, from: params.From, body: params.Body },
      repos,
      { now },
    );
    return json(result, 200);
  }

  return json({ error: 'bad_body' }, 400);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
