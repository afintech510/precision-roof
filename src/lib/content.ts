import * as sample from './sample';

// Content facade. Returns sample content today; when Sanity (project af66eilq)
// is seeded, these swap to @sanity/client queries (public reads, no token) with
// the same return shapes — templates don't change. Async so the swap is drop-in.

export const getSite = async () => sample.sampleSite;
export const getServices = async () => sample.sampleServices;
export const getTowns = async () => sample.sampleTowns;
export const getTownNames = async () => sample.sampleTownNames;
export const getReviews = async () => sample.sampleReviews;
export const getTown = async (slug: string) => sample.sampleTowns.find((t) => t.slug === slug);
export const getService = async (slug: string) => sample.sampleServices.find((s) => s.slug === slug);

export const formatUsd = (n: number) => `$${n.toLocaleString('en-US')}`;
