# Changelog — Suffolk County Roofing Website Spec Pipeline

## Pipeline audit trail

| Date | Phase | Artifact | Note |
|------|-------|----------|------|
| (prior) | 1–2 | `SYNTHESIS-suffolk-roofing.md`, `SOW-suffolk-roofing.md` | Research synthesis + locked SOW (external to this run) |
| 2026-08-02 | 3 | `suffolk-roofing-spec-v1.md` | Master Architecture Spec v1; F-001…F-022 minted from SOW |
| 2026-08-02 | 4 | `suffolk-roofing-review-{GUARDIAN,FOUNDATION,ADVOCATE,BRIDGE}.md` | Adversarial review prompts (attachment-placeholder form) |
| 2026-08-02 | 5 | `suffolk-roofing-synthesis-v1.md` | Cycle-1 synthesis: 6 reviews / 4 personas / 5 models → 96 raw → 44 consolidated |
| 2026-08-02 | 5→ | `suffolk-roofing-spec-v2.md` | v2: all approved Cycle-1 findings folded in |
| 2026-08-02 | 4 (C2) | Cycle-2 review prompts (internal agents) run against v2 | 4 personas |
| 2026-08-02 | 5 (C2) | `suffolk-roofing-synthesis-v2.md` | Cycle-2 synthesis: 4 internal reviews → 59 raw → 33 consolidated (2 CRIT, 12 HIGH); unanimous READY WITH CAVEATS |

## Cycle-2 status (2026-08-02)

