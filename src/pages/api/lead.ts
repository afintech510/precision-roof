import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createRepositories } from '../../db/repositories';
import { d1Executor } from '../../db/executor';
import { intakeLead, type LeadIntakeRequest } from '../../server/lead-intake';
import { verifyTurnstile } from '../../server/turnstile';
import { DEFAULT_SHARD_COUNT, shardIdForPhone, type ReserveResult } from '../../server/lead-authority';
import { json } from '../../server/http';

// POST /api/lead (spec §3.1, §3.2, F-012, F-009). Thin adapter over the pure
// intake core: verify Turnstile, build D1 repos, let `intakeLead` decide
// everything else. The LEAD_AUTHORITY/LEAD_SMS_QUEUE bindings aren't wired
// into wrangler.toml yet (see src/server/sms-queue-consumer.ts for why), so
// `dispatchSms` is only supplied when both happen to be present on `env` —
// intake still succeeds without them, just leaving the lead `dispatch:
// 'not_configured'` for a later sweep, never rejecting the submission.
export const prerender = false;

interface LeadBody {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  zip?: unknown;
  service?: unknown;
  consentText?: unknown;
  consentVersion?: unknown;
  turnstileToken?: unknown;
  gaClientId?: unknown;
}

async function parseBody(request: Request): Promise<LeadBody> {
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) return (await request.json()) as LeadBody;
    const fd = await request.formData();
    return Object.fromEntries(fd) as LeadBody;
  } catch {
    return {};
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!env.OP_STORE) return json({ error: 'not_configured' }, 503);

  const body = await parseBody(request);
  const turnstile = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstileToken, clientAddress);
  const repos = createRepositories(d1Executor(env.OP_STORE));

  const authority = env.LEAD_AUTHORITY;
  const queue = env.LEAD_SMS_QUEUE;

  const req: LeadIntakeRequest = {
    name: body.name,
    phone: body.phone,
    email: body.email,
    zip: body.zip,
    service: body.service,
    consentText: body.consentText,
    consentVersion: body.consentVersion,
    turnstileVerified: turnstile.verified,
    gaClientId: body.gaClientId,
  };

  const result = await intakeLead(req, repos, {
    now: Date.now(),
    newId: () => crypto.randomUUID(),
    consentIp: clientAddress ?? null,
    consentUa: request.headers.get('user-agent'),
    consentSourceUrl: request.headers.get('referer'),
    dispatchSms:
      authority && queue
        ? async (leadId, phoneE164, now, isSuppressed) => {
            const shard = shardIdForPhone(phoneE164, DEFAULT_SHARD_COUNT).toString();
            const stub = authority.get(authority.idFromName(shard));
            const reserve = await stub.reserve({ phoneE164, now, isSuppressed });
            if (reserve.allow) await queue.send({ leadId, phoneE164 });
            return reserve satisfies ReserveResult;
          }
        : undefined,
  });

  const status = result.outcome === 'malformed' ? 400 : 201;
  return json(result, status);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
