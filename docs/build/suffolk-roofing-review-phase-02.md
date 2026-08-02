# Meta-Agent Review: Phase 02 — Operational Store

You are a code reviewer evaluating an AI coding agent's output. Verify Phase 02 before the build proceeds. **Your role is adversarial** — schema errors here cascade into every API phase, so verify every type and constraint against the spec yourself.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §2.5, §1.2, §1.3
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-02-operational-store.md`
3. Builder completion report + `migrations/` + D1 config on disk

## What Phase 02 Should Have Built
**Objective:** All op-store tables in SQLite-native types + indexes + reversible migrations + backup/restore drill.
**Spec sections:** 1.2, 1.3, 2.5, 8. **Implements (data layer):** F-009, F-012, F-013, F-008, F-023.

## Review Checklist
### 1. Dangerous part — SQLite-native types (prior CRITICAL)
- [ ] **Grep every migration:** zero `timestamptz`, `uuid`, `boolean`, `serial`, `jsonb`. Timestamps are integer epoch-ms; ids `TEXT`; booleans `INTEGER 0/1`; enums `TEXT + CHECK`
### 2. Spec compliance (§2.5)
- [ ] Tables `lead, consent_record, booking, suppression, message_log, webhook_events, operator_access_log, review_request` all present with correct columns/constraints
- [ ] `lead`: `sms_suppressed_reason` enum, `sms_claimed_at`, `status` enum + transition CHECK, `consent_ua`, `consent_source_url`
- [ ] `consent_record` append-only, 4-yr retention intent; `booking.calcom_booking_uid` UNIQUE; `suppression` PK `(channel, contact)`; `message_log` UNIQUE `provider_message_id`; `webhook_events` key sized for `MessageSid:MessageStatus`
- [ ] Indexes per §2.5 (incl. partial `lead(created_at) WHERE speed_to_lead_sms_sent_at IS NULL`)
### 3. Acceptance criteria (re-run)
- [ ] Standing gate exits 0; `wrangler d1 migrations apply` succeeds; down-migrations reverse cleanly
- [ ] Restore drill: op-store restored from R2 in a preview env; **opted-out numbers remain suppressed post-restore**; `suppression`/`consent_record` have near-zero-RPO durability
### 4. Scope / hygiene
- [ ] No API routes, Durable Object logic, or SMS code; no `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema:
```json
{
  "phase_reviewed": "Phase 02: Operational Store",
  "verdict": "PROMOTE | FIX | ESCALATE",
  "verdict_rationale": "",
  "acceptance_criteria": [{ "criterion": "", "result": "PASS | FAIL", "evidence": "" }],
  "spec_compliance": { "sections_verified": [], "deviations": [{ "section": "", "expected": "", "found": "", "severity": "BLOCKER | WARNING | NOTE" }] },
  "issues_found": [{ "severity": "BLOCKER | WARNING | NOTE", "file": "", "line": "", "description": "", "fix": "" }],
  "cross_phase_notes": [],
  "ambiguity_audit": [{ "location": "", "builder_decision": "", "assessment": "REASONABLE | NEEDS HUMAN DECISION | INCORRECT", "note": "" }],
  "recommendation": ""
}
```

## Verdict Definitions
- **PROMOTE** — types are SQLite-native, all tables/indexes/constraints match §2.5, migrations reverse, restore drill preserves suppression.
- **FIX** — a type/constraint/index mismatch or a failed migration/restore; list precise `issues_found`.
- **ESCALATE** — a schema decision with cross-phase implications a human should weigh.

> **HEAVY phase.** A second independent reviewer may judge this diff; disagreement force-escalates to a cross-vendor adjudicator rather than an ordinary fix cycle.
