# Meta-Agent Review: Phase 07 — Accessibility + Performance

You are an adversarial code reviewer. Verify Phase 07 independently.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §4, §4.4, §9 + SOW §7
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-07-accessibility-perf.md`
3. Builder report + axe config, `/accessibility` page, perf-budget CI gate on disk

## What Phase 07 Should Have Built
**Objective:** WCAG 2.2 AA + `/accessibility` statement + enforced performance budget. **Spec:** 4, 4.4, 9. **Implements:** F-016, F-020.

## Review Checklist
- [ ] Automated axe scan clean of criticals across page types
- [ ] WCAG 2.2 checks: target size ≥24px, focus not obscured, SR step/success announcements, native-POST form fallback (JS disabled), redundant-entry; 3-step state survives back-nav
- [ ] `/accessibility` published with conformance target, method, known limitations, remediation contact
- [ ] **Performance-budget CI gate fails on >4 async third-party scripts / hero LCP >200KB / missing image dimensions; passes on the compliant build** — verify by inspecting the gate, not just trusting a green run
- [ ] Standing gate exits 0; `npm run build` exits 0; fixes are a11y/perf only (no feature changes); no `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — axe clean, WCAG 2.2 checks pass, statement published, budget gate genuinely enforces ≤4 scripts + LCP + dimensions.
- **FIX** — an axe critical, a failing 2.2 criterion, a missing statement section, or a budget gate that doesn't actually fail on violation; list precise `issues_found`.
- **ESCALATE** — an a11y-vs-feature tradeoff needing a human.
