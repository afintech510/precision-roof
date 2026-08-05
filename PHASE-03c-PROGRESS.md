# Phase 03c: Town Pages (East Batch) — status

**Scope (per BUILDPLAN):** the 6 east-batch launch towns — Brookhaven,
Patchogue, Port Jefferson, Sayville, Riverhead, and the 12th North-Shore
hamlet-town — plus East-End informational-only rendering for the
licensing-gated towns (Southampton, East Hampton, Shelter Island).

**Done, this run (Task 1, partial):** added detailed `TownFull` entries
(building department, permit, historic-overlay, housing stock, local
conditions, FAQs) for **Brookhaven, Patchogue, and Port Jefferson** in
`src/lib/sample.ts`, following the exact shape/tone established by the west
batch (Phase 03b). All 9 towns with detailed entries now render full
`/areas/[slug]/` pages; `e2e/a11y.spec.ts`'s route list extended to cover
the 3 new slugs.

Side effects that fall out of the same-shape data (no template changes
needed, matching the 03b precedent):
- `getQuoteTowns()` / `getPricingRows()` (`src/lib/content.ts`) now include
  Brookhaven, Patchogue, and Port Jefferson automatically.
- `src/server/east-end-gate.ts`'s `SUFFOLK_ZIP_GATE` already had ZIP
  entries for these 3 slugs (`11719`, `11772`, `11777`) from an earlier
  phase — no gate-table change was needed, just the content to back them.

**12th-town selection confirmed, not newly decided.** `sampleTownNames`
already listed **Northport** (not St. James) as the 12th launch town before
this run — St. James already appears as a Smithtown hamlet, so Northport is
the non-conflicting pick. This run didn't change that list, just noted it
here since Phase 03c's acceptance criteria calls for the selection to be
either wired or marked `// SPEC-AMBIGUITY`; it's wired (a detailed page for
Northport itself is still pending — see below).

**Gate:** `npm run typecheck` / `npm run lint` / `npx vitest run` (375
tests) / `npm run build` all green (33 pages now, anchor ratio still 0.0%).
`npx playwright test`: mobile-375 and tablet-768 projects pass (6/6);
desktop-1440 fails uniformly across every route, old and new alike —
`chrome-headless-shell-1234` isn't present in this container
(`/opt/pw-browsers` only has `chromium-1194` /
`chromium_headless_shell-1194`), the same pre-existing environment gap
`PHASE-03b-PROGRESS.md` already flagged. Not something this change
introduced; left unresolved per the "don't block a backend/content
increment on it" guidance.

## Still open for Phase 03c

- **Remaining east-batch towns:** Sayville, Riverhead, Northport — still
  shown as "publishing soon" placeholders in the `/areas/` coverage grid.
- **East-End informational gate (Task 2):** `src/pages/areas/[slug].astro`
  currently renders the same book/price/quote CTAs for every town
  unconditionally — there is no `advertisingAllowed` branch yet. Southampton,
  East Hampton, and Shelter Island don't have `TownFull` entries in
  `sample.ts` at all yet, so they don't render at any route today (fail-safe
  by omission, not by design) — the acceptance criteria that gated pages
  render with no conversion surface still needs the template branch, the 3
  gated-town content entries, and a page test asserting no
  LeadForm/QuoteWidget/BookingEmbed island renders for them.
- Playwright `chrome-headless-shell-1234` mismatch above — infra, not a
  code gap.
