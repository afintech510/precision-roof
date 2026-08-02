# Review Synthesis: Suffolk County Roofing Website — Cycle 1

**Spec Version Reviewed:** v1 (`suffolk-roofing-spec-v1.md`)
**Date:** 2026-08-02
**Reviewers (6 responses / 4 personas / 5 models):**
- GUARDIAN — Muse Spark 1.1 (Meta AI)
- GUARDIAN — Claude Sonnet 5
- FOUNDATION — Claude 3.5 Sonnet
- FOUNDATION — Grok 4.5 (xAI)
- ADVOCATE — Claude 3.5 Sonnet
- BRIDGE — Gemini

**Raw findings:** 96 → **Consolidated:** 44 (high overlap = high confidence). One reviewer (GUARDIAN/Muse) rated the spec **NOT READY**; the other five rated **READY WITH CAVEATS** — and the NOT-READY verdict is driven entirely by the consensus CRITICAL cluster below, so clearing the CRITICALs converges everyone to READY WITH CAVEATS.

**Severity counts (consolidated):** CRITICAL 7 · HIGH 14 · MEDIUM 15 · LOW 8

---

## How to use this document

Mark each finding's **Decision** column: `APPROVE` (fold into spec v2), `REJECT` (with reason), or `DEFER` (backlog). I've pre-filled a **Rec.** column with my recommendation as synthesis lead. Consensus findings (2+ reviewers) are flagged with reviewer count — these are the highest-confidence items.

---

## CONSENSUS CRITICAL — flagged by multiple reviewers, must fix before build

| ID | Title | Reviewers | Dim | Recommendation | Rec. | Decision |
|----|-------|-----------|-----|----------------|------|----------|
| REV-001 | **SMS toll-fraud / harassment via public endpoints — per-IP limit + captcha is bypassable by IP rotation; no per-phone throttle** | GUARDIAN×2 (both CRITICAL) | Security | Add a **per-phone** limiter independent of IP (≤1 speed-to-lead SMS per normalized phone / 24h; check `lead` before enqueue); enforce **server-side Turnstile verify** (secret, score ≥0.6, fail-closed on network error); use a **shared rate-limit store** (Cloudflare Durable Object / D1 counter, `cf-connecting-ip`), not per-isolate memory; add a **global daily SMS budget cap** with auto-disable + operator alert. | APPROVE | ⬜ |
| REV-002 | **TCPA consent + STOP handling incomplete** — `tcpa_consent` bool only (no text/timestamp/IP); STOP keyword set partial; E.164 normalization not enforced across write/read sites | GUARDIAN×2 (both CRITICAL), BRIDGE | Security | Add `consent_text`, `consent_timestamp`, `consent_ip`, `consent_version` columns. Full carrier STOP set (`STOP/STOPALL/UNSUBSCRIBE/CANCEL/END/QUIT`, case-insensitive) + START opt-back. Single shared **E.164 normalizer** (Zod transform) at intake, opt_out write, and opt_out lookup, ideally a DB CHECK constraint; add an E2E test with a non-canonical phone format. | APPROVE | ⬜ |
| REV-003 | **Webhook non-idempotency → duplicate SMS / duplicate review asks / double GA4 bookings; review-request sends before persisting** | GUARDIAN(Muse), BRIDGE (both CRITICAL), FOUNDATION×2 | Integration | Add a `webhook_events` (provider+event_id PK) dedupe table; return 200 on replays; enforce Twilio timestamp tolerance (5 min). **Invert review-request**: webhook inserts `review_request(status=pending)` only; the cron/queue does the send and flips to `sent` — never send before persisting. **Decouple `/api/lead`** dispatch: persist → return 201/202 → send SMS via async task (Cloudflare Queue), so a Twilio blip can't drop the lead. | APPROVE | ⬜ |
| REV-004 | **Voice path is architecturally fragile** — missed-call detection defeated by owner-carrier voicemail (Twilio marks "completed"); CallRail DNI may route straight to cell, bypassing Twilio entirely → F-009 SLA silently never fires | BRIDGE (CRITICAL + HIGH); single-reviewer but concrete mechanism | Integration | Route **all** CallRail destination numbers through the Twilio number (Twilio is the trunk). Use Twilio **Answering Machine Detection** or a "press 1 to accept" whisper; unaccepted → Twilio voicemail so the missed-call status deterministically fires. Verify end-to-end before marketing any response-time promise (SOW §12). | APPROVE | ⬜ |
| REV-005 | **No backup / DR / retention for the operational store holding TCPA consent evidence + leads + opt-outs** | FOUNDATION×2, GUARDIAN×2 (all HIGH → consensus-bumped CRITICAL) | Operations | Nightly automated backup (D1 export→R2 / Supabase PITR), 30-day+ retention aligned to TCPA statute; documented + tested restore runbook (F-021); health-check that most-recent backup <24h. Opt-out/consent records are legal evidence — losing them loses the TCPA defense. | APPROVE | ⬜ |
| REV-006 | **East-End (unlicensed-jurisdiction) gate only suppresses a CTA component — not the LeadForm / QuoteWidget / BookingEmbed islands, and not server-side** | GUARDIAN×2, BRIDGE, FOUNDATION(Grok) (4 reviewers, HIGH → consensus-bumped CRITICAL) | Security / Legal | Enforce `advertisingAllowed=false` **server-side** in `/api/lead` and `/api/quote` (resolve town by ZIP/slug → reject or mark `informational_only`, no service SMS) **and** hide/replace LeadForm, QuoteWidget, BookingEmbed on those pages. Extend E2E to assert all three islands are absent, not just the ServiceGrid CTA. Prevents generating a lead/booking record as evidence of unlicensed solicitation. | APPROVE | ⬜ |
| REV-007 | **Portable-text XSS + no CSP** — `bodyContent` rendered without sanitization; Studio compromise or pasted HTML → stored XSS reaching the booking/lead islands | FOUNDATION(Sonnet) CRITICAL, GUARDIAN(Muse) MEDIUM | Security | Render portable text through an allowlist serializer (strong/em/link/list only), block raw-HTML block type in schema, add a CSP header (`script-src 'self' cal.com callrail.com googletagmanager.com; object-src 'none'`). Lower real-world likelihood (needs author access) but cheap and high-value. | APPROVE | ⬜ |

