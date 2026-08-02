# F — Conversion, Lead Capture & Sales Technology
**Agent:** Claude (Sonnet 5, chat) · **Date run:** Aug 1, 2026 · **Sources consulted:** 2 web searches + 1 live competitor site fetch (Bumble Roofing of Suffolk County)

**Scope note:** Reduced-depth pass — the brief specifies testing 15+ Suffolk sites directly for the booking/chat gap; this pass re-checked one baseline competitor (Bumble) in depth after a general search surfaced a live discrepancy, plus one focused pass on the instant-quote vendor landscape. This is not the full verification sweep the brief calls for.

## 1. EXECUTIVE FINDINGS
- **H3 needs revision, not just confirmation or refutation.** The baseline's central whitespace claim — "zero of seven have real online booking, live chat, or text-to-quote" — is already partially stale. **Bumble Roofing of Suffolk County now has a prominent "Get Your Instant Quote" CTA as Step 1 of its stated 4-step sales process**, plus a nav item called "Visualize Your Roof." This is a live contradiction of the baseline's own table entry for Bumble.
- **Instant-quote technology is a commoditized, cheap, same-day-installable SaaS category — not a build-from-scratch differentiator.** Roofle/RoofQuote PRO (the category leader, "+15k contractor users") runs ~$350/mo + $2K setup (or a published annual plan with 2 free months); a cheaper competitor, Roof Quoter, undercuts it at $200/mo flat with a 3-month minimum, explicitly positioned as "solving the same conversion problem... at a price small shops can actually afford"; HD Instant Roof Quote sits in between at roughly $3,137 first-year all-in. **Any competitor can install one of these in under a business day.** This materially changes the strategic read: instant-quote capability is closing fast as a market-wide feature, not a durable moat — the differentiation window is narrower than the baseline implies, and the site should plan to have this at launch rather than treat it as a phase-2 wedge.
- All the instant-quote products found (Roofle, Roof Quoter, HD Instant Roof Quote) are **satellite/aerial-measurement-based ballpark tools that generate a homeowner-facing price range in under a minute**, not contractor-only measurement tools — this directly answers the brief's §2 distinction between "measurement for the contractor" and "instant price for the homeowner." The homeowner-facing version is now a packaged product, meaning the real differentiation opportunity has shifted from "do we build this" to "how good/honest/fast is our version vs. the now-available baseline."
- Bumble's site also shows discrepancies with the baseline beyond the instant quote: a **NiceJob-powered review widget** is present (baseline said "none shown"), and **BBB accreditation with a real Suffolk address** (1 Sommerset Dr, Yaphank, NY 11980) is displayed — contradicting the baseline's characterization of Bumble as having no trust signals shown.
- A technical weakness spotted in passing on Bumble's site (Lane E's territory, flagged here since it surfaced during this research): every town in its service-area list returns the **identical lat/long coordinate** (40.81515515694068, -72.91258075767067) — the per-town geolocation data appears to be a copy-paste error, not real per-town geocoding. If confirmed, this is exactly the kind of "soft underbelly" Lane A is looking for and undermines any local-relevance signal Bumble is trying to send to Google per-town.

