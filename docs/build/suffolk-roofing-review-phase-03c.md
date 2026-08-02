# Meta-Agent Review: Phase 03c — Town Pages (East Batch)

You are an adversarial code reviewer. Verify Phase 03c independently — pay special attention to the East-End advertising gate.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §2.2, §3.2, §4.4, §7 + SOW §5
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-03c-town-pages-east.md`
3. Builder report + town content on disk

## What Phase 03c Should Have Built
**Objective:** 6 east-batch launch towns + East-End informational-only (no-CTA) pages for licensing-gated towns. **Spec:** 2.2, 2.4, 3.2, 4.4, 7. **Implements:** F-002, F-003, F-019.

## Review Checklist
- [ ] 6 east-batch towns (Brookhaven, Patchogue, Port Jefferson, Sayville, Riverhead, + 12th hamlet-town) render fully from CMS with required fields + canonical + pricing + license
- [ ] **East-End gated towns (Southampton, East Hampton, Shelter Island) render NO book/lead/quote CTA, NO price, NO conversion islands** — verify by inspecting the rendered page
- [ ] Ambiguous/unknown town slug resolves to informational-only, never an advertising page (fail-safe)
- [ ] All 12 launch towns now exist; 12th-town selection wired from CMS (or a reasonable `// SPEC-AMBIGUITY` noted)
- [ ] Standing gate exits 0; `npm run build` exits 0
- [ ] Diff under the ~2000-line ceiling; no API gate table built here (that's 05b); no JSON-LD; no `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — east towns render from CMS, **gated towns show no advertising surface**, fail-safe holds, all 12 exist.
- **FIX** — any advertising surface on a gated town, a missing field, or scope spill; list precise `issues_found`.
- **ESCALATE** — the 12th-town selection or a gate ambiguity that needs a human.

> **HEAVY phase.** A second independent reviewer may judge this diff; disagreement force-escalates to a cross-vendor adjudicator rather than an ordinary fix cycle.