---

## HIGH Findings

| ID | Title | Reviewers | Dim | Recommendation | Rec. | Decision |
|----|-------|-----------|-----|----------------|------|----------|
| REV-008 | Operational store missing indexes + unique constraints (`townPricing` composite PK, `review_request(job_id)` UNIQUE, `opt_out(phone)`, `lead(created_at,phone,status)`, `message_log(lead_id)`) | GUARDIAN×2, FOUNDATION×2 (4) | Data | Add the exact `CREATE INDEX`/UNIQUE statements for both D1 and Supabase paths; the `review_request(job_id)` UNIQUE is also the DB-level dedupe backing REV-003. | APPROVE | ⬜ |
| REV-009 | Money stored as unconstrained `number` (float) not integer cents | FOUNDATION×2 | Data | Use integer cents (`lowCents`/`highCents`, `feeCents`) in Sanity + op-store; validate positive ints and `low ≤ high`; UI formats to dollars. | APPROVE | ⬜ |
| REV-010 | Referential integrity: no FK `townPricing→service`; no stable immutable `job._id` for `review_request`; broken-ref handling for `taggedJobs`/`townReviews` | FOUNDATION×2 | Data | Sanity validation that refs resolve to active docs; store Sanity `_id` as immutable UNIQUE key on `review_request`; weak-refs + graceful empty states for jobs/reviews. | APPROVE | ⬜ |
| REV-011 | Quote widget: no guarantee every launch town×service×band has a `townPricing` row → 422 fallback hit in production | FOUNDATION×2, ADVOCATE | Data/UX | Phase-0/1 CI check enumerating the Cartesian product; fail build on any missing combo; seed provisional rows (flagged) so the widget returns a range with stronger disclaimer. | APPROVE | ⬜ |
| REV-012 | Input validation gaps: `/api/lead` & `/api/quote` accept arbitrary ZIP/townSlug/service; 422 acts as a pricing-existence oracle; no explicit E.164/ZIP Zod schema; quote endpoint scrapeable | GUARDIAN(Muse), BRIDGE, FOUNDATION×2 | Security | Publish Zod schemas (`zip` 5-digit + Suffolk allowlist, `service`/`townSlug` as enums, `tcpaConsent` literal true); return **400** (not 422) for invalid town to kill the oracle; add Turnstile to `/api/quote` to stop pricing scraping. | APPROVE | ⬜ |
| REV-013 | PII retention/deletion/encryption + operator-dashboard auth: lead store holds name/phone/email/consent indefinitely; basic-auth option for a dashboard exposing it | GUARDIAN×2, FOUNDATION×2 | Security | Retention policy (e.g. 24 mo) + scheduled purge/anonymize; encryption-at-rest note; access/audit log; default dashboard to **Sanity SSO** (basic-auth only with IP allowlist as stopgap). | APPROVE | ⬜ |
| REV-014 | Lead form UX resilience: no double-submit protection, loading/success/error states, or network-failure handling; SMS-outage surfaces as dead-end | ADVOCATE×2, FOUNDATION(Sonnet), BRIDGE | UX | Disable button + spinner on submit; client-generated idempotency UUID in payload; inline network-error with fallback phone; on Twilio outage return **202** with "received, we'll call you" + flag lead for manual follow-up. | APPROVE | ⬜ |
| REV-015 | Third-party scripts (Cal.com, CallRail, GA4, financing, **+captcha uncounted**) will crush mobile LCP for the emergency audience | ADVOCATE, GUARDIAN(Sonnet5) | Performance | Facade/IntersectionObserver-defer Cal.com + financing; `defer`/interaction-load CallRail + captcha; count captcha in the F-020 budget (4–5 not 3–4); enforce in CI perf gate. | APPROVE | ⬜ |
| REV-016 | WCAG 2.2 AA gaps in dynamic islands: QuoteWidget/LeadForm lack ARIA live regions; focus-not-obscured (2.4.11) & redundant-entry (3.3.7) not handled; multi-step form loses state on back | ADVOCATE×2, GUARDIAN(Muse) | UX | `aria-live="polite"` on quote/error output; `scroll-padding-top` so sticky header doesn't obscure focus; persist 3-step inputs in `sessionStorage`; add these to the manual a11y checklist (axe alone misses 2.2 criteria). | APPROVE | ⬜ |
| REV-017 | Cal.com lead-matching is non-deterministic (phone/email match fails on mismatched contact) → broken funnel analytics | BRIDGE | Integration | Pass the generated `leadId` into the Cal.com embed as metadata/hidden field; webhook updates by `leadId`, not fuzzy match. | APPROVE | ⬜ |
| REV-018 | Sticky call button depends on CallRail DNI script → broken/missing if script blocked | ADVOCATE | UX | Render canonical `tel:` in static HTML; let CallRail swap text/href after load. Trivial, high-impact for emergency users. | APPROVE | ⬜ |
| REV-019 | `verifiedFeed` is an author-toggled boolean with no real feed behind it → violates SOW §8 "real, auditable feed" for `AggregateRating` | GUARDIAN(Sonnet5) | Security/Data | Import reviews via GBP API (store external review ID + last-synced); gate JSON-LD emission on presence of the external ID, not a manual bool. | APPROVE | ⬜ |
| REV-020 | `job` schema missing customer contact fields; no first-transition-only guard → review-request can't send, or double-fires on status flip-flop | FOUNDATION×2 | Data | Add `customerName/Phone/Email` (required when `status=completed`); act only on first transition to completed via a `statusHistory`/transition log. Blocks F-013. | APPROVE | ⬜ |
| REV-021 | Migration "rollback = re-run prior migration" is false for destructive/transform changes | FOUNDATION(Sonnet), GUARDIAN(Sonnet5) | Operations | Classify each migration (additive/rename/destructive); destructive requires a pre-migration dataset export, not a reverse-run claim. | APPROVE | ⬜ |

