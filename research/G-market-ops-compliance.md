# G — Market, Operations, Compliance & Economics
**Agent:** Claude Sonnet 5 · **Date run:** 2026-08-01 · **Sources consulted:** 24 (web search + web fetch; see §8)

## 1. EXECUTIVE FINDINGS

- **Southampton, East Hampton, and Shelter Island are NOT covered by the Suffolk County Home Improvement license.** They run independent town licensing regimes, and per legal commentary a contractor needs the town license *in addition to* the Suffolk license to legally advertise/work there. This directly restricts which East End towns the site can promote without a separate license — a hard scope constraint for any launch-phase town-page list.
- **NY General Business Law §771-B is a load-bearing, roofing-specific statute the baseline didn't surface.** It bans roofing contractors from requiring *any* upfront deposit for work/materials, bans advertising or promising to pay/rebate any insurance deductible, bars contractors from adjusting or negotiating insurance claims on a homeowner's behalf (or being paid for referring that service), and mandates specific insurance-disclosure and 3-day cancellation language when a claim is involved. This is a stricter, roofing-specific overlay on top of the general home-improvement law (§771) — several competitors' financing/insurance-claim marketing language should be checked against it before the new site echoes it.
- **The baseline's close-rate assumption (30%) is optimistic for pure web leads.** Sourced industry benchmarks put close rates for shared/price-shopped leads at 5–15%, and 15–25% even for strong teams on paid, exclusive leads. 30%+ is realistic mainly for warm/referral leads or after a mature sales process. The economics model below rebuilds around 12–25%, not 30%, as the base case.
- **Website conversion-rate benchmarks are lower than the baseline's 3–6%.** Multiple industry sources put average roofing site conversion at 0.5–3%, "healthy" at 3–5%, and 5–8%+ only for optimized/interactive sites. The baseline's 3–6% is achievable but sits at the top of the "healthy" band, not the average — treat it as an optimistic-to-base assumption, not a floor.
- **CAC benchmarks ($250–$1,500 depending on source) imply payback is fast relative to an $11,500 average job** — even at the high end, CAC is under 15% of job value, comfortably inside the "under 10%" scalability heuristic some sources cite, though sources vary widely and none are primary/audited.
- **Suffolk's market fundamentals support meaningful reroof demand:** ~580,772 housing units, 79.7% detached single-family, median structure built 1970 (i.e., median home is ~56 years old, well past 1–2 full roof-replacement cycles), median home value ~$578K–$626K depending on source/year. This is a mature, roof-replacement-driven market, not a new-construction one.
- **Wind/hail-driven insurance claims are roughly half of all U.S. residential roofing claims by dollar volume ($31B of national claims in 2024)** — but NY specifically restricts contractors from participating in claims adjustment/negotiation (§771-B) and bans deductible-waiver marketing, which limits how aggressively an insurance-claims funnel can be built without a public-adjuster license or a referral partner.
- **NY workers' comp for roofers is among the most expensive in the country** ($9.90–$15.25 per $100 of payroll cited); typical small-to-mid roofing GL runs ~$500–$3,000/yr, workers' comp $3,000–$10,000/yr. This is a real cost input for Branch A/B viability analysis, not just a compliance checkbox.
- **I could not verify Premium Roofing Solutions' Suffolk license status.** The county's public license-search tool (ca.suffolkcountyny.gov/dcasearch) returned HTTP 403 to automated fetch — it exists and is described as a legitimate public lookup, but requires a human to query it interactively. This is an open action item, not a dead end.
- **Roofing season peaks are spring (Apr–Jun, ~35% of annual revenue per one source) and early fall (Sep–Oct), with a hard slow season Nov–Mar** driven by adhesive/sealant temperature minimums (~40°F). This roughly confirms the baseline's Jul–Aug backlog + Oct–Apr storm framing but adds nuance: spring, not just summer, is a major revenue period, and winter is not "storm season" so much as "leak-repair and slow season" with periodic nor'easter spikes.

## 2. LICENSING — DEEP DIVE

