// Phase 00: Sanity project link stub. Phase 01 converts this into a full
// `defineConfig(...)` from the `sanity` studio package and registers the
// document types (town / service / townPricing / job / review / faq / post /
// siteSettings). Kept dependency-free here so the Phase 00 scaffold stays lean.
// Excluded from tsc (see tsconfig "exclude").
export const sanityProject = {
  projectId: process.env.SANITY_PROJECT_ID ?? 'af66eilq',
  dataset: process.env.SANITY_DATASET ?? 'production',
} as const;
