# Master Architecture Specification: Suffolk County Residential Roofing Website

**Version:** 3
**SOW Reference:** `SOW-suffolk-roofing.md`
**Research Reference:** `SYNTHESIS-suffolk-roofing.md`
**Review References:** `suffolk-roofing-synthesis-v1.md` (Cycle 1, 6 external reviews) · `suffolk-roofing-synthesis-v2.md` (Cycle 2, 4 internal reviews) · `SYNTHESIS-spec-v1-review.md` (parallel Cycle-1, 4 Opus personas)
**Date:** 2026-08-02
**Status:** 🔒 **LOCKED** (2026-08-02) — post-Cycle-2 revision + focused Cycle-3 verification. Both Cycle-3 verifiers (BRIDGE, GUARDIAN) confirmed the two Cycle-2 CRITICAL regressions closed; their three MEDIUM/LOW spec-wording residuals are applied above (tagged `[C3: …]`). No open CRITICAL/HIGH findings.

> **v2 → v3 changes** incorporate all approved Cycle-2 findings (C2-001…C2-033), the new items from the parallel Cycle-1 review (SPEC-006 email CAN-SPAM, SPEC-005 NANP restriction, SPEC-008 consent snapshot, SPEC-014 LSA timeline, SPEC-016 launch-scope resolution), and DEC-C (≤4 scripts). Changed passages are tagged inline `[C2-xxx]` / `[SPEC-xxx]`. Full audit in `suffolk-roofing-changelog.md`.

---

## 0. Feature ID Registry

Unchanged from v2 (F-001…F-023). **Phasing change** `[SPEC-016]`: **F-014 (quote widget) moves to Launch**; **F-013 (review-request) stays early-Phase-2** as a documented, Adam-approved deviation from SOW §6 — F-013 cannot fire until completed jobs exist, so it is naturally gated (see §6, §11).

---

## 1. System Architecture Overview

### 1.1 Architecture Diagram
As v2, with these seam corrections:
- All per-request rate/opt-out/budget decisions resolve in **one Durable Object invocation** that returns an **allow-token**; the token is the Queue message's dedupe key `[C2-003]`.
- A dedicated **`sanity-publish` webhook** rematerializes the pricing blob (separate from `sanity-job`) `[C2-023]`.
- Server-side GA4 fires via **Measurement Protocol with the captured `client_id`** `[C2-021]`.

### 1.2 Technology Stack
As v2, plus:

| Concern | Decision | Source |
|---------|----------|--------|
| Store commitment | **Commit to Cloudflare D1 for launch.** DDL is authored for SQLite: `TEXT` ids, **integer epoch-ms** timestamps, `INTEGER 0/1` booleans, enums as `TEXT + CHECK`. Supabase is a post-launch option behind a repository/data-access layer + dialect-specific migrations — **not** a drop-in swap. | `[C2-013 / SPEC-002]` |
| Concurrency authority | The **Durable Object exactly serializes** the per-phone 24h window + suppression check; the **global budget is an approximate sharded soft-cap** reconciled periodically, with the operator kill-switch (§8) as the true ceiling — the DO does not claim an exact global budget guarantee, and implementers must not assume one (max overshoot ≈ shard slack) `[C2-003, C2-004, C3: BRIDGE-003]` |
| Global budget counter | **Sharded** sub-counters (or a cheap cached kill-switch flag read at the edge) — not one hot global object on every request | `[C2-033]` |
| SMS geo-scope | Outbound SMS restricted to **NANP (+1 US/Canada)** at Zod validation **and** Twilio geographic-permissions | `[SPEC-005]` |

### 1.3 Deployment Topology
As v2, plus:
- **Op-store migrations tool** (D1 migrations) with the same additive/rename/destructive classification as Sanity `[SPEC-010, C2 migration]`.
- **`opt_out`/`suppression` + `consent_record` get near-zero-RPO durability** (write-through to a second store / continuous log), not just the nightly ≤24h backup — a restore must never resurrect an opted-out number `[C2-006]`.
- **Retention/purge** extended to `webhook_events` (prune past provider retry window, 30–90d) and `message_log` (archive/rollup per TCPA window) `[C2-024]`, and to `review_request.customer_contact` + Sanity `job` PII `[C2-031]`.

