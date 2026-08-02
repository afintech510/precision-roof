# Phase 02: Operational Store
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00
**Implements:** F-009, F-012, F-013, F-008, F-023 (data layer)
**Recommended:** `claude --max-turns 75`

---

## 1. Context

You are executing **Phase 02: Operational Store** — the Cloudflare **D1** schema, migrations, indexes, and backup/restore drill. **Your scope is strictly this phase.** No API routes, no Durable Object logic, no SMS (Phase 05b) — tables, constraints, migrations, and durability only.

**Tech Stack (spec §1.2, §1.3):** Cloudflare D1 (SQLite), Wrangler migrations, R2 for backups.
**Working Directory:** project root. **Spec File:** `suffolk-roofing-spec-v3.md` — READ §2.5, §1.2, §1.3 FIRST.

### What Already Exists
Phase 00 wired the D1 binding + migration tool + test surface. Dependencies are installed — **do NOT run `npm install`.**

### What You're Building
Every operational-store table in **SQLite-native types**, the indexes, the migration classification (additive/rename/destructive), and the backup + tested restore drill.

---

## 2. Objective & Deliverables

### Objective
After this phase, all op-store tables exist in D1 with correct SQLite types/constraints/indexes, migrations apply and reverse cleanly, and a restore-from-backup drill passes in a preview env.

### Deliverables
1. D1 DDL for: `lead`, `consent_record`, `booking`, `suppression`, `message_log`, `webhook_events`, `operator_access_log`, `review_request` — spec §2.5.
2. Indexes per spec §2.5.
3. Migrations tool usage with additive/rename/destructive classification — spec §1.3.
4. Near-zero-RPO durability for `suppression` + `consent_record` (write-through/continuous log) — spec §1.3.
5. Nightly backup (D1 export → R2, <24h health check) + documented, tested restore runbook — spec §1.3.

---

## 3. Implementation Instructions

### Task 1: Schema in SQLite-native types
**Spec:** §2.5, §1.2.
> **CAUTION — prior CRITICAL.** The op-store must use **SQLite/D1 native types**, NOT Postgres. All timestamps are **integer epoch-ms**; ids are `TEXT`; booleans are `INTEGER 0/1`; enums are `TEXT + CHECK`. There must be **zero** `timestamptz`, `uuid`, `boolean`, `serial`, or `jsonb` column types anywhere.

Author each table per §2.5, including: `lead` (`sms_suppressed_reason` enum, `sms_claimed_at` nullable, `status` enum + documented transition CHECK, `consent_ua`, `consent_source_url`); append-only `consent_record` (4-year retention); `booking` (`calcom_booking_uid` UNIQUE, `source` enum); `suppression` keyed `(channel, contact)` with nullable `opted_in_at`; `message_log` (`UNIQUE(provider_message_id)`, monotonic state machine); `webhook_events` (idempotency key column sized for `MessageSid:MessageStatus`); `operator_access_log`.

### Task 2: Indexes
**Spec:** §2.5. `UNIQUE message_log(provider_message_id)`, `review_request(status, requested_at)`, partial `lead(created_at) WHERE speed_to_lead_sms_sent_at IS NULL`, `suppression(channel, contact)` PK, `operator_access_log(lead_id)`.

### Task 3: Migration classification
**Spec:** §1.3. Structure migrations with additive/rename/destructive classification (same discipline as Sanity). Confirm up + down both apply cleanly.

### Task 4: Durability for suppression + consent
**Spec:** §1.3. `suppression` and `consent_record` get near-zero-RPO durability (write-through to a second store / continuous log) so a restore can never resurrect an opted-out number.

### Task 5: Backup + restore drill
**Spec:** §1.3. Nightly export → R2, 30-day+ retention; health check asserting most-recent backup <24h; a **tested** restore runbook exercised in a preview env.

---

## 4. Acceptance Criteria
- [ ] Standing gate green: `typecheck`, `lint`, `vitest`, `playwright` exit 0
- [ ] **Schema-type audit:** no `timestamptz`/`uuid`/`boolean`/`serial`/`jsonb` in any migration; timestamps are integer epoch-ms, booleans `INTEGER 0/1`, enums `TEXT + CHECK` (automated grep/test over `migrations/`)
- [ ] All tables/columns/constraints from §2.5 exist; `wrangler d1 migrations apply` succeeds
- [ ] Migrations reverse cleanly (down migrations apply)
- [ ] All §2.5 indexes present (including the partial and composite ones)
- [ ] `consent_record` is append-only; `suppression` PK is `(channel, contact)`
- [ ] Restore drill: op-store restored from an R2 backup in a preview env; opted-out numbers remain suppressed post-restore

---

## 5. Constraints

### Hard (violation = phase failure)
- **Tool allowlist only** (Edit/Write/Read/Glob/Grep; `Bash(npm run build|typecheck|lint)`, `Bash(npm run test:*)`, `Bash(npx vitest:*|playwright:*)`, `Bash(git status|diff|add|commit:*)`, `mcp__supabase`, `mcp__playwright`, `mcp__filesystem`). **No `npm install`. No `git push`.**
- SQLite-native types only (see Task 1 caution). Column names/types/constraints MUST match §2.5 exactly.
- Do NOT implement API routes, the Durable Object, or SMS logic (Phase 05*).

### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED` as needed. Reference §2.5 by number; don't inline.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results (include the type-audit evidence); Spec Ambiguities; Blocked Items; Decisions Made (backup cadence, durability mechanism); **Warnings for Next Phase** (which tables 05a/05b/05d/05e/09 write; the `sms_claimed_at` claim contract the DO in 05b must honor). Maintain `PHASE-02-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 75`.
- **Resumption (--continue):** re-read prompt, inspect filesystem + applied migrations, read `PHASE-02-PROGRESS.md`, resume at first incomplete task, no restart.
- **Autonomy:** defined → exact; silent → reasonable + `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
