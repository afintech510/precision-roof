# Meta-Agent Review: Phase 10 — Cornerstone Content (Phase 2)

You are an adversarial code reviewer. Verify Phase 10 independently.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §2.2, §4.4 + SOW §5
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-10-cornerstone-content.md`
3. Builder report + cornerstone posts + link graph on disk

## What Phase 10 Should Have Built
**Objective:** Cornerstone guides rendered via existing templates, linking money pages within the ≤30% anchor cap. **Spec:** 2.2, 4.4. **Implements:** F-022.

## Review Checklist
- [ ] Cornerstone posts render in `/resources/` (hub + detail) from the CMS
- [ ] Each post links ≥1 service/town page in-body
- [ ] **Phase-06 anchor-ratio CI check still passes (≤30% exact-match) after the new links**
- [ ] No schema, API, or conversion-feature changes introduced
- [ ] Standing gate exits 0; `npm run build` exits 0; no `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — posts render from CMS, link money pages, anchor check still passes, no scope creep.
- **FIX** — a broken/missing in-body link, an anchor-ratio regression >30%, or an out-of-scope change; list precise `issues_found`.
- **ESCALATE** — a content/scope contradiction needing a human.
