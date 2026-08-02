# Review Synthesis: Suffolk County Roofing Website — Cycle 2

**Spec Version Reviewed:** v2 (`suffolk-roofing-spec-v2.md`)
**Date:** 2026-08-02
**Reviewers (internal panel — 4 responses / 4 personas):**
- GUARDIAN — Claude (internal Cycle-2 agent) · MEDIUM confidence · READY WITH CAVEATS
- FOUNDATION — Claude (internal Cycle-2 agent) · HIGH · READY WITH CAVEATS
- ADVOCATE — Claude (internal Cycle-2 agent) · HIGH · READY WITH CAVEATS
- BRIDGE — Claude (internal Cycle-2 agent) · HIGH · READY WITH CAVEATS

> **External reviews pending.** Adam is running a few external-model reviews in parallel. Paste them back and I'll merge into a Cycle-2b synthesis (external convergence on any finding below raises its confidence further).

**Raw findings:** 59 → **Consolidated:** 33. **Unanimous verdict:** READY WITH CAVEATS (no NOT READY this cycle — down from a NOT READY in Cycle 1). Finding count fell (96→59 raw) and severity skewed lower, the healthy re-review trajectory.

**The headline:** the two Cycle-2 CRITICALs are **regressions introduced by v2's own Cycle-1 fixes** — they are interaction bugs between fixes, not pre-existing gaps. This is the payoff of re-reviewing after substantial CRITICAL changes.

**Severity counts (consolidated):** CRITICAL 2 · HIGH 12 · MEDIUM 14 · LOW 5

---

## CONSENSUS CRITICAL — regressions from v2 fixes, must fix before build

| ID | Title | Reviewers | Recommendation | Rec. | Decision |
|----|-------|-----------|----------------|------|----------|
| C2-001 | **`slo-sweep` re-sends SMS to leads that were deliberately NOT texted** — the null-safe sweep (REV-022) scans `speed_to_lead_sms_sent_at IS NULL` and retries, but East-End `informational_only` leads (REV-006) and no-SMS Turnstile-fallback leads (REV-027) are *permanently* NULL by design. The sweep will fire a prohibited service SMS into an unlicensed town on every tick, and re-arm the fail-closed bot path into a paid-SMS vector. | GUARDIAN, FOUNDATION, BRIDGE, ADVOCATE (4) | Add `lead.sms_suppressed_reason` (`turnstile_fallback\|east_end_gate\|opt_out\|null`); slo-sweep query becomes `WHERE sent_at IS NULL AND sms_claimed_at IS NULL AND sms_suppressed_reason IS NULL AND advertising_status='active'`, and **re-runs opt_out + per-phone + budget checks inside the retry transaction**. Suppressed leads get email/voice recovery only. | APPROVE | ⬜ |
| C2-002 | **Twilio `MessageSid` idempotency key discards all delivery-status callbacks** — one SMS emits many callbacks (queued→sent→delivered/failed) sharing one `MessageSid`; the `webhook_events` dedupe (REV-003) treats all but the first as no-ops, so `message_log` never advances, `twilio_error_code` is never captured, and the REV-024 hard-bounce + REV-033 resend paths become dead code. | GUARDIAN (1); consistent w/ FOUNDATION-011, BRIDGE idempotency notes | For status callbacks the idempotency key must include `MessageStatus` (`MessageSid:MessageStatus`) or use a monotonic last-write-wins state-machine update on `message_log`. Keep `MessageSid`-only dedupe for **inbound** STOP/START messages. | APPROVE | ⬜ |

---

## HIGH Findings

