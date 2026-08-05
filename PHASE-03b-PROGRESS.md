# Phase 03b: Town Pages (West Batch) — status

**Scope (per BUILDPLAN):** the 6 west/central launch towns — Huntington,
Smithtown, Islip, Babylon, Commack, Bay Shore.

**Done, this run:** added detailed `TownFull` entries (building department,
permit, historic-overlay, housing stock, local conditions, FAQs) for the 3
towns that only had coverage-grid placeholders — **Islip, Commack, Bay
Shore** — following the exact shape/tone already established by Huntington,
Smithtown, and Babylon in `src/lib/sample.ts`. All 6 west-batch towns now
render full `/areas/[slug]/` pages.

Side effects that fall out of the same-shape data (no template changes
needed):
- `getQuoteTowns()` / `getPricingRows()` (`src/lib/content.ts`) now include
  Islip, Commack, and Bay Shore automatically — `/api/quote` and the quote
  widget can price all 6 west towns, not just 3.
- `e2e/a11y.spec.ts`'s `ROUTES` list extended with the 3 new `/areas/`
  slugs so the axe sweep covers them too (not run this session — see below).

**Content basis.** Same "representative, clearly-labeled sample content"
convention as the existing 3 towns (`sample.ts`'s header comment) — plausible
building-department addresses/phone formats, and landmarks/streets that are
real, well-known places (Hoyt Farm Nature Preserve, Fire Island Ferry
Terminal, Heckscher State Park) rather than invented specifics. Not sourced
from a live lookup; swaps to real Sanity `town` documents with the same
shape once the dataset is seeded (`src/lib/content.ts`'s existing facade
pattern), same as every other town.

**Gate:** `npm run typecheck` / `npm run lint` / `npx vitest run` (375
tests) / `npm run build` all green, including the perf-budget, CSP, and
seo-technical build-time checks (30 pages now, anchor ratio still 0.0%).
`npx playwright test` was attempted but the installed browser
(`chromium-1194`) doesn't match what `playwright.config` expects
(`chrome-headless-shell-1234` missing) — a pre-existing environment gap that
fails uniformly across every route, old and new alike, not something this
change introduced. Left unresolved per the "don't block a backend/content
increment on it" guidance; needs `npx playwright install` or a matching
pre-installed browser image.

## Still open for Phase 03b/03c

- **East batch (Phase 03c):** Brookhaven, Patchogue, Port Jefferson,
  Sayville, Riverhead, and the 12th North-Shore hamlet (Northport or St.
  James per keyword-demand ranking — `// SPEC-AMBIGUITY`, not picked yet).
- **East-End gated informational pages** (Southampton, East Hampton, Shelter
  Island) — no advertising CTA, licensing-gated, also Phase 03c scope.
- Playwright browser mismatch above — infra, not a code gap.
