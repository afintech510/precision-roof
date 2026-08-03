// Pricing-coverage guarantee (spec §2.4, [C2-014]). A town/service/home-size
// band must have a NON-STALE covering townPricing row or the build fails.
// Pure + data-driven so it unit-tests without a live Sanity connection; the
// live check feeds it fetched documents (wiring lands with SANITY_API_TOKEN).

export interface TownRef {
  slug: string;
  /** East-End informational-only towns are exempt — they never advertise a price. */
  advertisingAllowed: boolean;
}

export interface ServiceRef {
  slug: string;
}

export interface PricingRow {
  townSlug: string;
  serviceSlug: string;
  homeSizeBand: string;
  effectiveYear: number;
  provisional?: boolean;
}

export interface CoverageOptions {
  /** Home-size bands every advertising town/service must price. */
  bands: string[];
  /** The year "now" — a row is stale if effectiveYear < currentYear - stalenessYears. */
  currentYear: number;
  /** Default 2 years (spec §2.2 staleness threshold N=2). */
  stalenessYears?: number;
}

export type CoverageGapReason = 'missing' | 'stale';

export interface CoverageGap {
  townSlug: string;
  serviceSlug: string;
  band: string;
  reason: CoverageGapReason;
}

/**
 * Enumerate advertising town × service × band and return every combo that lacks
 * a non-stale covering row. `missing` = no row at all; `stale` = only rows older
 * than the freshness window. Provisional rows still count as coverage (they
 * drive the heavy-disclaimer path, not a gap).
 */
export function findCoverageGaps(
  towns: TownRef[],
  services: ServiceRef[],
  pricing: PricingRow[],
  opts: CoverageOptions,
): CoverageGap[] {
  const stalenessYears = opts.stalenessYears ?? 2;
  const minYear = opts.currentYear - stalenessYears;
  const gaps: CoverageGap[] = [];

  for (const town of towns) {
    if (!town.advertisingAllowed) continue; // gated towns never price
    for (const service of services) {
      for (const band of opts.bands) {
        const rows = pricing.filter(
          (p) => p.townSlug === town.slug && p.serviceSlug === service.slug && p.homeSizeBand === band,
        );
        if (rows.length === 0) {
          gaps.push({ townSlug: town.slug, serviceSlug: service.slug, band, reason: 'missing' });
        } else if (!rows.some((p) => p.effectiveYear >= minYear)) {
          gaps.push({ townSlug: town.slug, serviceSlug: service.slug, band, reason: 'stale' });
        }
      }
    }
  }
  return gaps;
}
