import { blobKey, type PricingBlob, type QuoteBand } from './quote';

// Materialized pricing blob storage + build (spec §3.2 [C2-023]). The blob is a
// flat town|service|band → range map the quote engine reads. It's rebuilt by the
// sanity-publish webhook and cached in KV; the quote route falls back to building
// it in-process from CMS content if KV is empty, so /api/quote never fails closed.

/** Minimal KV surface (a subset of Cloudflare's KVNamespace) so it's mockable. */
export interface KVStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

/** A single priced combo as delivered by the content source (Sanity or sample). */
export interface SourcePricingRow {
  townSlug: string;
  serviceSlug: string;
  band: QuoteBand;
  low: number;
  high: number;
  provisional?: boolean;
}

export const PRICING_BLOB_KEY = 'pricing-blob:current';

/** Fold source rows into the flat blob the quote engine consumes. */
export function buildPricingBlob(rows: SourcePricingRow[], builtAt: number): PricingBlob {
  const ranges: PricingBlob['ranges'] = {};
  for (const r of rows) {
    ranges[blobKey(r.townSlug, r.serviceSlug, r.band)] = {
      low: r.low,
      high: r.high,
      ...(r.provisional ? { provisional: true } : {}),
    };
  }
  return { builtAt, ranges };
}

export async function readPricingBlob(kv: KVStore | undefined): Promise<PricingBlob | null> {
  if (!kv) return null;
  const raw = await kv.get(PRICING_BLOB_KEY);
  if (!raw) return null;
  try {
    const blob = JSON.parse(raw) as PricingBlob;
    if (blob && typeof blob.builtAt === 'number' && blob.ranges) return blob;
    return null;
  } catch {
    return null; // corrupt blob → treat as absent, fall back to content
  }
}

export async function writePricingBlob(kv: KVStore, blob: PricingBlob): Promise<void> {
  await kv.put(PRICING_BLOB_KEY, JSON.stringify(blob));
}