### Suffolk County Home Improvement Contractor License
- Issued by Suffolk County Division of Consumer Affairs (Dept. of Labor, Licensing & Consumer Affairs), Suffolk County Code Chapter 563, Article II — applies to **all Suffolk towns except Southampton, East Hampton, and Shelter Island**, which license separately.
- Application requires: completed application, passport photo, proof of identity, business registration/address, and passing a written exam.
- Fees found: license fee **$25** in specific even/odd-year filing windows (fee schedule is date-dependent — verify current schedule directly, this figure came from a secondary source, not eCode360), exam fee **$50**, Home Improvement Trust Fund enrollment **$200**.
- Bond/trust alternative: **$20,000 surety bond OR $200 trust fund enrollment** (contractor's choice, per secondary sources — verify against current code).
- Insurance minimums: **general liability $500,000** (bodily injury + property damage combined per some sources), workers' comp certificate (or exemption).
- Other statutory hooks confirmed from the baseline and re-verified: §563-17A (established NY place of business), §563-17B (written exam), §563-17C (insurance proof), §563-17J (current on child support), §563-15.1A (license #, business name, address, phone, servicing employee name required on every contract/receipt), §563-5(A) (advertising under an unlicensed/unfiled DBA is itself a violation).
- **Public lookup exists**: `ca.suffolkcountyny.gov/dcasearch`. Confirmed as a real tool via search snippets (license-type search returns license data only, not complaints). WebFetch to it returned 403 — could not query it programmatically in this session. **Action item:** a human needs to manually search "Premium Roofing" / "Premium Roofing Solutions" there to resolve the Branch A license question.

### Nassau County Home Improvement License
- Separate licensing regime via Nassau County Office of Consumer Affairs (Rules & Regulations Relating to the Home Improvement Business).
- Nassau §2(a)/(b) (confirmed in baseline) requires license number and exact licensed business name on all display advertising and promotional literature.
- Insurance: liability/property-damage and workers' comp required, with exact minimums specified on a separate OCA sheet — I could not obtain the exact dollar figures from public search results; this needs a direct Nassau OCA document pull.
- Bond requirements exist "in some cases," with cost tied to credit score and bond amount — exact conditions not confirmed from public sources in this pass.

### Town/village licensing within Suffolk — the constraint that matters most for site scope
- **Confirmed exclusions from the county license:** Southampton, East Hampton, and Shelter Island each require **their own separate Home Improvement Contractor's License**, and per NY construction-law commentary, this applies **even when the contractor already holds a valid Suffolk County license** ("You May Need More than a Suffolk County Home Improvement Contractor License" — nyconstructionlaw.com).
- Southampton's own code (Town of Southampton, NY, Licensing of Home Improvement Contractors, ecode360) confirms roofing is explicitly within scope of its local licensing; application package includes GL/workers' comp certificates and a notarized letter regarding workers' comp coverage for hires.
- East Hampton has its own Chapter 107 (Contractors, Home Improvement and Contractor Registry) with its own application (ehamptonny.gov Contractor's License PDF).
- Southold was not found to require a *separate* home-improvement license beyond Suffolk County's, but does have its own building-permit process and, per secondary sources, scenic-overlay/environmental-sensitivity zones near coastal wetlands that can affect roof-replacement approvals — this needs direct confirmation from Southold's code, not just secondary-source description.
- **Practical implication for the build:** the site can safely advertise/serve Huntington, Smithtown, Islip, Brookhaven, Babylon, Riverhead under a Suffolk County license alone. Advertising services in **Southampton, East Hampton, or Shelter Island requires a separate town license first** — this is a go/no-go gate for including those towns in the launch town-page set, not just a content nuance.
- The baseline's "case law is mixed — an East Hampton town license was found sufficient in one case; a Southampton town license was found insufficient without county licensing in a more recent one" reflects a genuinely unsettled area; I found the general commentary (nyconstructionlaw.com) confirming towns *can* require their own license on top of the county's, but did not find the specific case citations to independently verify the "mixed" framing — treat that as still open.

### Penalties for unlicensed advertising / operating
- Operating without a required license is commonly a **Class A misdemeanor** in county/municipal statutes, with fines cited in secondary sources at **$500–$5,000 per offense**, civil penalties around **$100/day**, and imprisonment authorized in some statutes. I could not pull the exact Suffolk Code penalty section text directly (secondary-source only) — needs a direct eCode360 pull of the penalties section of Chapter 563 before this is quoted as fact in the SOW.
- Advertising under a name not on file with Suffolk DCA (unfiled DBA) is a distinct violation (§563-5(A)) independent of the underlying license status.

### NY State layer
- No statewide home-improvement contractor license exists in NY; licensing is purely local (county/town/city). This is confirmed across multiple independent sources and matches the baseline.
- Statewide requirements that *do* apply regardless of local licensing: GBL Article 36-A (written contract law, §§770–776) and the roofing-specific GBL §771-B (see §4 below) apply to home improvement contracts statewide, layered on top of whatever local license is required.

## 3. PERMITTING BY TOWN (6+ towns)

All figures below are drawn from secondary sources (permit-guide blog content, town department web pages found via search) — **none are a direct fee-schedule PDF pull except where noted**, so treat dollar figures as directional pending direct confirmation from each town's building department.

| Town | Permit required for reroof? | Typical fee | Typical timeline | Notes |
|---|---|---|---|---|
| Huntington | Yes | Not independently confirmed this pass (baseline cites $400–600 via LI Roofing's own page — vendor-sourced, not primary) | Not confirmed | Check town building dept directly |
| Smithtown | Yes | Not confirmed (fee) | ~1–2 business days for straightforward re-roof | Efficient dept per secondary sources |
| Islip | Yes | Not confirmed (fee) | ~1–3 business days | Standard application: HIC license + insurance cert + scope of work |
| Brookhaven | Yes | ~$150–$300 (one source) vs. ~$200–$400 (another source, 7–14 business days) — sources disagree | 1–4 business days (one source) to 7–14 days (another) | Has an official fee-schedule PDF (brookhavenny.gov/DocumentCenter — Planning Dept fee schedule) that should be pulled directly for the SOW rather than relying on blog secondary sources |
| Babylon | Yes | Fee "based on project value" | ~1–3 business days | Not independently confirmed beyond secondary source |
| Riverhead | Yes (assumed, not directly confirmed) | Not found | Not found | Secondary sources note Eastern Suffolk towns generally carry additional historic-district/ARB layers |
| Southold | Yes | ~$150–$300 (secondary source) | ~7–14 business days | North Fork hamlets (Greenport, Mattituck, Cutchogue, Peconic, Orient, East Marion); scenic-overlay/environmental-sensitivity zones near coastal wetlands may add review steps |
| Southampton (Town) | Yes, plus separate HIC license | Not found | Not found | Village-level Architectural Review Board (ARB) review required for roof material/color changes in historic districts — **not optional** |
| East Hampton | Yes, plus separate HIC license | Not found | Not found | Same ARB/historic-district dynamic as Southampton |

**Bottom line:** across Suffolk, a roofing permit is essentially universal for full reroofs — the general pattern (permit application + HIC license + insurance certificate, 1–4 business days for straightforward jobs in the western/central towns, longer with historic/coastal review on the East End) held across every town checked, but exact current fee schedules were not independently verified from primary town documents in this pass and should be pulled directly (each town publishes a building-permit fee schedule PDF) before publishing them as content on town pages, per Lane D's content-sourcing plan.

## 4. INSURANCE & BONDING

- **General liability:** roofing contractors typically carry **$500,000–$1,000,000+** in coverage; Suffolk County itself requires proof of at least $500,000 combined bodily injury/property damage for licensing. Typical annual premium cited: **~$3,200/yr average ($267/mo)**, with a broader range of **$500–$3,000/yr** depending on revenue/crew size.
- **Workers' compensation:** required by both counties for licensing (or a formal exemption on file). NY roofing-class workers' comp rates are cited as **$9.90–$15.25 per $100 of payroll** — described as among the highest in the country for this trade. Typical small/mid roofing-company annual cost: **$3,000–$10,000/yr**.
- **NY GBL §771-B (roofing-specific)** independently requires roofing contractors to carry, and disclose in every insurance-claim-related contract, **general liability and property damage insurance of at least $100,000 per person / $300,000 per occurrence**, plus provide workers' comp certificates — a statewide floor layered on top of whatever the county license demands.
- **What should be displayed publicly:** license number (legally required, per Suffolk §563-15.1A and Nassau §2), and — as a trust/differentiation play validated by H6 — insurance carrier name/policy limits are not required to be published but doing so (or at minimum stating "$1M+ GL, workers' comp on file, license #X") would exceed every competitor in the baseline set except LI Roofing's license display, since none show insurance figures.
- **Bond:** Suffolk offers a **$20,000 surety bond OR $200 trust-fund enrollment** as licensing alternatives (secondary source — verify against current code before quoting).

## 5. ADVERTISING & CONSUMER LAW

### NY GBL Article 36-A (§§770–776) — general home improvement contract law
- **Written contract required**, signed by all parties, for contracts above the statutory threshold (commonly cited as $500, per secondary sources referencing §771 — the primary text pulled did not restate the dollar threshold explicitly, so confirm directly).
- Mandatory contract contents (confirmed via direct fetch/search of §771 text): contractor name/address/phone/license number; approximate start and completion dates, with a statement on whether a "time is of the essence" completion date has been agreed; description of work and materials (make/model/identifying info); total consideration; **disclosure of any warranty/guarantee terms, or an explicit statement that none is offered**; disclosure of the contractor's property/casualty insurance coverage.
- **3-business-day right of cancellation**: homeowner may cancel until midnight of the third business day after signing; notice by mail is effective on deposit in the mailbox.
- **Deposit/escrow rules (general home improvement, non-roofing):** no statewide flat deposit cap, but any pre-completion payments must go into an **escrow account within 5 business days** of receipt (contractor must disclose the bank within 10 business days), OR the contractor may substitute a bond/indemnity contract/irrevocable letter of credit in lieu of escrow. Progress payments must bear a "reasonable relationship" to work/materials actually delivered.

### NY GBL §771-B — roofing-specific overlay (confirmed by direct fetch, primary source)
This is the single most important compliance finding in this lane and was not in the baseline:
- **Roofing contractors may not require any deposit for work or materials** — materials payment is due only on delivery, and costs must be disclosed in writing in advance.
- **Roofing contractors may not advertise or promise to pay/rebate any portion of an insurance deductible**, nor offer any allowance/discount tied to it, as a sales inducement.
- **Roofing contractors may not perform insurance-claim reporting, adjusting, or negotiation** on a homeowner's behalf, and may not be compensated for referring a homeowner to an entity that does.
- Every roofing contract must disclose the insurer name, coverage type, and policy limits (when a claim is involved).
- Homeowners have a **separate 3-business-day cancellation right** tied specifically to notice that an insurance claim is denied, with mandatory refund of any payments/deposits.
- Insurance minimums restated as **$100,000/person, $300,000/occurrence** GL + property damage.

**Exposure assessment:** any competitor marketing "we'll cover your deductible," "0% down," or acting as a claims intermediary is running legal risk under §771-B, not just an ethics question. The new site should not match "deductible assistance" language and should build its financing/insurance messaging (Lane F consumes this) around compliant framing — no deposits for roofing work, no deductible promises, referral-only (not fee-based) to public adjusters if that path is pursued at all.

### Advertising claims ("#1 rated," "best," unverified reviews)
- FTC's revised Endorsement Guides (16 CFR Part 255, finalized 2023, still current) require **substantiation for superlative claims** like "best" or "#1" — advertisers are liable for deceptive endorsements even when the endorser isn't, and cannot cherry-pick, hide negative reviews, or misrepresent review sourcing.
- Competitors making unqualified "#1 rated" or "best roofer" claims without a named, verifiable third-party ranking source carry FTC exposure; this is a real risk the new site should avoid by sourcing any superlative claim to a specific, checkable award or ranking, or avoiding the framing entirely and leaning on the verifiable license/insurance/review-count trust stack instead.

## 6. INSURANCE-CLAIM ROOFING

- Nationally, **wind and hail damage account for over 50% of residential roofing insurance claims** ($31B nationally in 2024, one source) — storm/insurance work is a large and legitimate channel in principle.
- NY specifically **restricts** contractor involvement in claims: §771-B bars contractors from adjusting/negotiating claims on the homeowner's behalf and from being paid to refer that service; a person doing claims negotiation for compensation must be a **licensed public adjuster** (NY Insurance Law, confirmed via DFS General Counsel opinions 04-06-08 and 11-08-03) or risks being deemed to be practicing law without a license.
- **Deductible waiving/absorption is not permitted to be advertised or promised** under §771-B (this mirrors laws in several other states that criminalize the practice outright — NY's version is a marketing/inducement ban rather than an outright criminal prohibition on the practice itself, based on the text obtained; this distinction should be confirmed with counsel before the SOW asserts it definitively).
- **Recommendation for the site:** build storm/emergency content (validating H4 — Lane B/D territory) around response speed, tarping, and post-storm inspection/documentation help — not around claims negotiation or deductible promises, which cross into legally restricted territory. A referral relationship to an independent, licensed public adjuster (with no compensation flowing back for the referral) is the compliant version of an insurance-claim funnel.
- **Could not determine:** what share of the *Suffolk County* roofing market specifically is insurance-claim-driven (vs. voluntary end-of-life replacement). National wind/hail claim share is not a reliable proxy for a market with a large voluntary-replacement base (median home built 1970, most roofs replaced on an age/wear cycle rather than storm damage) — flagged as insufficient evidence, see §6 (What I Could Not Verify).

## 7. MARKET SIZING & ECONOMICS

### Market sizing
- Suffolk County housing units: **~580,772–582,899** (sources vary slightly by year/vintage of ACS estimate).
- **~79.7% detached single-family homes** → roughly **~460,000–465,000 single-family homes** in Suffolk County.
- **82.2% owner-occupied** of occupied units — most of this SFH stock is owner-occupied, i.e., addressable for a direct-to-homeowner roofing pitch (vs. landlord-owned, which typically defers maintenance).
- **Median structure built ~1970** → median home is **~56 years old** as of 2026. A 20–30 year asphalt shingle lifespan (18–25 years typical on Long Island, shortened to 12–18 years in high salt-exposure coastal zones) means the *median* home has already cycled through 1–2 full roof replacements, and roofing is a recurring, not one-time, demand driver across this stock.
- **Implied annual reroof demand (rough model):** if ~460,000 SFH homes replace roofs on average every ~22 years (midpoint of the 18–25yr asphalt range, ignoring the more durable materials segment), that implies **~21,000 roof replacements/year county-wide** as a steady-state baseline, before accounting for storm-driven acceleration. This is a back-of-envelope estimate, not a demand-model output — it excludes repair-only jobs (a larger volume, lower ticket), commercial/multi-family, and doesn't account for the age-distribution skew (homes built in the 1950s–70s building boom are disproportionately due now). Treat as directional order-of-magnitude, not a forecast.
- Median home value **~$578,400–$626,300** depending on source year — consistent with a market that can absorb an $11–17K replacement without extraordinary financing stress for most owner-occupants, supporting the baseline's job-value assumptions on the value side (see below).

### Pressure-testing the baseline economics
Baseline assumed: 15–40 sessions/town page/month, 3–6% conversion, 30% close, $11,500 avg job.

**Session volume (15–40/town page/month):** No independent traffic-tool data was available in this lane (Lane B/E territory) — cannot confirm or refute directly. Flagged as **out of lane**, not verified here.

**Conversion rate (3–6% claimed):** Sourced benchmarks are wider and generally lower at the average end: **0.5–3% is described as typical/average**, **3–5% as "healthy,"** and **5–8%+ only for optimized or interactive-tool sites** (one source put average roofing site conversion at ~2.8%, rising to 8–15% with an interactive estimate tool). The baseline's 3–6% band is therefore **plausible but sits at the optimistic/top end of "typical,"** not the middle. **This is a partial refutation** — 3–6% should be treated as an achievable target for a well-built, differentiated site (which is the whole thesis of this build), not a market-average assumption.

**Close rate (30% claimed):** Sourced benchmarks: **shared/price-shopped leads close at 5–15%**; **strong teams on paid, exclusive leads close 15–25%**; a separate source cites **30–40% (top performers ~50%) for a "solid sales process,"** generally associated with warmer/referral-quality leads, and **~20% for leads resold to multiple contractors**. **The baseline's 30% is achievable only at the high end of the range and likely requires web leads to be treated as high-intent/exclusive (not shared) with fast, disciplined follow-up** — it is not a safe default assumption for cold organic web leads specifically. Recommend modeling **15–25% as base case**, 30% as optimistic, 10% as conservative.

**Average job value ($11,500):** Broadly consistent with sourced cost guides ($9,000–$15,000 typical, ~$11,500 midpoint; $17,000–$25,000+ for larger/architectural jobs) — **confirmed**, no refutation found, though note all cost-guide sources are competitor-published content (marketing, not audited data) per the baseline's own sourcing.

### Rebuilt economics model — conservative / base / optimistic, arithmetic shown

Assumptions per town page per month, held constant except where noted:

| Input | Conservative | Base | Optimistic |
|---|---|---|---|
| Sessions/page/month (unverified, baseline figure carried forward) | 15 | 25 | 40 |
| Conversion rate (session → lead) | 2% | 4% | 6% |
| Close rate (lead → booked job) | 10% | 20% | 30% |
| Avg job value | $9,500 | $11,500 | $15,000 |

Arithmetic (per town page per month):
- **Conservative:** 15 sessions × 2% = 0.3 leads → × 10% close = 0.03 jobs/month → × $9,500 = **$285/month revenue per page**
- **Base:** 25 sessions × 4% = 1.0 lead → × 20% close = 0.2 jobs/month → × $11,500 = **$2,300/month revenue per page**
- **Optimistic:** 40 sessions × 6% = 2.4 leads → × 30% close = 0.72 jobs/month → × $15,000 = **$10,800/month revenue per page**

**At 15–20 launch town pages** (Lane D's likely range), monthly revenue attributable to town pages alone:
- Conservative: 15 pages × $285 = **~$4,275/month** (~1 job every ~2.2 months across the whole page set — this is a stress-test floor, likely too low to be viable standalone and signals town pages need to be supplemented by other channels, not the sole lead engine)
- Base: 18 pages × $2,300 = **~$41,400/month** (~3.6 jobs/month)
- Optimistic: 18 pages × $10,800 = **~$194,400/month** (~13 jobs/month) — this figure is implausibly high for 18 pages and signals the optimistic inputs are not simultaneously realistic; treat optimistic as an upper bound on any single input, not a compounding scenario.

**Takeaway:** the conservative and optimistic bands are wide enough (roughly 45x apart) that the model's real value is in identifying which lever matters most — **close rate and conversion rate compound multiplicatively, so a 2x swing in either roughly doubles revenue**, while session volume (the input this lane could not independently verify) is the single largest source of uncertainty in the whole model. Lane B/E's traffic data should be used to tighten the session assumption before this model is treated as a planning input.

### CAC and payback
- Sourced CAC benchmarks vary widely: **$250–$750** (one source, "healthy" for a residential roofer), **$600–$1,500** (another), **~$500** in a worked example ($6,000/month spend ÷ 12 closed jobs). No single authoritative figure exists — treat **$500–$1,000 as a reasonable planning band**.
- At $11,500 average job value, even the high end of CAC ($1,000–$1,500) is **under 15% of job value**, inside commonly cited scalability heuristics (CAC <10% of job value ideally; CLV ≥3x CAC).
- **CAC payback period** cited industry-wide as **6–9 months** for a healthy marketing system, with **SEO-specific payback cited at 6–18 months** given the upfront content/technical investment before organic traffic materializes — this matters directly for the build's cash-flow plan: a content-heavy SEO build (the core thesis of this whole project) should be underwritten expecting **little to no organic-lead revenue in months 1–6**, with payback more realistically in the 9–18 month range once content-driven lead flow ramps, not the 6-month figure that applies to paid-lead-driven CAC.
- **No source found that computes CAC/payback specific to a build-investment amount** (i.e., "what does a $30K–$80K website build cost against this CAC model") — that synthesis is a downstream task for the Opus session combining this lane's job-economics with the actual SOW/build cost from other lanes; flagged as out of this lane's scope to complete alone.

## 8. COMPETITIVE OPERATIONS

- **Labor model:** industry-standard is a **small core of W-2 employees** (sales, PM, sometimes a lead installer) plus a **larger network of 1099 subcontractor crews** doing the physical installation — described as one of the most subcontractor-intensive trades in construction. A mid-sized roofer may work with **15–40 different sub crews per year**.
- **The "25% rule":** an informal industry heuristic that subcontracted labor cost shouldn't exceed ~25% of total job cost before margin erosion becomes material — cited by an insurance-industry source, not a regulatory standard.
- **W-2 as differentiation (LI Roofing's stated model):** a mostly-W-2 workforce is described in secondary sources as more defensible from a valuation/quality-control standpoint and lower misclassification risk — this supports the baseline's framing that LI Roofing's W-2 positioning is a real (not just marketing) operational difference, though I found no independent verification of LI Roofing's actual employment mix beyond their own claims.
- **Capacity claim verification (same-day replacement + 6–8 week summer backlog):** I could not independently verify this specific combination as operationally coherent or contradictory — no source directly addresses whether "same-day" and "6–8 week backlog" can coexist for the same company (same-day likely refers to emergency tarping/repair, not full replacement, while backlog applies to full replacement scheduling — this distinction should be made explicit in any marketing copy to avoid an internal contradiction that competitors or regulators could flag as misleading).
- Typical job duration in days: **not found** in sourced material this pass — flagged as unverified; general trade knowledge suggests 1–3 days for a standard single-family asphalt reroof, but no citable source was located.

## 9. SEASONALITY AND CASH FLOW

- **Spring (Apr–Jun)** is cited as the largest seasonal revenue period — one source attributes **~35% of annual roofing revenue** to spring, driven by homeowners assessing winter damage.
- **Fall (Sep–Oct)** is a second peak, ahead of the cold-weather installation cutoff.
- **Summer** brings the highest volume of *storm-driven emergency* demand and the longest wait times, consistent with the baseline's Jul–Aug backlog claim, but is framed by sourced material as an extension of the spring/fall installation peaks plus emergency spikes, not a separate primary revenue driver.
- **Winter (Nov–Mar) is a hard slow season** for full replacement — most roofing sealants/adhesives require **~40°F+ ambient temperature** to bond properly, mechanically restricting installation volume regardless of demand. Winter roofing work skews toward emergency leak repair and tarping, not replacement.
- **This refines, not confirms, the baseline's "Oct–Apr nor'easter" framing:** nor'easter-driven *emergency repair/tarping* demand is real in that window, but *replacement* installation is constrained by temperature through the same period — meaning Oct–Apr is a lead-generation and emergency-repair opportunity window, while actual replacement revenue recognition is more concentrated in the surrounding spring/fall shoulder seasons. **Implication for launch timing:** the baseline's recommendation that storm/emergency content be live before October is still supported (lead capture for the emergency queries doesn't require warm weather), but the site's replacement-focused conversion content and capacity messaging should anticipate revenue landing in spring/fall, not immediately upon a fall/winter launch.

## 3. DECISIONS THIS RESEARCH FORCES

- **DECISION: Which towns can the site legally advertise/serve at launch?**
  Options: (A) Launch with Huntington/Smithtown/Islip/Brookhaven/Babylon/Riverhead/Southold only, deferring Southampton/East Hampton/Shelter Island until a separate town license is obtained; (B) Pursue all three East End town licenses before launch to include them from day one; (C) Include East End town-*content* (SEO value) but withhold active "we serve you" advertising/CTAs there until licensed.
  Recommendation: (A), with (C) as a content-architecture nuance for Lane D — build informational content for East End towns (captures search demand, no advertising-law exposure) but gate active lead-generation CTAs behind licensing status. This preserves near-term legal safety without abandoning East End SEO equity.
  Confidence: Medium (town-exclusion fact is well-sourced; the precise "advertising vs. informational content" legal line was not independently verified against case law).
  Reversibility: Cheap to change later (add towns once licensed).

- **DECISION: How aggressively to build an insurance-claim funnel.**
  Options: (A) Build a full insurance-claims marketing angle (deductible help, claims assistance) — legally risky under §771-B; (B) Build storm/emergency response content without any claims-negotiation or deductible language, with an arms-length referral (no compensation) to a licensed public adjuster; (C) Avoid insurance-claim messaging entirely and compete purely on voluntary replacement + emergency repair.
  Recommendation: (B). It captures the real storm-driven demand documented in §6 without the §771-B exposure that (A) carries, and doesn't leave the fairly large insurance-claim-adjacent search/customer segment (documented nationally, though not independently sized for Suffolk) entirely uncaptured as (C) would.
  Confidence: Medium (statute is clear; optimal compliant marketing framing needs counsel review before finalizing copy).
  Reversibility: Cheap to change later (copy/positioning change, not structural).

- **DECISION: Which close-rate and conversion-rate assumptions to underwrite the build business case with.**
  Options: (A) Keep the baseline's 3–6%/30% assumptions; (B) Adopt this lane's base case (4%/20%); (C) Underwrite to the conservative case (2%/10%) and treat anything better as upside.
  Recommendation: (C) for financial planning/go-no-go purposes, (B) as the target the build should be optimizing toward. Underwriting a business case to the optimistic band risks a false-negative decision if actual performance lands in the wide plausible range this research found.
  Recommendation basis: Confidence: Medium (based on multiple converging but non-primary industry sources, not Suffolk-specific audited data).
  Reversibility: Cheap to change later (a modeling assumption, not a structural commitment) — but expensive in trust if used to set investor/owner expectations too high upfront.

- **DECISION: Whether to independently verify Premium Roofing Solutions' license status before Branch A decision.**
  Options: (A) Manually query ca.suffolkcountyny.gov/dcasearch (the public tool exists but blocked automated fetch); (B) Call Suffolk DCA directly (631-853-4600); (C) Proceed with Branch A/B decision without resolving this, treating "no published license number" as sufficient evidence of non-compliance regardless of actual registration status.
  Recommendation: (A) or (B) — this is a fast, low-cost, high-value verification given how much it affects Branch A's viability (baseline already flags this as a red flag; confirming absence of a valid license would be decisive).
  Confidence: High that the tool/phone number are legitimate verification paths; Low on Premium's actual status (unresolved).
  Reversibility: One-way informational gate — doesn't change anything itself, but downstream Branch A/B decision should not be finalized without it.

## 4. HYPOTHESES TESTED

- **H4 (storm season is the opportunity): PARTIALLY CONFIRMED.** Storm/emergency lead generation is genuinely underserved (consistent with the baseline's SERP finding of weak, fragmented results) and nationally wind/hail claims are a large claims category. But full-replacement *revenue* is temperature-constrained to spring/fall, not the Oct–Apr window itself — so storm season is real as a **lead-capture and emergency-repair opportunity**, not as a year-round replacement-revenue opportunity. The "highest-margin" claim in the baseline was not independently substantiated in this lane — no source compared emergency-repair margins to standard-replacement margins.
- **H6 (compliance as differentiator): CONFIRMED, and stronger than the baseline framing.** Not only is license-number display a differentiator (only 1 of 7 competitors do it, per baseline), but §771-B compliance itself (no-deposit policy, no deductible-waiver promises, transparent insurance disclosure) is a legitimate marketing asset precisely because several competitors' financing/insurance-claim language likely brushes against or violates it. "We don't just show our license number, we're built to be fully compliant with NY's roofing-specific consumer protection law" is a defensible, differentiated trust claim with no legal downside.
- **Economics underlying H1–H7 broadly: PARTIALLY REFUTED on close rate, PARTIALLY CONFIRMED on conversion rate and job value.** See §7 for the full rebuild. The baseline's numbers are not fabricated but sit at the favorable end of sourced ranges rather than the middle — the strategic conclusions built on them (e.g., "depth beats volume," H2) are not undermined by this, since depth plausibly pushes conversion toward the top of the range, but the raw revenue projections in any pro forma should use the conservative/base bands here, not the baseline's numbers directly.

## 5. CONFIDENCE LEDGER

| Finding | Confidence | Basis | What would raise confidence |
|---|---|---|---|
| Southampton/East Hampton/Shelter Island require separate town licenses | High | Confirmed via each town's own code/site (ecode360, ehamptonny.gov, southamptontownny.gov) plus independent legal commentary | Direct read of the specific "must have both" case law citation |
| GBL §771-B roofing-specific provisions (no deposit, no deductible promises, claims-adjustment ban) | High | Direct fetch of nysenate.gov primary statute text | None needed — primary source |
| GBL §771 written-contract/cancellation requirements | High | Direct search results quoting justia.com/nysenate.gov primary text | Direct fetch of full current-year text |
| Suffolk license fees ($25/$50/$200/$20K bond) | Low-Medium | Secondary source only (not eCode360 fee schedule directly) | Direct pull of current Suffolk fee schedule PDF |
| Suffolk/Nassau exact insurance minimums | Medium (Suffolk $500K), Low (Nassau, no figure found) | Secondary sources, partially corroborated across multiple hits | Direct county fee-schedule/regulation PDF pull |
| Town permit fees (Brookhaven, Babylon, Islip, Southold specifics) | Low | Blog/secondary sources, internally inconsistent (Brookhaven fee ranges conflicted between two sources) | Direct pull of each town's official fee schedule |
| Suffolk market sizing (580K units, 79.7% SFH, 82.2% owner-occ, median built 1970) | Medium-High | Census-derived secondary aggregators (Point2Homes, USA.com, Census QuickFacts referenced) not a direct Census API pull | Direct ACS table pull via data.census.gov |
| Conversion-rate benchmarks (0.5–8%) | Medium | Multiple industry (vendor/SEO-agency) blog sources, consistent directionally, not primary data | Access to a real analytics platform with roofing-vertical benchmark data (e.g., an actual GA4 dataset) |
| Close-rate benchmarks (5–40%) | Medium | Industry blog/vendor sources (Ghostrep, ProLine — same as baseline's own sourcing) | Independent, non-vendor survey data (e.g., NRCA or a marketing research firm) |
| CAC benchmarks ($250–$1,500) | Low-Medium | Wide range across vendor sources, no primary/audited data | A real contractor's actual marketing P&L |
| Wind/hail = 50%+ of national roofing claims | Medium | Single cited statistic from a roofing-company blog, not an insurance-industry primary report (III, NAIC) | Pull from Insurance Information Institute or NAIC directly |
| Premium Roofing Solutions Suffolk license status | Insufficient evidence | County lookup tool blocked automated access | Manual query of ca.suffolkcountyny.gov/dcasearch or a call to Suffolk DCA |
| Seasonality (spring 35% of revenue, winter 40°F cutoff) | Medium | Secondary industry sources, directionally consistent with general roofing-trade knowledge | Suffolk/LI-specific contractor survey data, not national |

## 6. WHAT I COULD NOT VERIFY

- **Suffolk County's current, authoritative fee schedule and bond/insurance figures** — only secondary-source figures were obtained; a direct eCode360/Suffolk DCA PDF pull is needed before the SOW quotes exact dollar amounts.
- **Nassau County's exact insurance minimums** — described as existing on a separate OCA sheet, which was not located/fetched.
- **Premium Roofing Solutions' actual Suffolk license status** — the public lookup tool (ca.suffolkcountyny.gov/dcasearch) returned HTTP 403 to WebFetch; this needs a human to query interactively or a phone call to Suffolk DCA (631-853-4600).
- **Exact, current per-town permit fees and inspection requirements for Huntington, Riverhead, Southampton, and East Hampton specifically** — either not found, or found only via inconsistent secondary sources (Brookhaven's fee figures conflicted between two sources).
- **Whether the baseline's "case law is mixed" claim on town vs. county licensing sufficiency has a specific, citable case** — general commentary confirms towns can require their own license, but the specific East Hampton/Southampton case outcomes referenced in the baseline were not independently located.
- **Suffolk-County-specific (not national) share of roofing jobs that are insurance-claim-driven** — no source addressed this at the county or even state level; national wind/hail claim-share statistics are not a safe proxy given Suffolk's older, replacement-cycle-driven housing stock.
- **Typical job duration in days for a standard SFH reroof** — not found in any source consulted this pass.
- **Independent, non-vendor verification of session volume (15–40/town page/month)** — out of this lane's scope (Lane B/E) and not attempted.
- **A direct build-cost-to-CAC-payback model** — requires the actual SOW/build cost figure from other lanes, not available to this lane.

## 7. CONTRADICTIONS WITH THE BASELINE

- Baseline (§4, close rate): *"Close rate, solid sales process: 30–40% (top performers ~50%)"* — sourced to ProLine Roofing CRM. My research found a wider, generally lower range for **web-lead-specific** close rates: 5–15% for shared/price-shopped leads, 15–25% for strong teams on exclusive paid leads. **This is not a flat contradiction** (ProLine's 30-40% figure likely reflects a blended book including referrals, not pure web-lead conversion) but the baseline applies the 30% figure to a *web-lead economics model* where it is optimistic. The baseline should be read as an upper bound, not a base case, for the specific "15–40 sessions → 30% close" funnel it constructs.
- Baseline (§4, conversion): baseline states 3–6% session-to-lead conversion as an apparent working assumption (implied by the brief's own framing in Lane G's brief, "3-6% conversion"). Sourced benchmarks put **average** roofing site conversion lower (0.5–3%), with 3-6% achievable only for above-average/optimized sites. Not a contradiction of fact, but a contradiction of where in the distribution the number sits — the baseline implicitly assumes an above-average site from day one.
- Baseline (§3, "county license does not automatically satisfy town/village licensing... case law is mixed"): my research corroborates the general principle (confirmed independently) but could not locate the specific case citations the baseline implies exist. I neither confirm nor refute the "mixed" characterization — flagged as unresolved rather than contradicted.
- No other direct contradictions found; most of this lane's work extends rather than overturns the baseline's compliance and economics sections.

## 8. SOURCES

**Primary / legal:**
- [NY GBL §771-B, Responsibilities of Roofing Contractors — nysenate.gov](https://www.nysenate.gov/legislation/laws/GBS/771-B) — primary statute text, fetched directly.
- [NY GBL §771, Home Improvement Contract Provisions — nysenate.gov](https://www.nysenate.gov/legislation/laws/GBS/771) — primary statute, referenced via search.
- [2015/2021/2022/2025 NY Laws, GBS Article 36-A §771 — Justia](https://law.justia.com/codes/new-york/2015/gbs/article-36-a/771) — primary statute mirror, multiple year versions.
- [DFS OGC Opinion 04-06-08: Public Adjusters](https://www.dfs.ny.gov/insurance/ogco2004/rg040608.htm) — primary NY regulator guidance.
- [DFS OGC Opinion 11-08-03: Acting as a Public Adjuster Without a License](https://www.dfs.ny.gov/insurance/ogco2011/rg110803.htm) — primary NY regulator guidance.
- [Chapter 564: Licensing — Suffolk County, NY (eCode360)](https://ecode360.com/16061997) — primary code.
- [Article II: Home Improvement Contractors — Suffolk County, NY (eCode360)](https://ecode360.com/14947425) — primary code.
- [Suffolk County DCA — Search Licenses and Complaints](https://ca.suffolkcountyny.gov/dcasearch) — primary public tool; description obtained via search snippet, direct fetch blocked (403).
- [Suffolk County Division of Consumer Affairs](https://www.suffolkcountyny.gov/Departments/Consumer-Affairs) — primary agency page.
- [Town of Southampton, NY: Licensing of Home Improvement Contractors (eCode360)](https://ecode360.com/8695061) — primary code.
- [Town of East Hampton, Chapter 107: Contractors, Home Improvement (eCode360)](https://ecode360.com/8382656) — primary code.
- [16 CFR Part 255 — FTC Guides Concerning Endorsements and Testimonials (eCFR)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255) — primary federal regulation.
- [U.S. Census Bureau QuickFacts: Suffolk County, New York](https://www.census.gov/quickfacts/fact/table/suffolkcountynewyork/PST045222) — primary census data (via search snippet).

**Government/secondary but authoritative:**
- [Nassau County Home Improvement License Costs Guide — godesignspace.com](https://godesignspace.com/nassau-county-home-improvement-license-costs-guide/) — third-party summary, not primary Nassau OCA doc.
- [NY Construction Law: You May Need More than a Suffolk County Home Improvement Contractor License](https://www.nyconstructionlaw.com/suffolk-county-home-improvement-license/) — law-firm commentary, generally reliable but not primary code.
- [Town of Brookhaven, Planning Department Fee Schedule (PDF)](https://www.brookhavenny.gov/DocumentCenter/View/10185/Planning-Department-Fee-Schedule-PDF) — primary but not directly fetched/read in full this pass, only surfaced via search.

**Market/vendor/SEO-industry content (marketing, not audited data — labeled as such):**
- [Ghostrep: Roofing Website Conversion Rate 2026 Benchmarks](https://www.ghostrep.ai/blog/roofing-website-conversion-rate) — vendor blog.
- [Ghostrep: Roofing Lead Cost Benchmarks 2026](https://www.ghostrep.ai/blog/roofing-lead-cost-benchmarks) — vendor blog.
- [Rich's Construction: Vetting a Roofing Contractor — Suffolk County's Financial Guide](https://www.richs-construction.com/?p=7231) — competitor-published, marketing content.
- [Rich's Construction: Roof Repair Cost Breakdown Suffolk County](https://www.richs-construction.com/roof-repair-cost-breakdown-suffolk-county/) — competitor-published.
- [Rich's Construction: Licensed Roofing Company Requirements in Suffolk County](https://www.richs-construction.com/licensed-roofing-company-requirements-in-suffolk-county-ny/) — competitor-published.
- [Long Island Exterior Co.: Roof Replacement Permits in Suffolk County](https://www.longislandexteriorco.com/blog/roof-permit-suffolk-county) — vendor blog, cited for town permit patterns.
- [ERS Roofing & Siding: Roofing Permits on Long Island](https://www.ersroofingservices.com/blog/roofing-permits-long-island) — vendor blog.
- [subcontractorhub.com: Customer Acquisition Cost Calculator](https://www.subcontractorhub.com/tools/customer-acquisition-cost-calculator) — vendor tool/blog.
- [JobNimbus: 7 KPIs Every Contractor Should Watch](https://www.jobnimbus.com/blog/7-kpis-every-contractor-should-watch-to-grow-marketing-roi) — vendor blog (CRM company).
- [WexfordIns: Are Subcontractors Riskier Than W-2 Crews in Roofing?](https://www.wexfordins.com/post/subcontractors-vs-w2-crews-risk-roofing-business) — insurance-vendor blog.
- [ContractorTalk forum thread: Roofing labor, subbed out vs W2](https://www.contractortalk.com/threads/roofing-labor-subbed-out-vs-employees-w2.422925/) — practitioner forum, anecdotal.
- [Point2Homes: Suffolk County NY Demographics](https://www.point2homes.com/US/Neighborhood/NY/Suffolk-County-Demographics.html) — data aggregator, census-derived.
- [USA.com: Suffolk County NY Housing](http://www.usa.com/suffolk-county-ny-housing.htm) — data aggregator.
- [ServiceTitan: When is the Slow Season for Roofing](https://www.servicetitan.com/blog/roofing-slow-season) — vendor (field-service software) blog.
- [JobNimbus: When Is the Slow Season for Roofing Replacements](https://www.jobnimbus.com/blog/roofing-slow-season) — vendor blog.
- [Insureon: Roofing Insurance Cost](https://www.insureon.com/construction-contracting-business-insurance/roofing/cost) — insurance-vendor quote source.
- [WorkersCompensationShop.com: Roofing Workers' Compensation Insurance](https://www.workerscompensationshop.com/workers-comp-programs/roofing-insurance) — insurance-vendor content.

**Note on method:** all findings above came from WebSearch result snippets and two WebFetch calls (one successful primary-source fetch of GBL §771-B text; one blocked, 403, on the Suffolk DCA license search tool). No bash/curl was used to fetch any URL, per the output contract.