---

## 2. Content Model (Sanity Schema)

### 2.2 Sanity Document Types — deltas from v2
- **`townPricing`** adds `provisional` (boolean, default false) `[C2-014]`; the coverage guarantee (§2.4) asserts a **non-stale** covering row (staleness threshold `N = 2 years`, explicit) `[C2-014]`.
- **`town.historicOverlay`** modeled as `{ applies: boolean (required), details: string (required when applies=true) }` so a no-overlay town can publish `[C2-030]`.
- **`job`** customer-contact fields (v2) retained; these PII fields are covered by the retention/anonymization policy `[C2-031]`.
- **`review`** JSON-LD emission additionally **suppressed when `lastSyncedAt` > freshness threshold**, and reconciles Google deletions/edits each sync (soft-delete missing `externalReviewId`s; recompute `AggregateRating` only from present reviews) `[C2-011]`.
- **`siteSettings`** consent fields retained; the rendered consent version is the source of truth for the client payload (§3.2) `[C2-006]`.

### 2.4 Seed Data
Coverage CI check now enumerates town × service × band **× non-stale effectiveYear**, and fails on any missing/stale combo `[C2-014]`. Provisional-seeded combos set `provisional=true` and drive the stronger-disclaimer path (reconciled with §3.2 — one outcome: a **provisional range with heavy disclaimer**, not a book-CTA; the book-CTA is reserved for town/service genuinely out of launch scope) `[C2-014, C2-011-bridge]`.

### 2.5 Operational Store (Cloudflare D1)

All timestamps integer epoch-ms; enums `TEXT + CHECK` `[C2-013]`. Deltas from v2:

- **`lead`** adds `sms_suppressed_reason` (`turnstile_fallback | east_end_gate | opt_out | null`) and `sms_claimed_at` (nullable) `[C2-001, C2-004]`; `status` enumerated: `new | sms_sent | booked | informational_only | failed_followup | closed` with a documented transition map + CHECK `[C2-027]`; adds `consent_ua`, `consent_source_url` `[SPEC-008]`. Consent columns are **copied into `consent_record`** (below) and may be scrubbed from `lead` at 24-mo purge `[C2-006]`.
- **`consent_record`** (new, append-only) `[C2-006, SPEC-008]`: `id, phone_e164, consent_text, consent_version, consent_timestamp, consent_ip, consent_ua, consent_source_url, lead_id`. **Retention: 4 years** (TCPA statute), independent of the 24-mo `lead` purge.
- **`booking`** (new) `[C2-005]`: `id, lead_id (nullable FK), calcom_booking_uid (UNIQUE), slot_start, name, phone, email, status, source (form | booking_direct), created_at`. The Cal.com webhook **upserts a booking and creates a `lead` when `leadId` is absent** (walk-up bookings are never orphaned).
- **`suppression`** (replaces phone-only `opt_out`) `[C2-007, SPEC-006]`: keyed `(channel, contact)` where `channel ∈ {sms, email}`, `contact` = E.164 phone or email; `suppressed_at`, `opted_in_at` (nullable — START/resubscribe supersedes rather than hard-deletes), `keyword_matched`. **Any SMS STOP suppresses `(sms, phone)` wholesale** (matches carrier reality — no per-category granularity) `[C2-007]`; email List-Unsubscribe suppresses `(email, address)` `[SPEC-006]`.
- **`message_log`** adds `UNIQUE(provider_message_id)`; status advances via **monotonic last-write-wins state machine** (not idempotency-dropped) `[C2-002, C2-025]`; email rows capture provider id + bounce/complaint status `[C2-028]`.
- **`webhook_events`** — status-callback idempotency key is `MessageSid:MessageStatus` (not `MessageSid` alone) so each transition processes once `[C2-002]`; retention pruned past provider retry window `[C2-024]`.
- **`operator_access_log`** (new, schematized) `[C2-027]`: `id, operator_id, action, lead_id, accessed_at, ip` — one row per dashboard read of lead PII.

**Indexes** `[C2-025]`: `UNIQUE message_log(provider_message_id)`, `review_request(status, requested_at)`, partial `lead(created_at) WHERE speed_to_lead_sms_sent_at IS NULL`, `suppression(channel, contact)` PK, `operator_access_log(lead_id)`.