| ID | Title | Reviewers | Dim | Recommendation | Rec. | Decision |
|----|-------|-----------|-----|----------------|------|----------|
| C2-003 | Per-phone throttle "same transaction as enqueue" is a cross-store TOCTOU race (D1 + Durable Object + Queue can't share a txn) → concurrent same-phone submits both send | GUARDIAN, BRIDGE (2) | Security | Make the **Durable Object the single serialization point**: atomically evaluate per-phone window + opt_out + budget reservation and return an allow-token used as the Queue dedupe key; the `lead` table is evidence, never the concurrency gate. Add a 2-concurrent-submit test. | APPROVE | ⬜ |
| C2-004 | `slo-sweep` and the async send-queue **double-fire** the speed-to-lead SMS (sweep ignores `message_log`, can't see an in-flight send) | BRIDGE, GUARDIAN, FOUNDATION | Integration | Add an atomic **claim** (`UPDATE lead SET sms_claimed_at=now WHERE id=? AND sms_claimed_at IS NULL`) before either sender sends; only the winner sends; SLO window > max queue+Twilio latency. | APPROVE | ⬜ |
| C2-005 | **No `booking` table** — direct Cal.com bookings without a `leadId` (the common walk-up path) are orphaned; SOW §7 "books end-to-end + GA4 event" breaks for form-less bookings | FOUNDATION, BRIDGE (2) | Data | Add `booking(id, lead_id NULL FK, calcom_booking_uid UNIQUE, slot_start, name, phone, email, status, created_at)`; on webhook, **upsert a booking and create a lead** when `leadId` absent (`source=booking_direct`). | APPROVE | ⬜ |
| C2-006 | **Consent-evidence purge collision** — consent columns live on the `lead` row, but the 24-mo PII purge (REV-013) scrubs/deletes that row while claiming consent is kept for the 4-yr TCPA window; also consent version can mismatch cached static page vs server, and opt_out has ~24h backup RPO (a restore can resurrect opted-out numbers) | FOUNDATION, GUARDIAN, BRIDGE (3) | Data/Security | Move consent to an append-only `consent_record` table (4-yr retention, independent of the 24-mo lead purge); store `consent_version` **from the client payload** (what was shown) + server-validate against valid versions; force a rebuild+cache-purge on consent-text change; give `opt_out`/consent near-zero RPO durability (write-through / PITR). | APPROVE | ⬜ |
| C2-007 | **`opt_out` PK (`phone`) contradicts the `category` column** — can't store per-category opt-outs; STOP handler doesn't specify a category; and **carrier-level STOP suppresses ALL traffic on a single sender number anyway**, so category granularity is unhonorable as modeled | FOUNDATION×2 findings, BRIDGE (3) | Data | Simplest: **drop category granularity — treat any STOP as all-suppress** to match carrier reality (recommended). If per-category is truly needed, use separate Twilio Messaging Services per category. Either way, STOP writes `category='all'`; add a "STOP → review-sweep sends nothing" test. | APPROVE (drop category) | ⬜ |
| C2-008 | **A2P 10DLC carrier registration is an unaddressed Phase-0 blocker** — unregistered US long-code SMS is silently filtered; Twilio returns "sent" while messages never arrive; registration has days–weeks lead time against the hard October deadline | GUARDIAN (1) | Integration | Add A2P 10DLC Brand+Campaign registration (or Toll-Free verification) as a **Phase-0 gate** with lead time; monitor error 30007 (filtered) before trusting delivery. | APPROVE | ⬜ |
| C2-009 | **CSP as written breaks Cal.com/Acorn iframes, Turnstile, and GA4** — REV-007 CSP omits `frame-src`, `connect-src`, and the Turnstile host → core conversion embeds blocked, or CSP gets loosened to uselessness | GUARDIAN (1) | Integration | Specify the full policy: `frame-src` cal.com + financing vendor + `challenges.cloudflare.com`; `connect-src` GA4 + CallRail + own `/api`; prefer nonce-based `script-src`; validate in report-only before enforce. | APPROVE | ⬜ |
| C2-010 | **CallRail→Twilio forwarding may strip the caller's real number** → missed-call text-back goes to a CallRail number, not the customer; the REV-004 fix silently fails | BRIDGE (1) | Integration | Make original-caller-ID (ANI) passthrough a **Phase-0 verification gate**; if unavailable, drive text-back from CallRail's call webhook payload instead of Twilio's. Add "tracked missed call → SMS lands on real caller" test. | APPROVE | ⬜ |
| C2-011 | **Google Business Profile integration lacks the auth/rate-limit/error/staleness quartet** the other services have — stale/failed sync leaves old `externalReviewId`s emitting `AggregateRating` that Google no longer shows (SOW §8 "real, auditable feed" + FTC risk); ToS/attribution for republishing + aggregate unconfirmed | BRIDGE, GUARDIAN (2) | Integration | Specify OAuth refresh + failure alerting, GBP quota/backoff, deletion/edit reconciliation, and a **staleness gate that suppresses Review JSON-LD when `lastSyncedAt` > N days**; confirm GBP API display/aggregate ToS. | APPROVE | ⬜ |
| C2-012 | **Global daily SMS budget cap = self-inflicted outage during storm surge** — a flat cap trips at exactly the highest-value nor'easter window and silently disables the flagship feature | GUARDIAN (1) | Business | Base auto-disable on **anomaly/rate detection** (per-minute spike vs baseline), size the ceiling with storm-surge headroom, add a fast operator override, and don't trip on spend spread across distinct Turnstile-verified phones. | APPROVE | ⬜ |
| C2-013 | **Script budget widened to 4–5, contradicting the SOW's ≤3–4 hard cap** (REV-015 counted Turnstile honestly but raised the ceiling) — hurts the exact cellular-on-a-roof audience | ADVOCATE (1) | Performance | Hold CI budget at **4**: defer one script off the critical path (CallRail→first interaction, or GA4→idle) so total ≤4. If 5 is genuinely needed, record a **formal SOW deviation** with an LCP/TBT ceiling — don't leave spec and SOW numerically contradictory. **(Decision — see DEC-C.)** | DECIDE | ⬜ |
| C2-014 | **Pricing coverage guarantee can be voided at runtime** — the build-time Cartesian coverage check (REV-011) doesn't include `effectiveYear`, but the runtime staleness exclusion (REV-039) drops old-year rows → a combo the CI certified "covered" returns the fallback in production; `N` is undefined; `provisional` flag is referenced but not defined on the schema; §2.4 (provisional range) contradicts §3.2 (book-CTA) for the same state | FOUNDATION×2, BRIDGE (3) | Data | Define `N`; make the coverage check assert a **non-stale** covering row (same predicate as runtime); add `townPricing.provisional` to the schema + API `disclosure.provisional`; reconcile §2.4 vs §3.2 to one customer-facing outcome. | APPROVE | ⬜ |

---

## MEDIUM Findings

| ID | Title | Reviewers | Dim | Recommendation | Rec. | Decision |
|----|-------|-----------|-----|----------------|------|----------|
| C2-015 | **Silent-degradation UX** — 202/no-SMS and Turnstile-blocked paths change what the user receives without changing the confirmation copy → false "we'll text you" to distressed visitors | ADVOCATE, BRIDGE (2) | UX | `/api/lead` returns an explicit `channel` field; client branches copy: 201→"texting you now"; 202/no-SMS→"we'll call you at [tel:]". | APPROVE | ⬜ |
| C2-016 | WCAG 2.2-specific criteria unaddressed despite F-016 claim — Target Size 2.5.8 (≥24px), Focus Appearance 2.4.11/2.4.13, step-change + submit-success SR announcements | ADVOCATE (1) | UX | Add explicit acceptance checks + axe/manual assertions for these 2.2 criteria; announce step changes and success via `aria-live`. | APPROVE | ⬜ |
| C2-017 | QuoteWidget has no **network-error** state (only loading/success/unavailable) → infinite skeleton on flaky cellular | ADVOCATE (1) | UX | Add a 4th error state: inline "couldn't load — call [tel:]" + retry + fetch timeout, `aria-live` announced. | APPROVE | ⬜ |
| C2-018 | Out-of-area ZIP returns 400 with no friendly client rendering → a near-market homeowner bounces | ADVOCATE, BRIDGE | UX | Distinguish "out-of-service-area" from "malformed" client-side → warm Suffolk-County hand-off + phone CTA, without the server confirming which combos are priced. | APPROVE | ⬜ |
| C2-019 | East-End `/api/quote` still returns a **numeric price** ("informational estimate") in unlicensed towns — a quoted price is arguably the advertising the gate exists to prevent; and the informational block offers no emergency phone path (pure dead-end) | FOUNDATION, ADVOCATE (2) | Business/Legal | For `advertisingAllowed=false`, return the **no-price** informational payload; keep an emergency phone + honest "not yet licensed here" framing (legal-reviewed against §771-B/HI-license). | APPROVE | ⬜ |
| C2-020 | **ZIP↔town resolution ambiguous** for the East-End gate — Suffolk ZIPs span towns; a `townSlug` and a ZIP can disagree → gate misclassifies | BRIDGE (1) | Data | Deterministic ZIP→town(s)→`advertisingAllowed` table + fail-safe conflict rule (any gated match → `informational_only`); test conflicting ZIP-vs-slug. | APPROVE | ⬜ |
| C2-021 | Server-side GA4 booking event lacks `client_id`/Measurement-Protocol design → unattributed conversion or double-count | BRIDGE (1) | Integration | Capture GA4 `client_id` into Cal.com metadata; fire MP with `api_secret`+`client_id`; exactly one server event, no client booking event. | APPROVE | ⬜ |
| C2-022 | Cal.com `leadId` metadata is client-controlled (spoofable) and unvalidated | GUARDIAN, BRIDGE | Integration | Validate `leadId` exists + cross-check phone/email before linking; mismatches → treat as unlinked/organic. | APPROVE | ⬜ |
| C2-023 | **Pricing-blob rebuild webhook undefined** — §1.2 says the blob rematerializes "on each Sanity publish webhook" but no such endpoint/signature/idempotency/health exists → stale prices served silently | BRIDGE (1) | Operations | Add `POST /api/webhooks/sanity-publish` (verify + dedupe → rebuild); store `blob_built_at`; alarm on blob-age/rev divergence. | APPROVE | ⬜ |
| C2-024 | **`webhook_events` + `message_log` have no retention** → unbounded growth degrades idempotency lookups + backups | GUARDIAN, BRIDGE (2) | Operations | Prune `webhook_events` past the provider retry window (30–90d); archive/rollup terminal `message_log` per the TCPA window; wire into `pii-purge`. | APPROVE | ⬜ |
| C2-025 | Missing indexes: `message_log(provider_message_id)` (status callbacks), `review_request(status, requested_at)` (sweep); SLO index should be partial | FOUNDATION (1) | Data | Add `UNIQUE message_log(provider_message_id)`, `review_request(status, requested_at)`, partial `lead(created_at) WHERE speed_to_lead_sms_sent_at IS NULL`. | APPROVE | ⬜ |
| C2-026 | Operator dashboard auth may fall to permanent basic-auth (Sanity SSO is enterprise-tier); emailed one-click resend link is CSRF/prefetch-prone | GUARDIAN (1) | Security | Confirm SSO tier or use Cloudflare Access/OIDC + MFA; make resend a POST behind an authed session with a single-use signed token (email → confirm page, never execute on click). | APPROVE | ⬜ |
| C2-027 | `operator_access_log` (PII-read audit) and `lead.status` enum are referenced but never schematized/enumerated | FOUNDATION×2 | Data | Define `operator_access_log(id, operator_id, action, lead_id, accessed_at, ip)`; enumerate `lead.status` with a transition map + CHECK. | APPROVE | ⬜ |
| C2-028 | Email (primary alert channel) has no own-failure/bounce handling or failover trigger to SMS-secondary → a Postmark outage blinds the operator | BRIDGE (1) | Operations | Capture email provider id + bounce/complaint webhooks; explicit failover (email-fail/bounce → SMS secondary alert); add deliverability metrics. | APPROVE | ⬜ |

---

## LOW Findings

| ID | Title | Reviewers | Rec. | Decision |
|----|-------|-----------|------|----------|
| C2-029 | `review_request.responded` is unfillable — no join path from GBP-imported reviews back to the request | FOUNDATION | APPROVE — scope dashboard to asked/sent/failed; drop `responded` (or clearly-heuristic match) | ⬜ |
| C2-030 | Required `historicOverlay` gate can block a town that legitimately has no overlay | FOUNDATION | APPROVE — model as `{applies: bool, details: string when applies}` | ⬜ |
| C2-031 | Customer PII in `review_request.customer_contact` + Sanity `job` is outside the 24-mo purge scope | FOUNDATION | APPROVE — extend purge/anonymization to both | ⬜ |
| C2-032 | §771-B lint / LSA-live / financing-fallback have no rows in the §9 test matrix; accessibility-statement page location unspecified; no-JS LeadForm fallback; facade loading indicator; emergency-page UX under-specified; TCPA checkbox default-unchecked not stated | GUARDIAN, ADVOCATE | APPROVE — add the test rows + the small UX/spec clarifications | ⬜ |
| C2-033 | Single global-budget Durable Object is a serialization bottleneck/SPOF on the hot path under storm load | GUARDIAN | APPROVE — shard the counter or use a cheap cached kill-switch flag | ⬜ |

---

## Decision needed

| ID | Item | Options |
|----|------|---------|
| **DEC-C** | **Script budget: hold ≤4 (SOW-faithful) or formally raise to 5?** | (1) **Hold at 4** (recommended) — defer CallRail/GA4 off the critical path; keeps the SOW acceptance test honest and protects mobile LCP. (2) Record a SOW deviation approving 5 with a documented LCP/TBT ceiling. |

---

## Build Readiness

| Reviewer | Readiness | Confidence | Top risk |
|----------|-----------|------------|----------|
| GUARDIAN | READY WITH CAVEATS | MEDIUM | slo-sweep + MessageSid regressions; A2P 10DLC / CSP externals |
| FOUNDATION | READY WITH CAVEATS | HIGH | SMS/TCPA fix-interactions; consent purge; no booking table |
| ADVOCATE | READY WITH CAVEATS | HIGH | Silent degradation false-promises; script budget vs SOW; WCAG 2.2 |
| BRIDGE | READY WITH CAVEATS | HIGH | Cross-store atomicity; orphan bookings; GBP quartet |

**Consensus:** unanimous **READY WITH CAVEATS** (improved from Cycle 1's split with one NOT READY). The remaining CRITICALs are two well-understood regressions with SMALL fixes.

## Dimension Heatmap (consolidated)

| Dimension | CRIT | HIGH | MED | LOW | Total |
|-----------|------|------|-----|-----|-------|
| Integration | 1 | 5 | 3 | 0 | 9 |
| Data | 0 | 3 | 4 | 2 | 9 |
| Business Logic | 1 | 1 | 1 | 0 | 3 |
| Security | 0 | 1 | 1 | 1 | 3 |
| UX | 0 | 1 | 3 | 1 | 5 |
| Operations | 0 | 0 | 3 | 0 | 3 |
| Performance | 0 | 1 | 0 | 1 | 2 |

Risk migrated from Cycle-1's Security concentration to **Integration + Data** — i.e. the *seams between the new fixes and stores*, precisely what a re-review after heavy change is meant to catch.

## Commendations (v2 held up)

Every reviewer confirmed the Cycle-1 fixes are real and sound in isolation: integer cents + `onDelete:restrict` + immutable `_id` key; `webhook_events` dedupe + invert-to-pending + `UNIQUE(job_id)`; server-side East-End gate; 400-not-422 oracle avoidance; persist-then-201 + async queue; email-primary alerting; enumerated field-path publish gate; portable-text CSP+sanitize+CI. The Cycle-2 findings are about how these **interact**, not whether they were the right fixes.

---

## Recommended next step

Two CRITICAL regressions + 12 HIGH → produce **spec v3** folding these in, then a **light Cycle-3 verification** focused only on the SMS state-machine seam (slo-sweep/claim/opt_out/budget atomicity) and the booking/GA4 path — the rest are contained, low-interaction fixes. Given the trajectory (2 CRITICAL, all with SMALL fixes, unanimous READY-WITH-CAVEATS), **v3 is likely lockable** after that focused pass.

*Merge Adam's external reviews first if you want them in this cycle — paste them and I'll produce Cycle-2b before v3.*
