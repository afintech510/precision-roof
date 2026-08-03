import type { SiteSettings, ServiceLite, FaqItem } from './types';

// JSON-LD builders (spec §2.2/§4, F-007). Pure functions returning plain
// objects so they unit-test without a DOM. Review/AggregateRating is emitted
// only from a real, freshness-checked feed (Phase 06 wiring), never sampled.

const SITE = 'https://roof.benchworksai.com';
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
