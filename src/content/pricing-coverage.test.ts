import { describe, it, expect } from 'vitest';
import { findCoverageGaps, type TownRef, type ServiceRef, type PricingRow } from './pricing-coverage';

const towns: TownRef[] = [
  { slug: 'huntington', advertisingAllowed: true },
  { slug: 'southampton', advertisingAllowed: false }, // East-End gated
];
const services: ServiceRef[] = [{ slug: 'roof-replacement' }];
const bands = ['small', 'large'];
const opts = { bands, currentYear: 2026, stalenessYears: 2 };

function row(over: Partial<PricingRow> = {}): PricingRow {
  return { townSlug: 'huntington', serviceSlug: 'roof-replacement', homeSizeBand: 'small', effectiveYear: 2026, ...over };
}

describe('pricing coverage', () => {
  it('passes when every advertising combo has a fresh row', () => {
    const pricing = [row({ homeSizeBand: 'small' }), row({ homeSizeBand: 'large' })];
    expect(findCoverageGaps(towns, services, pricing, opts)).toEqual([]);
  });

  it('flags a missing combo', () => {
    const pricing = [row({ homeSizeBand: 'small' })]; // 'large' missing
    const gaps = findCoverageGaps(towns, services, pricing, opts);
    expect(gaps).toEqual([{ townSlug: 'huntington', serviceSlug: 'roof-replacement', band: 'large', reason: 'missing' }]);
  });

  it('flags a stale-only combo (older than the freshness window)', () => {
    const pricing = [row({ homeSizeBand: 'small' }), row({ homeSizeBand: 'large', effectiveYear: 2023 })];
    const gaps = findCoverageGaps(towns, services, pricing, opts);
    expect(gaps).toContainEqual({ townSlug: 'huntington', serviceSlug: 'roof-replacement', band: 'large', reason: 'stale' });
  });

  it('counts provisional rows as coverage, not a gap', () => {
    const pricing = [row({ homeSizeBand: 'small' }), row({ homeSizeBand: 'large', provisional: true })];
    expect(findCoverageGaps(towns, services, pricing, opts)).toEqual([]);
  });

  it('exempts East-End gated towns (they never advertise a price)', () => {
    const pricing = [row({ homeSizeBand: 'small' }), row({ homeSizeBand: 'large' })];
    const gaps = findCoverageGaps(towns, services, pricing, opts);
    expect(gaps.some((g) => g.townSlug === 'southampton')).toBe(false);
  });
});
