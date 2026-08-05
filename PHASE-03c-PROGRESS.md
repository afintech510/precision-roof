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

## Done, this run (Task 2, complete)

**East-End informational gate.** Added `TownFull` entries for **Southampton,
East Hampton, and Shelter Island** to `src/lib/sample.ts` (`advertisingAllowed:
false`, real building-department address/phone from each town's official site,
`pricing: []`, informational FAQs that state plainly we don't hold that town's
separate contractor license). `src/pages/areas/[slug].astro` now branches on
`town.advertisingAllowed`:
- Gated towns get no hero book/phone CTA, no price aside (`.tprice` omitted
  entirely, not just hidden), and the bottom section is a hand-off paragraph
  (verify-the-contractor + DCA link) instead of a "Book a free inspection" CTA.
- The building-department/permit/historic-overlay/housing-stock "local
  specifics" section and FAQs still render — informational content, not an
  advertising claim.

`src/pages/areas/index.astro` gained a small "East End — not licensed to
advertise there yet" section linking the 3 gated pages, so they're reachable
within the `seo-technical` integration's ≤2-click-depth gate (`npm run build`
would otherwise fail the link-graph check on unreachable pages) — this also
happens to be the honest hand-off framing the phase's CAUTION note asked for,
just placed on the hub page rather than duplicated per-town.

**Page test (acceptance criteria: "assert via page test"):** added
`e2e/east-end-gate.spec.ts` — Playwright, scoped to `#main` (site-wide
header/footer phone contact chrome is out of scope for this gate, present on
every page including `/accessibility/`): asserts no "Book a free inspection"
link, no `tel:` link, no `.tprice`, no `.lead-form`/`.quote-widget`/
`.calcom-facade` island, and no dollar-figure text, on all 3 gated routes;
plus a reachability check on `/areas/` and a regression check that an
advertising town (Huntington) still renders its CTA + price. Also added the 3
gated routes to `e2e/a11y.spec.ts`'s route list.

**Unknown/ambiguous slug fail-safe:** already satisfied — `/api/quote` and
`/api/lead` resolve via `src/server/east-end-gate.ts`'s `SUFFOLK_ZIP_GATE`
(Phase 05b), which defaults any unmatched ZIP to `out_of_area` and any
ZIP straddling a gated town to `informational_only`. Page routes are static
(`getStaticPaths` off `getTowns()`), so there's no "unknown slug" page to
gate — Astro 404s anything not in the town list, which is itself fail-safe
(never an advertising page for a slug that isn't an advertising town).

**Not touched this run:** the 3 remaining east-batch advertising towns
(Sayville, Riverhead, Northport) — still "publishing soon" placeholders in
the `/areas/` coverage grid. Left for a follow-up increment to keep this
diff scoped to Task 2.

**Gate:** `npm run typecheck` / `npm run lint` / `npx vitest run` (375
tests) / `npm run build` all green (36 pages now, anchor ratio 0.0%,
click-depth still ≤2). `node_modules` didn't exist at session start in this
container — ran `npm ci` (lockfile-exact restore, not a dependency change)
so the gate commands could run at all.

`npx playwright test`: every project now fails to launch —
`chrome-headless-shell-1234` isn't present in `/opt/pw-browsers` (only
`chromium-1194` / `chromium_headless_shell-1194` exist), the same
pre-existing environment gap `PHASE-03b-PROGRESS.md` flagged, except this
container instance is missing it for mobile-375/tablet-768 too, not just
desktop-1440 — a version mismatch between what this Playwright release
expects and what's pre-installed in this particular container. Tried
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to point at the installed
`/opt/pw-browsers/chromium`; didn't change the lookup. Did not hardcode an
`executablePath` into the committed `playwright.config.ts` — that path is
this sandbox's local quirk, not necessarily valid in whatever environment
actually runs CI, and hardcoding it there risked breaking a real CI run to
paper over a local one. Left unresolved per the "don't block a
backend/content increment on it" guidance; the a11y suite itself and the new
`east-end-gate.spec.ts` are unverified by an actual browser run this session
— reasoned correct by inspection (scoped selectors, `#main`-relative) and
consistent with the existing a11y suite's pattern, but flagging that as
unverified rather than claiming a pass that didn't happen.

## Still open for Phase 03c

- **Remaining east-batch towns:** Sayville, Riverhead, Northport — still
  shown as "publishing soon" placeholders in the `/areas/` coverage grid.
- Playwright browser-version mismatch above — infra, not a code gap; worth a
  container-image fix (or an environment-level `executablePath` override
  outside the repo) so `npx playwright test` is actually runnable in this
  sandbox again.
