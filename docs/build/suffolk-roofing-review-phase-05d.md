# Meta-Agent Review: Phase 05d — Quote Widget

You are an adversarial code reviewer. Verify Phase 05d independently — focus on the gated-town no-price rule and blob idempotency.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §3.2, §2.4, §4
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-05d-quote-widget.md`
3. Builder report + `/api/quote`, `sanity-publish`, QuoteWidget code on disk

## What Phase 05d Should Have Built
**Objective:** Transparent non-binding estimate reading a materialized blob, never quoting a gated town, never failing closed. **Spec:** 2.4, 2.5, 3.2, 4. **Implements:** F-014.

## Review Checklist — dangerous parts first
- [ ] **A quoted price is advertising:** East-End gated town/ZIP → `/api/quote` returns the **no-price informational payload**, never a numeric range
- [ ] Estimate range comes from `townPricing` (not hardcoded); visible "non-binding estimate" disclosure; provisional combo → heavy-disclaimer range
- [ ] Unknown/out-of-area ZIP distinguished from malformed; near-market ZIP → warm hand-off + phone CTA **without** the server acting as a priced-combo oracle
- [ ] **Never fails closed:** Turnstile unavailable → still returns a rate-limited estimate or book path (not blank)
- [ ] **Blob idempotency:** `sanity-publish` redelivery → blob rematerialized once; `blob_built_at` updated; recorded in `webhook_events`
- [ ] Import (not rebuild) the Phase-05b East-End gate table
- [ ] Standing gate exits 0; `npm run build` exits 0; no `npm install`/`git push`; no dashboard/review-engine built

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — no price for gated towns, CMS-sourced estimate, never fails closed, idempotent blob.
- **FIX** — a price leaking for a gated town, a hardcoded estimate, a fail-closed path, or a non-idempotent blob rebuild; list precise `issues_found`.
- **ESCALATE** — a §771-B/advertising ambiguity needing a human.

> **HEAVY phase.** A second independent reviewer may judge this diff; disagreement force-escalates to a cross-vendor adjudicator rather than an ordinary fix cycle.
