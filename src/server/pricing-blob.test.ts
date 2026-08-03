import { describe, it, expect } from 'vitest';
import {
  buildPricingBlob,
  readPricingBlob,
  writePricingBlob,
  PRICING_BLOB_KEY,
  type KVStore,
  type SourcePricingRow,
} from './pricing-blob';
import { blobKey } from './quote';

function memKV(): KVStore & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    async get(k) { return store.get(k) ?? null; },
    async put(k, v) { store.set(k, v); },
  };
}

const rows: SourcePricingRow[] = [
  { townSlug: 'huntington', serviceSlug: 'roof-replacement', band: 'medium', low: 18500, high: 28000 },
  { townSlug: 'huntington', serviceSlug: 'roof-replacement', band: 'large', low: 28000, high: 46000, provisional: true },
];

describe('buildPricingBlob', () => {
  it('folds rows into keyed ranges and sets builtAt', () => {
    const blob = buildPricingBlob(rows, 1234);
    expect(blob.builtAt).toBe(1234);
    expect(blob.ranges[blobKey('huntington', 'roof-replacement', 'medium')]).toEqual({ low: 18500, high: 28000 });
    expect(blob.ranges[blobKey('huntington', 'roof-replacement', 'large')]).toEqual({ low: 28000, high: 46000, provisional: true });
  });
});

describe('KV read/write', () => {
  it('round-trips a blob', async () => {
    const kv = memKV();
    const blob = buildPricingBlob(rows, 999);
    await writePricingBlob(kv, blob);
    expect(kv.store.has(PRICING_BLOB_KEY)).toBe(true);
    expect(await readPricingBlob(kv)).toEqual(blob);
  });

  it('returns null for an undefined KV binding (falls back to content)', async () => {
    expect(await readPricingBlob(undefined)).toBeNull();
  });

  it('returns null for a corrupt blob rather than throwing', async () => {
    const kv = memKV();
    kv.store.set(PRICING_BLOB_KEY, '{not json');
    expect(await readPricingBlob(kv)).toBeNull();
  });
});
