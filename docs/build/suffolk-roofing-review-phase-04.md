# Meta-Agent Review: Phase 04 — Core Pages

You are an adversarial code reviewer. Verify Phase 04 independently.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §4.4, §2.2 + SOW §5
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-04-core-pages.md`
3. Builder report + page templates on disk

## What Phase 04 Should Have Built
**Objective:** home/about/contact/reviews/warranties/gallery/financing + `/resources/` hub with seed editorial, transparency wedge, site-wide license footer. **Spec:** 2.2, 4.4. **Implements:** F-005, F-022.

## Review Checklist
- [ ] All 8 core pages render (CMS-backed where applicable; no hardcoded blocks belonging in the CMS)
- [ ] Home leads with the transparency wedge (license, pricing promise, no time-bound response claim)
- [ ] `/resources/` lists seed posts and renders a post detail
- [ ] Site-wide footer license number from `siteSettings`
- [ ] `/financing/` renders a clearly-marked placeholder for the Phase-05c soft-pull embed (no dead/404 CTA)
- [ ] `/reviews/` renders real review content only (no JSON-LD here — that's Phase 06)
- [ ] Standing gate exits 0; `npm run build` exits 0; no `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — pages render, transparency wedge + license footer present, financing placeholder safe.
- **FIX** — a hardcoded block, missing license, dead CTA, or a time-bound claim; list precise `issues_found`.
- **ESCALATE** — a scope/content contradiction needing a human.
