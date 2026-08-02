# SCOPE OF WORK — Suffolk County Residential Roofing Website

**Prepared for:** Adam (adam@easternbuilding.supply)
**Source:** Extracted and expanded from `SYNTHESIS-suffolk-roofing.md` Part 10 (SOW Handoff Package), with supporting detail from Parts 3 and 9. Full research citations, contradiction resolutions, and confidence grading live in the synthesis document — this SOW states positions only.
**Status:** DRAFT — Branch B, Cal.com (free tier), operator/crew model, and the conversion-stack build-vs-buy decisions are all confirmed by Adam. **The entire site — including the quote builder — will be built in-house by Adam, not a vendor.** This removes the vendor-quote blocker (§9) but makes Adam personally the single point of build capacity against the hard October deadline (§10); see the new risk in §12. No remaining decision blocks locking this SOW.

---

## 1. Scope Statement

Design, build, and launch a new Suffolk-County-anchored residential roofing brand website on Astro + Sanity (WordPress lean-theme as named fallback), leading with transparency — license number, itemized town-level pricing, and NY §771-B compliance — and genuine local depth, targeting the urgent-service and cost-intent long tail across 12 hand-researched deep town pages, with a working booking, speed-to-lead, and financing-prequal conversion layer, full structured data, WCAG 2.2 AA compliance, and the storm/emergency page cluster plus Local Services Ads enrollment live before **October 2026**.

---

## 2. In Scope

- Astro (static-first) + Sanity (headless CMS) build; WordPress lean-custom-theme named as fallback if developer-dependency tolerance requires it.
- **12 deep town pages** at flat `/areas/[town]/` URLs, each meeting the content-depth standard in §4.
- **~9 launch service pages**: roof replacement, roof repair, emergency roof repair, storm damage roof repair, roof leak repair, flat/low-slope roofing, metal roofing, roof inspection, plus the services hub.
- Core site pages: home, `/financing/`, `/reviews/`, `/warranties/`, `/about/`, `/gallery/`, `/contact/`, `/resources/` (blog/guides hub) with seed editorial-calendar content.
- Internal-linking model (town↔service, town↔town adjacency clusters, blog↔money-page, breadcrumbs) per §5.
- Structured-data plan by page type (`RoofingContractor`, `Service`, `FAQPage`, `BreadcrumbList`, `Review`/`AggregateRating`, `ImageObject`/`VideoObject`).
- Launch-tier conversion stack (§6): real calendar booking, speed-to-lead automation, DNI call tracking, financing prequal, 3-step lead form, review-request tooling.
- GA4 + Search Console + call-tracking analytics wired to key events (booking completion, form submit, tracked call).
- WCAG 2.2 AA compliance (automated + one manual pass) and published accessibility statement.
- 301 redirect discipline and split XML sitemaps by content type.
- Storm/emergency/leak page cluster and Local Services Ads (LSA) enrollment live before October 2026 (hard deadline — see §9).

## 3. Out of Scope (Launch)

- Auto-generated town × service page grid (only the top ~6 towns × 4 urgent-service combos ship, and only in Phase 2 — see §9).
- East-End (Southampton, East Hampton, Shelter Island) active advertising pages/CTAs — informational content only, gated behind separate town licensing (§8).
- Calibrated instant-price quoting tool (deferred to Phase 2, pending 20–30 completed jobs of cost data).
- AI voice/chat receptionist.
- Dedicated roofing CRM (internal dispatch tooling, distinct from the public booking widget).
- Spanish-language / hreflang variants.
- Skylights, gutters, siding service pages (Phase 2).
- Wikidata / Knowledge Panel / llms.txt investment, dedicated voice-search program, TikTok organic.
- "Same-day roof replacement" as a launch service or marketing claim (only ships later, and only if crew capacity is verified — see §8).

## 4. Content-Depth Standard (Town Pages)

Enforced as **required Sanity schema fields** — a town page cannot publish with any field empty:

