# Meta-Agent Review: Phase 03b — Town Pages (West Batch)

You are an adversarial code reviewer. Verify Phase 03b independently.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §2.2, §2.4, §4.4 + SOW §4
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-03b-town-pages-west.md`
3. Builder report + `/areas/[town]/` template + town content on disk

## What Phase 03b Should Have Built
**Objective:** 6 west-batch launch towns (Huntington, Smithtown, Islip, Babylon, Commack, Bay Shore) at flat `/areas/[town]/`, meeting the SOW §4 content-depth standard. **Spec:** 2.2, 2.4, 4.4. **Implements:** F-002, F-003, F-019.

## Review Checklist
- [ ] All 6 west-batch towns render at `/areas/[town]/` with self-referencing canonical
- [ ] Each town has all 7 required content-depth fields populated **from CMS** (no name-swap/hardcoded prose)
- [ ] The Phase-01 required-field publish gate holds (no town publishes with an empty required field)
- [ ] Price range renders from `townPricing`; provisional combos show the heavy disclaimer, **not** a book-CTA
- [ ] In-body license number on every town page
- [ ] Standing gate exits 0; `npm run build` exits 0
- [ ] **Diff stayed under the ~2000-line ceiling**; only the 6 west towns were built (no 03c towns, no East-End pages, no JSON-LD/islands)
- [ ] No `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — 6 towns render fully from CMS, gate holds, pricing/license correct, under the diff ceiling.
- **FIX** — a missing/empty field, hardcoded prose, wrong pricing path, or scope spill; list precise `issues_found`.
- **ESCALATE** — a content-sourcing or scope contradiction needing a human.

> **HEAVY phase.** A second independent reviewer may judge this diff; disagreement force-escalates to a cross-vendor adjudicator rather than an ordinary fix cycle.
