# Phase 09: Review-Request Engine (Phase 2)
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 01, 02, 05b
**Implements:** F-013
**Recommended:** `claude --max-turns 75`

---

## 1. Context
You are executing **Phase 09: Review-Request Engine** (early Phase 2, per SPEC-016 — naturally gated since no completed jobs exist at launch). It builds the `sanity-job` webhook, the `review_request` flow, the cron, and the templated email/SMS ask. **Scope is strictly this phase.**

**Tech Stack (spec §1.2):** Cloudflare Workers + D1 + Sanity webhook + Twilio + Postmark/SES. **Working Directory:** project root. **Spec File:** read §2.2, §2.5, §3.2, §5.5, §7 first.

### What Already Exists
Phase 01: `job` type with **required customer contact** (the CRITICAL fix). Phase 02: `review_request`, `suppression`, `message_log`. Phase 05b: DO+Queue SMS send path + suppression model. Deps installed — **no `npm install`.**

### What You're Building
An ungated review-request engine that asks 100% of completed-job customers identically, honoring suppression on both channels.

---

## 2. Objective & Deliverables
### Objective
After this phase, marking a job complete triggers an identical email/SMS review ask to every customer within the defined window, with no satisfaction gating, honoring `suppression` on both channels.
### Deliverables
1. `POST /api/webhooks/sanity-job` writing `review_request` (idempotent) — spec §3.2, §2.5.
2. Cron sending the templated ask exactly once per job — spec §2.5, §5.5.
3. Email with List-Unsubscribe + one-click endpoint; SMS via the 05b send path — spec §5.5.

---

## 3. Implementation Instructions
### Task 1: sanity-job webhook
**Spec:** §3.2, §2.5.
> **CAUTION — idempotency + the CRITICAL job-contact field.** Verify + dedupe the webhook (record in `webhook_events`); write `review_request` as `pending` only. The `job` MUST carry resolvable customer contact (Phase-01 gate) — if absent, do NOT fabricate; mark and skip. A crash after insert must let the cron send exactly once (no double).

### Task 2: Cron send (ungated)
**Spec:** §2.5, §5.5.
> **CAUTION — ungated compliance.** Fire the **identical** ask to 100% of customers regardless of any satisfaction signal (Google review-gating ban). No satisfaction pre-filter. Check `suppression(sms, phone)` and `suppression(email, address)` first; send nothing to suppressed contacts.

### Task 3: Email + SMS channels
**Spec:** §5.5. Email (Postmark/SES) carries a **List-Unsubscribe header + one-click unsubscribe endpoint** (suppresses `(email, address)`), captures bounce/complaint webhooks. SMS goes through the **Phase-05b DO+Queue send path** — no second pipeline.

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] Job marked complete → identical email/SMS ask fires within the defined window
- [ ] **Same trigger fires regardless of any satisfaction field (ungated)** — verified by test
- [ ] `sanity-job` redelivery / crash-after-insert → cron sends **exactly once** (no double)
- [ ] Job with no customer contact → skipped, not fabricated
- [ ] Suppressed `(sms,phone)` / `(email,address)` contacts receive nothing
- [ ] Email carries List-Unsubscribe + one-click endpoint that suppresses the address; SMS uses the 05b path

---

## 5. Constraints
### Hard
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- No satisfaction gating; no second SMS pipeline; no fabricated contact.
- Reuse the 05b send path + suppression model.
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results (incl. ungated + exactly-once evidence); Ambiguities; Blocked Items; Decisions (send window, template); **Warnings for Next Phase** (dashboard 05e review-request view coupling; retention of `review_request.customer_contact`). Maintain `PHASE-09-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 75`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-09-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
- **Note:** HEAVY phase — this is where the CRITICAL job-contact-field bug lived; a second independent reviewer may judge this diff and disagreement escalates rather than resolving as an ordinary fix.
