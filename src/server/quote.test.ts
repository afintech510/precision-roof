import { describe, it, expect } from 'vitest';
import { computeQuote, blobKey, type PricingBlob, type QuoteContext } from './quote';
import type { ZipGateTable } from './east-end-gate';

const towns = [
  { slug: 'huntington', name: 'Huntington', advertisingAllowed: true },
  { slug: 'southampton', name: 'Southampton', advertisingAllowed: false },
];

const blob: PricingBlob = {
  builtAt: 1000,
  ranges: {
    [blobKey('huntington', 'roof-replacement', 'medium')]: { low: 18000, high: 30000 },
    [blobKey('huntington', 'roof-replacement', 'large')]: { low: 28000, high: 46000, provisional: true },
  },
};

const ctx: QuoteContext = { blob, towns };

// A ZIP table with a real conflict so we can prove the fail-safe path in the engine.
const conflictTable: ZipGateTable = {
  '11743': [{ townSlug: 'huntington', advertisingAllowed: true }],
  '11968': [{ townSlug: 'southampton', advertisingAllowed: false }],
  '11111': [
    { townSlug: 'huntington', advertisingAllowed: true },
    { townSlug: 'southampton', advertisingAllowed: false },
  ],
};
const ctxZip: QuoteContext = { blob, towns, gateTable: conflictTable };

describe('computeQuote — estimate path', () => {
  it('returns a numeric range for an advertising town via townSlug', () => {
    const r = computeQuote({ townSlug: 'huntington', serviceSlug: 'roof-replacement', band: 'medium' }, ctx);
    expect(r.outcome).toBe('estimate');
    expect(r.reason).toBe('ok');
    expect(r.estimate).toEqual({ low: 18000, high: 30000, band: 'medium', provisional: false });
    expect(r.town).toBe('Huntington');
    expect(r.phoneCta).toBe(false);
    expect(r.disclosure).toMatch(/non-binding/i);
  });

  it('returns a numeric range for an advertising ZIP', () => {
    const r = computeQuote({ zip: '11743', serviceSlug: 'roof-replacement', band: 'medium' }, ctxZip);
    expect(r.outcome).toBe('estimate');
    expect(r.estimate?.low).toBe(18000);
  });

  it('flags a provisional combo with a heavy disclaimer, not a bare number', () => {
    const r = computeQuote({ townSlug: 'huntington', serviceSlug: 'roof-replacement', band: 'large' }, ctx);
    expect(r.outcome).toBe('estimate');
    expect(r.reason).toBe('provisional');
    expect(r.estimate?.provisional).toBe(true);
    expect(r.disclosure).toMatch(/provisional/i);
  });
});

describe('computeQuote — East-End gate (never a price)', () => {
  it('gated town via townSlug → informational_only, no estimate', () => {
    const r = computeQuote({ townSlug: 'southampton', serviceSlug: 'roof-replacement', band: 'medium' }, ctx);
    expect(r.outcome).toBe('informational_only');
    expect(r.estimate).toBeUndefined();
    expect(r.phoneCta).toBe(true);
  });

  it('gated ZIP → informational_only even with a valid service/band', () => {
    const r = computeQuote({ zip: '11968', serviceSlug: 'roof-replacement', band: 'medium' }, ctxZip);
    expect(r.outcome).toBe('informational_only');
    expect(r.estimate).toBeUndefined();
  });

  it('fail-safe conflict ZIP (advertising + gated) → informational_only', () => {
    const r = computeQuote({ zip: '11111', serviceSlug: 'roof-replacement', band: 'medium' }, ctxZip);
    expect(r.outcome).toBe('informational_only');
    expect(r.estimate).toBeUndefined();
  });

  it('never touches the blob for a gated town (no numeric leak) even if a row exists', () => {
    // Seed a (spec-violating) priced row for the gated town; the gate must still win.
    const poisoned: QuoteContext = {
      towns,
      blob: { builtAt: 1, ranges: { [blobKey('southampton', 'roof-replacement', 'medium')]: { low: 1, high: 2 } } },
    };
    const r = computeQuote({ townSlug: 'southampton', serviceSlug: 'roof-replacement', band: 'medium' }, poisoned);
    expect(r.outcome).toBe('informational_only');
    expect(r.estimate).toBeUndefined();
  });
});

describe('computeQuote — out-of-area vs malformed', () => {
  it('well-formed unknown ZIP → out_of_area (warm hand-off, phone CTA)', () => {
    const r = computeQuote({ zip: '90210', serviceSlug: 'roof-replacement', band: 'medium' }, ctxZip);
    expect(r.outcome).toBe('out_of_area');
    expect(r.reason).toBe('unknown_location');
    expect(r.phoneCta).toBe(true);
    expect(r.disclosure).toMatch(/service map/i);
  });

  it('unknown town slug → out_of_area', () => {
    const r = computeQuote({ townSlug: 'nowhere', serviceSlug: 'roof-replacement', band: 'medium' }, ctx);
    expect(r.outcome).toBe('out_of_area');
    expect(r.reason).toBe('unknown_location');
  });

  it('malformed ZIP → malformed (distinct from out_of_area)', () => {
    const r = computeQuote({ zip: '117', serviceSlug: 'roof-replacement', band: 'medium' }, ctxZip);
    expect(r.outcome).toBe('malformed');
    expect(r.reason).toBe('invalid_zip');
    expect(r.phoneCta).toBe(true);
  });

  it('no locator at all → malformed', () => {
    const r = computeQuote({ serviceSlug: 'roof-replacement', band: 'medium' }, ctx);
    expect(r.outcome).toBe('malformed');
    expect(r.reason).toBe('missing_locator');
  });

  it('does not act as a priced-combo oracle: out-of-area response is identical whether or not the blob has the combo', () => {
    const withCombo = computeQuote({ zip: '90210', serviceSlug: 'roof-replacement', band: 'medium' }, ctxZip);
    const withoutCombo = computeQuote({ zip: '90210', serviceSlug: 'metal-roofing', band: 'small' }, ctxZip);
    expect(withCombo).toEqual(withoutCombo);
  });
});

describe('computeQuote — malformed service/band on an in-area town', () => {
  it('missing service → malformed', () => {
    const r = computeQuote({ townSlug: 'huntington', band: 'medium' }, ctx);
    expect(r.outcome).toBe('malformed');
    expect(r.reason).toBe('invalid_service');
  });
  it('invalid band → malformed', () => {
    const r = computeQuote({ townSlug: 'huntington', serviceSlug: 'roof-replacement', band: 'gigantic' }, ctx);
    expect(r.outcome).toBe('malformed');
    expect(r.reason).toBe('invalid_band');
  });
});

describe('computeQuote — never fails closed', () => {
  it('in-area town, valid service/band, but combo out of launch scope → book path, not error', () => {
    const r = computeQuote({ townSlug: 'huntington', serviceSlug: 'metal-roofing', band: 'small' }, ctx);
    expect(r.outcome).toBe('out_of_area');
    expect(r.reason).toBe('out_of_scope');
    expect(r.phoneCta).toBe(true);
  });

  it('empty blob (materialization failed) → book path, never blank/error', () => {
    const emptyCtx: QuoteContext = { towns, blob: { builtAt: 0, ranges: {} } };
    const r = computeQuote({ townSlug: 'huntington', serviceSlug: 'roof-replacement', band: 'medium' }, emptyCtx);
    expect(r.outcome).toBe('out_of_area');
    expect(r.reason).toBe('blob_unavailable');
    expect(r.phoneCta).toBe(true);
  });
});
