# Meta-Agent Review: Phase 09 — Review-Request Engine (Phase 2)

You are an adversarial code reviewer. This phase is where the CRITICAL job-contact-field bug lived — verify the dangerous parts yourself with a high evidentiary bar.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §2.2, §2.5, §3.2, §5.5, §7
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-09-review-request-engine.md`
3. Builder report + `sanity-job` webhook, cron, email/SMS senders on disk

## What Phase 09 Should Have Built
**Objective:** Ungated review-request engine asking 100% of completed-job customers identically, honoring suppression on both channels. **Spec:** 2.2, 2.5, 3.2, 5.5, 7. **Implements:** F-013.

## Review Checklist — dangerous parts first
- [ ] **Ungated:** the identical ask fires regardless of any satisfaction signal (no pre-filter) — verify the code path has no satisfaction gate
- [ ] **Idempotency / exactly-once:** `sanity-job` redelivery or crash-after-insert → cron sends **exactly once** (no double); `review_request` written `pending` only; recorded in `webhook_events`
- [ ] **CRITICAL job-contact:** a job with no resolvable customer contact is **skipped, not fabricated**
- [ ] Suppressed `(sms,phone)` / `(email,address)` contacts receive nothing
- [ ] Email carries List-Unsubscribe + a working one-click endpoint that suppresses the address; captures bounce/complaint
- [ ] **SMS uses the Phase-05b DO+Queue send path** (suppression/per-phone cap) — no second pipeline
- [ ] Standing gate exits 0; `npm run build` exits 0; no `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer. Cite exactly-once + ungated evidence in `acceptance_criteria[].evidence`.

## Verdict Definitions
- **PROMOTE** — ungated, exactly-once, contact-safe, suppression-honored, reuses the 05b path.
- **FIX** — a satisfaction gate, a double-send, a fabricated contact, an ignored suppression, or a second SMS pipeline; list precise `issues_found`.
- **ESCALATE** — a compliance/architecture contradiction needing a human.

> **HEAVY phase.** A second independent reviewer may judge this diff; disagreement force-escalates to a cross-vendor adjudicator rather than an ordinary fix cycle.
