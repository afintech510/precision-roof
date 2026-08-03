import { describe, it, expect } from 'vitest';
import { classifyRoute, buildUrlSetXml, buildSitemapIndexXml, groupBySitemapCategory } from './seo';

describe('classifyRoute', () => {
  it('classifies town detail pages', () => {
    expect(classifyRoute('/areas/huntington/')).toBe('towns');
  });
  it('classifies service detail pages', () => {
    expect(classifyRoute('/services/roof-replacement/')).toBe('services');
  });
  it('classifies blog posts', () => {
    expect(classifyRoute('/blog/how-to-spot-a-leak/')).toBe('posts');
  });
  it('classifies hub and core pages as core', () => {
    expect(classifyRoute('/')).toBe('core');
    expect(classifyRoute('/areas/')).toBe('core');
    expect(classifyRoute('/services/')).toBe('core');
    expect(classifyRoute('/about/')).toBe('core');
  });
});

describe('buildUrlSetXml', () => {
  it('wraps each URL in a <url><loc> entry', () => {
    const xml = buildUrlSetXml(['https://example.com/', 'https://example.com/about/']);
    expect(xml).toContain('<url><loc>https://example.com/</loc></url>');
    expect(xml).toContain('<url><loc>https://example.com/about/</loc></url>');
    expect(xml).toMatch(/^<\?xml version="1.0"/);
  });

  it('escapes XML special characters', () => {
    const xml = buildUrlSetXml(['https://example.com/?a=1&b=2']);
    expect(xml).toContain('&amp;');
    expect(xml).not.toContain('&b=2<');
  });
});

describe('buildSitemapIndexXml', () => {
  it('lists each child sitemap', () => {
    const xml = buildSitemapIndexXml(['https://example.com/sitemap-core.xml', 'https://example.com/sitemap-towns.xml']);
    expect(xml).toContain('<sitemap><loc>https://example.com/sitemap-core.xml</loc></sitemap>');
    expect(xml).toContain('<sitemap><loc>https://example.com/sitemap-towns.xml</loc></sitemap>');
  });
});

describe('groupBySitemapCategory', () => {
  it('buckets URLs by content type', () => {
    const site = 'https://premiumroofsolutions.com';
    const groups = groupBySitemapCategory(
      [
        `${site}/`,
        `${site}/areas/huntington/`,
        `${site}/services/roof-replacement/`,
        `${site}/about/`,
      ],
      site,
    );
    expect(groups.towns).toEqual([`${site}/areas/huntington/`]);
    expect(groups.services).toEqual([`${site}/services/roof-replacement/`]);
    expect(groups.core).toEqual([`${site}/`, `${site}/about/`]);
    expect(groups.posts).toEqual([]);
  });
});
