# Synthesis — Suffolk Roofing Spec v1 Adversarial Review (Cycle 1: GUARDIAN/FOUNDATION/ADVOCATE/BRIDGE)

**Corpus:** 4 independent persona reviews of `suffolk-roofing-spec-v1.md` against `SOW-suffolk-roofing.md`, run this session (Claude Opus, 4 distinct personas/lenses — GUARDIAN/security-paranoid, FOUNDATION/data-purist, ADVOCATE/UX-lawyer, BRIDGE/integration-seams).

**Individual verdicts:** GUARDIAN READY WITH CAVEATS · FOUNDATION **NOT READY** · ADVOCATE READY WITH CAVEATS · BRIDGE READY WITH CAVEATS.

**Overall synthesis verdict: spec v1 should NOT lock as-is.** Two CRITICAL findings were independently confirmed by 2+ reviewers each (not just single-reviewer noise), and one of them (the review-request contact gap) is a genuine "this feature cannot function as specified" blocker, not a risk judgment call — that alone is enough to require a v2 before HG-3/lock regardless of severity-counting rules.

Per synthesis.md rules: dedup by actual defect, not title text; 2+ reviewers independently finding the same defect is treated as consensus-confirmed even below the "3+" bump threshold used for the larger agent-graph corpus, since this is a 4-reviewer (not 11-reviewer) pool.

---

## CRITICAL — must fix before v2 lock

