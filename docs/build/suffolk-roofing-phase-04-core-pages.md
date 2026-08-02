# Phase 04: Core Pages
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00, Phase 01
**Implements:** F-005, F-022 (resources hub)
**Recommended:** `claude --max-turns 50`

---

## 1. Context
You are executing **Phase 04: Core Pages** — home, about, contact, reviews, warranties, gallery, financing (trust page), and the `/resources/` blog/guides hub with seed editorial. **Scope is strictly this phase.** The financing *prequal flow* (F-011) and review *automation* (F-013) are later phases — here `/financing/` and `/reviews/` are trust/content pages only.

**Tech Stack:** Astro + Sanity. **Working Directory:** project root. **Spec File:** `suffolk-roofing-spec-v3.md` — read §4.4, §2.2 first.

### What Already Exists
Phase 00 scaffold + tests; Phase 01 types (`post`, `review`, `siteSettings`). Deps installed — **no `npm install`.**

### What You're Building
The core-page templates + the `/resources/` hub rendering `post` seed content, all with the transparency wedge (license, honest framing).

---

## 2. Objective & Deliverables
### Objective
After this phase, all core pages render with the transparency wedge and the resources hub lists seed editorial posts.
### Deliverables
1. `/`, `/about/`, `/contact/`, `/reviews/`, `/warranties/`, `/gallery/`, `/financing/` — spec §4.4.
2. `/resources/` hub + seed post rendering — spec §2.2, SOW §5 (F-022).
3. License number footer site-wide + transparency wedge on home — F-019 (shared `siteSettings`).

---

## 3. Implementation Instructions
### Task 1: Core page templates
**Spec:** §4.4. Home leads with the transparency wedge (license number, itemized-pricing promise, no time-bound response claim). `/reviews/` renders real review content only (JSON-LD emission is Phase 06). `/financing/` is a trust page; the soft-pull embed is Phase 05c — leave a marked placeholder.
### Task 2: Resources hub
**Spec:** §2.2, SOW §5. `/resources/` lists `post` documents; render seed editorial. Blog↔money-page internal links are finalized in Phase 06 — expose the data.
### Task 3: Site-wide license footer
Footer license number site-wide from `siteSettings` (F-019).

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] All 8 core pages render from Sanity where content-backed (no hardcoded blocks that belong in the CMS)
- [ ] `/resources/` lists seed posts and renders a post detail
- [ ] License number in the footer site-wide
- [ ] `/financing/` renders with a clearly marked placeholder for the Phase-05c soft-pull embed (no dead/404 CTA)
- [ ] No same-day/time-bound response claim on any page

---

## 5. Constraints
### Hard
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- Do NOT build the financing prequal flow (05c), review automation (09), JSON-LD (06), or conversion islands beyond marked placeholders.
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results; Ambiguities; Blocked Items; Decisions; **Warnings for Next Phase** (placeholder locations for 05c financing + Phase 06 internal linking). Maintain `PHASE-04-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 50`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-04-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