---

## MEDIUM Findings

| ID | Title | Reviewers | Dim | Recommendation | Rec. | Decision |
|----|-------|-----------|-----|----------------|------|----------|
| REV-022 | Speed-to-lead SLO: no stated trigger mechanism; crash-before-send leaves `sent_at=NULL` with no row to alert on; no metrics/dashboard; no user-facing recovery | GUARDIAN(Sonnet5), FOUNDATION(Grok), ADVOCATE | Operations | Tight-interval cron (1–2 min) scanning `sent_at IS NULL` past SLO regardless of `message_log` row → retry + alert; emit latency/failure metrics + one dashboard panel; on breach, email the user "we have your info, we'll call." | APPROVE | ⬜ |
| REV-023 | Verify Cal.com **free-tier webhook** support as a Phase-0 gate (booking→GA4 is on the SOW §7 critical path) | GUARDIAN×2 | Integration | Confirm in Phase 0; if webhooks are paid-only, budget upgrade or an API-polling fallback. | APPROVE | ⬜ |
| REV-024 | Twilio retry loops on hard bounces (e.g. landline) → carrier spam flags + burned funds | BRIDGE | Operations | Inspect Twilio error code; retry only transient (30001-class); flag hard bounces `failed_permanent`, no retry, alert. | APPROVE | ⬜ |
| REV-025 | Financing iframe (and Cal.com embed) lack `onError`/timeout fallback → blank-box hang, not a graceful "call us" | ADVOCATE×2, GUARDIAN(Muse) | Integration | 3–5s load timeout + `onError` → hide iframe, show phone CTA; never pass PII in iframe src. | APPROVE | ⬜ |
| REV-026 | STOP handling is legally correct but experientially cold for a leaking-roof customer | ADVOCATE | UX | Send one final TCPA-permitted confirmation SMS with the emergency phone number, bypassing the opt-out suppression for that single message. | APPROVE | ⬜ |
| REV-027 | Turnstile has no accessible/degraded recovery if the script is blocked or slow | ADVOCATE | UX/Security | Fallback to honeypot + simple challenge after load timeout. **⚠ Tension with REV-001's fail-closed stance** — resolve as: fail-closed for the SMS trigger, but offer a no-SMS "we'll email/call you" submit path so blocked-script humans aren't locked out. | APPROVE (reconciled) | ⬜ |
| REV-028 | D1 (SQLite) has no native `timestamptz`; schema demands it → query/ORM failures | BRIDGE | Data | Store integer Unix epoch (ms) or ISO-8601 TEXT; handle TZ in app layer. (Moot if Supabase chosen.) | APPROVE | ⬜ |
| REV-029 | §771-B "banned-phrase" content lint has no concrete pattern list | GUARDIAN(Muse) | Traceability | Ship `/scripts/content-lint.ts` with regexes (`waive.*deductible`, `no.*deposit.*required`, `adjust.*claim`, …) scanning Sanity body + siteSettings at build; fail on match. | APPROVE | ⬜ |
| REV-030 | Quote legal disclosure thin (NY GBL §349) + transparency wedge buried in footer | GUARDIAN(Muse), ADVOCATE | Business/UX | QuoteWidget shows license badge inline + effectiveYear + factors + non-binding text; surface a compact license/verify badge in header/sticky nav and a "Trust & Compliance" block near the top of Contact. | APPROVE | ⬜ |
| REV-031 | `/api/quote` reads live content API each request; cache TTL/invalidation unspecified → stampede or stale prices | FOUNDATION(Grok) | Performance | Materialize a compact pricing JSON/KV blob at build + on each Sanity publish webhook; serve quote from edge cache; add cache-hit metric. | APPROVE | ⬜ |
| REV-032 | Alert channel SPOF — a Twilio-outage alert sent via Twilio never arrives | GUARDIAN(Sonnet5) | Operations | Route operator alerts primarily via Postmark/SES email, independent of Twilio. | APPROVE | ⬜ |
| REV-033 | Failed-send has no compensating action / manual resend path beyond "alert operator" | FOUNDATION(Grok) | Integration | After max retries: high-priority email with a one-click resend deep link; dedicated failed-lead queue view; documented retry schedule (1/5/15 min). | APPROVE | ⬜ |
| REV-034 | `/resources/` listing/pagination page not detailed (F-022) | FOUNDATION(Sonnet) | Traceability | Spec `resources/index.astro` query (posts by `publishedAt` desc, paginated) + `PostList` component. | APPROVE | ⬜ |
| REV-035 | Publish-gate doesn't enumerate every SOW §4 sub-field/cardinality (partial `buildingDept` can still publish) | FOUNDATION(Grok) | Data | Document-level validation walking every required path + cardinality (`namedStreets≥3`, `faqs 10–13`, `permit.sourceUrl` matches `.gov`/eCode360), mirrored in CI; surface the exact missing path. | APPROVE | ⬜ |
| REV-036 | Cost/TCPA observability: no daily-spend alert, opt-out-rate, or immutable consent audit | GUARDIAN(Muse) | Operations | Metrics (`sms_cost_daily`, `opt_out_rate`, `consent_stored_total`); alert on spend > threshold; append-only consent audit. (Overlaps REV-022.) | APPROVE | ⬜ |

