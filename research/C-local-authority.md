# C — Local SEO, Map Pack, Citations & Link Authority
**Agent:** Claude (Sonnet 5) · **Date run:** 2026-08-01 · **Sources consulted:** ~35 (WebSearch queries + WebFetch attempts)

## 1. EXECUTIVE FINDINGS

- **Google's map UI genuinely resists automation** — WebSearch and WebFetch cannot render an actual live 3-pack (no lat/lng-anchored SERP, no map tile). Every "map pack composition" claim below is inferred from organic SERP results, BBB/Angi/Yelp aggregator listings, and companies' own review-count claims — not a screenshot of a real pack. This is a hard method limit; treat §2 as directional, not measured.
- **Review count "table stakes" is lower than the baseline implies.** Industry benchmarks say local packs' top 3 average ~561 reviews, but businesses clearing just **50 reviews are ~3x more likely to appear in the map pack**, and a 4.6★/280-review contractor with fast, recent activity beats a 4.9★/18-review one. The baseline's 140–312 range for Suffolk leaders (LI Roofing 312+, Perfect Pitch 140) is consistent with this — it's a competitive-market number, not an absolute Google threshold. A new brand needs velocity toward 100+ within year one, not toward the "561 average," to be map-pack-competitive locally.
- **SAB (service-area business) profiles rank from a hidden physical address, not from the service-area list.** Proximity to the *verified* address drives ranking; naming 20 Suffolk towns as a service area does not make you competitive in all 20 — you rank best near your actual base and progressively worse with distance. Google actively suppresses profiles whose claimed service area looks implausible relative to review geography and business size. This is a material finding for Branch A vs. B: a Nassau-based Branch-A address structurally disadvantages Suffolk town rankings versus a Suffolk-based Branch-B address.
- **Google's review-gating policy tightened materially in April 2026** — routing customers differently based on expected sentiment (survey-then-gate) is now explicitly banned and being actively enforced with retroactive review removal and warning letters. Compliant pattern: send the identical review ask to every customer; run satisfaction triage as a *parallel*, not *gating*, channel.
- **FTC's Consumer Review Rule (effective Oct 21, 2024) bans incentives conditioned on positive sentiment**, express or implied — a $5-off-for-any-review is fine; $5-off-for-a-5-star is not. This directly constrains any review-tooling workflow.
- **Google Guaranteed / LSA is achievable and moderately priced for this market**: roofing LSA leads run roughly **$40–$120/lead** (broad home-services range $30–$80, roofing skews higher), cheaper than standard Google Ads CPL ($60–$200). Setup requires a 2–5 week background-check/license/insurance verification cycle — this has lead time and should start well before any storm-season launch push.
- **The definitive Long Island citation list is not GAF/Angi/Houzz — it's the hyperlocal layer**, and it's thin from search alone: individual town chambers of commerce (Huntington, Smithtown, Islip confirmed with addresses), Patch's free local business directory, and the Suffolk County DCA's own public license-lookup portal (`ca.suffolkcountyny.gov/dcasearch`) which doubles as a trust-verification tool for consumers. Houzz has materially de-prioritized lead-gen in favor of its Houzz Pro SaaS product (~40% workforce cut over six years); Porch pivoted to insurance (67% of revenue) and its directory is now "an afterthought" — both are lower-value citations than the baseline likely assumes.
- **Backlink profiles could not be measured.** Every free/WebFetch-accessible backlink tool (openlinkprofiler.org, seoreviewtools.com, Ahrefs/Semrush free checkers) requires interactive JS-driven queries that WebFetch cannot execute — all attempts returned tool documentation, not data, or 404s. This is a full method failure for the #5 scope item; see §6.
- **Nextdoor is plausibly high-leverage but the numbers are vendor-sourced and unverifiable**: claims of "5–15 calls per recommendation" and "25 recommendations = owning a neighborhood" come from reputation-management marketing content (Podium/Birdeye/TrueReview), not independent data. Treat directionally, not as fact.
- **"Best of Long Island" (bestoflongisland.com, FourLeaf-sponsored) is a real, active, large-scale annual award** (1.3M+ votes in the most recent cycle, hundreds of categories, run by Long Island Press) — a legitimate, low-cost hyperlocal trust/PR asset with a defined nomination window (Jan 1–Aug 31) and voting window (Oct 1–Dec 15).

## 2. MAP PACK COMPOSITION — METHOD AND FINDINGS

