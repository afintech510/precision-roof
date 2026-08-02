# Phase 05b: Lead Intake + Twilio Speed-to-Lead
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00, Phase 01, Phase 02
**Implements:** F-009, F-012, F-015 (form submit)
**Recommended:** `claude --max-turns 75`

---

## 1. Context
You are executing **Phase 05b: Lead Intake + Twilio** — the most safety-critical phase. It builds the 3-step lead form, `/api/lead`, the **Durable Object** concurrency authority, the **async Queue-worker SMS dispatch**, the Twilio webhooks (status + STOP/START), the `consent_record` snapshot, the `slo-sweep` cron, and the deterministic East-End ZIP→town gate table. **Scope is strictly this phase.**

**Tech Stack (spec §1.2):** Astro + Cloudflare Workers + Durable Objects + Queues + D1 + Twilio + Turnstile. **Working Directory:** project root. **Spec File:** read §3.1, §3.2, §1.2, §2.5, §5.2, §7.3 first.

### What Already Exists
Phase 02: `lead`, `consent_record`, `suppression`, `message_log`, `webhook_events` (+ the `sms_claimed_at` claim contract noted in Phase 02's handoff). Phase 03c: town advertising flags. Deps installed — **no `npm install`.**

### What You're Building
An honest-confirmation lead pipeline where the SMS never blocks the request path, per-phone/budget/suppression is serialized in one Durable Object, and STOP is honored even for in-flight sends.

---

## 2. Objective & Deliverables
### Objective
After this phase, `/api/lead` persists a lead and returns first, the SMS dispatches asynchronously through the DO+Queue, a second same-phone submit yields exactly one SMS, and a STOP arriving before delivery aborts the in-flight send.
### Deliverables
1. 3-step `LeadForm` with native-POST fallback + TCPA consent — spec §4 `[SPEC-013, C2-032, C2 ADVOCATE-009]`.
2. `POST /api/lead` (NANP + E.164 + enum validation, East-End gate, honest `channel` field) — spec §3.1, §3.2.
3. **Durable Object** concurrency authority (per-phone 24h window + `suppression` + budget reservation → allow-token) — spec §1.2, §3.1.
4. **Async Queue-worker SMS dispatch** (never inline) — spec §3.1.
5. `POST /api/webhooks/twilio` (status `MessageSid:MessageStatus`, inbound STOP/START) — spec §3.2, §2.5.
6. `consent_record` append-only snapshot — spec §2.5 `[SPEC-008]`.
7. `cron: slo-sweep` reserving through the DO with send-time re-check — spec §3.2.
8. Deterministic ZIP→town→`advertisingAllowed` gate table (reused by 05d) — spec §3.2, §7.

---

## 3. Implementation Instructions
### Task 1: LeadForm island
**Spec:** §4 `[SPEC-013]`. Real `<form action>` that **degrades to native POST** if the island doesn't hydrate; above-the-fold emergency form uses `client:load`; TCPA checkbox **unchecked by default**, not bundled; announce step changes + submit success via `aria-live`; branch confirmation copy on the `channel` field.

### Task 2: `/api/lead` + async dispatch
**Spec:** §3.1, §3.2.
> **CAUTION — prior CRITICAL: speed-to-lead SMS must never block the request path.** Persist the lead and **return first** (201+`channel:sms` → "texting you now"; 202+`channel:callback` → "we'll call you at [tel:]"). Dispatch the SMS via the Queue (worker consumes it), **not** inline. `/api/lead` calls the Durable Object **once**; the DO atomically evaluates per-phone 24h window + `suppression` + budget reservation and returns allow(+token)/deny. The `lead` table is evidence, never the concurrency gate. The allow-token is the Queue dedupe key. Validate NANP + E.164 + enums at the edge (Zod). Turnstile blocked/slow → `sms_suppressed_reason = turnstile_fallback`, never SMS-eligible, client told the channel changed.

### Task 3: Durable Object authority
**Spec:** §1.2, §3.1. The DO **exactly serializes** the per-phone 24h window + suppression check + budget reservation. Global budget is an approximate **sharded soft-cap** — do NOT claim an exact global guarantee. Operator kill-switch is the true ceiling.

### Task 4: Twilio webhooks
**Spec:** §3.2, §2.5.
> **CAUTION — idempotency (prior CRITICAL).** Status callbacks keyed **`MessageSid:MessageStatus`** (not `MessageSid` alone) with a monotonic last-write-wins state machine; inbound STOP/START keyed on `MessageSid`. STOP → suppress `(sms, phone)` wholesale; START clears/supersedes with `opted_in_at` audit. STOP-confirmation SMS deduped per phone/window, drawn from a small reserved allowance.

### Task 5: consent_record snapshot
**Spec:** §2.5 `[SPEC-008]`. Copy consent (version/text/ts/ip/ua/source_url) into append-only `consent_record`; it survives the 24-mo `lead` purge.

### Task 6: slo-sweep cron with send-time symmetry
**Spec:** §3.2, §3.1.
> **CAUTION.** `slo-sweep` scope: `advertising_status='active' AND sms_suppressed_reason IS NULL AND sms_claimed_at IS NULL`. It reserves per-phone/budget **through the same Durable Object** (allow-token) and re-consults `suppression` inside the atomic `sms_claimed_at` claim immediately before dispatch — identical to the primary path — so it can't double-fire with the queue worker or race a live same-phone submit.

### Task 7: East-End gate table
**Spec:** §3.2, §7. Deterministic ZIP→town(s)→`advertisingAllowed` lookup mirroring the Phase-03c town flags, fail-safe conflict rule (any gated match → `informational_only`). Export it for Phase 05d reuse.

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] **`/api/lead` returns 201 within the spec's latency target even when the outbound Twilio call is mocked to hang** — test stalls the SMS call and asserts the response is not blocked on it
- [ ] Two concurrent same-phone submits → **exactly 1 SMS** (DO atomic claim)
- [ ] STOP arriving after allow-token issuance but before queue delivery → in-flight SMS **aborted** (send-time re-check)
- [ ] Live same-phone submit + slo-sweep pickup in the same tick → exactly 1 SMS (both reserve through the DO)
- [ ] slo-sweep does NOT re-send to `informational_only` / `turnstile_fallback` / opted-out leads
- [ ] Twilio status callbacks (`queued→sent→delivered/failed`) all recorded via `MessageSid:MessageStatus`; hard bounce → `failed_permanent`
- [ ] STOP suppresses `(sms, phone)`; subsequent sends blocked; START supersedes with `opted_in_at`
- [ ] Non-NANP / non-E.164 phone rejected at validation
- [ ] Per-phone daily send cap enforced; LeadForm degrades to native POST when JS disabled
- [ ] `consent_record` row written (version/text/ts/ip/ua/url) and survives a simulated lead purge

---

## 5. Constraints
### Hard (violation = phase failure)
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- SMS dispatch MUST be async (Queue), never inline in `/api/lead`.
- The DO is the single concurrency authority; D1 predicates are cheap pre-filters only.
- No exact global-budget guarantee claims (sharded soft-cap + kill-switch).
- Do NOT build CallRail/financing (05c) or the dashboard (05e).
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results (include the stall-test evidence + concurrency-test counts); Ambiguities; Blocked Items; Decisions (queue config, shard count, latency target used); **Warnings for Next Phase** (the DO + send-path 05c reuses for missed-call text-back; the gate table 05d imports; message rows 05e reads). Maintain `PHASE-05b-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 75`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-05b-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
- **Note:** HEAVY phase — a second independent reviewer may judge this diff; disagreement escalates rather than resolving as an ordinary fix.