---

## LOW Findings

| ID | Title | Reviewers | Dim | Recommendation | Rec. | Decision |
|----|-------|-----------|-----|----------------|------|----------|
| REV-037 | Mint **F-023** for the operator review/lead-status dashboard (currently untraceable) | FOUNDATION(Grok) | Traceability | Add F-023 + acceptance criteria, or explicitly scope it as a minimal read-only view. | APPROVE | ⬜ |
| REV-038 | `job.status`/`lead.status`/`filingMethod`/`homeSizeBand` are free-text, not enums | FOUNDATION(Grok) | Data | Sanity `options.list` + SQL CHECK constraints; unit-test rejection of out-of-set values. | APPROVE | ⬜ |
| REV-039 | `townPricing.effectiveYear` staleness not checked → stale quotes surface indefinitely | FOUNDATION(Sonnet), GUARDIAN(Sonnet5) | Data | Build/runtime staleness check flags/excludes records older than N years. | APPROVE | ⬜ |
| REV-040 | Full SSG rebuild per content edit + O(N²) anchor-ratio check won't scale to Phase-2/3 page counts | GUARDIAN(Muse), FOUNDATION(Grok) | Performance | Incremental content cache / changed-page rebuild; cache link graph, nightly full recompute. Fine at launch; note for scale. | DEFER | ⬜ |
| REV-041 | `/internal/send-sms` auth boundary undefined | BRIDGE | Security | Use a direct module import, not an exposed HTTP route; shared-secret if a worker boundary is required. | APPROVE | ⬜ |
| REV-042 | F-021 handoff has no testable acceptance criterion ("manual review") | GUARDIAN(Sonnet5) | Traceability | Concrete checklist: diagram current, `.env.example` complete, "add a town" runbook dry-run by a non-Adam, deploy/rollback exercised once, secrets-rotation documented. | APPROVE | ⬜ |
| REV-043 | CallRail DNI swap failures silently absorbed → invisible attribution decay | GUARDIAN(Sonnet5) | Integration | Fire a GA4 beacon when the DNI swap fails, so degradation is visible. | APPROVE | ⬜ |
| REV-044 | `townReviews` publish-gate: confirm it's a **soft** warning (spec already marks it optional) so a 0-review launch town isn't unpublishable | BRIDGE | Traceability | Clarify in schema notes; already intended — verify implementation matches. | APPROVE | ⬜ |