**Method and limits (stated up front):** Google Maps' pack is rendered client-side from geolocated data that neither WebSearch nor WebFetch can reproduce — there is no way to fetch "the actual 3-pack for [query] as seen from a searcher physically in Huntington." What follows is reconstructed from (a) organic SERP results for `"[service]" "[town] NY"` queries, which surface company location pages and aggregator category pages that themselves list the businesses Google's local index considers relevant to that town, and (b) BBB's own directory (which lists city-level address per contractor and is fetchable). This is a proxy for pack composition, not a measurement of it. No review counts or star ratings below are independently verified against a live Google listing — they are as self-reported on the company's own site or as summarized by an aggregator page, consistent with the baseline's own caveat.

Towns checked (12): Huntington, Smithtown, Bay Shore/Islip, Patchogue, Babylon/Lindenhurst, Riverhead, Southampton, East Hampton, Commack, Port Jefferson, Coram, West Islip (via Islip BBB pull).

| Town | Companies surfacing (organic + directory) | Address-in-town pattern | Notes |
|---|---|---|---|
| Huntington | Clearview Roofing (55+ yrs), Perfect Pitch, Rapid Roofing (110+ reviews claimed), Bumble, Tascone Contracting, SW Roofing of Huntington, Triple Crown Exteriors | Mixed — several run county-wide town-page networks (Rapid, Bumble) whose actual office is not in Huntington; SW Roofing and Tascone read as locally based | Consistent with baseline: doorway-page operators (Rapid, Bumble, Valor) surface everywhere regardless of true location |
| Smithtown | County Roofing Systems (35+ yrs, claims local base though baseline notes ~9 town pages "none in Suffolk" for its own office), PJ Fitzpatrick (multi-state, not Suffolk-based), Bumble, Rapid Roofing, Level Up Roofing & Chimney, Valor | Same pattern — large multi-state (PJ Fitzpatrick) and franchise/network players (Bumble) surface without being physically local | |
| Bay Shore / Islip | BBB-listed with confirmed addresses: Ed Murray Roofing (Islip), JAGG Roofing (Central Islip), Kalco RG Services (West Islip), Roof Pro Inc (Bay Shore), Babe Roof Corp (Deer Park); also Rapid Roofing (240+ reviews claimed), Valor, Chief Cornerstone | BBB set is genuinely address-in-town; Rapid/Valor overlay from outside | HomeAdvisor aggregate: 4.7★ / 5,236 reviews across 82 pros for Bay Shore category — a market-level, not single-business, number |
| Patchogue | Bill Court Roofing (5.0★, owner-operated, 30+ yrs — reads as genuinely local), Right Angle Roofing & Siding (A+ BBB, GAF Master Elite, "5-star" self-claimed, 18 reviews, 92% recommend), County Roofing Systems, suffolkroofingandsiding.com (self-styled "best Google-rated on LI," GAF Master Elite, unverified) | Bill Court and Right Angle appear address-local; larger players overlay | |
| Babylon / Lindenhurst | Clearview Roofing & Construction (base appears Babylon-area, serves Amityville/Lindenhurst/Copiague), two BBB-listed Lindenhurst addresses (unnamed in snippet), Rapid Roofing (110+ reviews claimed) | Clearview reads locally rooted; Rapid overlays | |
| Riverhead | Rapid Roofing/Rapid Restore (180+ reviews claimed, "top rated in Town of Riverhead" self-claim), Valor, M. Stevens Roofing (Southampton-based, family-owned), Supreme Roofing & Chimney | Thin — East End towns show fewer distinct local operators than western Suffolk in these results | |
| Southampton | M. Stevens Roofing (South Hampton-based, family owned/insured), BBB-listed addresses at Southampton and Jamesport | Genuinely local set is small | |
| East Hampton | Quality Roofing And Chimney Inc (East Hampton-based, self-styled "premier choice"), BBB accredited list | Thinnest market of the 12 checked — fewest named companies at all | |
| Commack | Four Seasons Roofing (locally described), Universal Roofing & Chimney, Rapid Roofing, Long Island Roofing & Siding (GAF certified, 20+ yrs) | Mixed | |
| Port Jefferson / Coram | Long Island Roofing & Siding surfaces heavily across both (network of town landing pages, base unclear) | Network-page pattern again | |

**Pattern observed (consistent with baseline §2 "page-count vs. depth split"):** the same handful of high-page-count operators (Rapid Roofing/Rapid Restore, Valor, Bumble, County Roofing, PJ Fitzpatrick) appear across nearly every town search regardless of whether their true office sits in that town, while a distinct layer of small, single-location, address-verifiable operators (Bill Court in Patchogue, M. Stevens in Southampton, Quality Roofing in East Hampton, Roof Pro in Bay Shore) shows up only in their home town. This is exactly the proximity-vs.-doorway-page tension the baseline flags — it cannot be resolved into "who actually wins the 3-pack" without a live, geolocated map render, which was not achievable with available tools.

