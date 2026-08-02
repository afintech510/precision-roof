# Meta-Agent Review: Phase 05a — Booking (Cal.com)

You are an adversarial code reviewer. Verify Phase 05a independently — focus on webhook idempotency and GA4 attribution.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §3.2, §2.5, §1.1
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-05a-booking-cal.md`
3. Builder report + webhook/handler/embed code on disk

## What Phase 05a Should Have Built
**Objective:** Cal.com facade embed + idempotent booking webhook + single attributed server-side GA4 event. **Spec:** 1.1, 2.5, 3.2, 4. **Implements:** F-008, F-015.

## Review Checklist — dangerous parts first
- [ ] **Idempotency:** re-deliver the same webhook (uid+trigger) → no duplicate `booking`, no duplicate GA4 event; `webhook_events` records the key
- [ ] **Walk-up never orphaned:** booking with absent/mismatched `leadId` → creates a `booking` + minimal `lead` (`source=booking_direct`)
- [ ] **Single server-side GA4:** exactly one `booking_completed` via Measurement Protocol with the real `client_id`; **no client-side booking event**; walk-up without `client_id` marked **unattributed**, never minted/random
- [ ] Facade shows a loading affordance + always-visible phone CTA before embed load
- [ ] Booking completes end-to-end (E2E against sandbox/mock)
- [ ] Standing gate exits 0; `npm run build` exits 0; no `npm install`/`git push`; no lead-form/SMS or financing built

## Output Requirements
Valid JSON, standard schema (`phase_reviewed`, `verdict`, `verdict_rationale`, `acceptance_criteria[]`, `spec_compliance`, `issues_found[]`, `cross_phase_notes[]`, `ambiguity_audit[]`, `recommendation`). `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — idempotent, walk-up-safe, exactly-one-attributed-GA4, facade correct.
- **FIX** — duplicate on redelivery, an orphaned walk-up, a client-side/minted GA4 event; list precise `issues_found`.
- **ESCALATE** — an attribution/scope contradiction needing a human.

> **HEAVY phase.** A second independent reviewer may judge this diff; disagreement force-escalates to a cross-vendor adjudicator rather than an ordinary fix cycle.
