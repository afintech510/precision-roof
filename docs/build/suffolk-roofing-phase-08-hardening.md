# Phase 08: Hardening
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 02, 05a, 05b, 05c, 05d, 05e
**Implements:** F-021
**Recommended:** `claude --max-turns 50`

---

## 1. Context
You are executing **Phase 08: Hardening** — CSP enforcement, rate-limit hardening, the webhook idempotency ledger retention, retention/purge jobs, backup/restore verification, and the handoff-documentation checklist. **Scope is strictly this phase.** Secure what exists; do not add features.

**Tech Stack:** Astro + Cloudflare Workers + D1. **Working Directory:** project root. **Spec File:** read §1.3, §3.3, §7, §8 first.

### What Already Exists
The full conversion stack (05*), op-store (02), and pages (03*/04/06/07). Each conversion phase declared its CSP `frame-src`/`connect-src` needs. Deps installed — **no `npm install`.**

### What You're Building
Production-safety hardening across CSP, rate limiting, retention, backups, and handoff docs.

---

## 2. Objective & Deliverables
### Objective
After this phase, CSP is enforced (not report-only), retention/purge runs on schedule, backups verify, and a second developer could service the site from the handoff docs.
### Deliverables
1. Full CSP policy report-only → enforce — spec §7.3, §5.9.
2. Rate-limit hardening + webhook idempotency ledger retention/prune — spec §3.3, §8.
3. Retention/purge for `webhook_events`, `message_log`, `review_request.customer_contact`, Sanity `job` PII — spec §1.3, §8.
4. Backup/restore verification (health check <24h) — spec §1.3.
5. F-021 handoff-doc checklist finalized — spec §8, SOW §8.

---

## 3. Implementation Instructions
### Task 1: CSP enforce
**Spec:** §7.3, §5.9. Assemble the full policy from each conversion phase's declared needs: `frame-src` cal.com + financing vendor + `challenges.cloudflare.com`; `connect-src` GA4 + CallRail + own `/api`; nonce-based `script-src`. Validate in **report-only first**, then enforce. Confirm Cal.com/Turnstile/GA4/financing all still load under it.

### Task 2: Rate limiting + idempotency ledger retention
**Spec:** §3.3, §8. Harden public-endpoint rate limiting; prune `webhook_events` past the provider retry window (30–90d) while preserving idempotency within it.

### Task 3: Retention/purge
**Spec:** §1.3, §8.
> **CAUTION — durability invariant.** Purge/anonymize `webhook_events`, `message_log` (per TCPA window), `review_request.customer_contact`, Sanity `job` PII, and scrub consent columns from `lead` at 24-mo — **but `consent_record` (4-yr) and `suppression` must survive**; a purge or restore must never resurrect an opted-out number.

### Task 4: Backup/restore verification
**Spec:** §1.3. Re-verify the nightly export + <24h health check + restore runbook from Phase 02 still hold end-to-end post-integration.

### Task 5: Handoff docs (F-021)
**Spec:** §8, SOW §8. Finalize: current architecture diagram; complete `.env.example`; "how to add a town" runbook dry-run by someone other than Adam; deploy/rollback exercised once; secrets-rotation documented; restore drill performed.

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] CSP enforced (not report-only); Cal.com/Turnstile/GA4/financing all load under it
- [ ] Public endpoints rate-limited; `webhook_events` pruned past retry window while idempotency holds within it
- [ ] Retention/purge runs for all named datasets; **`consent_record` + `suppression` survive purge**; opted-out numbers stay suppressed after a restore
- [ ] Backup <24h health check passes; restore runbook exercised
- [ ] F-021 handoff checklist complete and each item verified

---

## 5. Constraints
### Hard
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- Retention must never delete `consent_record`/`suppression` or resurrect opt-outs.
- Do NOT add features or change conversion behavior.
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results (incl. CSP-load + retention-invariant evidence); Ambiguities; Blocked Items; Decisions; **Warnings for Phase 2** (what 09 review-engine must respect re: suppression/consent). Maintain `PHASE-08-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 50`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-08-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
