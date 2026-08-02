# Meta-Agent Review: Phase 05b — Lead Intake + Twilio

You are an adversarial code reviewer. This is the most safety-critical phase — verify every dangerous part yourself, do not trust the builder's report.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §3.1, §3.2, §1.2, §2.5, §5.2, §7.3
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-05b-lead-intake-twilio.md`
3. Builder report + `/api/lead`, Durable Object, queue worker, Twilio webhook, cron, LeadForm on disk

## What Phase 05b Should Have Built
**Objective:** Non-blocking lead pipeline with single-authority per-phone/budget/suppression serialization and STOP honored for in-flight sends. **Spec:** 1.1, 1.2, 2.5, 3.1, 3.2, 5.2, 7.3, 8. **Implements:** F-009, F-012, F-015.

## Review Checklist — CRITICALs first (verify each with a test/trace)
- [ ] **Non-blocking:** `/api/lead` returns 201 within the latency target even when the Twilio call is mocked to hang — the response is not awaited on SMS. SMS dispatch is via the **Queue**, never inline
- [ ] **Single concurrency authority:** `/api/lead` calls the Durable Object once; DO atomically evaluates per-phone 24h window + `suppression` + budget → allow-token. The `lead` table is NOT the gate
- [ ] **Concurrent same-phone submits → exactly 1 SMS** (DO atomic claim)
- [ ] **STOP after allow-token but before delivery → in-flight SMS aborted** (send-time re-check inside the `sms_claimed_at` claim)
- [ ] **Live submit + slo-sweep in the same tick → exactly 1 SMS** (both reserve through the DO)
- [ ] slo-sweep excludes `informational_only` / `turnstile_fallback` / opted-out leads
- [ ] **Idempotency:** Twilio status callbacks keyed `MessageSid:MessageStatus`, monotonic; hard bounce → `failed_permanent`
- [ ] STOP suppresses `(sms, phone)` wholesale; START supersedes with `opted_in_at`; STOP-confirmation deduped + from reserved allowance
- [ ] **NANP + E.164 validation** rejects non-NANP/non-E.164; per-phone daily cap enforced
- [ ] `consent_record` written (version/text/ts/ip/ua/url) and survives a simulated lead purge
- [ ] LeadForm degrades to native POST with JS disabled; TCPA checkbox unchecked by default; `aria-live` step/success
- [ ] Budget is a sharded soft-cap (no exact global-budget guarantee claim); kill-switch is the true ceiling
- [ ] Standing gate exits 0; `npm run build` exits 0; no `npm install`/`git push`; no CallRail/financing/dashboard built

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer. Cite the specific test/trace evidence for each CRITICAL in `acceptance_criteria[].evidence`.

## Verdict Definitions
- **PROMOTE** — every CRITICAL verified: non-blocking, single-authority, exactly-once under all three race tests, STOP honored in-flight, idempotent callbacks, NANP + per-phone cap.
- **FIX** — any CRITICAL fails but is resolvable (e.g. inline dispatch, missing send-time re-check, `MessageSid`-only key); list precise `issues_found`.
- **ESCALATE** — a concurrency/architecture contradiction that needs a human call.

> **HEAVY phase.** A second independent reviewer may judge this diff; disagreement force-escalates to a cross-vendor adjudicator rather than an ordinary fix cycle. Given the CRITICAL surface here, hold a high evidentiary bar.