---

## Decision needed (reviewer disagrees with the SOW, not a straight fix)

| ID | Item | Tension | Options |
|----|------|---------|---------|
| DEC-A | **Enforce 2,500–4,000 word count as a hard publish gate?** | FOUNDATION(Sonnet) wants a hard word-count block; the **SOW §4 explicitly says word count is a proxy and density is the real bar**, and spec v1 deliberately made it a soft warning. | (1) Keep soft (SOW-faithful, **recommended**) — pair with REV-035's field-enumeration which is the real depth guarantee. (2) Add a hard lower bound (e.g. ≥2,000) as a floor. |
| DEC-B | **Store full consent text or a hash?** | FOUNDATION(Grok) suggests storing only a hash of consent text to reduce PII; GUARDIAN wants full text for audit defense. | Recommend **full versioned consent text** (the audit-defense value outweighs the minimal PII of your own disclosure language) — pairs with REV-002/REV-013. |

---

## Build Readiness Assessment

| Reviewer | Readiness | Confidence | Top risk |
|----------|-----------|------------|----------|
| GUARDIAN (Muse Spark) | **NOT READY** | HIGH | SMS toll-fraud + TCPA via weak rate limiting |
| GUARDIAN (Sonnet 5) | READY WITH CAVEATS | HIGH | Per-phone throttling absent |
| FOUNDATION (3.5 Sonnet) | READY WITH CAVEATS | HIGH | Missing customer-contact fields block F-013 |
| FOUNDATION (Grok 4.5) | READY WITH CAVEATS | HIGH | Money/pricing precision + coverage |
| ADVOCATE (3.5 Sonnet) | READY WITH CAVEATS | HIGH | Emergency mobile users hitting dead-ends |
| BRIDGE (Gemini) | READY WITH CAVEATS | HIGH | Voice-path missed-call detection failing |