**What would raise confidence:** a tool or manual check that renders Google Maps from a spoofed/real location in each town (e.g., a local rank-tracker service like BrightLocal, Whitespark, or LocalFalcon — none free, none reachable via WebFetch/WebSearch).

## 3. GBP STRATEGY (SAB vs. STOREFRONT), REVIEW VELOCITY, AND LSA

**SAB vs. storefront (2026):**
- SAB ranking is driven by a hidden, Google-verified physical address; the public "service area" list (up to 20 cities/postal codes) does not itself confer ranking — it only sets consumer expectations and eligibility to show as relevant to a search in that area. Google explicitly recommends service radius not exceed roughly a 2-hour drive from the verified base, and can suppress profiles whose claimed radius looks implausible against business size and review geography.
- Practical implication: an SAB **can** appear in a town's map pack without an address there, but its ranking strength decays with distance from the true base — a Huntington-based SAB will realistically compete in Huntington/Melville/Cold Spring Harbor/Northport, weaken by Smithtown, and likely not be competitive by Riverhead/East End without a second, separately-verified location or genuinely strong review signal offsetting proximity.
- Misclassification risk: listing a shared office or virtual address as a storefront (rather than correctly as SAB with hidden address) is flagged as a leading suspension cause for home-services profiles. This is directly relevant to Branch A — Premium Roofing Solutions' listed address (825 East Gate Blvd, Garden City, a shared office building per the baseline) would be a liability if used as a storefront-type GBP.

**GBP levers that move rankings in 2026 (per current SEO-industry analysis, not Google-published data — flagged as such):**
- Category selection is claimed as the single largest sub-factor within GBP profile signals (~32% of total local-pack weight per one industry source); correct primary + secondary category selection is claimed to produce materially stronger visibility.
- Service list entries and keyword-rich service descriptions are claimed to drive more website click-throughs.
- Photos are claimed to drive more direction requests and site clicks; profile completeness overall is claimed to correlate with more visits.
- Google's Q&A feature has been **discontinued and replaced by "Ask Maps,"** an AI answer feature — Q&A optimization as a lever is now obsolete; this contradicts any pre-2026 SEO guidance still floating around.
- Posts (weekly cadence) are described as improving click-through in the panel but not directly moving pack position.
- **All of the above percentage figures are from SEO-industry blog content, not Google's own published ranking documentation — label them as claimed correlations, not verified causal weights.**

**Review-gating and FTC compliance (see §1 for the headline):**
- Google: as of Feb–Apr 2026, sentiment-based routing (asking a triage question, then directing only likely-positive respondents to Google) is explicitly prohibited and is being actively enforced, including retroactive removal of reviews and warning letters to businesses.
- Compliant pattern: identical review ask to 100% of customers; separate, parallel low-stakes satisfaction survey (NPS-style) for internal service recovery — never gating the public ask.
- FTC: incentives (discounts, sweepstakes entries, gift cards) for *leaving a review* are fine only if not conditioned, explicitly or implicitly, on sentiment. Effective since Oct 21, 2024; FTC has issued a wave of warning letters into late 2025/2026.

**Review velocity tooling and cost:**
| Tool | Starting price (per location) | Positioning |
|---|---|---|
| NiceJob | ~$75/mo, no contract, 14-day trial | Best fit for owner-operator/small home-services businesses |
| GatherUp | ~$99/mo single location (drops to ~$60/mo at 2–10 locations) | Mid-tier, multi-location friendly |
| Birdeye | ~$299–449/mo, annual contract | Multi-location/enterprise-leaning |
| Podium | ~$399–599/mo base, reported $500–800/mo with add-ons, annual contract | Enterprise-leaning, most expensive |

For a single-location Suffolk launch, **NiceJob or GatherUp are the realistic fit on cost**; Podium/Birdeye pricing is hard to justify pre-revenue. Realistic acquisition rate: industry content references "20+ reviews/month" as the point where automating review requests becomes worthwhile — treat as a soft signal, not a benchmark; no independently-sourced monthly-velocity data was found.

