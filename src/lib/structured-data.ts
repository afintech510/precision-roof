import type { SiteSettings, ServiceLite, FaqItem, Review, Post } from './types';

// JSON-LD builders (spec §2.2/§4, F-007). Pure functions returning plain
// objects so they unit-test without a DOM. Review/AggregateRating is emitted
// only from a real, freshness-checked feed (Phase 06 wiring), never sampled.

const SITE = 'https://premiumroofsolutions.com';
const abs = (path: string) => new URL(path, SITE).href;

export function roofingContractor(site: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    '@id': `${SITE}/#business`,
    name: site.businessName,
    telephone: site.phoneHref.replace('tel:', ''),
    areaServed: { '@type': 'AdministrativeArea', name: 'Suffolk County, NY' },
    address: { '@type': 'PostalAddress', addressRegion: 'NY', addressCountry: 'US' },
    url: SITE,
    ...(site.dcaVerifyUrl ? { hasCredential: site.dcaVerifyUrl } : {}),
    identifier: site.licenseNumber,
  };
}

export function breadcrumbs(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function serviceSchema(service: ServiceLite, site: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.jsonLdServiceType ?? service.name,
    name: service.name,
    description: service.summary,
    provider: { '@type': 'RoofingContractor', name: site.businessName, '@id': `${SITE}/#business` },
    areaServed: { '@type': 'AdministrativeArea', name: 'Suffolk County, NY' },
  };
}

export function faqPage(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function articleSchema(post: Post, site: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: site.businessName, '@id': `${SITE}/#business` },
    publisher: { '@type': 'Organization', name: site.businessName, '@id': `${SITE}/#business` },
    mainEntityOfPage: abs(`/resources/${post.slug}/`),
  };
}

const DEFAULT_REVIEW_FRESHNESS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Review/AggregateRating JSON-LD (spec §2.2 CAUTION, F-007) — emitted only
 * when every review carries a `lastSyncedAt` from a real feed sync and the
 * *oldest* sync is still within the freshness window; otherwise suppressed
 * (`null`), never fabricated from placeholder data. */
export function aggregateRating(
  reviews: Review[],
  site: SiteSettings,
  opts: { now: number; freshnessMs?: number },
): object | null {
  if (reviews.length === 0) return null;
  const freshnessMs = opts.freshnessMs ?? DEFAULT_REVIEW_FRESHNESS_MS;
  const syncTimes = reviews.map((r) => r.lastSyncedAt);
  if (syncTimes.some((t) => t === undefined)) return null;
  const oldestSync = Math.min(...(syncTimes as number[]));
  if (opts.now - oldestSync > freshnessMs) return null;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: { '@type': 'RoofingContractor', name: site.businessName, '@id': `${SITE}/#business` },
    ratingValue: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  };
}