---

## 3. API & Function Design

### 3.1 Conventions — deltas
- **Single-authority concurrency** `[C2-003]`: `/api/lead` calls the Durable Object once; the DO atomically evaluates per-phone 24h window + `suppression` + budget reservation and returns `allow` (with a token) or `deny`. The `lead` table is evidence, never the concurrency gate. The allow-token is the Queue dedupe key.
- **Send-time re-check is symmetric across BOTH send paths** `[C3: BRIDGE-001, GUARDIAN-001]`: the **primary queue-worker send** AND `cron: slo-sweep` both obtain the authoritative per-phone/budget reservation **by invoking the same Durable Object at send time** (not via an independent D1 transaction), and re-consult `suppression` inside the atomic `sms_claimed_at` claim immediately before dispatch. This closes the window where a STOP arriving *after* allow-token issuance but *before* queue delivery would otherwise let an in-flight SMS through, and preserves the single-serialization-point invariant for same-phone races between a live submit and the sweep. D1 predicates (`advertising_status`, `sms_suppressed_reason`, `sms_claimed_at`) remain cheap pre-filters; the DO is the authority.
- **Budget cap** is **anomaly/rate-based** (per-minute spike vs baseline) with storm-surge headroom + fast operator override — not a flat daily ceiling that trips at peak demand `[C2-012]`; the counter is sharded `[C2-033]`.
- **SMS geo-restriction** to NANP at validation + Twilio permissions `[SPEC-005]`.
- **Turnstile fallback reconciled** `[C2-001, C2-015]`: a blocked/slow Turnstile routes to a genuinely SMS-free path — the lead is marked `sms_suppressed_reason = turnstile_fallback`, is **never** eligible for the SMS path (including slo-sweep), is independently rate-limited, and the client is told the channel changed (email/call, not text).

### 3.2 Endpoints — deltas

#### `POST /api/lead`
- Returns an explicit **`channel` field** (`sms | callback`) so the client renders honest confirmation copy: 201+`sms` → "texting you now"; 202/`callback` → "we'll call you at [tel:]" `[C2-015]`.
- NANP + enum + E.164 validation `[SPEC-005]`; East-End gate resolves via a **deterministic ZIP→town(s)→`advertisingAllowed` table with a fail-safe conflict rule** (any gated match → `informational_only`) `[C2-020]`.

#### `POST /api/quote`
- East-End gated towns return the **no-price informational payload** (not a numeric range — a quoted price is itself advertising) `[C2-019]`.
- Out-of-area vs malformed are distinguished so the client can render a **warm Suffolk hand-off + phone CTA** for a near-market ZIP without the server confirming which combos are priced `[C2-018]`.
- Reads the materialized blob; if Turnstile is unavailable, still returns a rate-limited estimate or the book path — a transparency feature never fails closed into invisibility `[C2-008-advocate]`.

#### `POST /api/webhooks/calcom`
- Validates `leadId` exists + cross-checks phone/email before linking; mismatch/absent → creates/【links a `booking` + minimal `lead`】 (`source=booking_direct`) `[C2-005, C2-022]`.
- Fires GA4 `booking_completed` **once**, server-side, via Measurement Protocol with the captured `client_id` + `api_secret`; no client-side booking event `[C2-021]`. For **walk-up (`booking_direct`) bookings with no prior form**, the Cal.com embed captures the browser's GA4 `client_id` (and `session_id`/`gclid` where present) client-side and forwards it via Cal.com booking metadata so the direct booking is attributed to the real session; if the `client_id` is genuinely absent, the event is marked **unattributed** (never fired with a minted/random `client_id`, which would corrupt source/medium) `[C3: BRIDGE-002]`.
- Idempotency key derived from Cal.com booking uid + trigger type `[C2 FOUNDATION-011]`.

#### `POST /api/webhooks/twilio`
- **Status callbacks** keyed `MessageSid:MessageStatus`, monotonic state-machine update; **inbound** STOP/START keyed on `MessageSid` `[C2-002]`.
- STOP → suppress `(sms, phone)` wholesale; **START clears/supersedes** with `opted_in_at` audit `[C2-007, SPEC-007]`.
- **STOP-confirmation SMS is deduped per phone/window** (not per MessageSid), not re-sent if already opted out, and draws from a small reserved allowance so it survives a budget auto-disable `[C2 GUARDIAN-005]`.