**Google Local Services Ads / Google Guaranteed:**
- Cost: roofing LSA leads ~$40–$120 each, broad home-services range $30–$80 (cheaper than standard Google Ads CPL of $60–$200).
- Requirements: business entity, owner, and field-worker background checks; license verification; insurance verification (general liability + workers' comp); active GBP in good standing. Process takes **2–5 weeks**.
- Google Guaranteed backs jobs up to $2,000 per claim — a genuine trust asset to display, once earned.
- **Launch-phase necessity or later optimization?** Given the 2–5 week lead time and the baseline's October storm-season deadline, LSA enrollment should start immediately upon licensing being finalized — it is a launch-phase prerequisite if the October target is real, not a phase-2 nice-to-have, purely because of setup lag, independent of budget considerations.

## 4. CITATION AND DIRECTORY AUDIT

| Tier | Source | Value / notes |
|---|---|---|
| Must-have, industry | GAF contractor locator, CertainTeed "Find a Pro," Owens Corning locator | Only available once genuinely certified — high-trust, high-relevance, but earned not bought |
| Must-have, general | Google Business Profile, Bing Places, Apple Business Connect, BBB | Foundation-tier NAP consistency; BBB accreditation has a real cost (varies by chapter) |
| Declining value, general | Angi/HomeAdvisor (now merged under Angi Leads, revenue down ~30% from peak), Houzz (pivoted to Houzz Pro SaaS, ~40% workforce cut, lead-gen now secondary), Porch (pivoted to insurance, 67% of revenue; directory is "an afterthought" per industry commentary) | Baseline likely overweights these as "the" citation set — they are legacy citations more than active ranking or lead channels now |
| Still-relevant, general | Thumbtack, Yelp, Networx | Lead-driven, worth a listing; Yelp specifically blocks automated data access (confirmed) |
| Industry-specific | NRCA membership directory ($ cost, ~3,500 members nationally) | Prestige/legitimacy citation, not a strong local ranking channel by itself; no local-SEO-lift data found |
| Hyperlocal — highest marginal value, most under-used | Individual Suffolk chambers of commerce: **Huntington Township Chamber** (164 Main St, Huntington, 631-423-6100), **Smithtown Chamber** (1 W Main St, Smithtown), **Islip Chamber** (53 Moffitt Blvd, Islip, 631-277-5670), plus Babylon (town page lists chambers), Riverhead, Southampton, East Hampton, Greater Patchogue chambers | Real membership fee (typically $150–500/yr per chamber), member directory link, local networking/PR access — this is the layer the baseline under-specifies |
| Hyperlocal — free | Patch.com Long Island business directory (free basic listing), Nextdoor Business Page (free) | Confirmed free-listing mechanisms |
| Hyperlocal — press/PR | Long Island Business News (LIBN, Ronkonkoma-based weekly, BridgeTower Media), Long Island Press | Not a self-serve citation — earned coverage (award wins, press releases, expert commentary) is the access path |
| Hyperlocal — award/PR asset | **Best of Long Island** (bestoflongisland.com, FourLeaf-sponsored, run via Long Island Press) — nominations Jan 1–Aug 31, voting Oct 1–Dec 15, ~1.3M votes last cycle | Real, large, recurring — worth budgeting a nomination push each year once the brand exists |
| Verification / trust, not a marketing citation | **Suffolk County DCA license search** (`ca.suffolkcountyny.gov/dcasearch`) | This is the consumer-facing tool referenced in Lane G — link to it or reference it as a "verify our license" trust element on-site |
| Newsday | No dedicated self-serve business directory found in this research pass — Newsday functions as a news source, not a citation platform, contrary to what the baseline brief implies it might be | Flagged as a gap; a "not found" result, not a negative finding |

## 5. BACKLINK PROFILES OF TOP 5 COMPETITORS — LARGELY UNVERIFIABLE

**What was attempted:** WebSearch for `[competitor domain] backlinks ahrefs`, and WebFetch against openlinkprofiler.org and seoreviewtools.com backlink-checker URLs for liroofingco.com and rapidrestoreny.com.

**What happened:** openlinkprofiler.org returned HTTP 404 for the direct-URL pattern attempted; seoreviewtools.com returned only the tool's static documentation/UI copy, not query results — these tools require interactive form submission and/or JS execution that WebFetch cannot perform. Ahrefs' and Semrush's own free checkers require the same. **No actual backlink, referring-domain, or domain-rating data was obtained for any competitor.** This is a full method failure for this scope item, consistent with the rules ("if WebFetch fails, note it and move on").

**What can be said instead — plausible, replicable link opportunities identified independently (not verified as competitors' actual backlinks, but real, named, obtainable local link sources for a new Suffolk roofing brand):**
- **Named Suffolk chambers of commerce** listed in §4 — each typically links member businesses from a directory page.
- **GAF / CertainTeed / Owens Corning contractor locator pages** — earned via certification, not purchased; a genuine authoritative backlink once achieved.
- **Best of Long Island** (bestoflongisland.com) — nomination/winner pages link back to the business.
- **Local youth sports and school sponsorships** — per general link-building guidance (not LI-specific data), Little League, school booster clubs, and community 5K/charity events commonly list sponsor links; this applies directly to Suffolk town Little Leagues, PTA fundraisers, and high school athletic boosters, which are real, findable, low-cost sponsorship targets (specific organization names were not identified in this pass — would require a town-by-town search, e.g. "Huntington Little League sponsors," which is straightforward but out of scope for this session's budget).
- **Connectively (formerly HARO)** — journalist-request platform; a live, current channel for earning local-news or trade-press mentions/links (e.g., pitching a Newsday or Patch reporter on storm-season roofing advice).
- **Long Island Business News (LIBN)** — earned coverage (op-ed, expert quote, "40 under 40"-style features) rather than a citation buy.

**What would raise confidence:** paid access to Ahrefs, Semrush, or Moz Link Explorer, or a rank-tracking tool with API access, run directly against liroofingco.com, rapidrestoreny.com, countyroofingsystems.com, valorli.com, and perfectpitchroofing.com.

## 6. LOCAL TRUST SIGNALS UNIQUE TO LONG ISLAND

- **Suffolk County DCA license lookup** (`ca.suffolkcountyny.gov/dcasearch`) is a real, public, consumer-facing verification tool — confirmed to exist via the Suffolk County government site. This is the mechanism a homeowner (or Adam, per the baseline's Branch-A verification question) would use to check Premium Roofing Solutions' license status. It should be referenced/linked from the new site's trust page as a "verify us" CTA, since only one of seven baseline competitors (LI Roofing) publishes a license number at all — pairing the number with a direct link to the government lookup is a step further than any competitor takes.
- **Nextdoor**: plausibly meaningful for LI home services per vendor content (Podium, Birdeye, TrueReview all independently position it as high-value for contractors), but every specific number found ("5–15 calls per recommendation," "25 recommendations owns a neighborhood") comes from reputation-management vendor marketing, not independent research — flag as unverified/vendor-sourced.
- **Best of Long Island** — a real, large, recurring hyperlocal award program (see §4), a legitimate trust badge once won.
- **BBB accreditation** appears heavily used by genuinely local single-location Suffolk roofers (Ed Murray, JAGG, Kalco, Roof Pro, Babe Roof, Bill Court, M. Stevens, Quality Roofing) — more consistently than by the doorway-page network operators. This suggests BBB accreditation correlates with (or is a marker of) the smaller, address-verifiable competitor segment, which is worth noting for positioning purposes.
- Local Facebook groups were referenced in the baseline's own SERP snapshot ("LI Roofing & Repair Service" ranking via a Facebook page for "emergency roof repair long island") — independent confirmation that Facebook/community-group presence can occupy real SERP real estate in the softest (emergency) query territory, consistent with Lane B's finding.

## 7. DECISIONS THIS RESEARCH FORCES

- **DECISION: SAB address location for Branch A vs. Branch B.**
  Options: (A) Keep Premium Roofing Solutions' Garden City/Nassau address as the verified GBP base; (B) establish a genuine Suffolk-based address (physical or legally-sufficient) as the GBP base for a new Branch-B brand.
  Recommendation: If Suffolk County map-pack visibility is the primary growth channel (which the whole baseline assumes), a Nassau-anchored SAB structurally under-ranks across most of Suffolk due to proximity decay from the verified address — this is not a cosmetic issue, it is the single biggest lever GBP proximity ranking gives you. Branch B (or a re-anchored Branch A with a real Suffolk address) is strongly preferred on this dimension alone.
  Confidence: Medium (based on consistent, if vendor/SEO-industry-sourced, description of SAB proximity ranking — not Google's own published algorithm).
  Reversibility: Expensive — GBP address changes trigger re-verification and can reset review/ranking history; this should be decided before launch, not adjusted later.

- **DECISION: Review-tooling vendor and workflow.**
  Options: NiceJob (~$75/mo) / GatherUp (~$99/mo) / Birdeye or Podium (~$300–600+/mo).
  Recommendation: NiceJob or GatherUp for a pre-revenue/early-revenue single-location launch; revisit Birdeye/Podium only after multi-location or high review-volume needs emerge. Whichever is chosen, the request workflow must send an identical review ask to 100% of customers (no gating) to stay compliant with Google's April 2026 policy tightening and FTC rules.
  Confidence: Medium (pricing is current vendor-published data; the "right" workflow is confirmed policy, not speculation).
  Reversibility: Cheap to change later (monthly SaaS, no lock-in described).

- **DECISION: LSA/Google Guaranteed enrollment timing.**
  Options: Enroll immediately upon licensing being finalized, vs. treat as phase-2.
  Recommendation: Start enrollment the moment the Suffolk license is issued — the 2–5 week background-check/verification cycle means treating this as "phase 2" risks missing the October storm-season window the baseline itself identifies as the deadline.
  Confidence: High on the timing logic; Medium on the exact 2–5 week figure (vendor-sourced, not Google-published).
  Reversibility: Cheap — LSA is pay-per-lead with no long-term contract, but the *setup lead time* itself is the non-reversible constraint.

- **DECISION: Chamber-of-commerce membership investment.**
  Options: Join 1 (base town) vs. 3–4 (primary service towns) vs. all Suffolk chambers at once.
  Recommendation: Join the chamber in whatever town becomes the verified GBP base first (cheap, ~$150–500/yr, direct backlink + local network access), then expand to 2–3 more of the highest-volume service towns after 6–12 months of revenue, rather than trying to cover all Suffolk chambers pre-launch.
  Confidence: Low-Medium (fee ranges are typical/estimated, not sourced per-chamber from this pass).
  Reversibility: Cheap — annual membership, easy to add or drop.

## 8. HYPOTHESES TESTED

**H1 — The market bar is low.** PARTIALLY CONFIRMED for this lane's scope. Only one of seven baseline competitors displays a license number; review-count table stakes (per current industry benchmarks) is much lower than a naive "561-review average" would suggest (50+ reviews already lifts map-pack odds ~3x) — meaning the operational bar to be map-pack-competitive is genuinely achievable for a new entrant within a year, not a multi-year climb. However, this lane could not independently verify actual current map-pack winners (method limit, §2), so "the bar is low" is confirmed on citation/review-count logic but not confirmed by direct observation of who currently wins.

**H7 — Directory presence is a ranking channel.** CONFIRMED, with a refinement. GAF/CertainTeed/OC locator listings are genuinely earned, authoritative, industry-relevant citations/links. However, several directories the baseline likely assumes are still strong (Houzz, Porch, and to a lesser extent HomeAdvisor/Angi post-split) have measurably de-prioritized their contractor lead-gen/directory function in favor of other business lines — their citation value likely still holds (NAP consistency), but their *ranking-channel* value (as a place that itself surfaces in SERPs, per the baseline's §5 "directory pages occupy significant SERP real estate" finding) is probably declining for Houzz/Porch specifically. BBB, Angi, and Yelp still clearly occupy SERP real estate per this lane's own searches (BBB pages returned directly for every town query run). Recommendation: budget for GBP, BBB, and the hyperlocal chamber/Patch layer as the load-bearing citations; treat Houzz/Porch as low-priority/optional.

## 9. CONFIDENCE LEDGER

| Finding | Confidence | Basis | What would raise confidence |
|---|---|---|---|
| SAB ranks from hidden verified address, not service-area list | Medium-High | Consistent across multiple independent SEO-industry sources; aligns with Google's own publicly stated proximity/relevance/prominence framework | Google's own current Business Profile Help documentation, directly fetched |
| Review count ~50 lifts map-pack odds ~3x; top-3 average ~561 | Low-Medium | Single aggregated SEO-industry-blog claim, uncited primary source | A rank-tracking tool's own published dataset (e.g., BrightLocal Local Search Ranking Factors survey) |
| Google review-gating ban tightened April 2026, active enforcement | Medium | Multiple independent 2026-dated industry articles describe the same policy change consistently | Google's own Prohibited/Restricted Content policy page, directly fetched |
| FTC Consumer Review Rule effective Oct 21 2024, bans conditioned incentives | High | Corroborated by law-firm alerts (Goodwin, Morgan Lewis, Crowell & Moring) and FTC's own site listed in results | Direct fetch of ftc.gov rule text (attempted via search only, not fetched) |
| LSA roofing CPL $40–$120 | Medium | Multiple 2026-dated marketing-agency sources roughly agree | Google's own LSA dashboard data for a live account |
| LSA background-check 2–5 week timeline | Low-Medium | Vendor/agency-sourced, not Google-published | Google's own Local Services Help documentation |
| Map pack composition per town (§2) | Low | Reconstructed from organic SERPs and BBB directory, not a live map render | A geolocated rank tracker (BrightLocal/Whitespark/LocalFalcon) |
| Competitor backlink profiles | None obtained | Tool access failure | Paid Ahrefs/Semrush/Moz API or manual UI access |
| Chamber of commerce addresses/phone (Huntington, Smithtown, Islip) | High | Directly returned from chamber's own listing/US Chamber directory | Direct site visit to confirm current membership fee |
| Best of Long Island program details | High | Directly sourced from bestoflongisland.com and Long Island Press pages in search snippets | Direct fetch of bestoflongisland.com rules page |
| NiceJob/GatherUp/Birdeye/Podium pricing | Medium-High | Multiple 2026-dated comparison sources converge on similar ranges | Vendor pricing pages fetched directly |
| Nextdoor "5-15 calls per recommendation" | Low | Vendor marketing content only (Podium, Birdeye, TrueReview) | Independent case study or Nextdoor's own advertiser data |

## 10. WHAT I COULD NOT VERIFY

- **Live map pack composition for any of the 12 towns.** Tried: WebSearch for town+service queries (returns organic/aggregator results, not the map pack itself), no rank-tracking tool available. Would need: BrightLocal, LocalFalcon, or Whitespark grid-tracking (all paid, none reachable via WebFetch).
- **Actual backlink profiles for any of the five named competitors.** Tried: WebFetch against openlinkprofiler.org (404) and seoreviewtools.com (returned tool UI, not results), WebSearch for domain+"backlinks"+"ahrefs" (returned generic tool explainers, no domain-specific data). Would need: paid Ahrefs/Semrush/Moz account or API key.
- **Whether Google's stated GBP ranking-factor percentages (32% profile signals, 15-17% reviews, etc.) are accurate.** These come from a single SEO-industry blog post cluster, not Google's own documentation. Would need: Google's official Business Profile Help ranking guidance, or a large independent correlation study (e.g., Whitespark/BrightLocal's annual survey).
- **Newsday's own business-directory/citation mechanism**, if one exists — none found in this pass; may exist behind a paywall or sales contact not surfaced by search.
- **Specific named Suffolk youth-sports/school sponsorship link targets** — the general tactic is well-documented, but naming actual Little League/booster-club websites in specific Suffolk towns was out of this session's search budget; a follow-up pass doing town-by-town "[town] Little League sponsors" searches would surface real, named opportunities.

## 11. CONTRADICTIONS WITH THE BASELINE

- The baseline (§5) frames directory presence broadly ("GAF contractor locator, Angi, Yelp, HomeAdvisor, BBB all rank as pages in their own right") as uniformly valuable. This lane's research suggests that framing needs a footnote: **Houzz and Porch have both structurally de-emphasized their contractor-directory/lead-gen function** in 2025–2026 (Houzz toward SaaS, Porch toward insurance), so treating "the directory layer" as one undifferentiated tier overstates two of its members. This does not contradict the baseline's core claim (directories occupy real SERP space — confirmed independently in this lane's own town searches, where BBB pages returned directly for nearly every query), but it refines which directories still deserve budget.
- The baseline's review-count leader figures (140–312, per LI Roofing/Perfect Pitch) read, in light of current industry benchmarks (50 reviews already lifts odds 3x; competitive markets can see winners with far fewer than 561), as **solid but not exceptional** — i.e., the baseline may be slightly over-crediting how hard-won that review position is. This is a nuance, not a refutation.
- No contradiction found regarding the licensing/citation claims (§3 of the baseline) — the Suffolk DCA license-lookup portal's existence (`ca.suffolkcountyny.gov/dcasearch`) actually *strengthens* the baseline's point that license-number display is a real, checkable differentiator, by confirming the public verification mechanism exists.

## 12. SOURCES

**Primary / government:**
- [Suffolk County DCA License and Complaint Search](https://ca.suffolkcountyny.gov/dcasearch)
- [Suffolk County Home Improvement Fact Sheet (PDF)](https://suffolkcountyny.gov/Portals/0/formsdocs/consumeraffairs/CA%20Home%20Improvement%20Fact%20Sheet%202.pdf)
- [FTC — Consumer Reviews and Testimonials Rule Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers)
- [FTC — Warning letter blog post, Dec 2025](https://www.ftc.gov/business-guidance/blog/2025/12/warning-letter-or-ten-businesses-comply-ftcs-consumer-review-rule)
- [Google Local Services — Business screening and verification requirements](https://support.google.com/localservices/answer/12174778)
- [BBB — Roofing Contractors near Islip, NY](https://www.bbb.org/us/ny/islip/category/roofing-contractors) (fetched directly)

**Legal analysis (primary-adjacent):**
- [Goodwin Law — FTC Finalizes Rule on Consumer Reviews and Testimonials](https://www.goodwinlaw.com/en/insights/publications/2024/09/alerts-practices-cldr-ftc-finalizes-rule-on-consumer-reviews)
- [Morgan Lewis — FTC Issues Final Rule on Consumer Reviews and Testimonials](https://www.morganlewis.com/pubs/2024/08/ftc-issues-final-rule-on-consumer-reviews-and-testimonials)
- [Crowell & Moring — Final Rule Announced](https://www.crowell.com/en/insights/client-alerts/final-rule-announced-the-ftc-strengthens-its-enforcement-capacity-against-deceptive-reviews-and-testimonials)
- [Consumer Financial Services Law Monitor — FCC one-to-one consent rule vacated](https://www.consumerfinancialserviceslawmonitor.com/2025/09/fccs-final-rule-on-consent-kills-one-to-one-consent-requirement/)

**Vendor / marketing (labeled as such — used for pricing and directional claims, not fact):**
- [Kukui — Google Changed the Rules on Reviews](https://www.kukui.com/google-changed-the-rules-on-reviews)
- [Birdeye — Review gating in the trust economy](https://birdeye.com/blog/google-birdeye-against-review-gating/)
- [DG Agency — Google Review Policy 2026: What Roofers Need to Know](https://dgagency.co/blog/google-review-policy-2026-changes-roofers)
- [Sterling Sky — Does the Service Area in Your GBP Impact Ranking](https://www.sterlingsky.ca/does-the-service-area-in-google-my-business-impact-ranking/)
- [Ampli5 Pulse — GBP for Service-Area Businesses, 2026 Setup Guide](https://www.ampli5pulse.com/blog/google-business-profile-service-area-business.html)
- [Map Ranks — Google Business Profile Ranking Factors in 2026](https://www.mapranks.com/2026/07/13/google-business-profile-ranking-factors-in-2026/)
- [BizIQ — GBP Optimization Statistics 2026](https://biziq.com/blog/google-business-profile-optimization-statistics/)
- [99calls — Google Ads Lead Costs for Roofing Contractors in 2026](https://99calls.com/blog/google-ads-lead-costs-roofing-contractors)
- [BaaDigi — Google Guaranteed for Contractors 2026](https://www.baadigi.com/blog/google-guaranteed-contractors-guide-2026)
- [Home Service Direct — Google LSA Cost & ROI Calculator 2026](https://www.homeservicedirect.net/google-local-services-ads-cost/)
- [Contractor ToolStack — Podium Review 2026](https://contractortoolstack.com/software/podium/)
- [Contractor ToolStack — NiceJob Review 2026](https://contractortoolstack.com/software/nicejob/)
- [GetApp — NiceJob vs Birdeye Comparison 2026](https://www.getapp.com/marketing-software/a/nicejob/compare/birdeye/)
- [W3Era — Top Home Service Business Directories for 2026](https://www.w3era.com/blog/seo/home-service-business-directories/) (source for Houzz/Porch/Angi pivot claims)
- [GC Sherpa — Best Citation Sources for Construction Businesses in 2026](https://gcsherpa.com/best-citation-sources-for-construction-businesses-in-2026/)
- [The Ad Firm — Local Sponsorship Links That Improve Local SEO Trust](https://www.theadfirm.net/local-sponsorship-links-that-improve-local-seo-trust/)
- [Footbridge Media — Get More Backlinks: 8 Backlink Sources for Home Service Pros](https://www.footbridgemedia.com/marketing-tips/backlinks-for-home-service-pros)
- [Olly Olly — How Many Reviews Do I Need to Start Ranking on Google](https://www.ollyolly.com/blog/how-many-reviews-do-i-need-to-start-ranking-on-google-the-magic-numbers-that-change-everything/)
- [TrueReview — Nextdoor Reviews: The Complete 2026 Guide](https://www.truereview.co/post/nextdoor-reviews)
- [House Escort — Nextdoor Marketing for Home Service Contractors](https://houseescort.com/resources/nextdoor-marketing-for-contractors/)

**Local/hyperlocal (mixed primary and directory):**
- [Long Island Press — 2026 Best of Long Island winners announced](https://www.longislandpress.com/2026/03/04/2026-best-of-long-island-winners-announced/)
- [Best of Long Island — official site](https://www.bestoflongisland.com/)
- [Patch — Long Island, NY Local Directory and Listings](https://patch.com/new-york/longisland/directory)
- [Long Island Business News — Wikipedia entry](https://en.wikipedia.org/wiki/Long_Island_Business_News)
- [Huntington Township Chamber of Commerce listing](https://biz.huntingtonchamber.com/list/member/huntington-township-chamber-of-commerce-3206)
- [US Chamber — Smithtown Chamber Finder](https://www.uschamber.com/co/chambers/new-york/smithtown)
- [Islip — Chambers of Commerce (town government page)](https://islipny.gov/community-and-services/chambers-of-commerce)
- [NRCA — Become a Member / Contractor](https://www.nrca.net/becomeamember/contractor)

**Failed fetches (noted per method rules, not routed around):**
- openlinkprofiler.org/r/liroofingco.com — HTTP 404
- seoreviewtools.com/valuable-backlinks-checker (queried for rapidrestoreny.com) — returned static tool UI, no domain-specific data
