# Phase 07: Accessibility + Performance
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 03a, 03b, 03c, 04, 05a, 05b, 05c, 05d
**Implements:** F-016, F-020
**Recommended:** `claude --max-turns 50`

---

## 1. Context
You are executing **Phase 07: Accessibility + Performance** — WCAG 2.2 AA conformance, the `/accessibility` statement page, and the performance-budget CI gate. **Scope is strictly this phase.** Pages + conversion islands already exist; you audit, fix a11y/perf regressions, and add the CI gates.

**Tech Stack:** Astro + Playwright/axe. **Working Directory:** project root. **Spec File:** read §4, §4.4, §9 first.

### What Already Exists
All launch pages + conversion islands (03*, 04, 05*). Deps installed — **no `npm install`.**

### What You're Building
WCAG 2.2 AA coverage (incl. the new 2.2 criteria), a published accessibility statement, and an enforced performance budget.

---

## 2. Objective & Deliverables
### Objective
After this phase, an automated axe scan is clean of criticals, the WCAG 2.2 AA manual checklist passes, `/accessibility` is published, and the build fails if the performance budget is exceeded.
### Deliverables
1. WCAG 2.2 AA coverage: Target Size 2.5.8 (≥24px), Focus Appearance 2.4.11/2.4.13, focus-not-obscured, redundant-entry, `aria-live` step/success announcements, native-POST form fallback — spec §4, §9.
2. `/accessibility` statement page (conformance target, method, known limitations, remediation contact) — spec §4 (launch gate).
3. Performance-budget CI gate: hero LCP image ≤200KB, explicit width/height on all images, **≤4 async third-party scripts** — spec §4, SOW §7.

---

## 3. Implementation Instructions
### Task 1: WCAG 2.2 AA
**Spec:** §4, §9. Automated axe scan (Playwright) clean of criticals + a manual checklist covering the 2.2 additions. Verify LeadForm/QuoteWidget `aria-live` announcements, focus not obscured, 3-step state survives back-nav, native-POST form fallback works with JS disabled, sticky call targets ≥24px.

### Task 2: /accessibility page
**Spec:** §4. Publish the statement (WCAG 2.2 AA target, testing method, known limitations, remediation contact). This is a launch gate.

### Task 3: Performance budget CI gate
**Spec:** §4, SOW §7.
> **CAUTION — script budget held at ≤4 (DEC-C).** The CI budget gate asserts **≤4** concurrent async third-party scripts (CallRail deferred to first interaction, GA4 to idle, Cal.com + financing behind facades, Turnstile interaction-loaded). Also enforce hero LCP image ≤200KB and explicit width/height on all images. The build fails if the budget is exceeded.

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] Automated axe scan clean of criticals across page types
- [ ] WCAG 2.2 checks pass: target size ≥24px, focus not obscured, SR step/success announcements, native-POST fallback, redundant-entry
- [ ] `/accessibility` published with all required sections
- [ ] **Performance-budget CI gate fails when >4 async third-party scripts / hero LCP >200KB / missing image dimensions; passes on the compliant build**
- [ ] 3-step form state survives back-navigation

---

## 5. Constraints
### Hard
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- Script budget ≤4 is a hard gate.
- Fixes are a11y/perf only — do NOT change feature behavior or add new pages.
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results (incl. axe + budget evidence); Ambiguities; Blocked Items; Decisions; **Warnings for Next Phase** (any a11y/perf item deferred to hardening). Maintain `PHASE-07-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 50`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-07-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