| ID | Title | Reviewers | Recommendation | Decision |
|---|---|---|---|---|
| SPEC-001 | Sanity `job` document has **no customer contact field** — F-013 review-request engine has nothing to send to. This is not a risk, it's a non-functional feature as specified. | FOUNDATION-001, BRIDGE-001 (2/4, but both call it CRITICAL/blocking) | Add `customerName`/`customerPhone`/`customerEmail` to `job`, OR link `job` → operational-store `lead`/customer row and resolve contact at send time. Require non-empty contact before a job can be marked `completed`. | |
| SPEC-002 | Operational-store schema (§2.5) is written in Postgres types (`uuid`, `timestamptz`, `bool`) but defaults to Cloudflare D1 (SQLite), which has none of those types. The spec's own claim "either way the schema is unchanged" is false. | **ALL 4** (GUARDIAN-008, FOUNDATION-002, ADVOCATE-015, BRIDGE-006) | Decide the host now (spec already leans Cloudflare). Rewrite DDL for SQLite: `TEXT` ids, epoch-millis or ISO-8601 `TEXT` timestamps, `INTEGER` 0/1 booleans. Remove the "unchanged" claim. | |
| SPEC-003 | `/api/lead`'s synchronous SMS send contradicts the spec's own §8.1 "persist-first, never lose a lead" principle — a Twilio slowdown can fail the request even though the lead was saved. | ADVOCATE-004, FOUNDATION-013, BRIDGE-005 (3/4) | Persist lead → return 201 immediately → dispatch SMS via `ctx.waitUntil()`/queue, not inline. Retry/SLO-alert path (already spec'd in §8.3) is the real backstop. | |
| SPEC-004 | No webhook idempotency anywhere except a half-working review-request dedupe — Cal.com/Twilio retries can double-fire the GA4 `booking_completed` key event (the primary October acceptance metric) and double-notify the operator. Compounded by GA4 firing from **both** client gtag and server Measurement Protocol with no shared `event_id`. | **ALL 4** on webhook idempotency generally; BRIDGE-002/003 and GUARDIAN-005/014 specifically on the double-fire mechanism | Persist provider event IDs (`processed_webhook` table or reuse `message_log.provider_message_id`); make every webhook handler an idempotent upsert; pick ONE authoritative `booking_completed` emitter (prefer server-side) with a shared `transaction_id` so GA4 dedupes. | |
| SPEC-005 | Rate limiting on `/api/lead` (10 req/min/IP + captcha) does not stop the two attacks that actually matter for a paid-SMS endpoint: cost-drain via rotating IPs, and TCPA-weaponization (spamming a *victim's* number through the form, making the business the legal sender of record). No per-destination-phone cap, no global SMS spend ceiling, no international/NANP restriction. | GUARDIAN-001/002 (CRITICAL/HIGH), ADVOCATE-006/011, FOUNDATION-018 (3-4/4 depending on how the sub-findings are counted) | Cap outbound SMS per destination phone (e.g. 1/24h) checked against `message_log` before send; restrict to +1 US/Canada at validation AND at Twilio's geographic permissions; set a hard daily SMS budget with an abort+alert; treat captcha verification as gating the DB write, not parallel to it. | |

## HIGH — should fix before v2, strong fix-before-build case

| ID | Title | Reviewers | Recommendation | Decision |
|---|---|---|---|---|
| SPEC-006 | Email channel has zero CAN-SPAM unsubscribe/suppression — SMS STOP is handled, email isn't, and `opt_out` is phone-keyed only. | GUARDIAN-003, ADVOCATE-012, BRIDGE-007 (3/4) | Extend suppression to `(channel, contact)`; add List-Unsubscribe header + endpoint on every review-request email. | |
| SPEC-007 | STOP suppresses correctly but **START/UNSTOP never clears `opt_out`** — a customer who re-opts-in stays silently suppressed forever. | FOUNDATION-015, BRIDGE-007 | Handle START by clearing/superseding the suppression row; keep an audit trail (`opted_in_at`) rather than hard-deleting. | |
| SPEC-008 | TCPA consent record is a bare boolean + loose "consent text" — not defensible in a dispute (no versioned copy, no IP/UA, no page URL). | GUARDIAN-010, ADVOCATE-007 | Store a consent snapshot: version id, verbatim rendered text, timestamp, source URL, IP, UA — immutable/append-only. | |
| SPEC-009 | Operator dashboard (leads/PII) is a named SOW deliverable but has no route, no components, and unresolved auth ("Sanity auth OR basic-auth") — also contradicts §7.3's "no client reads" of the lead store. | ADVOCATE-014, GUARDIAN-006, FOUNDATION-010 (3/4) | Spec the route/components/queries explicitly; resolve auth to one mechanism (Cloudflare Access/Zero Trust, not shared Basic auth) in front of a server endpoint, never direct client reads of the store. | |
| SPEC-010 | No backup/DR/migration plan for the operational store — the one net-new datastore holding every lead AND the `opt_out` compliance list. Losing `opt_out` re-exposes previously-suppressed numbers to sends (direct TCPA liability). | ADVOCATE-005, GUARDIAN-011, FOUNDATION-007/008 (3/4) | Scheduled export (D1 export or Supabase backup) to off-vendor storage; document restore in the F-021 runbook; add a migrations tool for the op-store (currently only Sanity has one). | |
| SPEC-011 | CallRail (DNI call tracking) and Twilio (missed-call text-back) both need to own the same inbound phone number — the spec never resolves which one does, so the marketed "we text you back if we miss your call" promise can silently never fire. | ADVOCATE-001 only, but CRITICAL-rated and structurally sound — a design conflict, not a matter of opinion | Define the call topology explicitly (CallRail forwards to a Twilio-owned line, or use CallRail's own missed-call webhook instead of Twilio for voice) and add a real end-to-end test placing an unanswered call through the DNI number. | |
| SPEC-012 | No indexes declared on any operational-store hot path (`message_log.lead_id`, `review_request.job_id`, `lead.created_at`/`status`) — full table scans during the storm-surge traffic that is the whole point of the site. | GUARDIAN-009, FOUNDATION-005 | Add the indexes now, in the initial migration. | |
| SPEC-013 | Lead form / quote widget are `client:visible`-only islands with no no-JS fallback, no loading/error/double-submit states — for an audience of stressed homeowners on degraded mobile connections, this is the single most likely real-world failure path. | ADVOCATE-002/003 | Real `<form action>` HTML fallback; `client:load` for the above-the-fold emergency form; submit-idempotency key; spinner/disable-on-submit; SR-announced errors. | |
| SPEC-014 | LSA enrollment (2-5 week estimate) doesn't include Google's background/insurance verification, which routinely extends further, and has no buffer against the hard October gate. | GUARDIAN-007, ADVOCATE-016, BRIDGE-016 (3/4) | Re-plan as 6-8 weeks with explicit backward-dated milestones and a named fallback (standard Google Ads) if LSA slips. | |
| SPEC-015 | Phone-number normalization for STOP-suppression matching is undefined — inbound STOP in one format vs. a later lead stored in a different format can silently fail to suppress. | FOUNDATION-006 | Normalize every phone to E.164 at every write boundary (libphonenumber) before any read/write/compare. | |
| SPEC-016 | SOW places review-request (F-013) and quote widget (F-014) in the **Launch** conversion stack; the spec's own phase plan defers both to Phase 2 — the two governing documents disagree on launch scope with no flagged deviation. | BRIDGE-009 | Either move F-013/F-014 into Phase 1, or explicitly document the Phase-2 descope as an agreed deviation with Adam's sign-off. Needs a decision, not a code fix. | |

## MEDIUM (selected — full list in the raw agent outputs, not reproduced here for brevity)

- Money stored as float (`townPricing`, `permit.feeUsd`) instead of integer cents (FOUNDATION-003)
- `review_request` schema can't represent "queued but not sent," which the cron backstop depends on; webhook+cron dedupe is non-atomic (GUARDIAN-004, BRIDGE-004)
- Cross-store referential integrity between op-store rows and Sanity `_id`s is unenforced — no unique constraint, no reconciliation (FOUNDATION-004, BRIDGE-001 overlap)
- GA4 server-side event has no `client_id` continuity — bookings attribute to (direct)/None (FOUNDATION-017, BRIDGE-011)
- `advertisingAllowed` has no fail-safe default and the East-End CTA-suppression E2E is only "SHOULD" despite being a licensing violation if it regresses (GUARDIAN-016, BRIDGE-012)
- §771-B banned-phrase content lint is named but never defined (GUARDIAN-015)
- Async third-party script budget (≤3-4) contradicts the captcha requirement, which is a 5th script (GUARDIAN-013)
- Quote widget's ~324-record `townPricing` matrix has no coverage guarantee — most combos may 422 silently (FOUNDATION-009)
- WCAG 2.2's newer, less-automatable criteria (redundant entry, focus-not-obscured, target size) and third-party embed accessibility aren't verifiably covered by "axe + one manual pass" (ADVOCATE-008, GUARDIAN-012)
- Reviews/booking-embed-failure/quote-widget empty and loading states are deferred to a post-phase visual pass rather than specified acceptance criteria (ADVOCATE-009)

---

## What every reviewer commended (keep these)

- The Feature ID Registry + Traceability Matrix (§0, §10) — every SOW feature mints an F-XXX and maps to concrete data/functions/components/tests/phase, with no orphans. All 4 reviewers called this out unprompted.
- Required-field Sanity publish gate enforced in both Studio validation AND CI (§2.2/§2.3) — genuinely structural defense against thin/name-swap pages.
- Compliance treated as build-enforced (§7.5), not aspirational: license-presence CI check, ungated-review no-satisfaction-branch test, STOP suppression.
- The "storm cluster is the non-negotiable slice, everything else can slip" phasing decision (§6) — correct risk posture for a solo builder against a hard deadline.

---

## Recommended path to lock

1. **Decision gate (you, now):** SPEC-001 through SPEC-005 are effectively must-fix — SPEC-001 is a literal non-functional-feature bug, not a judgment call. SPEC-016 needs your decision either way (move F-013/F-014 to Phase 1, or explicitly accept the Phase-2 descope).
2. **Incorporate → spec v2** addressing at minimum the 5 CRITICAL + as many HIGH as you want before the next review dollar is spent.
3. Given this was a genuinely thorough single-cycle review (4 reviewers, 8 dimensions each, ~70 total findings), I'd recommend a **lighter v2 check** — not a full second 4-persona fan-out, but 1-2 targeted reviewers (BRIDGE + FOUNDATION, since the data/integration seams were where the real blockers lived) reviewing just the diff between v1 and v2 — before locking, rather than re-running all 4 personas cold.
