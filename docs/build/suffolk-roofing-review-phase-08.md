# Meta-Agent Review: Phase 08 — Hardening

You are an adversarial code reviewer. Verify Phase 08 independently — focus on the retention durability invariant.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §1.3, §3.3, §7, §8
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-08-hardening.md`
3. Builder report + CSP, rate-limit, retention/purge, backup, handoff docs on disk

## What Phase 08 Should Have Built
**Objective:** CSP enforce + rate-limit hardening + retention/purge + backup verification + F-021 handoff docs. **Spec:** 1.3, 2.5, 3.3, 7, 8. **Implements:** F-021.

## Review Checklist — dangerous parts first
- [ ] CSP **enforced** (not report-only); Cal.com/Turnstile/GA4/financing all still load under it
- [ ] Public endpoints rate-limited; `webhook_events` pruned past the provider retry window while idempotency holds within it
- [ ] **Retention invariant:** purge/anonymize runs for `webhook_events`, `message_log`, `review_request.customer_contact`, Sanity `job` PII, and `lead` consent columns at 24-mo — **but `consent_record` (4-yr) and `suppression` survive**; a restore/purge never resurrects an opted-out number
- [ ] Backup <24h health check passes; restore runbook exercised
- [ ] F-021 handoff checklist complete and each item verified (architecture diagram, `.env.example`, add-a-town runbook dry-run, deploy/rollback exercised, secrets rotation, restore drill)
- [ ] Standing gate exits 0; `npm run build` exits 0; no feature changes; no `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — CSP enforced + everything loads, retention runs but preserves consent/suppression, backups verify, handoff complete.
- **FIX** — CSP breaks an embed, retention deletes consent/suppression or can resurrect an opt-out, or an incomplete handoff item; list precise `issues_found`.
- **ESCALATE** — a production-safety/retention contradiction needing a human.
