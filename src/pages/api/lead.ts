import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createRepositories } from '../../db/repositories';
import { d1Executor } from '../../db/executor';
import { handleLeadIntake, type LeadIntakeRequest } from '../../server/lead-intake';
import type { ReserveOutcome } from '../../server/sms-authority';
import type { SmsDispatchMessage } from '../../server/sms-dispatch';
import { verifyTurnstile } from '../../server/turnstile';
import { checkRateLimit, rateLimitKey } from '../../server/rate-limit';
import { json, redirect } from '../../server/http';

// POST /api/lead (spec §3.2, F-009/F-012). Thin adapter over the pure
// `handleLeadIntake` core: verify Turnstile best-effort, bind the DO
// reservation + Queue enqueue calls, then let the core decide everything
// else (validation, East-End gate, channel).
//
// Native-POST fallback (spec §4/§9): LeadForm.astro's JS enhancement always
// sends `content-type: application/json`; a plain `<form method="post">`
// submit (JS disabled) sends `application/x-www-form-urlencoded` instead. We
// use that distinction to decide the *response* shape too — a no-JS browser
// following a raw JSON response would just render the JSON as the page,
// which reads as broken even though the lead was captured fine. Redirect it
// back to /contact/ with the outcome in the query string instead.
export const prerender = false;

type LeadBody = LeadIntakeRequest & { turnstileToken?: unknown };

function isNativeFormSubmission(request: Request): boolean {
  const ct = request.headers.get('content-type') ?? '';
  return !ct.includes('application/json');
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

// Tighter than /api/quote (spec §3.3 hardening): this endpoint triggers a D1
// write + downstream SMS spend, not just a read, so 5 requests/min/IP.
const RATE_LIMIT = { windowMs: 60_000, max: 5 };

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const native = isNativeFormSubmission(request);
  const fail = (outcome: string) =>
    native ? redirect(`/contact/?lead=${outcome}`) : undefined;

  if (!env.OP_STORE) return fail('error') ?? json({ error: 'not_configured' }, 503);

  if (env.RATE_LIMIT_KV) {
    const rl = await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey('lead', clientAddress), {
      ...RATE_LIMIT,
      now: Date.now(),
    });
    if (!rl.allowed) return fail('error') ?? json({ error: 'rate_limited', retryAt: rl.resetAt }, 429);
  }

  const body = await parseBody(request);
  const turnstile = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstileToken, clientAddress);

  // The DO isn't wired into a deployed Worker yet (see wrangler.toml). Denying
  // as a transient reason — never suppresses the lead, never blocks capture —
  // means slo-sweep picks it right back up once the binding exists.
  const reserveSms = async (phoneE164: string, leadId: string): Promise<ReserveOutcome> => {
    if (!env.SMS_AUTHORITY) return { allow: false, reason: 'budget_anomaly' };
    const stub = env.SMS_AUTHORITY.get(env.SMS_AUTHORITY.idFromName('global'));
    return stub.reserve(phoneE164, leadId);
  };

  const enqueueSms = async (msg: SmsDispatchMessage): Promise<void> => {
    if (!env.SMS_QUEUE) return; // never fail the request over an unwired queue
    await env.SMS_QUEUE.send(msg);
  };

  const repos = createRepositories(d1Executor(env.OP_STORE));
  const result = await handleLeadIntake(body, repos, {}, {
    now: Date.now(),
    newId: () => crypto.randomUUID(),
    ip: clientAddress ?? null,
    userAgent: request.headers.get('user-agent'),
    sourceUrl: request.headers.get('referer'),
    turnstileVerified: turnstile.verified,
    reserveSms,
    enqueueSms,
  });

  if (native) {
    const q = result.outcome === 'malformed' ? `lead=malformed&field=${result.field}` : `lead=${result.outcome}`;
    return redirect(`/contact/?${q}`);
  }
  return json(result, result.status);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
