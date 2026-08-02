# Phase 05c: CallRail DNI + Financing
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00, Phase 01, Phase 02, Phase 05b
**Implements:** F-010, F-011, F-015 (tracked call)
**Recommended:** `claude --max-turns 50`

---

## 1. Context
You are executing **Phase 05c: CallRail DNI + Financing** — dynamic number insertion with canonical-NAP preservation, missed-call text-back (reusing the 05b send path), the Acorn/Wisetack financing facade, and resolution of inbound-number ownership. **Scope is strictly this phase.**

**Tech Stack (spec §1.2):** Astro + Cloudflare Workers + CallRail + Twilio + Acorn/Wisetack. **Working Directory:** project root. **Spec File:** read §3.2, §5.3, §5.9, §4 first.

### What Already Exists
Phase 05b built the DO + Queue SMS send path + Twilio webhooks. Phase 04 has the `/financing/` trust page with a marked embed placeholder. Deps installed — **no `npm install`.**

### What You're Building
DNI that never changes the canonical NAP in HTML/schema, a missed-call text-back that lands on the real caller, and a financing soft-pull facade that never 404s.

---

## 2. Objective & Deliverables
### Objective
After this phase, tracked calls attribute correctly while canonical NAP stays fixed, a missed tracked call triggers a text-back to the real caller, and the financing prequal opens a maintained third-party flow.
### Deliverables
1. CallRail DNI with fixed canonical NAP in HTML + schema — spec §3.2, §5.3, §8.
2. Missed-call text-back via the 05b send path — spec §3.2 (CallRail voice path).
3. Acorn/Wisetack financing facade on `/financing/` — spec §4, §5.9 (CSP `frame-src`).
4. **Resolve inbound-number ownership** (CallRail vs Twilio) per the HIGH finding — spec §3.2.

---

## 3. Implementation Instructions
### Task 1: DNI with canonical NAP
**Spec:** §3.2, §5.3, §8. CallRail DNI swaps the display number on interaction; the canonical business name/address/phone stays fixed in HTML and JSON-LD. Sticky call button must work even with the CallRail script blocked.

### Task 2: Missed-call text-back + number ownership
**Spec:** §3.2 (CallRail voice path).
> **CAUTION — HIGH finding: resolve which platform owns the inbound number.** Original-caller-ID (ANI) passthrough is a Phase-0 verification gate. If CallRail can **not** forward true ANI to Twilio, drive the missed-call text-back from **CallRail's own call webhook** payload instead. Document the resolved ownership (CallRail vs Twilio) explicitly. Reuse the Phase-05b DO+Queue send path — do NOT build a second SMS pipeline; the text-back is subject to the same per-phone/suppression/budget reservation.

### Task 3: Financing facade
**Spec:** §4, §5.9. Acorn/Wisetack soft-pull as a facade embed with an immediate loading affordance + always-visible phone CTA; a maintained third-party flow, never a static page that 404s. Add the vendor to CSP `frame-src` (enforced in Phase 08; declare it here).

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] DNI swaps the display number while canonical NAP stays fixed in HTML + JSON-LD
- [ ] Sticky call button works with the CallRail script blocked
- [ ] **Inbound-number ownership resolved and documented**; missed tracked call → text-back lands on the real caller's handset (via ANI passthrough or CallRail webhook fallback)
- [ ] Missed-call text-back goes through the 05b DO+Queue path (honors suppression/per-phone cap) — no second SMS pipeline
- [ ] Financing facade opens the soft-pull flow without error; loading affordance + phone CTA visible; no 404

---

## 5. Constraints
### Hard
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- Canonical NAP is fixed; DNI must not alter it in HTML or schema.
- Reuse the 05b send path; do not duplicate SMS/opt-out logic.
- Do NOT build the dashboard (05e) or quote widget (05d).
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED` (e.g. if ANI-passthrough verification isn't confirmed, mark and use the CallRail-webhook fallback). Reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results (incl. the ownership-resolution decision); Ambiguities; Blocked Items; Decisions; **Warnings for Next Phase** (CSP `frame-src`/`connect-src` entries Phase 08 must include; call events Phase 06 analytics wiring needs). Maintain `PHASE-05c-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 50`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-05c-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
- **Note:** HEAVY phase — a second independent reviewer may judge this diff; disagreement escalates rather than resolving as an ordinary fix.