#### New / changed scheduled + webhook functions
- **`POST /api/webhooks/sanity-publish`** (new) — verify + dedupe → rematerialize pricing blob; store `blob_built_at`; alarm on blob-age/rev divergence `[C2-023]`.
- **`cron: slo-sweep`** query scoped to `advertising_status='active' AND sms_suppressed_reason IS NULL AND sms_claimed_at IS NULL`, and reserves per-phone/budget **through the Durable Object** (allow-token) plus a suppression re-check inside the atomic `sms_claimed_at` claim — identical to the primary path (see §3.1 send-time symmetry) so it can't double-fire with the queue worker or race a live same-phone submit `[C2-001, C2-004, C3: GUARDIAN-001]`.
- **Email sends** (review-request, alerts, SLO-recovery) carry a **List-Unsubscribe header + one-click unsubscribe endpoint**, check `suppression(email, …)` first, and capture bounce/complaint webhooks `[SPEC-006, C2-028]`.

#### CallRail voice path
- **Original-caller-ID (ANI) passthrough is a Phase-0 verification gate**; if CallRail can't forward true ANI to Twilio, drive the missed-call text-back from **CallRail's own call webhook** payload instead `[C2-010]`.

### 3.3 Webhook Verification & Idempotency
As v2 + the `MessageSid:MessageStatus` refinement `[C2-002]` + the new `sanity-publish` handler `[C2-023]`.

---

## 4. Component & Page Architecture — deltas

- **Script budget held at ≤4** `[DEC-C]`: CallRail deferred to first interaction; GA4 to idle; Cal.com + financing behind facades. Turnstile is interaction-loaded and, with CallRail/GA4 off the critical initial path, the concurrent async-script count stays ≤4. CI budget gate asserts **4**, matching SOW ≤3–4.
- **LeadForm** is a real `<form action>` that **degrades to a native POST** if the island doesn't hydrate `[SPEC-013, C2-032]`; above-the-fold emergency form uses `client:load` (not `client:visible`) `[SPEC-013]`; branches confirmation copy on the `channel` field `[C2-015]`; announces step changes ("Step 2 of 3") and submit success via `aria-live` `[C2-016]`; TCPA checkbox renders **unchecked by default**, not bundled `[C2 ADVOCATE-009]`.
- **QuoteWidget** adds a **network-error state** (inline "call [tel:]" + retry + fetch timeout, `aria-live`) `[C2-017]`, promoted to **Launch** `[SPEC-016]`.
- **Facade embeds** show an immediate loading affordance + an always-visible phone CTA alongside, so slow-load never reads as a dead button `[C2 ADVOCATE-011]`.
- **Emergency-cluster UX** (new spec) `[C2 ADVOCATE-010]`: storm/leak/emergency pages lead with click-to-call as the primary hero action, minimal secondary form, honest "book a free inspection" framing (no time-bound promise), sticky call target ≥24px.
- **WCAG 2.2** explicit coverage `[C2-016]`: Target Size 2.5.8 (≥24px), Focus Appearance 2.4.11/2.4.13, focus-not-obscured, redundant-entry — added to the manual a11y checklist and §9 assertions.
- **`/accessibility` page** specified `[C2-032]`: WCAG 2.2 AA conformance target, testing method, known limitations, remediation contact; a launch gate.

### 4.4 Routing & Internal Linking
As v2 + the deterministic ZIP→town gate table `[C2-020]`.

---

## 5. Integration Requirements — deltas