- **Internal panel complete** (GUARDIAN/FOUNDATION/ADVOCATE/BRIDGE). Two CRITICALs (C2-001 slo-sweep re-sends suppressed leads; C2-002 MessageSid idempotency drops status callbacks) are **regressions introduced by v1→v2 fixes** — the re-review payoff.
- **PENDING:** Adam is running external-model reviews. Next action = merge external into a **Cycle-2b synthesis**, then write **spec v3**. Do NOT write v3 until external reviews are merged (per Adam's decision).
- **DEC-C decided:** hold the third-party script budget at **≤4** (defer CallRail→first-interaction and/or GA4→idle); SOW ≤3–4 cap stands, no SOW deviation. To fold into v3.
- All C2 findings pre-approved except DEC-C (decided above); C2 recommendations to be applied in v3.

## Cycle-2 → v3 (2026-08-02)

**Decision:** build v3 from internal Cycle-2 findings (external reviews not run). Also incorporated `SYNTHESIS-spec-v1-review.md` — a parallel independent Cycle-1 review (4 Opus personas) whose 5 CRITICALs all corroborated fixes already in v2, plus new items folded into v3.

**Artifact:** `suffolk-roofing-spec-v3.md`.

### Applied in v3
- All 33 consolidated Cycle-2 findings (C2-001…C2-033), incl. both CRITICAL regressions: C2-001 slo-sweep re-sending suppressed leads (added `sms_suppressed_reason` + scoped sweep + in-txn re-checks) and C2-002 MessageSid status-callback drop (key = `MessageSid:MessageStatus`, monotonic state machine).
- New tables: `booking` (C2-005), `consent_record` (C2-006/SPEC-008), `suppression` replacing `opt_out` (C2-007/SPEC-006), `operator_access_log` (C2-027).
- New from parallel review: SPEC-006 email CAN-SPAM (List-Unsubscribe + (channel,contact) suppression); SPEC-005 NANP SMS restriction; SPEC-008 consent snapshot +UA/URL; SPEC-014 LSA re-plan 6–8 wk + Google-Ads fallback.
- **DEC-C:** script budget held ≤4 (defer CallRail/GA4).
- **SPEC-016:** F-014 quote widget → Launch; F-013 review-request → early Phase 2 (documented deviation).

### Deferred
- External Cycle-2 reviews (Adam may still run; merge into a later cycle if they surface new issues).
- REV-040 incremental builds → Phase 3.

### Recommended next
- **Focused Cycle-3 verify** of the SMS state-machine seam (DO atomic claim / slo-sweep / suppression / budget) + booking→GA4 path, then **lock v3** → handoff to `build-prompter`.

## Cycle-3 (focused verify) → LOCK (2026-08-02)

**Reviewers:** BRIDGE + GUARDIAN (internal, focused on SMS state-machine seam + booking→GA4 path only).
**Result:** both confirmed the two Cycle-2 CRITICAL regressions (C2-001 slo-sweep, C2-002 MessageSid) are **genuinely closed**. No new CRITICAL/HIGH. Three MEDIUM/LOW spec-wording residuals, two of them independently flagged by both reviewers:
- **C3-BRIDGE-001 + C3-GUARDIAN-001** (convergent) — send-time suppression/per-phone/budget re-check must reserve through the DO on **both** the primary queue-worker path and slo-sweep (not just the sweep). Applied to §3.1/§3.2.
- **C3-BRIDGE-002** — walk-up (`booking_direct`) GA4 event needs a `client_id` source (Cal.com metadata) or an explicit "unattributed" fallback (never a minted random id). Applied to §3.2.
- **C3-BRIDGE-003** — clarified DO exactly-serializes per-phone+suppression while the global budget is an approximate sharded soft-cap. Applied to §1.2.
- Added 3 §9 test rows for the above.

**`suffolk-roofing-spec-v3.md` is LOCKED** — no open CRITICAL/HIGH. Handoff input to `build-prompter` (locked spec + `SOW-suffolk-roofing.md`).

### Spec-pipeline: COMPLETE (Phases 3–5, 3 review cycles)
Trajectory: Cycle 1 (7 CRIT, split verdict, one NOT READY) → Cycle 2 (2 CRIT regressions, unanimous READY WITH CAVEATS) → Cycle 3 (0 CRIT, both READY). Healthy convergence.

## Cycle-1 review panel

| Persona | Model | Verdict | Findings |
|---------|-------|---------|----------|
| GUARDIAN | Muse Spark 1.1 (Meta) | NOT READY | 18 |
| GUARDIAN | Claude Sonnet 5 | READY WITH CAVEATS | 17 |
| FOUNDATION | Claude 3.5 Sonnet | READY WITH CAVEATS | 17 |
| FOUNDATION | Grok 4.5 (xAI) | READY WITH CAVEATS | 18 |
| ADVOCATE | Claude 3.5 Sonnet | READY WITH CAVEATS | 14 |
| BRIDGE | Gemini | READY WITH CAVEATS | 12 |

Consolidated: **CRITICAL 7 · HIGH 14 · MEDIUM 15 · LOW 8** (44 total).

---

# Changelog: Spec v1 → v2

**Date:** 2026-08-02 · **Review cycle:** 1 · **Decision:** all recommendations approved (DEFER REV-040; DEC-A soft word count; DEC-B full consent text)

## Approved Changes

| ID | Sev | Change summary | Spec sections modified |
|----|-----|----------------|------------------------|
| REV-001 | CRIT | Per-phone SMS throttle + shared rate-limit store + server Turnstile (fail-closed) + global daily SMS budget cap | 1.2, 2.5, 3.1, 3.2 |
| REV-002 | CRIT | TCPA consent columns (text/version/ts/ip) + full STOP set + shared E.164 normalizer + opt-out category | 2.2, 2.5, 3.2, 7.3 |
| REV-003 | CRIT | `webhook_events` idempotency; invert review-request to persist-pending; async queue decouples `/api/lead` | 1.2, 2.5, 3.2, 3.3 |
| REV-004 | CRIT | Voice trunk through Twilio + AMD/whisper missed-call detection; CallRail routes through Twilio | 3.2, 5.2, 5.3 |
| REV-005 | CRIT | Operational-store backup/DR/retention + restore drill (consent evidence) | 1.3, 2.5, 6, 8 |
| REV-006 | CRIT | East-End legal gate enforced server-side + islands hidden, not CTA-only | 2.2, 3.2, 4.4, 7.5 |
| REV-007 | CRIT | Portable-text sanitization + CSP + raw-HTML blocked | 2.2, 7.3 |
| REV-008 | HIGH | Explicit indexes + unique constraints across op-store | 2.5 |
| REV-009 | HIGH | Money as integer cents | 2.2, 3.2 |
| REV-010 | HIGH | Referential integrity: FK townPricing→service, immutable job `_id` key, weak-ref handling | 2.2, 2.5 |
| REV-011 | HIGH | Pricing-coverage CI check + provisional seed | 2.4, 6 |
| REV-012 | HIGH | Zod enums/E.164/ZIP; 400-not-422 oracle; Turnstile on `/api/quote` | 3.1, 3.2 |
| REV-013 | HIGH | PII retention/purge/encryption/access-log; dashboard Sanity SSO | 2.5, 7.1, 7.3 |
| REV-014 | HIGH | Lead form: double-submit UUID, loading/success/error states, 202-on-outage | 3.2, 4 |
| REV-015 | HIGH | Facade/deferred third-party scripts; captcha counted (4–5 budget) | 3.1, 4, 5.1 |
| REV-016 | HIGH | WCAG 2.2 islands: aria-live, focus-not-obscured, state preservation | 4 |
| REV-017 | HIGH | Deterministic Cal.com lead match via leadId metadata | 3.2, 5.1 |
| REV-018 | HIGH | Sticky call button static `tel:` in HTML | 4 |
| REV-019 | HIGH | verifiedFeed → GBP API import (external review id gates JSON-LD) | 2.2, 5.7 |
| REV-020 | HIGH | job customer-contact fields + first-transition-only guard | 2.2 |
| REV-021 | HIGH | Migration classification; destructive requires export | 1.3, 2.3 |
| REV-022 | MED | slo-sweep cron (null-safe) + metrics/dashboard + user recovery email | 3.2, 8.3 |
| REV-023 | MED | Verify Cal.com free-tier webhooks in Phase 0 | 5.1, 6 |
| REV-024 | MED | Twilio error-code-aware retries (hard-bounce → no retry) | 2.5, 3.2 |
| REV-025 | MED | Financing/Cal.com iframe timeout + onError fallback | 4, 5.1, 5.4 |
| REV-026 | MED | Final TCPA-permitted STOP confirmation SMS with emergency phone | 3.2 |
| REV-027 | MED | Accessible no-SMS submit fallback if Turnstile blocked (reconciled w/ REV-001) | 3.1 |
| REV-028 | MED | D1 timestamps as integer epoch (no native timestamptz) | 1.2, 2.5 |
| REV-029 | MED | §771-B banned-phrase content lint (concrete regexes) | 7.5 |
| REV-030 | MED | Quote legal disclosure inline + header/contact transparency surfacing | 3.2, 4 |
| REV-031 | MED | Materialized pricing blob (build + publish webhook), edge-served quote | 1.2, 3.2 |
| REV-032 | MED | Alert channel independence (email-primary) | 1.3, 8.3 |
| REV-033 | MED | Failed-send compensating action + manual resend queue | 8.1 |
| REV-034 | MED | `/resources/` listing/pagination page spec'd | 4 |
| REV-035 | MED | Publish-gate enumerates every §4 sub-field + cardinality | 2.2, 2.3 |
| REV-036 | MED | Cost/TCPA observability metrics + consent audit | 8.3 |
| REV-037 | LOW | Mint F-023 operator dashboard | 0, 2.5, 7.1, 8.1, 10 |
| REV-038 | LOW | Enum constraints on status/method fields | 2.2, 2.5 |
| REV-039 | LOW | effectiveYear required + staleness check | 2.2 |
| REV-041 | LOW | `/internal/send-sms` = module import, not HTTP route | (3.2 implementation note) |
| REV-042 | LOW | Concrete F-021 handoff acceptance checklist | 6, 9 |
| REV-043 | LOW | GA4 beacon on CallRail DNI-swap failure | 5.3, 8.3 |
| REV-044 | LOW | townReviews confirmed soft (0-review town publishable) | 2.2 |

## Deferred to Backlog

| ID | Change | Rationale |
|----|--------|-----------|
| REV-040 | Incremental SSG builds + cached anchor-ratio link graph | Fine at launch ≤~20 pages; a Phase-3 scale concern |

## Rejected Changes
None — all findings approved (per user decision).

## Decisions
- **DEC-A** Word count stays a soft warning (SOW §4: density is the bar; field-enumeration REV-035 is the real depth guarantee).
- **DEC-B** Store full versioned consent text (audit-defense value outweighs minimal PII).

## Re-review
Cycle 2 recommended and approved: 7 CRITICAL fixes need verification. Internal agents run reviews against v2; external runs by Adam in parallel.
