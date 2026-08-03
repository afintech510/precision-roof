import {
  resolveZipGate,
  type GateResolution,
  type ZipGateTable,
  SUFFOLK_ZIP_GATE,
} from './east-end-gate';

// Quote engine core (spec §3.2 `POST /api/quote`, F-014). Pure decision logic
// over a materialized pricing blob + the East-End ZIP gate, so it unit-tests
// with zero vendor keys. The API route (added with the SSR/deploy wiring) is a
// thin adapter: verify Turnstile (best-effort), load the blob + gate, rate-limit,
// then call `computeQuote`.
//
// CRITICALs enforced here:
//  - A gated East-End town/ZIP NEVER receives a numeric range — the response is
//    the no-price informational payload (§771-B; a quoted price is advertising).
//  - Malformed input is distinguished from a well-formed out-of-area ZIP so the
//    client can render a warm Suffolk hand-off without the server acting as a
//    priced-combo oracle (we never touch the blob for a ZIP that didn't resolve
//    to an in-launch advertising town).
//  - It NEVER fails closed: every path returns a usable payload with a phone CTA
//    (a transparency feature going blank/erroring reads as a dead button).

export type QuoteBand = 'small' | 'medium' | 'large';
const BANDS: readonly QuoteBand[] = ['small', 'medium', 'large'];
const isBand = (v: unknown): v is QuoteBand =>
  typeof v === 'string' && (BANDS as readonly string[]).includes(v);

/** One priced combo in the materialized blob (dollars, non-binding). */
export interface PricingBlobEntry {
  low: number;
  high: number;
  /** Provisional-seeded combo → heavy-disclaimer range, not a bare number. */
  provisional?: boolean;
}

/**
 * Materialized pricing blob (spec §3.2 [C2-023]). Keyed
 * `${townSlug}|${serviceSlug}|${band}`. Built by the sanity-publish webhook; the
 * quote engine only reads it.
 */
export interface PricingBlob {
  builtAt: number;
  ranges: Record<string, PricingBlobEntry>;
}

export const blobKey = (townSlug: string, serviceSlug: string, band: QuoteBand): string =>
  `${townSlug}|${serviceSlug}|${band}`;

/** A launch town the widget may name directly (dropdown selection). */
export interface QuoteTownRef {
  slug: string;
  name: string;
  advertisingAllowed: boolean;
}

export interface QuoteRequest {
  /** Either a ZIP (East-End map path) or an explicit town slug (widget dropdown). */
  zip?: unknown;
  townSlug?: unknown;
  serviceSlug?: unknown;
  band?: unknown;
}

export interface QuoteContext {
  blob: PricingBlob;
  towns: QuoteTownRef[];
  gateTable?: ZipGateTable;
}

export type QuoteOutcome = 'estimate' | 'informational_only' | 'out_of_area' | 'malformed';

/** Machine-readable sub-reason so the client can vary copy without re-deriving it. */
export type QuoteReason =
  | 'ok'
  | 'provisional'
  | 'east_end_gated'
  | 'unknown_location'
  | 'out_of_scope'
  | 'blob_unavailable'
  | 'missing_locator'
  | 'invalid_zip'
  | 'invalid_service'
  | 'invalid_band';

export interface QuoteResult {
  outcome: QuoteOutcome;
  reason: QuoteReason;
  /** Always present + honest; the client shows it verbatim. */
  disclosure: string;
  /** Present only for a genuine advertising, priced combo. */
  estimate?: { low: number; high: number; band: QuoteBand; provisional: boolean };
  /** Resolved advertising town name, when known (estimate path). */
  town?: string;
  /** Always true except a clean estimate — a phone CTA must never disappear. */
  phoneCta: boolean;
}

const NON_BINDING =
  'This is a non-binding estimate based on typical local pricing — not a quote. ' +
  'Your final price depends on an on-site inspection.';
const PROVISIONAL =
  'This range is provisional and may change. It is a rough, non-binding ballpark only ' +
  '— we confirm real pricing after a free on-site inspection.';
const EAST_END =
  'We proudly serve the East End, but we can’t advertise a price for your area online. ' +
  'Call us and we’ll walk through your roof and options directly.';
const OUT_OF_AREA =
  'That looks just outside our main Suffolk service map. Give us a call — if we can help, ' +
  'or point you to someone who can, we will.';
