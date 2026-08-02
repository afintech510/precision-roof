# Phase 01: Content Schema
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00
**Implements:** F-003, F-002, F-004, F-007, F-019
**Recommended:** `claude --max-turns 75`

---

## 1. Context

You are executing **Phase 01: Content Schema** — the Sanity content model. **Your scope is strictly this phase.** No pages, no API routes, no D1 (Phase 02) — document types, validation, publish gates, and the §771-B content lint only.

**Tech Stack (spec §1.2):** Astro + Sanity.
**Working Directory:** project root. **Spec File:** `suffolk-roofing-spec-v3.md` — READ §2 FIRST.

### What Already Exists
Phase 00 created the Astro scaffold, `sanity.config` (linked, no types), the D1 migration tool, and the full test surface. Dependencies are installed — **do NOT run `npm install`.**

### What You're Building
The Sanity document types `town / service / townPricing / job / review / faq / post / siteSettings` with required-field publish gates and the §771-B banned-phrase build lint.

---

## 2. Objective & Deliverables

### Objective
After this phase, an editor cannot publish a `town` or `job` with a required field empty, `townPricing` supports the coverage guarantee, and a build fails if banned §771-B phrasing is seeded.

### Deliverables
1. Sanity schema types per spec §2.2 (all eight document types, exact field names/types).
2. Required-field **publish gate** validation — spec §2.2, SOW §4.
3. `townPricing` with `provisional` + staleness (`N=2 years`) support — spec §2.2, §2.4.
4. `town.historicOverlay` as `{ applies: boolean(required), details: string(required when applies=true) }` — spec §2.2.
5. Pricing-coverage CI check (town × service × band × non-stale effectiveYear) — spec §2.4.
6. §771-B banned-phrase content lint wired into `npm run build` — spec §7.5.

---

## 3. Implementation Instructions

### Task 1: Core document types
**Spec:** §2.2. Define `town, service, townPricing, job, review, faq, post, siteSettings` exactly as specified — field names, types, references. `siteSettings` is a singleton carrying the license number + consent fields (§2.2, §7.3).

### Task 2: Required-field publish gate
**Spec:** §2.2, SOW §4.
> **CAUTION — prior CRITICAL.** A `job` document MUST carry resolvable **customer contact** (this exact gap was a CRITICAL finding). The `job` type's customer-contact fields are required and validated at publish. Town pages likewise cannot publish with any of the 7 required content-depth fields empty (SOW §4).

Implement Sanity `validation` rules that block publish. Model `town.historicOverlay` so a no-overlay town (`applies:false`) can still publish (§2.2).

### Task 3: townPricing coverage semantics
**Spec:** §2.2, §2.4. Add `provisional` (boolean, default false); the coverage guarantee asserts a **non-stale** covering row (staleness threshold `N=2 years`). Provisional combos drive the heavy-disclaimer path (consumed by Phase 05d).

### Task 4: Pricing-coverage CI check
**Spec:** §2.4. A test (under `test:*`/vitest) enumerates town × service × band × **non-stale effectiveYear** and fails on any missing/stale combo.

### Task 5: §771-B content lint
**Spec:** §7.5. A build-time lint that fails `npm run build` when a banned phrase appears in portable-text/content. Seed a banned phrase in a fixture and assert the build fails, then remove it.

---

## 4. Acceptance Criteria
- [ ] Standing gate green: `typecheck`, `lint`, `vitest`, `playwright` all exit 0
- [ ] `npm run build` exits 0 on clean content
- [ ] **Publishing a `job` with no customer contact is rejected** (validation test)
- [ ] Publishing a `town` with any required content field empty is rejected
- [ ] A no-overlay town (`historicOverlay.applies=false`) publishes successfully
- [ ] Pricing-coverage CI fails on a seeded missing/stale combo, passes on full coverage
- [ ] Seeding a §771-B banned phrase makes `npm run build` fail (then reverted)
- [ ] All eight document types' field names/types match spec §2.2 exactly

---

## 5. Constraints

### Hard (violation = phase failure)
- **Tool allowlist only:** `Edit, Write, Read, Glob, Grep, Bash(npm run build|typecheck|lint), Bash(npm run test:*), Bash(npx vitest:*), Bash(npx playwright:*), Bash(git status|diff|add|commit:*), mcp__supabase, mcp__playwright, mcp__filesystem`. **No `npm install`. No `git push`.** No scripts outside build/typecheck/lint/test:*.
- Field names, types, and required-ness MUST match spec §2.2 exactly.
- Do NOT create D1 tables or API routes (Phases 02 / 05*).

### Soft
- `// SPEC-AMBIGUITY: …` for gaps; `// BLOCKED: …` if a Phase-00 dependency is missing. Reference spec sections by number; do not inline spec text.

---

## 6. Completion Protocol
Files Created/Modified tables; Acceptance Criteria Results; Spec Ambiguities; Blocked Items; Decisions Made; **Warnings for Next Phase** (which types the pages phases consume; how the pricing blob is expected by Phase 05d). Maintain `PHASE-01-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 75`.
- **Resumption (--continue):** re-read prompt, inspect filesystem, read `PHASE-01-PROGRESS.md`, resume at first incomplete task, no restart, no refactor of done work.
- **Autonomy:** defined → exact; silent → reasonable + `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip; blocked → `// BLOCKED` + continue.
