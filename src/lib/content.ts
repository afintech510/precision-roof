import * as sample from './sample';
import type { SourcePricingRow } from '../server/pricing-blob';
import type { QuoteTownRef } from '../server/quote';

// Content facade. Returns sample content today; when Sanity (project af66eilq)
// is seeded, these swap to @sanity/client queries (public reads, no token) with
// the same return shapes — templates don't change. Async so the swap is drop-in.

export const getSite = async () => sample.sampleSite;
export const getServices = async () => sample.sampleServices;
export const getTowns = async () => sample.sampleTowns;
export const getTownNames = async () => sample.sampleTownNames;
export const getReviews = async () => sample.sampleReviews;
export const getTown = async (slug: string) => sample.sampleTowns.find((t) => t.slug === slug);
export const getService = async (slug: string) => sample.sampleServices.find((s) => s.slug === slug);
export const getPosts = async () => sample.samplePosts;
export const getPost = async (slug: string) => sample.samplePosts.find((p) => p.slug === slug);

export const formatUsd = (n: number) => `$${n.toLocaleString('en-US')}`;

// ── Quote pricing source ─────────────────────────────────────────────────────
// The advertising towns the quote widget can price + the rows the pricing blob
// is materialized from. Derived from sample content now; swaps to Sanity
// `townPricing` documents when seeded (same shapes). Only advertising towns with
// real pricing are included — gated East-End towns never appear here (they never
// carry a price), and the quote engine's gate is the enforcement point.

/** The service the sample data actually prices (town-page replacement tables). */
const PRICED_SERVICE_SLUG = 'roof-replacement';

export const getQuoteTowns = async (): Promise<QuoteTownRef[]> =>
  sample.sampleTowns
    .filter((t) => t.advertisingAllowed)
    .map((t) => ({ slug: t.slug, name: t.name, advertisingAllowed: t.advertisingAllowed }));

export const getPricingRows = async (): Promise<SourcePricingRow[]> => {
  const rows: SourcePricingRow[] = [];
  for (const town of sample.sampleTowns) {
    if (!town.advertisingAllowed) continue;
    for (const band of town.pricing) {
      rows.push({
        townSlug: town.slug,
        serviceSlug: PRICED_SERVICE_SLUG,
        band: band.band,
        low: band.low,
        high: band.high,
        ...(band.provisional ? { provisional: true } : {}),
      });
    }
  }
  return rows;
};
