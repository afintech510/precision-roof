// View-model types the templates render. These mirror the Sanity schema
// (spec §2.2) but are display-ready (prices in dollars, not cents).

export interface SiteSettings {
  businessName: string;
  licenseNumber: string;
  dcaVerifyUrl?: string;
  phone: string;
  phoneHref: string;
  email?: string;
  addressLine: string;
}

export interface ServiceLite {
  name: string;
  slug: string;
  category: 'urgent' | 'standard';
  isEmergencyCluster: boolean;
  summary: string;
  jsonLdServiceType?: string;
  icon: string; // inline svg path data (24x24)
}

export interface PriceBand {
  band: 'small' | 'medium' | 'large';
  bandLabel: string;
  low: number; // dollars
  high: number; // dollars
  provisional?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TownDepth {
  buildingDepartment: { streetAddress: string; phone: string; counterHours: string; filingMethod: string };
  permit: { requiredForReroof: boolean; fee: string; turnaroundBusinessDays: number };
  historicOverlay: { applies: boolean; details?: string };
  housingStock: { era: string; type: string; typicalRoofSquares: number };
  localConditions: string[];
  namedStreets: string[];
  hamlets: string[];
  landmarks: string[];
}

export interface TownFull {
  name: string;
  slug: string;
  advertisingAllowed: boolean;
  blurb: string;
  depth: TownDepth;
  pricing: PriceBand[];
  faqs: FaqItem[];
}

export interface Review {
  authorName: string;
  rating: number;
  text: string;
  town?: string;
  /** Epoch-ms the review feed was last synced (spec §2.2). Absent/stale means
   * AggregateRating JSON-LD is suppressed rather than emitted — see
   * src/lib/structured-data.ts `aggregateRating`. */
  lastSyncedAt?: number;
}

export interface Post {
  title: string;
  slug: string;
  excerpt: string;
  /** ISO 8601 date, display-ready. */
  publishedAt: string;
  /** Paragraphs; mirrors the Sanity `post.body` Portable Text field once
   * seeded (a renderer swap, not a shape change). Trusted HTML — authored
   * locally, never user input — so a paragraph may embed `<a>` links to
   * service/town pages (Phase 10 in-body linking, spec §4.4). Rendered with
   * `set:html`, matching how Portable Text will render rich text later. */
  body: string[];
  /** Slugs into ServiceLite/TownFull — drives blog↔money-page internal
   * linking (spec §4.4, F-006), finalized as in-body links in Phase 10. */
  relatedServiceSlugs?: string[];
  relatedTownSlugs?: string[];
}