## 2. THE INSTANT-QUOTE VENDOR LANDSCAPE (first pass)
| Vendor | Model | Pricing observed | Notes |
|---|---|---|---|
| Roofle / RoofQuote PRO | Aerial measurement + pricing rules + financing + CRM ecosystem | $350/mo + $2K setup (unlimited platform); annual plan with 2 free months also published | Category leader, "+15k contractor users" claimed, includes built-in financing (soft-pull, 60-second pre-qual, up to $55K), digital e-sign proposals |
| Roof Quoter | Lighter, embeddable widget only | $200/mo flat, 3-month minimum, no setup fee | Explicitly positioned against Roofle as the budget option for small shops; uses public roof-area data rather than proprietary satellite measurement |
| HD Instant Roof Quote | Self-service instant quote + visualization + standalone site | ~$3,137 first-year platform fee before optional visualization packs (per a comparison source, not HD's own page — verify directly) | Narrower scope than Roofle — no financing/CRM/rep-quoting layer |

This is enough to answer the brief's core §2 question directly: **a credible instant homeowner-facing price range is achievable off-the-shelf today, at a cost low enough that it should be a launch-phase line item, not a phase-2 differentiator.**

## 3. DECISIONS THIS RESEARCH FORCES
- DECISION: Whether to build a custom instant-quote tool or license one of the existing SaaS widgets.
  Options: (A) License Roofle/RoofQuote PRO — highest cost, most complete (financing built in), fastest to a polished result; (B) License the budget alternative (Roof Quoter or similar) — cheaper, less accurate, appropriate if the goal is lead-capture rather than pinpoint pricing; (C) Custom-build using a satellite measurement API (EagleView, Nearmap — Lane E/this lane's §2 territory) — highest cost and timeline, only justified if the differentiation is the *accuracy* or *ownership* of the tool itself.
  Recommendation: (B) or (A) at launch — build vs. buy doesn't pencil out here given $200–450/mo pricing already exists and 1-day setup; a custom build only makes sense later if volume justifies owning the data/margin.
  Confidence: Medium — pricing is from vendor/comparison-site claims, not independently verified against a live quote request.
  Reversibility: Cheap to change later (these are embeddable widgets, swappable)
- DECISION: Whether the site's differentiation claim should still be "we have instant quoting" (weakening fast as a claim) or shift to something the SaaS commoditization can't copy — e.g., published real pricing ranges + license number + real reviews together, which is still rare per the baseline's H6.
  Options: (A) Lead marketing with the instant-quote feature; (B) Treat instant quote as table stakes and lead with the trust-stack combination (license + real reviews + published pricing) that's still genuinely rare; (C) Both, positioned as "the honest quote, from a licensed company you can verify."
  Recommendation: (C) — combines the now-available tech with the harder-to-copy trust signals the baseline's own data (only 1 of 7 shows a license number) still supports.
  Confidence: Medium
  Reversibility: Cheap to change later (messaging, not architecture)

## 4. HYPOTHESES TESTED
- **H3 (booking/quoting layer is category-leading whitespace):** PARTIALLY REFUTED. The *instant quote* piece of H3 is closing — it's now a commodity SaaS purchase, and at least one baseline competitor (Bumble) already has a version of it live. The brief's broader claim about **genuine online booking against real crew calendar availability** was not re-tested in this pass (no site was checked for a live calendar-booking flow, as opposed to a lead-callback form) — that part of H3 remains untested, not refuted, and is the more defensible differentiation target now. Recommend the synthesis session narrow H3 from "instant quote + booking + chat" to "real calendar-integrated booking + speed-to-lead automation" as the actual whitespace, since instant quote alone no longer qualifies.

## 5. CONFIDENCE LEDGER
| Finding | Confidence | Basis | What would raise confidence |
|---|---|---|---|
| Bumble now has an instant-quote CTA | High | Direct live fetch of bumbleroofing.com/suffolk-county | N/A — direct observation, but should be re-checked whether it's a real satellite-measurement tool or just a form mislabeled "instant" |
| Instant-quote SaaS is available at $200–450/mo | Medium | Vendor and third-party comparison pages, not an independent quote request | Request an actual quote from Roofle and Roof Quoter |
| Bumble's per-town lat/long is duplicated/broken | Medium | Observed directly in the fetched page's location list | Check 2–3 more Bumble town subpages to confirm it's not a display artifact |
| Genuine calendar-integrated booking remains rare | Low | Not directly tested this pass — inherited assumption from baseline | Test 10+ competitor sites for a live calendar booking widget vs. callback form |

## 6. WHAT I COULD NOT VERIFY
- Did not test 15+ Suffolk sites for live chat / text-to-quote as the brief specifies — only re-checked Bumble.
- Did not request an actual quote from Roofle or Roof Quoter to verify their published pricing or test the homeowner-facing UX quality.
- Did not evaluate booking/scheduling vendors (Calendly, JobNimbus, AccuLynx, ServiceTitan, Housecall Pro) against real crew-calendar integration — brief's §3, not touched.
- Did not evaluate speed-to-lead tooling, AI voice/chat receptionists, financing lender landscape beyond what the baseline already had, TCPA/SMS consent rules, or call tracking/attribution — brief's §4–8, not touched this pass.

## 7. CONTRADICTIONS WITH THE BASELINE
- Baseline table: Bumble Roofing — "Reviews shown: None shown"; "Financing terms published: Vague, page 404s." **This pass's live fetch shows a NiceJob-powered review widget present ("hundreds of happy customers") and a "Get Your Instant Quote" CTA prominently in the hero and as step 1 of the sales process** — the financing page itself was not re-checked for a 404, but the review and instant-quote claims are directly contradicted. Note the fetched page's `modified_time` metadata reads 2026-07-13, which is *before* the baseline's stated July 29, 2026 audit date — meaning either the baseline's Bumble review missed these elements, or Bumble's site changed again between the two dates. Flagging for the synthesis session to reconcile rather than assuming either source is simply wrong.
- Baseline §2 states "Zero of seven offer real online booking... Zero of seven offer live chat or text-to-quote... 'Instant quote' is universally oversold." The instant-quote-specific part of this claim does not hold for Bumble as currently live. The booking/live-chat claims were not re-tested and may still hold.

## 8. SOURCES
- [Bumble Roofing of Suffolk County — homepage](https://bumbleroofing.com/suffolk-county/) — competitor primary source, live fetch Aug 1 2026
- [Roofle / RoofQuote PRO — product page](https://offers.roofle.com/) — vendor primary source
- [Roofle — pricing/plans](https://offers.roofle.com/plans) — vendor primary source
- [Roofle — FAQ](https://win.roofle.com/faqs) — vendor primary source
- [Roof Quoter — homepage](https://www.roof-quoter.com/) — vendor primary source, explicitly positions against Roofle
- [HD Instant Roof Quote — Roofle pricing comparison](https://www.hdinstantroofquote.com/roofle-pricing) — competitor/vendor comparison page, marketing content, treat pricing claims as unverified until confirmed directly
- [L&S Home Improvements — Roofle usage example](https://www.lnshomeimprovements.com/how-to-use-roofle-roof-cost-calculator/) — non-Suffolk contractor, illustrates real-world Roofle deployment
