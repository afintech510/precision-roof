# Phase 10: Cornerstone Content (Phase 2)
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 01, Phase 04
**Implements:** F-022
**Recommended:** `claude --max-turns 50`

---

## 1. Context
You are executing **Phase 10: Cornerstone Content** (Phase 2) — the cornerstone editorial guides and their internal linking. **Scope is strictly this phase.** Content + linking only; no schema or feature changes.

**Tech Stack:** Astro + Sanity. **Working Directory:** project root. **Spec File:** read §2.2, §4.4 + SOW §5 first.

### What Already Exists
Phase 01 `post` type; Phase 04 `/resources/` hub + seed posts; Phase 06 internal-linking + anchor-ratio model. Deps installed — **no `npm install`.**

### What You're Building
Cornerstone `post` content that links into money pages within the established anchor-ratio limits.

---

## 2. Objective & Deliverables
### Objective
After this phase, cornerstone guides render in `/resources/`, each linking ≥1 service/town page in-body within the ≤30% exact-match anchor cap.
### Deliverables
1. Cornerstone `post` documents rendered via the existing hub/detail templates — spec §2.2, §4.4.
2. Blog↔money-page internal links respecting the Phase-06 anchor-ratio check — SOW §5.

---

## 3. Implementation Instructions
### Task 1: Cornerstone posts
**Spec:** §2.2, §4.4. Author/render cornerstone guides via the existing `post` templates. Content from the CMS; no new document types.
### Task 2: Internal linking
**Spec:** §4.4, SOW §5. Each post links ≥1 service/town page in-body; the site-wide exact-match anchor ratio stays ≤30% (the Phase-06 CI check must still pass).

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] Cornerstone posts render in `/resources/` (hub + detail)
- [ ] Each post links ≥1 service/town page in-body
- [ ] **Phase-06 anchor-ratio CI check still passes (≤30% exact-match) after the new links**
- [ ] No schema or feature changes introduced

---

## 5. Constraints
### Hard
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- Content + linking only; do NOT alter schema, APIs, or conversion features.
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results; Ambiguities; Blocked Items; Decisions; **Warnings for Next Phase** (none / future editorial cadence). Maintain `PHASE-10-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 50`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-10-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
