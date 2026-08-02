# Phase 03c: Town Pages — East Batch
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00, Phase 01
**Implements:** F-002, F-003, F-019
**Recommended:** `claude --max-turns 75`

---

## 1. Context
You are executing **Phase 03c: Town Pages (East Batch)** — the remaining 6 launch towns (more eastern, advertising-allowed): **Brookhaven, Patchogue, Port Jefferson, Sayville, Riverhead, and the 12th North-Shore hamlet-town (Northport or St. James per keyword-demand ranking)**. This phase also renders **East-End informational-only** content for the licensing-gated towns (Southampton, East Hampton, Shelter Island) — no advertising CTAs. **Scope is strictly this phase.**

**Tech Stack:** Astro + Sanity. **Working Directory:** project root. **Spec File:** `suffolk-roofing-spec-v3.md` — read §2.2, §3.2, §4.4, §7 first.

### What Already Exists
Phase 00 scaffold + tests; Phase 01 `town` type + gate; Phase 03b established the `/areas/[town]/` template. Deps installed — **no `npm install`.**

### What You're Building
The 6 east-batch launch town pages using 03b's template, plus East-End gated informational pages that render **no** book/lead/quote CTAs.

---

## 2. Objective & Deliverables
### Objective
After this phase, all 12 launch towns exist; East-End gated towns show informational content only, with no advertising CTA or price.
### Deliverables
1. 6 east-batch town pages — SOW §4, spec §2.2, §4.4.
2. East-End informational-only rendering for gated towns — spec §3.2, §7, SOW §5.
3. Confirm the 12th-town selection is wired from CMS data (mark `// SPEC-AMBIGUITY` if final selection isn't set).

---

## 3. Implementation Instructions
### Task 1: 6 east-batch towns
Reuse the 03b template; populate the 6 remaining launch towns with full required fields + pricing + license (as 03b).
### Task 2: East-End informational gate
**Spec:** §3.2, §7, SOW §5.
> **CAUTION.** Southampton, East Hampton, and Shelter Island require a separate town license and are **excluded from active advertising**. Their pages are **informational only**: no "we serve you"/book/quote CTAs, no price, no LeadForm/QuoteWidget/BookingEmbed islands. The East-End gate is fail-safe — any ambiguous ZIP/slug → `informational_only` (§7). Render the honest Suffolk hand-off framing, not a service CTA.

The deterministic ZIP→town `advertisingAllowed` table used by the APIs is built in Phase 05b; here, render pages off the town document's advertising flag and ensure gated towns present no conversion surface.

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] All 6 east-batch towns render at `/areas/[town]/` with required fields + canonical
- [ ] **East-End gated town pages render no book/lead/quote CTA, no price, and no conversion islands** (assert via page test)
- [ ] Ambiguous/unknown town slug resolves to informational-only, never an advertising page (fail-safe)
- [ ] All 12 launch towns now exist; 12th-town selection wired from CMS (or `// SPEC-AMBIGUITY` noted)
- [ ] Diff stays under the ~2000-line ceiling

---

## 5. Constraints
### Hard
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- Gated East-End towns MUST NOT render advertising CTAs, prices, or conversion islands.
- Do NOT build the API-side ZIP→town gate table (Phase 05b) or JSON-LD (Phase 06).
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results; Ambiguities (incl. 12th-town selection); Blocked Items; Decisions; **Warnings for Next Phase** (which town advertising flags Phase 05b's gate table must mirror). Maintain `PHASE-03c-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 75`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-03c-PROGRESS.md`, resume at first incomplete town.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
