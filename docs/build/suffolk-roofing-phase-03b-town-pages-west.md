# Phase 03b: Town Pages — West Batch
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00, Phase 01
**Implements:** F-002, F-003, F-019
**Recommended:** `claude --max-turns 75`

---

## 1. Context
You are executing **Phase 03b: Town Pages (West Batch)** — the first 6 of the 12 launch towns (western/central, advertising-allowed): **Huntington, Smithtown, Islip, Babylon, Commack, Bay Shore**. **Scope is strictly these 6 towns.** The remaining 6 are Phase 03c. This phase is content-heavy and will approach the ~2000-line diff ceiling on its own — stay tightly scoped.

**Tech Stack:** Astro + Sanity. **Working Directory:** project root. **Spec File:** `suffolk-roofing-spec-v3.md` — read §2.2, §2.4, §4.4 + SOW §4 first.

### What Already Exists
Phase 00 scaffold + tests; Phase 01 `town` type with required-field publish gate + `townPricing`. Deps installed — **no `npm install`.**

### What You're Building
The `/areas/[town]/` template + the 6 west-batch town pages, each meeting the SOW §4 content-depth standard, rendered from the required Sanity fields.

---

## 2. Objective & Deliverables
### Objective
After this phase, the 6 west-batch town pages render at flat `/areas/[town]/` URLs with all 7 required content-depth fields populated, price range by home size, in-body license number, and 10–13 FAQ entries.
### Deliverables
1. `/areas/` hub + `/areas/[town]/` template — spec §4.4.
2. 6 town pages (west batch) from Sanity — SOW §4, spec §2.2.
3. Per-town pricing range display from `townPricing` — spec §2.4.

---

## 3. Implementation Instructions
### Task 1: Town template
**Spec:** §4.4, §2.2. Flat `/areas/[town]/` URLs, self-referencing canonical. Render the 7 required fields (building dept, permit, historic overlay, housing stock, local condition, named streets/hamlets/landmarks, tagged jobs/review) — all sourced from the CMS, never hardcoded.
### Task 2: 6 west-batch towns
Populate/verify the 6 town documents render fully. No name-swap pages — local-specificity density is the bar (SOW §4).
### Task 3: Pricing + license
Render price range by town × home size from `townPricing` (heavy-disclaimer path if `provisional=true`); in-body license number (F-019).

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] All 6 west-batch towns render at `/areas/[town]/` with self-referencing canonical
- [ ] No town page renders with an empty required field (the Phase-01 gate holds at build)
- [ ] Price range renders from `townPricing`; provisional combos show the heavy disclaimer, not a book-CTA
- [ ] In-body license number on every town page
- [ ] **Diff stays under the ~2000-line ceiling** (if approaching it, stop and note in progress file rather than spilling into 03c's towns)

---

## 5. Constraints
### Hard
- **Tool allowlist only** (as in prior phases). **No `npm install`. No `git push`.**
- Only the 6 west-batch towns — do NOT build 03c's towns, East-End gated pages, JSON-LD (06), or conversion islands (05*).
- Town content comes from Sanity; no hardcoded per-town prose.
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results; Ambiguities; Blocked Items; Decisions; **Warnings for Next Phase** (the template 03c reuses; internal-linking hooks Phase 06 needs). Maintain `PHASE-03b-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 75`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-03b-PROGRESS.md`, resume at first incomplete town.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