**Consensus:** READY WITH CAVEATS. The lone NOT-READY is driven by REV-001/002/003 — the exact consensus CRITICAL cluster. Clear the 7 CRITICALs and the panel unanimously converges to build-ready.

## Dimension Coverage Heatmap (consolidated)

| Dimension | CRIT | HIGH | MED | LOW | Total |
|-----------|------|------|-----|-----|-------|
| Security | 4 | 3 | 3 | 1 | 11 |
| Data | 1 | 4 | 2 | 3 | 10 |
| Integration | 2 | 1 | 4 | 1 | 8 |
| Operations | 1 | 1 | 4 | 0 | 6 |
| UX | 0 | 3 | 2 | 0 | 5 |
| Traceability | 0 | 0 | 1 | 3 | 4 |
| Performance | 0 | 1 | 2 | 1 | 4 |
| Business Logic | 0 | 0 | 0 | 0 | 0* |

*Business-logic concerns were largely absorbed into Security/Integration clusters (legal gate, voice routing). The concentration in **Security + Data + Integration** reflects that the spec's risk lives at the serverless boundary + the one net-new datastore, exactly as the architecture predicted.

## Aggregated Commendations (preserve these)

- **Required-field publish gate** (dual Sanity + CI) — every reviewer praised it as the right structural defense against thin/name-swap pages (F-003).
- **Persist-before-send** lead pattern — correct default where the record is also legal evidence.
- **"Quote never returns a hardcoded constant" unit test** — singled out as an unusually sharp, adversarial acceptance test.
- **Review-request ungated to 100% of jobs** — correctly encodes the FTC/Google review-gating ban structurally.
- **Split sitemaps + anchor-ratio CI gate + canonical NAP under DNI** — rare SEO rigor baked into CI.
- **Content/operational-store separation** — architecturally sound; keeps high-churn transactional data out of the CMS.
- **Comprehensive traceability matrix** — every reviewer noted it made a precise review possible.

---

## Recommended next step

This cycle surfaced **7 CRITICAL** findings, all with clear fixes (mostly SMALL/MEDIUM effort) — so per the methodology a **re-review (Cycle 2)** is warranted after v2 incorporates the approved changes, since the CRITICAL fixes (rate-limit architecture, webhook idempotency, voice routing, op-store DR) themselves need verification. Most are additive hardening, not architectural rework — no reviewer called for a redesign.

*Return this document with the Decision column filled (or just say "approve all my recommendations") and I'll produce `suffolk-roofing-spec-v2.md` + a changelog.*
