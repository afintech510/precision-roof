# Phase 03a: Service Pages
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00, Phase 01
**Implements:** F-004, F-018
**Recommended:** `claude --max-turns 50`

---

## 1. Context
You are executing **Phase 03a: Service Pages** — the ~9 launch service pages + services hub, including the launch-critical storm/emergency/leak cluster. **Scope is strictly this phase.** No town pages (03b/03c), no conversion islands beyond linking to them.

**Tech Stack:** Astro + Sanity. **Working Directory:** project root. **Spec File:** `suffolk-roofing-spec-v3.md` — read §4 + §2.2 first.

### What Already Exists
Phase 00 scaffold + test surface; Phase 01 Sanity types (`service`, `faq`, `siteSettings`). Deps installed — **no `npm install`.**

### What You're Building
Astro templates for the services hub and the 9 services (roof replacement, roof repair, emergency roof repair, storm damage, roof leak repair, flat/low-slope, metal, roof inspection) rendered from the `service` document type, with the emergency-cluster UX.

---

## 2. Objective & Deliverables
### Objective
After this phase, all launch service pages render from Sanity, the emergency/storm/leak pages lead with click-to-call, and the license number appears in-body.
### Deliverables
1. `/services/` hub + 9 service page templates — spec §4.4, SOW §5.
2. Emergency-cluster UX (storm/leak/emergency) — spec §4 `[C2 ADVOCATE-010]`.
3. License-number in-body display (F-019 shares Phase 01 `siteSettings`).

---

## 3. Implementation Instructions
### Task 1: Service page template + hub
**Spec:** §4.4, §2.2. Render from the `service` type. FAQ blocks emit `FAQPage`-ready data (JSON-LD wiring is Phase 06 — expose the data, don't hand-roll schema tags that 06 will duplicate; mark the seam `// SPEC-AMBIGUITY` if unclear).

### Task 2: Emergency-cluster UX
**Spec:** §4 `[C2 ADVOCATE-010]`.
> **CAUTION.** Storm/leak/emergency pages lead with **click-to-call as the primary hero action**, minimal secondary form, and **honest "book a free inspection" framing — no time-bound / same-day response promise** (SOW §8/§12 decision). Sticky call target ≥24px (WCAG 2.5.8; full a11y pass is Phase 07, but do not ship a <24px call target here).

### Task 3: License display
Render the license number in-body on every service page from `siteSettings` (F-019).

---

## 4. Acceptance Criteria
- [ ] Standing gate green (`typecheck`, `lint`, `vitest`, `playwright` exit 0); `npm run build` exits 0
- [ ] All 9 service pages + hub render from Sanity content (no hardcoded copy blocks that belong in the CMS)
- [ ] Emergency/storm/leak pages render click-to-call as the primary hero action; **no same-day/time-bound response claim appears** (assert via content check)
- [ ] Sticky call target ≥24px on emergency pages
- [ ] License number present in-body on every service page

---

## 5. Constraints
### Hard
- **Tool allowlist only** (Edit/Write/Read/Glob/Grep; `Bash(npm run build|typecheck|lint)`, `Bash(npm run test:*)`, `Bash(npx vitest:*|playwright:*)`, `Bash(git status|diff|add|commit:*)`, `mcp__supabase`, `mcp__playwright`, `mcp__filesystem`). **No `npm install`. No `git push`.**
- Do NOT build town pages, JSON-LD emitters (Phase 06), or conversion islands (Phase 05*).
- No "same-day"/"fast response" marketing claims anywhere (SOW decision).
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED` as needed; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results; Ambiguities; Blocked Items; Decisions; **Warnings for Next Phase** (component patterns Phase 06 SEO + Phase 07 a11y will extend; where LeadForm/BookingEmbed placeholders live). Maintain `PHASE-03a-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 50`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-03a-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