1. Building department — exact street address, phone, counter hours, e-file vs. in-person (primary `.gov` source).
2. Permit — required-for-reroof status, fee, turnaround in business days, sourced from the town fee schedule/eCode360 (not a competitor's claimed figure).
3. Historic district / overlay trigger for roof work, named.
4. Dominant housing stock — era, type, typical roof size in squares.
5. At least one roofing-relevant local condition (salt air, wind exposure, flood zone, tree canopy, HOA).
6. At least 3 named real streets, 2–4 hamlets/neighborhoods, 1–2 landmarks.
7. 3–5 town-tagged recent jobs and at least one town-specific review where available.

Plus: current price range by town × home size, in-body license number, 10–13 search-voice FAQ entries with validating `FAQPage` schema. Target length 2,500–4,000 words — word count is a proxy; local-specificity density is the actual bar. No name-swap pages.

## 5. Site Map & Internal Linking

**Launch page set:**

| URL | Type | Notes |
|---|---|---|
| `/` | Home | Transparency wedge |
| `/services/` + 9 service pages | Service | Emergency/storm/leak pages are launch-critical (before Oct) |
| `/areas/` + `/areas/[town]/` ×12 | Town hub + pages | See §4 for depth standard |
| `/resources/` + posts | Blog/guides | Seed content at launch, ongoing after |
| `/financing/`, `/reviews/`, `/warranties/`, `/about/`, `/gallery/`, `/contact/` | Trust/conversion | |

**Town launch set (12):** Huntington, Smithtown, Islip, Babylon, Brookhaven, Bay Shore, Patchogue, Commack, Port Jefferson, Sayville, Riverhead, and one North Shore hamlet-town (Northport or St. James, final selection pending keyword-demand ranking). Western/central high-population towns publish first.

**Excluded from active advertising (legal gate):** Southampton, East Hampton, Shelter Island require a separate town Home Improvement license in addition to the Suffolk County license. Informational content only; no "we serve you" CTAs until licensed.

**Linking rules:** every town page links the full service grid; every service page links all 12 launch towns; town-to-town links limited to 2–4 geographically adjacent towns; every blog post links at least one service/town page in-body; anchor text capped at ≤30% exact-match "[service] [town]" site-wide; no page more than 2 clicks from home.

## 6. Conversion Stack

**Decision (2026-08-01): build the speed-to-lead, review-request, and lead-capture-quote pieces in-house instead of buying SaaS, and run booking on Cal.com's free tier.** This trades monthly subscription cost for build cost + usage-based fees + an ongoing maintenance obligation. Net effect on the launch estimate below: **~$550–900/mo drops to roughly $50–130/mo in variable/hosting cost**, offset by added build scope that must be priced into the fixed-scope quote in §9 (see cost note under each item) and by an explicit new maintenance owner (§8, §12).

**Launch:**
- Booking: **Cal.com, free tier** — "Book a Free Inspection" embed. **$0/mo, not $16–20/mo as previously estimated**; the free plan covers a single-business booking calendar, which is what's needed here. *Revisit only if volume or team growth pushes into a paid-tier feature (e.g., multiple team members needing routing/round-robin).*
- **Speed-to-lead — build on Twilio directly** (replaces the $100–300/mo missed-call-text-back SaaS). Twilio Programmable SMS + Voice webhooks: detect a missed call or form submit, auto-fire an SMS within the 5-minute acceptance-test window (§7). Twilio's own cost is usage-based and small at launch volume — SMS is roughly $0.0079/message, voice minutes roughly $0.0085–0.013/min, plus a phone number (~$1–2/mo); at realistic Phase-1 volume this lands well under $20/mo in Twilio fees. **The real cost is build time**, not the monthly bill: someone has to write and maintain the webhook logic, retry/failure handling, and opt-out (STOP/TCPA) compliance that a SaaS tool ships out of the box. Must still be tested end-to-end before any response-time promise is marketed (§8 dependency unchanged).
- Call tracking: CallRail with dynamic number insertion (~$50–185/mo); canonical business name/address/phone stays fixed in HTML and schema. *Unchanged — DNI plus multi-source call attribution is a deep, maintained product; not a good in-house build candidate given the size of this project.*
- Financing: Acorn Finance or Wisetack — maintained third-party soft-pull flow (not a static page that can 404). *Unchanged — this requires a lender relationship, not just code; not a build-vs-buy candidate.*
- Lead form: 3-step (ZIP → service → contact), single TCPA consent checkbox.
- **Reviews — build in-house: automated email + SMS review-request via a scheduled job** (replaces NiceJob/GatherUp, ~$75–99/mo). A cron job (or Sanity webhook on "job completed" status) triggers a templated email (SES/Postmark, fractions of a cent per send) and/or Twilio SMS asking for a review, identical ask to 100% of customers — no gating, no satisfaction pre-filter (§12 compliance risk unchanged: Google's review-gating ban still applies whether the tool is bought or built). **Build cost:** the job-completion trigger, template, send logic, and a basic dashboard to see who's been asked/who's responded — meaningfully more scope than SMS speed-to-lead since it needs a data model for "job status," not just a webhook.
- **Lead-capture quote widget — build our own** (replaces the ~$200/mo optional SaaS widget). Explicitly non-binding, same as the SaaS version would have been — this decision changes *who builds it*, not what it promises the customer. **Build cost:** a form/calculator UI plus whatever pricing logic backs the estimate (roof size × material × town price range from the town-page CMS data already being built per §4) — this can lean on the town-page pricing fields already in scope rather than needing new data infrastructure.

**Phase 2 (+ volume-gated):** calibrated instant-price tool after 20–30 completed jobs (build-vs-buy to be revisited once real job-cost data exists — the in-house lead-capture widget in Launch is explicitly *not* this calibrated tool); AI voice/chat receptionist if storm-season call volume outstrips human intake; roofing CRM for internal dispatch.

## 7. Deliverables & Acceptance Criteria

| Deliverable | Acceptance test |
|---|---|
| 12 town pages, all 7 required CMS fields populated from primary sources, ≥3 named streets, 2,500–4,000 words | Page cannot publish with an empty required field; `FAQPage` schema passes Rich Results Test |
| License number in footer site-wide + in-body on every town/service page | Automated presence check |
| Booking widget books a real inspection slot end-to-end | Complete a booking; confirmation fires GA4 key event |
| Financing prequal is a maintained third-party flow | Soft-pull flow completes without error |
| Speed-to-lead (in-house Twilio build): form submit / missed call triggers SMS within 5 minutes; failed sends retry or alert a human; STOP/opt-out honored | Timed end-to-end test; simulate a failed send and confirm alert/retry fires; send STOP and confirm no further messages |
| Review-request (in-house cron/webhook build): job marked complete triggers an identical email/SMS ask to every customer within a defined window, no gating on prior satisfaction signal | Trigger a test "job complete" status; confirm send fires; confirm the same trigger fires regardless of any satisfaction field |
| Lead-capture quote widget (in-house build): produces a non-binding estimate range from town + service + rough size, clearly labeled as an estimate | Submit the widget end-to-end; confirm output pulls from town-page pricing data, not a hardcoded number; confirm "non-binding estimate" disclosure is visible |
| WCAG 2.2 AA | Automated axe scan clean of criticals + one manual keyboard/screen-reader pass; accessibility statement published |
| Performance budget | Hero LCP image ≤200KB, explicit width/height on all images, ≤3–4 async third-party scripts; enforced in build pipeline, verified against CrUX post-launch |
| Storm/emergency/leak pages + LSA enrollment live before October 2026 | Indexed in Search Console; LSA active |

## 8. Technical Constraints & Requirements

Static-first rendering (Astro); Sanity schema enforcing required per-town uniqueness fields (no page can publish as a template swap); canonical/self-referencing URLs; split XML sitemaps by content type; JSON-LD for `RoofingContractor`/`Service`/`FAQPage`/`BreadcrumbList` (`Review`/`AggregateRating` only from a real, auditable feed); dynamic number insertion that preserves canonical NAP in HTML and schema; AVIF/WebP responsive images; self-hosted fonts; booking layer built on an API so it remains addressable by future agentic-booking flows; **handoff documentation sufficient that a second developer can service the site** is an explicit acceptance criterion, not a nice-to-have.

## 9. Dependencies & Assumptions

All decisions below are resolved. (See full detail and options in synthesis Part 8.)

| Decision | Owner |
|---|---|
| ~~Branch A vs. Branch B~~ — **DECIDED: Branch B, new Suffolk-anchored brand** | Adam |
| ~~Operator/crew arrangement~~ — **DECIDED: sub-contracted crews; realistic turnaround is days-to-weeks, not same/next-day.** Direct consequence: no "same-day" or fast-response marketing claim ships anywhere on the site (consistent with H5 already being refuted, §5 of synthesis). Book "a free inspection" — always deliverable — never a time-bound promise the subcontractor network can't guarantee. | Adam |
| ~~Build budget / vendor~~ — **DECIDED: fully in-house.** Adam builds the entire site, including the quote builder — no external build vendor, no fixed-scope quote to obtain. The $20K–60K figure that appeared in earlier drafts was an agency-sourced estimate for a *vendor* build and no longer applies; there is no external cash build cost, only Adam's time and the ~$50–130/mo ongoing stack (§6). | Adam |
| Suffolk address, entity, county (and any town) licenses, insurance | Adam |
| Final 12th town selection | Spec author, using keyword-demand data |
| ~~Cal.com vs. Calendly~~ — **DECIDED: Cal.com, free tier** | Adam |
| ~~Financing prequal in scope?~~ — **DECIDED: keep in scope.** No in-house monthly payment plan is offered, but the Acorn Finance/Wisetack soft-pull prequal flow stays as a future/optional third-party financing path for customers. | Adam |

**Assumption flagged as unverified:** session-volume estimates behind the economics model are modeled, not measured (no keyword-volume tool was used in any research pass). Get a real keyword-volume read before committing significant additional time to the build — see synthesis Appendix, "Softest foundations," item 1. **Job-value assumption ($9,500–$15,000 avg) left unchanged for now** despite Adam noting real roof jobs start at $15k — revisit if this turns out to matter to the model once real job data exists.

## 10. Timeline — Hard Deadline

The storm/emergency/leak page cluster and LSA enrollment **must be live before October 2026** — organic ranking lag is 8–12 weeks and LSA enrollment itself takes 2–5 weeks, so licensing and content work need to start immediately once Phase 0 blockers clear. Missing the September publish window forfeits the entire nor'easter season. Full phased roadmap (Phase 0 foundations → Phase 1 storm-cluster launch → Phase 2 depth/remaining towns → Phase 3 scale → Phase 4 12-month review) is in synthesis Part 9.

## 11. Success Metrics (Baseline → Target)

- Town/service organic sessions: 0 → measurable to town-page segment by month 6.
- Phone-click + form-submit key events: 0 → tracked from launch.
- Reviews: 0 → 50+ by month 6, 100+ by month 12 (compliant, ungated).
- Booked inspections via site: 0 → first booking within Phase 1.
- Core Web Vitals: unmeasured → "Good" on CrUX once traffic permits.
- Storm cluster indexed and LSA live before October: binary gate, pass/fail.

## 12. Known Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Session-volume assumptions are unverified | Get real keyword data before over-committing budget |
| **Solo-founder build risk.** With a vendor, a missed deadline was contractually someone else's problem and there was a fallback (WordPress lean-theme, §8 of synthesis). With Adam building the entire site plus the quote builder plus Twilio/cron/webhook systems alone, alongside running Eastern Building Supply, there is no fallback builder if capacity runs out against the hard October deadline (§10) — this is now the single largest execution risk in the project. | Adam is confident the timeline works (confirmed 2026-08); still, treat the storm/emergency cluster + LSA (§10) as the non-negotiable minimum viable slice — if time runs short, everything else (remaining town pages, blog, gallery) can slip past October without forfeiting the season, but the storm cluster cannot. Keep handoff documentation as a real practice (not just an acceptance criterion for a future developer) since it protects Adam's own future self, not just a hypothetical second developer. |
| Single-developer dependency (Astro/Sanity) | Conventional patterns + documentation as good practice even with no near-term handoff planned |
| In-house Twilio/cron/webhook build (speed-to-lead, review-requests, quote widget) adds three more custom systems to build and maintain solo, plus lost SaaS guarantees around deliverability, retries, and compliance (TCPA opt-out, SMS carrier filtering) that vendors like CallRail/NiceJob handle by default | Scope compliance/retry/opt-out handling explicitly into the build (not an afterthought); don't underestimate these as "quick add-ons" when planning solo build time against the October deadline |
| NY leads the nation in ADA web-accessibility suits | WCAG 2.2 AA from day one, not retrofitted |
| §771-B non-compliance from copying competitor financing/insurance copy | Legal review of all financing and insurance-claim language before publish |
| Capacity-vs-promise mismatch (marketing "fast response" without verified crew) | **Resolved by decision:** sub-contracted crews run a normal days-to-weeks backlog, so no same-day/fast-response promise ships anywhere on the site — book "a free inspection," not a response-time guarantee |
| Instant-quote tooling is commoditizing fast | Don't build the site's core differentiation on it; defer to Phase 2 |

## 13. Open Questions for the Spec Author

No open decision blocks locking this SOW. Remaining items are non-blocking and resolve during or after the build:

- East-End license timing — owner: Adam (does not block launch; excluded from advertising until resolved).
- Exact 12th launch town — owner: spec author, using Lane B demand ranking.

---

*Full evidence, confidence grading, contradiction resolutions, and hypothesis verdicts (H1–H7) supporting every position in this SOW are in `SYNTHESIS-suffolk-roofing.md`. This document intentionally omits citations and evidence weighing — it states decided positions only, for handoff to the SOW/Architecture Spec stage of `spec-pipeline`.*