const MALFORMED =
  'We couldn’t read that location. Call us and we’ll sort out your estimate over the phone.';

const informational = (): QuoteResult => ({
  outcome: 'informational_only',
  reason: 'east_end_gated',
  disclosure: EAST_END,
  phoneCta: true,
});

const outOfArea = (reason: QuoteReason): QuoteResult => ({
  outcome: 'out_of_area',
  reason,
  disclosure: OUT_OF_AREA,
  phoneCta: true,
});

const malformed = (reason: QuoteReason): QuoteResult => ({
  outcome: 'malformed',
  reason,
  disclosure: MALFORMED,
  phoneCta: true,
});

/**
 * Compute a quote decision. Order matters: the gate is applied BEFORE any blob
 * lookup so a gated ZIP can never leak into a numeric range, and an out-of-area
 * ZIP never probes the blob (no priced-combo oracle).
 */
export function computeQuote(req: QuoteRequest, ctx: QuoteContext): QuoteResult {
  const town = resolveTown(req, ctx);
  if (town.status === 'malformed') return malformed(town.reason);
  if (town.status === 'informational_only') return informational();
  if (town.status === 'out_of_area') return outOfArea(town.reason);

  // Advertising town resolved. A price still requires a valid service + band.
  if (typeof req.serviceSlug !== 'string' || req.serviceSlug.trim() === '') {
    return malformed('invalid_service');
  }
  if (!isBand(req.band)) return malformed('invalid_band');

  // Pick the first resolved advertising town that actually prices this combo.
  const service = req.serviceSlug.trim();
  for (const slug of town.slugs) {
    const entry = ctx.blob.ranges[blobKey(slug, service, req.band)];
    if (entry) {
      const provisional = entry.provisional === true;
      return {
        outcome: 'estimate',
        reason: provisional ? 'provisional' : 'ok',
        disclosure: provisional ? PROVISIONAL : NON_BINDING,
        estimate: { low: entry.low, high: entry.high, band: req.band, provisional },
        town: ctx.towns.find((t) => t.slug === slug)?.name ?? undefined,
        phoneCta: false,
      };
    }
  }

  // In-area advertising town but no priced combo. By the pricing-coverage
  // invariant [C2-014] every in-launch town×service×band is priced, so this is
  // a service/size genuinely out of launch scope (or a stale/partial blob) —
  // book-CTA path, never fail closed into a blank or error (spec §2.2, §3.2).
  const reason: QuoteReason =
    Object.keys(ctx.blob.ranges).length === 0 ? 'blob_unavailable' : 'out_of_scope';
  return outOfArea(reason);
}

type TownResolution =
  | { status: 'advertising'; slugs: string[] }
  | { status: 'informational_only' }
  | { status: 'out_of_area'; reason: QuoteReason }
  | { status: 'malformed'; reason: QuoteReason };

/**
 * Resolve the request to a town outcome. A direct `townSlug` (widget dropdown)
 * takes precedence over `zip`; both are gate-checked. Neither present → malformed.
 */
function resolveTown(req: QuoteRequest, ctx: QuoteContext): TownResolution {
  const hasTown = typeof req.townSlug === 'string' && req.townSlug.trim() !== '';
  const hasZip = req.zip !== undefined && req.zip !== null && req.zip !== '';

  if (hasTown) {
    const slug = (req.townSlug as string).trim();
    const town = ctx.towns.find((t) => t.slug === slug);
    if (!town) return { status: 'out_of_area', reason: 'unknown_location' };
    if (!town.advertisingAllowed) return { status: 'informational_only' };
    return { status: 'advertising', slugs: [town.slug] };
  }

  if (hasZip) {
    const gate: GateResolution | null = resolveZipGate(req.zip, ctx.gateTable ?? SUFFOLK_ZIP_GATE);
    if (gate === null) return { status: 'malformed', reason: 'invalid_zip' };
    if (gate.kind === 'informational_only') return { status: 'informational_only' };
    if (gate.kind === 'out_of_area') return { status: 'out_of_area', reason: 'unknown_location' };
    return { status: 'advertising', slugs: gate.townSlugs };
  }

  return { status: 'malformed', reason: 'missing_locator' };
}