- **5.2 Twilio** — **A2P 10DLC Brand+Campaign registration (or Toll-Free verification) is a Phase-0 gate** with explicit lead time; monitor error 30007 (carrier-filtered) before trusting "delivered" `[C2-008]`. NANP-only geo permissions `[SPEC-005]`. Status-callback state machine `[C2-002]`.
- **5.3 CallRail** — ANI-passthrough Phase-0 gate `[C2-010]`.
- **5.5 Postmark/SES** — own-failure handling: capture provider id + bounce/complaint webhooks; **explicit failover to SMS-secondary alert** on email failure/bounce; deliverability metrics; List-Unsubscribe on every email `[C2-028, SPEC-006]`.
- **5.7 Google Business Profile API** — full quartet `[C2-011]`: OAuth refresh + token-failure alerting, quota/backoff, deletion/edit reconciliation, staleness gate suppressing Review JSON-LD when stale; confirm display/aggregate **ToS + attribution**.
- **5.8 Google LSA** — **re-planned 6–8 weeks** including Google background + insurance verification, with backward-dated milestones and a **named fallback (standard Google Ads)** if LSA slips the October gate `[SPEC-014]`.
- **5.9 CSP** (new integration concern) `[C2-009]`: full policy — `frame-src` cal.com + financing vendor + `challenges.cloudflare.com`; `connect-src` GA4 + CallRail + own `/api`; nonce-based `script-src`; validated in report-only before enforce.

---

## 6. Build Phases — deltas

**Phase 0 additions** `[C2-008, C2-010, C2-023, C2-011, SPEC-014]`: A2P 10DLC registration; CallRail ANI-passthrough verification; Cal.com free-tier webhook verification (from v2); GBP API OAuth + ToS confirmation; op-store stood up **with backups + restore drill + migrations tool**; LSA enrollment started against the 6–8 wk plan with the Google-Ads fallback pre-scoped; pricing-coverage CI green.

**Phase 1 (Launch, before October)** — now **includes F-014 quote widget** `[SPEC-016]` (low-cost, supports the transparency wedge; reads the materialized pricing blob). All the CRITICAL/HIGH SMS-seam fixes (C2-001/002/003/004), CSP (C2-009), booking table (C2-005), consent_record (C2-006), suppression model (C2-007/SPEC-006) are Phase-1 since they gate the launch conversion stack.

**Phase 2 (early)** — **F-013 review-request** `[SPEC-016]` (naturally gated: no completed jobs exist at launch to request reviews from); remaining towns; metal/flat/inspection; cornerstone content.

F-021 handoff checklist (v2) retained; restore drill is a Phase-0 acceptance item `[C2-006, SPEC-010]`.

---

## 7. Security, Privacy & Compliance — deltas

- **7.1 Operator dashboard (F-023)** — auth via **Cloudflare Access / OIDC + MFA**, not permanent basic-auth (Sanity SSO is enterprise-tier and not assumed) `[C2-026, SPEC-009]`. Dashboard reads go through a **server endpoint** (never direct client reads of the op-store) and write `operator_access_log` `[C2-027, SPEC-009]`. The emailed resend link lands on a **confirm page** and executes only as an authenticated **POST with a single-use short-TTL signed token** (no GET side effects) `[C2-026]`.
- **7.3 CSP** full policy `[C2-009]`; consent stored as an immutable snapshot incl. UA + source URL `[SPEC-008]`; consent version taken from the client payload and server-validated against currently-valid versions; a consent-text change forces a full rebuild + cache purge `[C2-006 / BRIDGE-009]`.
- **7.5 §771-B content lint** retained; **added to the §9 test matrix** (seed a banned phrase → build fails) `[C2-032]`.
- **Email CAN-SPAM** suppression + List-Unsubscribe `[SPEC-006]`; **suppression is `(channel, contact)`-keyed** `[C2-007, SPEC-006]`.
- **East-End gate** has a fail-safe default (any ambiguous ZIP/slug → `informational_only`) and its E2E is **MUST**, not SHOULD `[C2-020, SPEC-MED]`.

---

## 8. Error Handling & Observability — deltas

- **`message_log` state machine** captures every Twilio transition + `twilio_error_code`, re-enabling the hard-bounce → `failed_permanent` and failed-send resend paths that the v2 idempotency bug had killed `[C2-002]`.
- **Email deliverability metrics** + bounce/complaint handling + failover trigger to SMS-secondary alert `[C2-028]`.
- **Pricing-blob staleness alarm** (`blob_built_at` vs latest Sanity rev) `[C2-023]`; **GBP sync-health panel** `[C2-011]`.
- **Retention/purge** covers `webhook_events`, `message_log`, `review_request.customer_contact`, Sanity `job` PII `[C2-024, C2-031]`.
- Budget: anomaly-based auto-disable with operator override, sharded counter `[C2-012, C2-033]`.

