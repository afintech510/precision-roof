// Split-sitemap builders (spec §4.4, SOW §8, F-017). Pure XML string builders
// so they unit-test without a filesystem; an Astro integration
// (src/integrations/seo-technical.ts) runs this over the emitted pages.

export type SitemapCategory = 'towns' | 'services' | 'posts' | 'core';

/** Classifies a built route by content type for the split sitemaps. Detail
 * pages under /areas/ and /services/ get their own category; hub pages
 * (/areas/, /services/) and everything else fall back to `core`. */
export function classifyRoute(pathname: string): SitemapCategory {
  if (/^\/areas\/[^/]+\/$/.test(pathname)) return 'towns';
  if (/^\/services\/[^/]+\/$/.test(pathname)) return 'services';
  if (/^\/blog\/[^/]+\/$/.test(pathname)) return 'posts';
  return 'core';
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function buildUrlSetXml(urls: string[]): string {
  const entries = urls.map((u) => `<url><loc>${escapeXml(u)}</loc></url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
}

export function buildSitemapIndexXml(sitemapUrls: string[]): string {
  const entries = sitemapUrls.map((u) => `<sitemap><loc>${escapeXml(u)}</loc></sitemap>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`;
}

/** Groups absolute page URLs into their sitemap category buckets, in the
 * order encountered (stable output for reproducible builds). */
export function groupBySitemapCategory(pageUrls: string[], siteUrl: string): Record<SitemapCategory, string[]> {
  const groups: Record<SitemapCategory, string[]> = { towns: [], services: [], posts: [], core: [] };
  for (const url of pageUrls) {
    const pathname = url.startsWith(siteUrl) ? url.slice(siteUrl.length) || '/' : new URL(url).pathname;
    groups[classifyRoute(pathname)].push(url);
  }
  return groups;
}
