import { describe, it, expect } from 'vitest';
import { roofingContractor, breadcrumbs, serviceSchema, faqPage, aggregateRating } from './structured-data';
import { sampleSite, sampleServices, sampleReviews } from './sample';
import type { Review } from './types';

describe('structured data (JSON-LD)', () => {
  it('emits a RoofingContractor with name, phone and license', () => {
    const s = roofingContractor(sampleSite);
    expect(s['@type']).toBe('RoofingContractor');
    expect(s.name).toBe(sampleSite.businessName);
    expect(s.telephone).toBe(sampleSite.phoneHref.replace('tel:', ''));
    expect(s.identifier).toBe(sampleSite.licenseNumber);
  });

  it('numbers breadcrumb positions from 1 with absolute URLs', () => {
    const b = breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Areas', path: '/areas/' }]);
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(b.itemListElement[0].item).toMatch(/^https:\/\//);
  });

  it('builds a Service tied to the business', () => {
    const svc = serviceSchema(sampleServices[0], sampleSite);
    expect(svc['@type']).toBe('Service');
    expect(svc.provider.name).toBe(sampleSite.businessName);
  });

  it('builds a FAQPage from question/answer pairs', () => {
    const f = faqPage([{ question: 'Q?', answer: 'A.' }]);
    expect(f['@type']).toBe('FAQPage');
    expect(f.mainEntity[0].acceptedAnswer.text).toBe('A.');
  });

  describe('aggregateRating', () => {
    const now = 1_800_000_000_000;

    it('suppresses when reviews have no lastSyncedAt (never emit from placeholder data)', () => {
      expect(aggregateRating(sampleReviews, sampleSite, { now })).toBeNull();
    });

    it('suppresses when there are no reviews', () => {
      expect(aggregateRating([], sampleSite, { now })).toBeNull();
    });

    it('suppresses when the oldest sync is stale (past the freshness window)', () => {
      const stale: Review[] = sampleReviews.map((r) => ({ ...r, lastSyncedAt: now - 60 * 24 * 60 * 60 * 1000 }));
      expect(aggregateRating(stale, sampleSite, { now })).toBeNull();
    });

    it('suppresses when even one review is missing lastSyncedAt', () => {
      const mixed: Review[] = [
        { ...sampleReviews[0], lastSyncedAt: now },
        { ...sampleReviews[1] }, // no lastSyncedAt
      ];
      expect(aggregateRating(mixed, sampleSite, { now })).toBeNull();
    });

    it('emits AggregateRating when every review is freshly synced', () => {
      const fresh: Review[] = sampleReviews.map((r) => ({ ...r, lastSyncedAt: now - 24 * 60 * 60 * 1000 }));
      const rating = aggregateRating(fresh, sampleSite, { now }) as Record<string, unknown>;
      expect(rating).not.toBeNull();
      expect(rating['@type']).toBe('AggregateRating');
      expect(rating.reviewCount).toBe(fresh.length);
      expect(rating.ratingValue).toBe(5);
    });
  });
});
