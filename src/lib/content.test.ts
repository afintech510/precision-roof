import { describe, it, expect } from 'vitest';
import * as sample from './sample';
import {
  getSite,
  getServices,
  getTowns,
  getTownNames,
  getReviews,
  getTown,
  getService,
  getPosts,
  getPost,
  formatUsd,
  getQuoteTowns,
  getPricingRows,
} from './content';

describe('content facade reads', () => {
  it('returns the sample site settings', async () => {
    expect(await getSite()).toBe(sample.sampleSite);
  });

  it('returns the sample services', async () => {
    expect(await getServices()).toBe(sample.sampleServices);
  });

  it('returns the sample towns', async () => {
    expect(await getTowns()).toBe(sample.sampleTowns);
  });

  it('returns the sample town names', async () => {
    expect(await getTownNames()).toBe(sample.sampleTownNames);
  });

  it('returns the sample reviews', async () => {
    expect(await getReviews()).toBe(sample.sampleReviews);
  });

  it('returns the sample posts', async () => {
    expect(await getPosts()).toBe(sample.samplePosts);
  });
});

describe('getTown', () => {
  it('finds a town by slug', async () => {
    const town = await getTown('huntington');
    expect(town?.name).toBe('Huntington');
  });

  it('returns undefined for an unknown slug', async () => {
    expect(await getTown('nowhere')).toBeUndefined();
  });
});

describe('getService', () => {
  it('finds a service by slug', async () => {
    const service = await getService('roof-inspection');
    expect(service?.name).toBe('Roof Inspection');
  });

  it('returns undefined for an unknown slug', async () => {
    expect(await getService('nowhere')).toBeUndefined();
  });
});

describe('getPost', () => {
  it('finds a post by slug', async () => {
    const [firstPost] = sample.samplePosts;
    expect(await getPost(firstPost.slug)).toBe(firstPost);
  });

  it('returns undefined for an unknown slug', async () => {
    expect(await getPost('nowhere')).toBeUndefined();
  });
});

describe('formatUsd', () => {
  it('formats with a dollar sign and thousands separators', () => {
    expect(formatUsd(18500)).toBe('$18,500');
  });

  it('formats zero', () => {
    expect(formatUsd(0)).toBe('$0');
  });
});

describe('getQuoteTowns', () => {
  it('includes only advertising-allowed towns', async () => {
    const quoteTowns = await getQuoteTowns();
    expect(quoteTowns.length).toBeGreaterThan(0);
    expect(quoteTowns.every((t) => t.advertisingAllowed)).toBe(true);

    const gatedTown = sample.sampleTowns.find((t) => !t.advertisingAllowed);
    expect(gatedTown).toBeDefined();
    expect(quoteTowns.some((t) => t.slug === gatedTown!.slug)).toBe(false);
  });

  it('carries slug, name, and advertisingAllowed for each town', async () => {
    const quoteTowns = await getQuoteTowns();
    const huntington = quoteTowns.find((t) => t.slug === 'huntington');
    expect(huntington).toEqual({ slug: 'huntington', name: 'Huntington', advertisingAllowed: true });
  });
});

describe('getPricingRows', () => {
  it('emits one row per pricing band, only for advertising-allowed towns', async () => {
    const rows = await getPricingRows();
    const advertisingTowns = sample.sampleTowns.filter((t) => t.advertisingAllowed);
    const expectedCount = advertisingTowns.reduce((sum, t) => sum + t.pricing.length, 0);
    expect(rows.length).toBe(expectedCount);

    const gatedTown = sample.sampleTowns.find((t) => !t.advertisingAllowed);
    expect(rows.some((r) => r.townSlug === gatedTown!.slug)).toBe(false);
  });

  it('carries townSlug, serviceSlug, band, and price range', async () => {
    const rows = await getPricingRows();
    const huntingtonSmall = rows.find((r) => r.townSlug === 'huntington' && r.band === 'small');
    expect(huntingtonSmall).toMatchObject({
      townSlug: 'huntington',
      serviceSlug: 'roof-replacement',
      band: 'small',
      low: 12000,
      high: 18500,
    });
    expect(huntingtonSmall).not.toHaveProperty('provisional');
  });

  it('marks a row provisional when the source band is provisional', async () => {
    const town = sample.sampleTowns.find((t) => t.advertisingAllowed && t.pricing.length > 0)!;
    const band = town.pricing[0];
    band.provisional = true;
    try {
      const rows = await getPricingRows();
      const row = rows.find((r) => r.townSlug === town.slug && r.band === band.band);
      expect(row).toMatchObject({ provisional: true });
    } finally {
      band.provisional = undefined;
    }
  });
});
