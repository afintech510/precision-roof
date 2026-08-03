// East-End gate — the deterministic ZIP→town(s)→advertisingAllowed resolver
// (spec §3.2, §4.4, [C2-019, C2-020]). A quoted price is advertising under NY
// GBL §771-B, so East-End (Hamptons / North Fork) towns are informational-only
// and MUST NEVER receive a numeric price. This is the single source of truth for
// that gate, imported by both /api/lead and /api/quote so the two paths agree.
//
// FAIL-SAFE CONFLICT RULE: a ZIP can straddle multiple towns. If ANY matched
// town is gated, the whole ZIP resolves to `informational_only` — we would
// rather withhold a price we could have shown than advertise into a gated town.

/** One town a ZIP falls in, with whether that town may advertise a price. */
export interface ZipTownMatch {
  townSlug: string;
  advertisingAllowed: boolean;
}

/** ZIP (5-digit string) → the town(s) it falls in. */
export type ZipGateTable = Record<string, ZipTownMatch[]>;

export type GateKind = 'advertising' | 'informational_only' | 'out_of_area';

export interface GateResolution {
  kind: GateKind;
  /** Advertising town slugs for this ZIP (empty for out_of_area). */
  townSlugs: string[];
}

/**
 * Normalize a raw ZIP to a canonical 5-digit string, or null if malformed.
 * Accepts "11743" and ZIP+4 ("11743-1234" / "117431234"); anything else is null
 * so the caller can distinguish MALFORMED input from a well-formed out-of-area
 * ZIP (spec §3.2 [C2-018]).
 */
export function normalizeZip(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const m = /^(\d{5})(?:-?\d{4})?$/.exec(trimmed);
  return m ? m[1] : null;
}

/**
 * Resolve a raw ZIP against the gate table. A malformed ZIP returns null (the
 * caller renders the malformed payload); a well-formed ZIP always resolves to
 * one of the three kinds. The fail-safe conflict rule applies: any gated match
 * wins.
 */
export function resolveZipGate(
  rawZip: unknown,
  table: ZipGateTable = SUFFOLK_ZIP_GATE,
): GateResolution | null {
  const zip = normalizeZip(rawZip);
  if (zip === null) return null; // malformed — not this module's outcome to name

  const matches = table[zip];
  if (!matches || matches.length === 0) {
    return { kind: 'out_of_area', townSlugs: [] };
  }

  // Fail-safe: any gated match → informational_only for the whole ZIP.
  const gated = matches.filter((m) => !m.advertisingAllowed);
  if (gated.length > 0) {
    return { kind: 'informational_only', townSlugs: gated.map((m) => m.townSlug) };
  }

  return { kind: 'advertising', townSlugs: matches.map((m) => m.townSlug) };
}

const adv = (townSlug: string): ZipTownMatch => ({ townSlug, advertisingAllowed: true });
const gated = (townSlug: string): ZipTownMatch => ({ townSlug, advertisingAllowed: false });

/**
 * Canonical Suffolk County ZIP gate. Western/central launch towns advertise;
 * the East End (South Fork Hamptons + North Fork + Shelter Island) is gated.
 * Data-driven so it can be swapped for a Sanity/CMS-sourced table later without
 * touching the resolver logic. NOT exhaustive of every Suffolk ZIP — anything
 * absent resolves to `out_of_area` (a warm hand-off, never a price).
 */
export const SUFFOLK_ZIP_GATE: ZipGateTable = {
  // — Advertising: Town of Huntington —
  '11743': [adv('huntington')], // Huntington / Huntington Bay
  '11746': [adv('huntington')], // Huntington Station / Dix Hills
  '11740': [adv('huntington')], // Greenlawn
  '11724': [adv('huntington')], // Cold Spring Harbor
  '11768': [adv('northport')], // Northport
  // — Advertising: Town of Smithtown —
  '11787': [adv('smithtown')], // Smithtown
  '11780': [adv('smithtown')], // St. James
  '11754': [adv('smithtown')], // Kings Park
  '11767': [adv('smithtown')], // Nesconset
  '11725': [adv('commack')], // Commack
  // — Advertising: Town of Babylon —
  '11702': [adv('babylon')], // Babylon village
  '11703': [adv('babylon')], // North Babylon
  '11704': [adv('babylon')], // West Babylon
  '11757': [adv('babylon')], // Lindenhurst
  // — Advertising: Town of Islip / Brookhaven (launch coverage grid) —
  '11751': [adv('islip')], // Islip
  '11706': [adv('bay-shore')], // Bay Shore
  '11782': [adv('sayville')], // Sayville
  '11772': [adv('patchogue')], // Patchogue
  '11719': [adv('brookhaven')], // Brookhaven hamlet
  '11777': [adv('port-jefferson')], // Port Jefferson
  '11901': [adv('riverhead')], // Riverhead (western North Fork gateway, in launch)

  // — Gated: South Fork (the Hamptons) —
  '11968': [gated('southampton')], // Southampton
  '11946': [gated('southampton')], // Hampton Bays
  '11977': [gated('southampton')], // Westhampton Beach
  '11978': [gated('southampton')], // Westhampton
  '11932': [gated('southampton')], // Bridgehampton
  '11937': [gated('east-hampton')], // East Hampton
  '11954': [gated('east-hampton')], // Montauk
  '11930': [gated('east-hampton')], // Amagansett
  '11963': [gated('sag-harbor')], // Sag Harbor (straddles Southampton/East Hampton — both gated)
  // — Gated: Shelter Island & North Fork —
  '11964': [gated('shelter-island')], // Shelter Island
  '11971': [gated('southold')], // Southold
  '11944': [gated('southold')], // Greenport
  '11952': [gated('southold')], // Mattituck
  '11935': [gated('southold')], // Cutchogue
};
