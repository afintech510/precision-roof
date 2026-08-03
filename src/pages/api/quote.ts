import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { computeQuote, type QuoteRequest } from '../../server/quote';
import { readPricingBlob, buildPricingBlob } from '../../server/pricing-blob';
import { getQuoteTowns, getPricingRows } from '../../lib/content';
import { verifyTurnstile } from '../../server/turnstile';
import { checkRateLimit, rateLimitKey } from '../../server/rate-limit';
import { json } from '../../server/http';

// POST /api/quote (spec §3.2, F-014). Thin adapter over the pure quote engine:
// verify Turnstile best-effort, read the materialized pricing blob (falling back
// to an in-process build from CMS content so it never fails closed), then let the
// engine decide. The engine — not this route — enforces the East-End gate, so a
// gated town/ZIP can never leak a price here.
export const prerender = false;

interface QuoteBody {
  zip?: unknown;
  townSlug?: unknown;
  serviceSlug?: unknown;
  band?: unknown;
  turnstileToken?: unknown;
}

async function parseBody(request: Request): Promise<QuoteBody> {
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) return (await request.json()) as QuoteBody;
    const fd = await request.formData();
    return Object.fromEntries(fd) as QuoteBody;
  } catch {
    return {};
  }
}

// Generous cap (spec §3.3 hardening, never fails closed on a legitimate
// burst — e.g. someone tabbing through town/size combos): 20 requests/min/IP.
const RATE_LIMIT = { windowMs: 60_000, max: 20 };

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (env.RATE_LIMIT_KV) {
    const rl = await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey('quote', clientAddress), {
      ...RATE_LIMIT,
      now: Date.now(),
    });
    if (!rl.allowed) return json({ error: 'rate_limited', retryAt: rl.resetAt }, 429);
  }

  const body = await parseBody(request);

  const turnstile = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstileToken, clientAddress);

  const blob =
    (await readPricingBlob(env.PRICING_KV)) ?? buildPricingBlob(await getPricingRows(), Date.now());
  const towns = await getQuoteTowns();

  const req: QuoteRequest = {
    zip: body.zip,
    townSlug: body.townSlug,
    // Sample data prices roof replacement; default to it when unspecified.
    serviceSlug: typeof body.serviceSlug === 'string' ? body.serviceSlug : 'roof-replacement',
    band: body.band,
  };
  const result = computeQuote(req, { blob, towns });

  const status = result.outcome === 'malformed' ? 400 : 200;
  return json({ ...result, verified: turnstile.verified }, status);
};

export const GET: APIRoute = () => json({ error: 'method_not_allowed' }, 405);
