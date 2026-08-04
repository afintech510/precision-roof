import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createRepositories } from '../../../db/repositories';
import { d1Executor } from '../../../db/executor';
import { handleCallrailMissedCall, type CallrailCallWebhook } from '../../../server/callrail';
import { verifyCallrailSignature } from '../../../server/callrail-signature';
import type { ReserveOutcome } from '../../../server/sms-authority';
import type { SmsDispatchMessage } from '../../../server/sms-dispatch';
import { json } from '../../../server/http';

// POST /api/webhooks/callrail (spec §3.2 CallRail voice path, §5.3, F-010).
// Thin adapter over the pure missed-call core: verify the CallRail signature,
// then let `handleCallrailMissedCall` (idempotent by call id) do the rest,
// reusing the same DO reservation + Queue enqueue bindings as /api/lead.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!env.OP_STORE) return json({ error: 'not_configured' }, 503);

  const secret = env.CALLRAIL_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'not_configured' }, 503);

  const raw = await request.text();
  const sig = await verifyCallrailSignature(secret, request.headers.get('x-callrail-signature'), raw);
  if (!sig.ok) return json({ error: 'invalid_signature', reason: sig.reason }, 401);

  let hook: CallrailCallWebhook;
  try {
    hook = JSON.parse(raw) as CallrailCallWebhook;
  } catch {
    return json({ error: 'bad_body' }, 400);
  }
  if (hook?.id === undefined || hook?.id === null) return json({ error: 'bad_body' }, 400);

  // Same "DO/Queue not wired into a deployed Worker yet" transient-deny as
  // /api/lead (see PROPOSAL-api-wiring.md addendum) — never fails the
  // webhook, never suppresses the underlying lead; slo-sweep picks it back
  // up once the bindings exist.
  const reserveSms = async (phoneE164: string, leadId: string): Promise<ReserveOutcome> => {
    if (!env.SMS_AUTHORITY) return { allow: false, reason: 'budget_anomaly' };
    const stub = env.SMS_AUTHORITY.get(env.SMS_AUTHORITY.idFromName('global'));
    return stub.reserve(phoneE164, leadId);
  };

  const enqueueSms = async (msg: SmsDispatchMessage): Promise<void> => {
    if (!env.SMS_QUEUE) return;
    await env.SMS_QUEUE.send(msg);
  };

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const result = await handleCallrailMissedCall(hook, repos, {
    now: Date.now(),
    newId: () => crypto.randomUUID(),
    reserveSms,
    enqueueSms,
  });
  return json(result, 200);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
