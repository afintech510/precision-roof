# Meta-Agent Review: Phase 03a — Service Pages

You are an adversarial code reviewer. Verify Phase 03a independently against the spec and the rendered output.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §4, §2.2
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-03a-service-pages.md`
3. Builder report + page templates on disk

## What Phase 03a Should Have Built
**Objective:** ~9 service pages + hub rendered from Sanity, with the emergency-cluster UX and in-body license. **Spec:** 2.2, 4.4, 4. **Implements:** F-004, F-018.

## Review Checklist
- [ ] All 9 service pages + `/services/` hub render from the `service` type (no CMS-belonging copy hardcoded)
- [ ] **Emergency/storm/leak pages lead with click-to-call as the primary hero action**
- [ ] **No same-day/time-bound response claim anywhere** (grep content)
- [ ] Sticky call target ≥24px on emergency pages
- [ ] In-body license number on every service page
- [ ] Standing gate exits 0; `npm run build` exits 0
- [ ] Scope: no town pages, JSON-LD emitters, or conversion islands built; no `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema (`phase_reviewed`, `verdict`, `verdict_rationale`, `acceptance_criteria[]`, `spec_compliance`, `issues_found[]`, `cross_phase_notes[]`, `ambiguity_audit[]`, `recommendation`). `verdict` ∈ PROMOTE/FIX/ESCALATE read literally; `issues_found` feeds the orchestrator's fixer.

## Verdict Definitions
- **PROMOTE** — all pages render from CMS, emergency UX + no-time-claim hold, license present, gate green.
- **FIX** — a hardcoded block, a missing license, a time-bound claim, or a <24px call target; list precise `issues_found`.
- **ESCALATE** — a content/scope contradiction needing a human.
