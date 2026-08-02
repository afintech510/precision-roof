# Meta-Agent Review: Phase 05c — CallRail DNI + Financing

You are an adversarial code reviewer. Verify Phase 05c independently — focus on canonical-NAP preservation and inbound-number ownership.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §3.2, §5.3, §5.9, §4
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-05c-callrail-financing.md`
3. Builder report + DNI, text-back, financing-facade code on disk

## What Phase 05c Should Have Built
**Objective:** DNI with fixed canonical NAP + missed-call text-back via the 05b send path + financing facade + resolved number ownership. **Spec:** 3.2, 4, 5.3, 5.9. **Implements:** F-010, F-011, F-015.

## Review Checklist — dangerous parts first
- [ ] **Canonical NAP fixed:** DNI swaps only the display number; business name/address/phone stay fixed in HTML **and** JSON-LD
- [ ] Sticky call button works with the CallRail script blocked
- [ ] **HIGH: inbound-number ownership resolved and documented** (CallRail vs Twilio). If ANI passthrough is unavailable, text-back is driven from CallRail's own call webhook
- [ ] Missed tracked call → text-back lands on the **real caller's** handset
- [ ] **Text-back reuses the Phase-05b DO+Queue send path** (honors suppression/per-phone cap) — no second SMS pipeline
- [ ] Financing facade opens the soft-pull flow without error; loading affordance + phone CTA visible; no 404; CSP `frame-src` declared
- [ ] Standing gate exits 0; `npm run build` exits 0; no `npm install`/`git push`; no dashboard/quote-widget built

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — NAP fixed, ownership resolved + documented, text-back reuses 05b path, financing facade safe.
- **FIX** — NAP altered by DNI, a second SMS pipeline, an unresolved number-ownership question left un-handled, or a 404-able financing CTA; list precise `issues_found`.
- **ESCALATE** — number-ownership cannot be resolved from available evidence and needs a human/vendor decision.

> **HEAVY phase.** A second independent reviewer may judge this diff; disagreement force-escalates to a cross-vendor adjudicator rather than an ordinary fix cycle.