---

## 9. Testing Strategy — new/updated rows

| Test | Feature | Source |
|------|---------|--------|
| slo-sweep does NOT re-send to `informational_only` / `turnstile_fallback` / opted-out leads | F-009 | C2-001 |
| Two concurrent same-phone submits → exactly 1 SMS (DO atomic claim) | F-009 | C2-003/004 |
| STOP arrives after allow-token issuance but before queue delivery → in-flight SMS aborted (send-time re-check) | F-009 | C3-BRIDGE-001 |
| Live same-phone submit + slo-sweep pickup in the same tick → exactly 1 SMS (both reserve through the DO) | F-009 | C3-GUARDIAN-001 |
| Walk-up direct booking → GA4 `client_id` originates from the real session (or event marked unattributed, never random) | F-008 | C3-BRIDGE-002 |
| Twilio status callbacks (queued→sent→delivered/failed) all recorded; hard bounce → `failed_permanent` + resend fires | F-009 | C2-002 |
| Direct Cal.com booking (no prior form) → `booking` + `lead` created, single server GA4 event with `client_id` | F-008 | C2-005/021/022 |
| STOP → `(sms,phone)` suppressed; review-sweep sends nothing; email unsubscribe → `(email,addr)` suppressed | F-009/F-013 | C2-007/SPEC-006 |
| Consent snapshot stored (version/text/ts/ip/ua/url) in append-only `consent_record`; survives lead purge | F-012 | C2-006/SPEC-008 |
| §771-B banned phrase seeded → build fails; financing/Cal.com embed error → phone-CTA fallback; LSA-live launch gate | F-019/F-011/F-018 | C2-032 |
| East-End: direct `/api/lead` + `/api/quote` for gated ZIP → `informational_only`, no price, no service SMS; islands absent (MUST) | F-002 | C2-019/020 |
| CSP present + Cal.com/Turnstile/GA4 all load under it | F-016 | C2-009 |
| CallRail tracked missed call → text-back lands on the real caller's handset | F-009/F-010 | C2-010 |
| WCAG 2.2: target size ≥24px, focus not obscured, step/success SR announcement, native-POST form fallback | F-016/F-012 | C2-016/SPEC-013 |
| Pricing coverage CI incl. non-stale effectiveYear; provisional combos render heavy-disclaimer range | F-014 | C2-014 |

---

## 10. Traceability Matrix — deltas
All v2 mappings retained. Changes: F-014 build phase → **Launch**; F-013 → **early Phase 2** (documented deviation). New data entities (`booking`, `consent_record`, `suppression`, `operator_access_log`) mapped under F-008/F-012/F-009/F-023. New integration rows: A2P 10DLC (F-009), CSP (F-016), GBP quartet (F-007), LSA re-plan (F-018). All 23 features + supporting entities trace to concrete data/functions/tests/phase.

---

## 11. Decisions Recorded

- **DEC-A** (Cycle 1) — word count soft.
- **DEC-B** (Cycle 1) — full versioned consent text (now `consent_record`, +UA/URL) `[SPEC-008]`.
- **DEC-C** (Cycle 2) — **script budget held at ≤4** (defer CallRail/GA4; no SOW deviation).
- **SPEC-016** (parallel Cycle 1) — **F-014 quote widget promoted to Launch; F-013 review-request early Phase 2** as an Adam-approved deviation from SOW §6 (F-013 is gated by completed jobs existing).
- **REV-040** — incremental builds deferred to Phase 3.

---

*Spec v3 folds in all approved Cycle-2 internal findings, the parallel Cycle-1 review's new items, and DEC-C/SPEC-016. The two Cycle-2 CRITICALs were fix-interaction regressions (slo-sweep suppression, MessageSid status callbacks), both confirmed closed by the focused Cycle-3 verification (BRIDGE + GUARDIAN). The three Cycle-3 residuals (send-time re-check symmetry, walk-up client_id, budget-cap wording) are applied above. **This spec is LOCKED and is the handoff input to `build-prompter`.***
