# SYNTHESIS — Suffolk County Residential Roofing Website

**Synthesis lead:** Claude Opus 4.8 · **Date:** 2026-08-01
**Consumer:** `spec-pipeline` (SOW author works from this document; source lanes should not need reopening)
**Inputs resolved:** baseline audit + Lanes A–H (research/ folder, authoritative) + three root supplementary drafts (A/B/F early drafts) + two additional independent keyword lanes (B1-Gemini, B2-Claude)

**Citation key:** `[Lane X]` = research/ folder version (authoritative). `[Lane X - early draft]` = root-level shorter draft. `[Lane B1-Gemini]`, `[Lane B2-Claude]` = the two unmerged keyword variants. `[baseline §N]` = the Session-1 baseline. Confidence and measured/claimed/estimated status are carried forward per the source lanes.

---

# PART 1 — STRATEGIC POSITION

**The market, in one paragraph.** Suffolk County is a mature, roof-replacement-driven market: ~460,000 owner-occupied detached single-family homes, median home built ~1970 (median roof age past 1–2 replacement cycles), median value ~$578K–$626K, and a steady-state demand estimate of ~21,000 replacements/year before storm acceleration [Lane G, estimated]. The competitive field is bimodal. The *median* competitor is genuinely weak — most hide pricing, most omit the legally required license number, several run financing pages that 404/403, four of seven baseline sites show no reviews, and 0 of 15 sites checked have real online booking, live chat, or text-to-quote [baseline; Lane A; Lane F]. But the *ceiling* is high: LI Roofing Co. runs ~6,000-word town pages with real permit fees, building-department addresses, named streets, per-home-size pricing tables, FAQPage schema, 312 reviews, and a custom Next.js build — the single most sophisticated local presence in the market and a genuinely hard target [Lane A; Lane D; Lane E].

**The opportunity, in one paragraph.** The winnable ground is not the saturated "roofer [town]" head term (defended by programmatic operators, directories, and the map pack) but four adjacent territories the incumbents underserve: (1) **town × urgent-service** pages — `[town] + roof leak / emergency / storm damage / flat roof` — which are directory-light and have no town-level owner [Lane B; Lane B2-Claude]; (2) **transparency** — license number + real itemized town-level pricing + NY §771-B compliance, a trust stack only one competitor partially assembles [Lane A; Lane D; Lane G]; (3) a **working conversion layer** — real booking, speed-to-lead automation, honest financing prequal — that literally nobody in the checked set has functioning [Lane F]; and (4) **residential flat/low-slope**, which no modern conversion-optimized residential brand owns [Lane A]. These windows are open because the incumbents are commodity WordPress builds run by operators who compete on referral volume and review count, not on web engineering or content depth.

**The strategy, in one paragraph.** Build a **new Suffolk-anchored brand** (Branch B) on a static-first stack (Astro + Sanity), lead with **transparency + genuine local depth**, and win the **urgent-service and cost-intent long tail** with 12 hand-researched deep town pages that clear a hard content bar, while occupying the map pack from a real Suffolk address and the AI-citation layer through reviews, BuildZoom, and Bing Places. Ship a real (not cosmetic) booking + speed-to-lead layer at launch. Treat classic local SEO + GBP + reviews as the primary channel; treat AI/GEO as a cheap adjacent layer, not a separate program. Get the storm/emergency cluster live before October.

**The five decisions that matter most:**

1. **Branch B (new Suffolk brand), not Branch A.** A Nassau-anchored Branch-A GBP structurally under-ranks across Suffolk because SAB proximity decays from the verified address, and Premium's shared Garden City office is a suspension liability if listed as a storefront [Lane C]. A new brand gives clean NAP, a Suffolk address, and no entity collision — but requires a real operator/crew, which is the gating open question.

2. **Twelve deep town pages at launch, flat `/areas/[town]/`, no auto-generated town×service grid.** Depth beats volume decisively on the long tail; 48 thin pages is a demonstrated liability, not coverage [Lane D; Lane E]. Town×service pages come in phase 2 for the top urgent-service combos only, gated by completed local research.

3. **Transparency is the primary wedge; "same-day replacement" is not.** License + itemized town pricing + §771-B compliance is defensible day one [Lane D; Lane G]. Same-day full replacement — the baseline's headline wedge — is refuted: it is already widely claimed [Lane A; Lane B]. Reposition speed as town-level emergency response, capacity permitting.

4. **Astro + Sanity, with WordPress (lean custom theme) as the named fallback.** The entire competitive field's visible weakness is plugin-bloated WordPress; a static-first build beats it on speed without heroics [Lane E]. The developer-dependency counterargument is real and is answered with content portability + handoff acceptance criteria.

5. **Launch a real booking + speed-to-lead stack (~$550–900/mo), but sequence the promise behind the capacity.** A working booking widget + missed-call-text-back + honest financing prequal out-positions all 15 competitors [Lane F] — but a "we respond in minutes" or "same-day" promise is only credible if crew availability is real [Lane G]. Build the automation first, then make the claim.

---

# PART 2 — CONTRADICTION LEDGER

Resolved before anything else was written. Each: the two positions, the evidence, the resolution, the confidence.

### CL-1 — THE CENTRAL ARCHITECTURAL TENSION: how many pages, how deep, generated how
- **Position A (volume):** Keyword breadth favors many town/town×service pages. [Lane B1-Gemini] recommends nested `[town] roof repair` / `[town] roof replacement` pages at launch, graded **High confidence, "expensive to change later."** Programmatic operators (Valor 48, Rapid 34-nested, PJ Fitzpatrick, Long Island Exterior Co.) co-rank the generic head term [Lane B; Lane B2-Claude - early draft].
- **Position B (depth):** Quality favors few. LI Roofing's ~6,000-word pages and Perfect Pitch's ~1,650-word high-density page rank; Valor's 850-word and Renew's 642-word name-swap pages are the thinnest in the market and a Helpful-Content liability [Lane D; Lane A].
- **Position C (mechanism):** Google's spam policy targets *output uniqueness*, not generation method — a templated page with genuine per-town data (permit fee, building-dept address, housing era, named streets) is not a doorway page; a name-swap is, regardless of who typed it [Lane E, primary-sourced from developers.google.com].
- **Evidence weigh:** Depth is directly observed and quoted (Renew Deer Park = 642 words, zero specificity; LI Roofing Huntington = ~6,000 words with primary-sourced permit data). B1-Gemini's volume recommendation is graded by its own author as resting on **zero live sources and modeled volumes at Low confidence** — it cannot outweigh directly-fetched competitor pages. B1's one durable point (repair vs. replace carry distinct SERPs) is real but does not require separate pages at launch; on-page service targeting captures it, as LI Roofing demonstrates ranking for "[service] [town]" from a single town page.
- **RESOLUTION:** **12 deep town pages at launch** at flat `/areas/[town]/`, 2,500–4,000 words each, every page clearing the Part 3 content-depth bar; scale to ~25–30 by month 9. **No auto-generated town×service grid.** Add `/areas/[town]/[service]/` only in phase 2, only for `{emergency, storm-damage, roof-leak, replacement-cost}` × the top ~6 towns, each gated by completed local research. Enforce uniqueness as **required, non-swappable CMS schema fields** (permit fee, building-dept address, housing era, ≥3 named streets, ≥1 local condition) so "just swap the town name" is structurally impossible [Lane E]. Reject B1-Gemini's launch-nested recommendation. **Confidence: High.**

### CL-2 — MAP PACK vs ORGANIC as the primary lead channel
- **Position A:** The 3-pack may drive most local leads; if so, the content investment thesis weakens [Lane C, framing]. [Lane B1-Gemini] asserts the map pack sits above organic on **85%+** of "service + town" / "near me" queries.
- **Position B:** Organic depth wins the problem/emergency/cost/informational long tail; directories/map dominate only the generic-town/"best"/East-End cluster (~70% of those carry ≥3 directories vs. ~10% of emergency/leak/material queries) [Lane B, 30 SERPs tallied].
- **Evidence weigh:** Neither C nor B could render a live map pack (tool limit, explicitly flagged). B1's 85% is modeled, not measured. But the *direction* is convergent across all three: map pack + directories own generic-town/near-me; organic owns the long tail. C's proximity-decay finding (SAB ranks from the hidden verified address) is the load-bearing one and is independently corroborated across SEO sources.
- **RESOLUTION:** Both channels are required; they win different queries. **Map pack is primary for generic-town/near-me** — which makes a **Suffolk-verified GBP address non-negotiable** and Branch B strongly preferred (CL-9). **Organic depth is primary for the urgent-service, cost, and informational long tail** — which is where the 12 deep pages and blog cluster pay off. The content thesis is *not* weakened; it is *scoped* to the queries organic actually wins. **Confidence: Medium-High** (directionally strong, live-pack composition unmeasured).

### CL-3 — BOOKING LAYER (build it) vs OPERATOR CAPACITY (may not support it)
- **Position A:** Build the booking/speed-to-lead layer — 0/15 competitors have working booking, chat, or text-to-quote; even King Quality's "Book Now" is a dead `#` anchor [Lane F].
- **Position B:** A booking system against crew availability requires crew availability to be real; "same-day" and "6–8 week backlog" cannot be reconciled without distinguishing emergency tarping from full replacement, and the operator/crew arrangement is unverified [Lane G].
- **RESOLUTION:** Build the booking widget (Calendly/Cal.com embed) and speed-to-lead automation at launch — the *infrastructure* is cheap and differentiating. But **gate every time-based promise on verified capacity**: book "a free inspection" (always deliverable), not "same-day replacement" (capacity-dependent). Sequence: automation live and tested → then the response-time promise. This is an Open Decision for Adam (Part 8), not a spec blocker. **Confidence: High on the sequencing logic.**

### CL-4 — AI DISCOVERY (reshaping the channel) vs CLASSIC SEO (B/C/D investment)
- **Position A:** AI search may be reshaping discovery [Lane H, framing].
- **Position B:** Classic local SEO + GBP + reviews is still correct as primary [Lanes B/C/D].
- **RESOLUTION (no hedge):** **Classic local SEO + GBP + reviews is the primary investment.** AI discovery is *downstream of the same signals* — the retrieval pool is the same directory/review pool [Lane H]. The only net-new AI-specific work is cheap and high-leverage: **BuildZoom + Bing Places verified profiles, a genuine Reddit/Nextdoor presence, review velocity, and fact-dense pages.** Explicitly do NOT invest in llms.txt (97% never fetched), Wikidata/Knowledge Panel, dedicated voice, or TikTok organic. Effort reallocation vs. a 2022 playbook: ~15–25%, toward off-site surfaces, not away from on-site depth. **Confidence: High.**

### CL-5 — SAME-DAY WEDGE: unclaimed (baseline) vs already claimed
- **Baseline H5:** "Same-day / rapid replacement is an unclaimed positioning wedge."
- **Lane A:** Same-day *service/repair* claimed by Sunrise, Empire Gen, L.I.N.Y; same-day *full replacement* as headline still unclaimed by the 18.
- **Lane B / B2-Claude:** Same-day full *replacement* is **widely claimed** — Ready Roof ("90% in one day"), Valor ("within a single day"), J. Great, LI Roofing & Repair, Rapid. [Lane A - early draft] concurs (Valor "48h/1-day").
- **Evidence weigh:** Lane B directly observed the "same day roof replacement Long Island" SERP returning multiple claimants; Lane A observed the homepages. Both are direct fetches; B's is the more specific to the exact wedge.
- **RESOLUTION:** **The baseline's H5 wedge is refuted as stated.** Neither same-day *service* nor same-day *replacement* is clean whitespace. The genuinely open variant is **same-day emergency *response/dispatch* tied to a specific town** in the emergency cluster. Do not build the brand on "same-day replacement." Keep it as a supporting money page only if operations verify it. **Confidence: High.** (Full verdict in Part 5, H5.)

### CL-6 — LICENSE-DISPLAY WHITESPACE: "1 of 7" (baseline) vs wider
- **Baseline §2:** Only LI Roofing shows a license number (1 of 7).
- **Lane A:** At least **three** display Suffolk numbers — LI Roofing (#53241-H), Right Angle (#51,886-H), Clearview (#55260-H, plus Southampton/Long Beach). [Lane B2-Claude] adds **Smart Choice Contracting (HI-62204)** in the emergency SERP.
- **RESOLUTION:** Still a *minority* behavior and still a differentiator, but the "nobody but LI Roofing" framing is stale — call it ~3–4 of the expanded ~18-site set. The stronger, still-rare lever is **pricing transparency (2 of ~18)** and **§771-B-compliance-as-marketing** [Lane G]. Go further than any competitor by pairing the number with a link to the Suffolk DCA license lookup (`ca.suffolkcountyny.gov/dcasearch`) as a "verify us" element [Lane C]. **Confidence: High.**

### CL-7 — INSTANT-QUOTE TOOL: internal Lane F conflict (defer vs launch)
- **Position A [Lane F]:** Defer the genuine instant-*price* tool (Roofr Instant Estimator, ~$400–500/mo all-in) to phase 2 — a new build has no completed-job cost data to calibrate a credible ballpark, and an uncalibrated number recreates the "oversold instant quote" credibility problem; phase in after 20–30 jobs.
- **Position B [Lane F - early draft]:** Install at launch — instant-quote is now a commoditized same-day-installable SaaS category (Roofle ~$350/mo+$2K, Roof Quoter $200/mo, HD ~$3,137/yr), Bumble already has a "Get Your Instant Quote" CTA live, so the differentiation window is closing and it should be a launch line item.
- **Evidence weigh:** Both are correct about different things. The early draft is right that the *technology* is cheap and commoditizing (which means it is **not a durable moat**). The research-F version is right that a *new* operator has no cost history to calibrate against (a real liability/expectation risk). The early draft's Bumble finding also shows the feature spreading — which strengthens, not weakens, the case that it is table stakes rather than a wedge.
- **RESOLUTION:** **Do not build the brand's differentiation on instant quote.** At launch, ship a genuine 3-step lead form (ZIP → service → contact) with honest "ballpark after inspection" framing, and optionally a **cheap, clearly-non-binding widget (Roof Quoter-tier)** purely for lead capture — never a precise price it cannot stand behind. Defer the calibrated instant-*price* tool until 20–30 completed jobs exist. Lead marketing with the **trust stack** (license + real reviews + published pricing), which the commoditization cannot copy [Lane F - early draft, DECISION 2C]. **Confidence: Medium-High.**

### CL-8 — B vs B1 vs B2: EMERGENCY SERP — organically soft vs LSA-walled
- **[Lane B] and [Lane B2-Claude]:** Emergency/storm/leak SERPs are directory-light (0 directories in 4/5) and have no town-level owner — the clearest open lane; B2 found *zero* overlap with the baseline's Tier-1 names in the emergency pull.
- **[Lane B1-Gemini]:** Organically soft, yes — but the top of the emergency SERP is "completely dominated by Google Local Services Ads," so "you cannot win emergency queries on organic content alone"; on mobile (80%+ of emergency traffic) organic is pushed below the fold.
- **Evidence weigh:** B and B2 directly observed organic composition (strong evidence). B1 observed nothing (zero sources) but its LSA claim is *independently corroborated* — Lane C confirms roofing LSA is live and priced ($40–$120/lead) and recommends enrolling before storm season. So B1's mechanism is sound even though its run was source-free.
- **RESOLUTION:** **Both are true and they compose into a dual play.** Emergency organic is genuinely open and cheap to rank → **build the town-level emergency/storm/leak pages** (they will rank because no incumbent owns them). AND the above-the-fold mobile emergency SERP is LSA/map-pack-gated → **enroll in LSA before October** [Lane C; Lane B1-Gemini]. Do not treat emergency as "free organic territory" alone. **Confidence: High** (organic softness directly measured; LSA gating corroborated).

### CL-9 — Branch A address vs Branch B (GBP proximity)
- **Position A:** Keep Premium's Garden City/Nassau address (Branch A) — faster to revenue.
- **Position B:** A Nassau-anchored SAB structurally under-ranks across Suffolk (proximity decay), and a shared-office address listed as a storefront is a leading suspension cause [Lane C].
- **RESOLUTION:** **Branch B (or a Branch A re-anchored to a real Suffolk address).** This is the single biggest lever GBP proximity gives you, and it is expensive/one-way (address changes reset review/ranking history) — decide before launch. **Confidence: Medium** (SAB proximity is SEO-sourced, not Google-published; reversibility is genuinely expensive).

### CL-10 — CLOSE RATE & CONVERSION: baseline optimistic
- **Baseline §4:** 30–40% close; 3–6% conversion implied.
- **Lane G:** Web-lead close 5–15% (shared) / 15–25% (strong, exclusive); 30% only at the high end. Site conversion 0.5–3% average, 3–5% "healthy," 5–8% only for optimized/interactive.
- **RESOLUTION:** **Not a fabrication, but the baseline sits at the favorable end.** Underwrite the go/no-go business case to the **conservative band (2% conversion / 10% close)**; set the **base case (4% / 20%)** as the target the build optimizes toward; treat 30%/6% as optimistic upside, never as a planning floor [Lane G]. Full model in Part 6. **Confidence: Medium** (converging non-primary sources).

### CL-11 — SEASONALITY: "Oct–Apr storm season" refined
- **Baseline §4/H4:** Nor'easters Oct–Apr are the dominant emergency driver; storm cluster must be live before October.
- **Lane G:** Full-replacement *revenue* is temperature-constrained (~40°F sealant minimum) to spring/fall; Oct–Apr is a **lead-capture and emergency-repair** window, not a replacement-revenue window. Spring (Apr–Jun) is ~35% of annual revenue. [Lane B1-Gemini] adds a distinct March–May repair spike and Jan–Feb ice-dam spike.
- **RESOLUTION:** Both hold and refine each other. **Storm/emergency/leak content must be live before October** (lead capture doesn't need warm weather) — the hard deadline stands. But **replacement revenue lands in spring/fall**, so cash-flow planning and capacity messaging should expect the pipeline to fill in winter and convert to revenue in the shoulder seasons. Publish ice-dam content by early November. **Confidence: Medium-High.**

### CL-12 — COUNTY ROOFING "none in Suffolk" — stale
- **Baseline / [Lane A]:** County Roofing has ~9 town pages, none physically in Suffolk.
- **[Lane A - early draft]:** County is **expanding into Suffolk** — new Hauppauge/Smithtown office announced July 2026; Owens Corning Platinum Preferred confirmed via 2026 press.
- **RESOLUTION:** Accept the early draft's update — the Suffolk-proximity gap is *closing*; County is a strengthening Tier-1 with a triple-cert claim and now a Suffolk footprint. Treat as a moving target. **Confidence: Medium** (single press-sourced claim, plausible).

### CL-13 — PLATFORM: Astro/Sanity vs WordPress
- **Position A [Lane E]:** Astro (SSG) + Sanity — highest performance ceiling, targets the market's visible WordPress weakness.
- **Counterargument [Lane E, self-raised]:** WordPress is commodity labor; Astro/Sanity means single-developer dependency, hard to service locally.
- **RESOLUTION:** **Astro + Sanity primary; disciplined WordPress (lean custom theme, Rank Math, no Elementor/Divi) as the named credible fallback if Adam's developer-dependency tolerance is genuinely low.** The lock-in asymmetry favors Astro/Sanity for *content* portability; mitigate the code-maintainability risk with conventional patterns + handoff documentation as an explicit SOW acceptance criterion. **Confidence: Medium.**

### CL-14 — Bumble trust signals — baseline stale
- **Baseline table:** Bumble — no reviews shown, financing 404, no working instant quote.
- **[Lane F - early draft]:** Bumble now shows a **NiceJob review widget**, **BBB accreditation with a real Suffolk address (1 Sommerset Dr, Yaphank)**, and a live **"Get Your Instant Quote" CTA**; also a probable per-town lat/long copy-paste bug (identical coordinates for every town).
- **RESOLUTION:** Accept as an update — the baseline's Bumble row is stale (site `modified_time` 2026-07-13). This reinforces CL-7 (instant-quote is spreading = table stakes) and gives a real competitive soft spot (broken per-town geocoding) to exploit with genuinely distinct geodata. **Confidence: High** (direct fetch).

### CL-15 — Root-draft-vs-research internal consistency (A, B, F)
- **Lane A:** research/ version is fuller (Opus, 18-site teardown, tiering) and authoritative; [Lane A - early draft] (Grok) is consistent in direction and adds: **Expressway 247+ reviews / cedar specialist / "map of 175 towns," Right Angle GAF-locator ~930 reviews + $125/mo min, Ready Roof LI / All American as named competitors, and "we still pick up the phone" as LI Roofing's human-answer messaging territory.** No material conflict — additive.
- **Lane B:** research/ version (Opus, 36 SERPs) supersedes [Lane B - early draft]/[Lane B2-Claude] (3 SERPs, identical to each other). The early draft adds **Long Island Exterior Co.** (`/roofing/[town]-ny-[zip]` pattern, per-town building-dept address, "no subcontractors ever"), the **Homeyou Huntington $7,102–$8,147** low-cost data point, and the **emergency-SERP competitor names** (Smart Choice, All Weather, GNP, ProHome, Cross County, Superior Siding). Additive, not conflicting.
- **Lane F:** research/ version (15-site sweep, full stack) supersedes [Lane F - early draft] (Bumble-only). The one genuine internal conflict is the instant-quote timing — resolved at CL-7.
- **RESOLUTION:** Root drafts are folded in as supplementary; the only substantive internal conflict surfaced was Lane F's instant-quote timing (CL-7). Everything else the root drafts contributed is net-additive data, now captured. **Confidence: High.**

---

# PART 3 — THE DECIDED ARCHITECTURE

## 3.1 Positioning and value proposition
**Territory claimed:** *The Suffolk roofer that shows you everything before you call* — the license number (with a link to verify it), the real town-by-town price range, your town's permit fee and building department, and a working way to book an inspection online. Reinforced by genuine local depth (your town's salt-air/wind exposure, housing era, streets) and a credible fast-response promise backed by real automation.

**Why defensible:** Transparency + §771-B compliance + local-research depth is *labor*, not spend — a bigger-budget competitor can copy the design but not skip the 45–60 min/town of primary building-department research [Lane D] or retroactively become compliant. Instant-quote tech and thin town pages are copyable in a day; a fact-dense, permit-sourced, priced town-page library is the moat [Lane D; Lane E]. Secondary, near-uncontested territory: **residential flat/low-slope** [Lane A].

**Primary tagline (A/B two):** (A) transparency — "The only Suffolk roofer that puts our license number, real prices, and your permit fee right on the page." (B) human/local — "We still pick up the phone." (LI Roofing's own untapped-by-others lean [Lane A - early draft].) Recommend A as primary, B as supporting.

## 3.2 Complete site map

| URL | Type | Target intent | Phase |
|---|---|---|---|
| `/` | Home | Brand + transparency wedge | Launch |
| `/services/` | Services hub | Navigation | Launch |
| `/services/roof-replacement/` | Service (money) | Transactional | Launch |
| `/services/roof-repair/` | Service (money) | Transactional | Launch |
| `/services/emergency-roof-repair/` | Service | Transactional urgent (H4) | **Launch — before Oct** |
| `/services/storm-damage-roof-repair/` | Service | Event-driven (H4) | **Launch — before Oct** |
| `/services/roof-leak-repair/` | Service | Urgent (H4) | **Launch — before Oct** |
| `/services/flat-roofing/` | Service | Commercial/low-slope bridge | Launch |
| `/services/metal-roofing/` | Service/material | Commercial-investigation | Launch |
| `/services/roof-inspection/` | Service + lead magnet | Commercial-investigation | Launch |
| `/services/skylights/` | Sub-service | Transactional | Phase 2 |
| `/services/gutters/` | Service | Transactional | Phase 2 |
| `/services/siding/` | Service line | Transactional | Phase 2 |
| `/services/same-day-roof-replacement/` | Service | Speed (H5, capacity-gated) | Phase 2, **only if verified** |
| `/areas/` | Service-area hub (Suffolk map) | Navigation | Launch |
| `/areas/[town]/` ×12 | Town page (deep) | `[service] [town]` + local | Launch |
| `/areas/[town]/[service]/` | Town×service | Urgent-service long tail | **Phase 2, top ~6 towns × {emergency, storm, leak, replacement-cost} only** |
| `/resources/` | Blog/guides hub | Informational | Launch |
| `/resources/[slug]/` | Blog posts | Informational (per editorial calendar) | Launch → ongoing |
| `/financing/` | Trust/conversion | Bottom-funnel | Launch (with real prequal widget) |
| `/reviews/` | Trust | Trust | Launch |
| `/warranties/` | Trust | Objection-handling | Launch |
| `/about/` | Trust (named owner/crew) | Trust | Launch |
| `/gallery/` | Proof (town-tagged) | Trust | Launch |
| `/contact/` | Conversion | Transactional | Launch |

## 3.3 Town coverage — exactly which towns, order, depth, reasoning

**Launch set (12), all at full depth (2,500–4,000 words, complete local-research payload):**
Huntington, Smithtown, Islip, Babylon, Brookhaven, Bay Shore, Patchogue, Commack, Port Jefferson, Sayville, Riverhead, and one North Shore hamlet-town (Northport **or** St. James) — final 12th adjustable to Lane B's demand×weakness ranking [Lane D].

**Legal gate (hard):** **Southampton, East Hampton, and Shelter Island are excluded from the launch advertising set** — they require separate town Home Improvement licenses *in addition to* the Suffolk County license, and advertising/serving there without one is a violation [Lane G]. Build *informational* East-End content for SEO equity if desired, but **gate active "we serve you" CTAs behind obtaining those town licenses** [Lane G, DECISION A+C]. Riverhead and Southold are covered by the county license; East-End organic ROI is directory-dominated anyway [Lane B].

**Order:** western/central high-population towns first (Huntington, Smithtown, Islip, Babylon, Brookhaven) — highest demand and where the Suffolk address ranks best via proximity [Lane C]; then the urgent-service town×service pages in phase 2 for the top ~6.

**Depth reasoning:** LI Roofing wins with 19 deep pages; Perfect Pitch competes with 4 high-density pages; Valor's 48 and Renew's 24 are the market's thinnest and a liability [Lane D]. The constraint is *research hours, not template time* — 12 is what can be done with real per-town primary-source research at launch.

## 3.4 Service taxonomy — named as customers search
Roof Replacement · Roof Repair · Emergency Roof Repair · Storm Damage Roof Repair · Roof Leak Repair · Flat / Low-Slope Roofing · Metal Roofing · Roof Inspection · Skylights · Gutters · Siding. (Same-Day Roof Replacement only if operationally verified.) "Roof Installation" folds into Replacement; "Cedar Shake" is a material *section*, not a top-level service, unless Lane B confirms standalone North Shore demand. Reject invented categories (baseline's "Roof Cornering" etc.) [Lane D].

## 3.5 Internal linking model

| Edge | Rule | Anchor convention |
|---|---|---|
| Town → Service | Every town page links all core services (service grid) | Descriptive: "Emergency Roof Repair" |
| Service → Town | Each service page links the 12 launch towns | Town name only |
| Town → Town | 2–4 *geographically adjacent* towns + up-link to `/areas/` | Contextual, varied |
| Blog → Money page | Every post links ≥1 service/town in-body + CTA | Exact/partial match |
| Money → Blog | Town/service pages link 1–2 supporting guides | Descriptive |
| Breadcrumbs | Every page, with `BreadcrumbList` schema | Home › Areas › [Town] |

**Adjacency clusters** (so town→town links are geographically credible) [Lane D]: North Shore/25A (Huntington↔Smithtown↔Commack↔Port Jefferson); Central South Shore (Islip↔Bay Shore↔Sayville↔Patchogue); Western South Shore (Babylon↔Islip); East (Riverhead↔Brookhaven bridge). **Anchor-text rule: ≤30% exact-match "[service] [town]" site-wide.** Orphan rule: no page >2 clicks from home.

## 3.6 Content-depth standard — the bar a town page MUST clear to ship
Enforced as **required CMS schema fields** (page cannot publish until filled) [Lane E]:
1. Building department: **exact street address + phone + counter hours + e-file vs. in-person** (primary `.gov` source).
2. Permit: **required-for-reroof status + fee + turnaround in business days** (from the town fee schedule/eCode360, not a competitor's claimed number — competitor fees are claims until confirmed [Lane D]).
3. Historic district / overlay trigger for roof work (named).
4. Dominant housing stock **era + type + typical roof size in squares**.
5. ≥1 roofing-relevant local condition (salt air / wind / flood zone / tree canopy / HOA).
6. **≥3 named real streets + 2–4 hamlets/neighborhoods + 1–2 landmarks.**
7. 3–5 town-tagged recent jobs + ≥1 town review if available.
Plus: 2026 price range (town × home-size), in-body license number, 10–13 search-voice FAQ entries, FAQPage schema. **Word count is a proxy; local-specificity density is the real variable** — Perfect Pitch wins at 1,650 words [Lane D]. Target 2,500–4,000; never ship a name-swap.

## 3.7 Technical platform — with the strongest counterargument addressed
**Astro (static-first) + Sanity (hosted headless CMS).** Rationale: image-heavy 20→100+ pages is the SSG sweet spot; Sanity Studio gives non-technical structured editing; the town/service schema generates the town×service matrix at build time with *required* uniqueness fields; ongoing infra <$200/yr vs. WordPress $700–$2,100/yr [Lane E].
**Counterargument (developer dependency):** WordPress is commodity labor; Astro/Sanity ties the client to one shop. **Answer:** content lives in a portable Sanity dataset (more portable than an Elementor/Divi-entangled WP DB); commodity WP build quality has produced the interchangeable-mediocre market we're differentiating against; mitigate with conventional Astro patterns + handoff docs as an explicit acceptance criterion. **Named fallback:** disciplined WordPress (lean custom theme, Rank Math, no page builder) if developer-dependency tolerance is low [Lane E; CL-13].

## 3.8 Structured data plan by page type [Lane E]
- **Site-wide:** `RoofingContractor` (valid `LocalBusiness` subtype) with `sameAs`, `areaServed` (only genuinely-serviced towns), `aggregateRating` **only if real and verifiable** (under-claim rather than over-claim).
- **Home:** `WebSite` + `RoofingContractor`.
- **Service pages:** one `Service` block each, with `areaServed`, `provider`, and `offers` **only where a real price/range is published**.
- **Town / town×service:** `Service` + `FAQPage` (genuine FAQ only — valuable for AI extraction) + `BreadcrumbList`.
- **Reviews:** `Review`/`AggregateRating` from a real auditable feed — never self-hosted testimonials styled as reviews (the reference site's reviewshark.com anti-pattern).
- **Gallery:** `ImageObject` (town-tagged); video: `VideoObject`.
No special AI schema needed (Google: "no special schema"); schema is table stakes for entity understanding, not a growth lever [Lane H].

## 3.9 The conversion stack — launch / phase 2 / monthly cost [Lane F]

**Launch (~$550–900/mo all-in):**
- Booking: Calendly or Cal.com embed, "Book a Free Inspection" (~$16–20/mo). *Prefer Cal.com for branding control; API/GBP-addressable so it survives agentic booking [Lane H].*
- Speed-to-lead: missed-call-text-back + SMS auto-response ($100–300/mo). **Build and test before making any response-time promise.**
- Call tracking: CallRail with DNI (~$50–185/mo) — canonical NAP stays in HTML/schema, only displayed number swaps (no NAP risk) [Lane E; Lane F].
- Financing: **Acorn Finance** (free to contractor, soft-pull, maintained third-party flow — fixes the "financing page 404s" failure mode) or Wisetack [Lane F].
- Lead form: 3-step (ZIP → service → contact), single TCPA consent checkbox (one-to-one rule vacated; PEWC standard) [Lane F].
- Reviews: native Google Business Profile embed (free); NiceJob or GatherUp (~$75–99/mo) for compliant review *requests* (identical ask to 100% of customers — no gating) [Lane C].
- Optional cheap non-binding lead-capture quote widget (Roof Quoter-tier, ~$200/mo) — **not** a precise price (CL-7).

**Phase 2 (+~$1,200–2,500/mo as volume justifies):**
- Calibrated instant-price tool (Roofr Instant Estimator ~$400–500/mo) after 20–30 jobs, clearly non-binding.
- AI voice/chat receptionist (Podium AI add-on ~$99/mo, or Structurely/Rosie) when storm-season call volume makes human-only intake a bottleneck.
- Roofing CRM (JobNimbus ~$323–349/mo solo) for internal dispatch — *not* the public booking widget; deferring is cheap.

---

# PART 4 — THE COMPETITIVE THESIS

**Tiered picture (condensed) [Lane A; Lane A - early draft]:**
- **Tier 1 (must out-build):** LI Roofing Co. (content + pricing + license + reviews leader, custom Next.js), Rapid Roofing (34-page SERP volume + OC Platinum + reviews), County Roofing (triple-cert + commercial + now expanding into Suffolk — CL-12), Right Angle (~900–930 reviews + license + aggressive financing + GAF ME), Perfect Pitch (highest per-page quality + reviews). King Quality is Tier-1 on brand/ad-spend only.
- **Tier 2 (beatable on depth/UX):** Clearview (60+ yrs, multi-town licenses, commercial — but dated site, no pricing/financing), Anthony's (awards/volume, thin web surface), Expressway (22+ yrs, cedar specialist, 247+ reviews, "175 towns" map), PJ Fitzpatrick (regional programmatic, generic, no flat roof).
- **Tier 3 (thin/exploitable):** Valor (48 thin, 24-hr promise, no reviews/license), Renew (thinnest, 404 financing), Bumble (franchise; now upgraded — CL-14, but broken per-town geocoding), plus the emergency-SERP long tail (Smart Choice, All Weather, GNP, ProHome, Cross County, Sunrise, Ready Roof LI, Superior Siding) [Lane B2-Claude].

**The named whitespace, why it's open, and how long the window stays:**

1. **Town-level urgent-service pages (`[town] + leak/emergency/storm/flat`).** *Open because* incumbents default these queries to "Long Island/Suffolk" scope with no town-level owner, and directories are near-absent here [Lane B; Lane B2-Claude]. *Window:* wide but with a seasonal deadline — must be live before October to rank for the nor'easter cluster; the organic opening could be occupied by any competent operator within a year, so first-mover depth matters.

2. **The transparency trust stack (license + verify-link + itemized town pricing + §771-B compliance).** *Open because* only LI Roofing partially assembles it and most competitors either can't (non-compliant financing/deductible language, no license) or won't (pricing hidden by 16 of 18) [Lane A; Lane G]. *Window:* narrowing on license display (now ~3–4 show it — CL-6) but still wide on *pricing* (2 of 18) and essentially untouched on *§771-B-compliance-as-marketing*. Durable because it's partly labor/legal posture, not spend.

3. **A working conversion layer (real booking + speed-to-lead + honest prequal).** *Open because* the cheap cosmetic version (mislabeled "Book Now"/"Instant Quote" CTAs) has been tried and abandoned by even the best-resourced player (King Quality's dead anchor) — the real thing costs complexity, not money, and nobody has paid it [Lane F]. *Window:* the *instant-quote* sub-component is closing fast (commoditized SaaS, Bumble already live — CL-7/CL-14); the *real calendar booking + speed-to-lead automation* sub-component is still fully open and is the more defensible target.

4. **Residential flat/low-slope bridge.** *Open because* only County and Clearview meaningfully claim it, and the dedicated flat-roof SERP is a separate specialist universe that doesn't contest residential terms [Lane A]. *Window:* wide and quiet — "close to open territory," low urgency, high-margin.

---

# PART 5 — HYPOTHESIS VERDICTS

**H1 — The market bar is low. → PARTIALLY CONFIRMED.**
The *median* is beatable with basics (12 of 18 hide pricing, most hide license, four show no reviews, several have 404 financing, Valor's above-fold CTA is merely "Contact Us"), but the *ceiling* is high — LI Roofing's ~6,000-word priced town pages, King Quality's 3-Star President's Club, Right Angle's ~900+ reviews are not "ordinary" [Lane A; Lane A - early draft]. On the technical sub-claim, 6 of 8 competitors run WordPress+builder (a performance liability) while the lone leader is on custom Next.js — consistent with H1 but unmeasured (PSI blocked) [Lane E]. Refined: the leader wins by doing ordinary things *at extraordinary depth*. **Deciding evidence: Lane A (teardown), Lane E (stack).**

**H2 — Depth beats volume on town pages. → CONFIRMED, with a head-term caveat.**
Directly observed: Renew Deer Park 642 words / zero specificity and Valor Bellport ~250 words of real body vs. LI Roofing's ~6,000 words of primary-sourced local data; Google's own spam policy defines the violation by output uniqueness, not method [Lane D; Lane E]. Caveat: on the plain `roofer [town]` head term, programmatic/volume players still co-rank and aren't evicted by depth alone — depth wins the long tail decisively, but the head term needs depth **+** off-site authority **+** map-pack presence [Lane B]. **Deciding evidence: Lane D (page teardowns), Lane B (SERP co-ranking).**

**H3 — A real booking/quoting layer is category-leading whitespace. → PARTIALLY CONFIRMED (and must be narrowed).**
0/15 sites have working booking, chat, or text-to-quote — confirmed and extended beyond the baseline's 7 [Lane F]. BUT the *instant-quote* sub-claim is refuted: it's now commoditized SaaS and Bumble already has one live [Lane F - early draft]. Narrow H3 from "instant quote + booking + chat" to **"real calendar-integrated booking + speed-to-lead automation"** — that is the actual, still-open whitespace. **Deciding evidence: Lane F (15-site sweep), Lane F - early draft (Bumble + SaaS commoditization).**

**H4 — Emergency + storm damage is the softest, highest-value territory. → CONFIRMED, scoped.**
Organically the clearest open lane — directory-light, no town-level owner, zero overlap with Tier-1 names in the emergency pull [Lane B; Lane B2-Claude]. Scoping refinements: (a) the above-fold mobile SERP is LSA-gated, so pair organic pages with LSA [Lane B1-Gemini; Lane C] (CL-8); (b) LI Roofing already weaves storm content into town-page FAQs, so the *topic* isn't unclaimed even where the *dedicated page* is [Lane D]; (c) replacement *revenue* from this window lands in spring/fall, not Oct–Apr [Lane G] (CL-11); (d) the "highest-margin" claim was not independently substantiated [Lane G]. **Deciding evidence: Lane B/B2 (organic softness), Lane B1/C (LSA gating), Lane G (seasonality/margin).**

**H5 — Same-day / rapid replacement is an unclaimed positioning wedge. → REFUTED (as stated).**
This is the most valuable refutation in the set — it prevents building the brand on a claimed position. Same-day *service/repair* is claimed by Sunrise/Empire/L.I.N.Y [Lane A]; same-day *full replacement* is claimed by Ready Roof ("90% in one day"), Valor ("within a single day"), J. Great, LI Roofing & Repair, Rapid [Lane B; Lane A - early draft]. The only genuinely open variant is **same-day emergency response/dispatch tied to a specific town**. Do not lead with same-day replacement. **Deciding evidence: Lane B (same-day-replacement SERP), Lane A (same-day-service homepages).**

**H6 — Publishing license + real pricing is a trust differentiator. → CONFIRMED, counts stale, and stronger than the baseline knew.**
License display is now ~3–4 of 18 (LI Roofing, Right Angle, Clearview, Smart Choice), not 1 of 7 — still a differentiator, narrowing [Lane A; Lane B2-Claude]. Pricing transparency remains rare (2 of 18) and is the stronger lever [Lane A]. **New, load-bearing:** NY GBL **§771-B compliance** (no deposits, no deductible-waiver promises, no claims-adjusting) is itself a marketing asset because several competitors' financing/insurance language likely violates it [Lane G]. Pair the license number with the Suffolk DCA verify-link [Lane C]. **Deciding evidence: Lane A (display counts), Lane G (§771-B), Lane D (town-page transparency).**

**H7 — Directory presence is itself a ranking channel worth budgeting for. → CONFIRMED, scoped, and extended to AI.**
Directories appeared in 17/30 local SERPs (57%) and led ~6, but *query-type-dependent*: ~70% of generic-town/best/East-End queries vs. ~10% of emergency/leak/material/financing [Lane B; corroborated by Lane B1-Gemini and Lane B2-Claude]. Refinement: Houzz/Porch have de-prioritized lead-gen; budget GBP + BBB + hyperlocal chambers + GAF locator, not the whole legacy tier [Lane C]. Extension: the same pool is the **AI-citation** channel — add **BuildZoom, Bing Places, Reddit, Nextdoor** as first-class surfaces [Lane H]. **Deciding evidence: Lane B (30-SERP tally), Lane C (directory decline), Lane H (AI extension).**

*(H3's "quoting" and H5 are the refutations; give them weight — they redirect the build away from a commoditized feature and a claimed wedge toward real booking + transparency + local depth.)*

---

# PART 6 — ECONOMICS

**Reconciled per-town-page-per-month model [Lane G, rebuilt from baseline].** Every input sourced; session volume is the weakest input (unmeasured — no keyword tool in any lane, explicitly [Lane B; Lane B1; Lane B2]).

| Input | Conservative | Base | Optimistic | Source |
|---|---|---|---|---|
| Sessions/page/mo | 15 | 25 | 40 | baseline carried forward, **unverified** |
| Conversion (session→lead) | 2% | 4% | 6% | [Lane G] (avg 0.5–3%, healthy 3–5%) |
| Close (lead→job) | 10% | 20% | 30% | [Lane G] (shared 5–15%, exclusive 15–25%) |
| Avg job value | $9,500 | $11,500 | $15,000 | baseline + [Lane G]; low end softer per [Lane B2] Homeyou $7,102 |

**Arithmetic (per page/month):**
- Conservative: 15 × 2% = 0.30 leads × 10% = 0.03 jobs × $9,500 = **$285**
- Base: 25 × 4% = 1.0 lead × 20% = 0.20 jobs × $11,500 = **$2,300**
- Optimistic: 40 × 6% = 2.4 leads × 30% = 0.72 jobs × $15,000 = **$10,800**

**At the 12–18 launch town pages:**
- Conservative: 15 pages × $285 = **~$4,275/mo** (~1 job per 2 months across the whole set — a stress floor; town pages alone are not a standalone engine at this band).
- Base: 18 × $2,300 = **~$41,400/mo** (~3.6 jobs/mo).
- Optimistic: 18 × $10,800 = **~$194,400/mo** — **flagged as implausible**; the optimistic inputs are not simultaneously realistic (treat optimistic as an upper bound on any *single* input, not a compounding scenario) [Lane G].

**Cost side:**
- **Build cost:** Astro+Sanity industry ranges $20K–$60K (scoped tightly, less); WordPress lean-theme lower [Lane E, estimated, agency-sourced]. **No firm quote exists — this is the single biggest un-sourced build-side number; get a fixed-scope quote against this page count.**
- **Ongoing:** infra <$200/yr (Astro static) + conversion stack $550–900/mo + review tool $75–99/mo + LSA (pay-per-lead, $40–120/lead) + chamber memberships ~$150–500/yr each [Lane C; Lane E; Lane F].
- **CAC:** $500–$1,000 planning band ($250–$1,500 across sources) [Lane G] — under 15% of an $11,500 job even at the high end.
- **Payback:** paid-lead CAC payback 6–9 months; **SEO/content payback 9–18 months** — underwrite months 1–6 expecting little-to-no organic-lead revenue [Lane G].

**vs. the paid-lead alternative ($500–$1,400 per booked job [baseline]):** an owned-content + GBP + LSA channel targets a *lower long-run* cost per booked job than perpetually renting shared leads (which also close at only ~20% because resold to up to 16 contractors [baseline]), but it front-loads cost and delays revenue. LSA ($40–120/lead) is the bridge that produces bookings during the 9–18 month content ramp.

**Assumptions that, if wrong, break the model:**
1. **Session volume (15–40/page/mo).** Entirely unverified — no keyword tool in any lane. If real volume is materially lower, the conservative floor drops below viability. **Highest-priority thing to measure before committing budget.**
2. **A real operator/crew exists to close and deliver** (Part 8). No leads convert without fulfillment.
3. **Conversion lands at "healthy" (4%), not "average" (2%).** The whole build thesis is an above-average site; if execution is average, halve the revenue.
4. **Job value holds ~$11,500.** The market low end is softer than the baseline assumed ($7,102 Huntington average per one aggregator [Lane B2-Claude]).

---

# PART 7 — COMPLIANCE & RISK REGISTER

**LEGAL REQUIREMENTS (must comply):**

| Requirement | What the build must do | Owner | If skipped |
|---|---|---|---|
| Suffolk §563-17D / §563-15.1A — license # in all advertising | License number as a template-level element: footer on every page + in-body on town/service pages + on estimate docs [baseline; Lane A] | Build + operator | Code violation; Class-A-misdemeanor exposure, $500–$5,000/offense [Lane G] |
| Nassau §2(a)/(b) — license # + exact licensed name on ads (if serving Nassau) | Display Nassau HIC # + exact name where Nassau is targeted | Build + operator | Nassau advertising violation |
| Town licenses — Southampton/East Hampton/Shelter Island require separate HIC license | **Exclude these from launch advertising set**; gate CTAs until licensed [Lane G] | Operator + content | Advertising/serving unlicensed = violation (hard go/no-go gate) |
| NY GBL §771-B — roofing-specific | **No upfront deposit** language; **no deductible-waiver** promises; **no claims-adjusting** offers; disclose insurer/limits when a claim is involved; separate 3-day cancel notice on claim denial [Lane G, primary-sourced] | Content + legal review | Statutory violation; do not echo competitors' non-compliant financing/insurance copy |
| NY GBL §771 — written-contract law | Contract fields (license #, dates, scope, warranty disclosure, insurance disclosure); 3-business-day cancellation | Operator | Contract unenforceable / penalty exposure |
| FTC Consumer Review Rule (Oct 2024) + Endorsement Guides | Review incentives never conditioned on sentiment; substantiate any "best/#1" claim or avoid the framing [Lane C; Lane G] | Marketing | FTC warning-letter/enforcement exposure |
| Google review-gating ban (tightened Apr 2026) | Identical review ask to 100% of customers; satisfaction triage runs parallel, never gating [Lane C] | Review tooling | Retroactive review removal + warning |
| TCPA / SMS consent | Single clear PEWC consent checkbox (one-to-one rule vacated Jan 2025, still vacated) [Lane F] | Build + legal | PEWC/mini-TCPA litigation (home services a top target) |
| ADA / WCAG 2.2 AA | Build to WCAG 2.2 AA from day one (target size ≥24px on tap targets/phone CTA, focus-not-obscured, redundant-entry); automated scan + one manual keyboard/SR pass; accessibility statement [Lane E] | Build | **NY is #1 state — 1,108 suits in 2025; 64% of targets <$25M revenue** [Lane E]; predictable settlement/demand-letter cost |
| Call recording | NY one-party consent (§250.00) — fine in-state; all-party consent for two-party-consent-state callers [Lane F] | Operator | Wiretap exposure on out-of-state calls |
| Insurance minimums | Suffolk GL ≥$500K; §771-B GL ≥$100K/$300K; workers' comp on file | Operator | License denial / §771-B violation |

**BEST PRACTICES (not legally required — do not blur with the above):**
- Publish insurance carrier/limits ("$1M+ GL, workers' comp on file") — exceeds all competitors, not required [Lane G].
- Link the Suffolk DCA verify tool next to the license number [Lane C].
- Display Google Guaranteed badge once earned; BuildZoom/Bing Places profiles [Lane H].
- HSTS, image weight budgets, self-hosted fonts, ≤3–4 third-party scripts [Lane E].
- 301 redirect map + recurring broken-link audit (3 competitors run 404/403 financing pages — a demonstrated vertical failure mode) [Lane E].

---

# PART 8 — OPEN DECISIONS FOR ADAM

| Decision | Options | Recommendation | Consequence | Blocks SOW? |
|---|---|---|---|---|
| **Branch A vs B** | A: build on Premium (Nassau addr, existing operator/phone/crew, license unverified). B: new Suffolk brand. | **B**, or A re-anchored to a real Suffolk address [Lane C] | Nassau SAB structurally under-ranks Suffolk; shared-office storefront = suspension risk. One-way (address change resets GBP history) | **BLOCKS** — the entire GBP/NAP/domain architecture depends on it |
| **Operator / crew arrangement** | Own crew (W-2 differentiator) / sub-crews / partner operator | Must be **real and named** before any booking/speed/same-day promise ships | No fulfillment = no revenue regardless of leads; same-day claims require verified capacity [Lane G] | **BLOCKS** economics + any capacity-based marketing claim |
| **Premium's license status** | Verify via `ca.suffolkcountyny.gov/dcasearch` (blocked to bots) or call Suffolk DCA 631-853-4600 | **Verify before finalizing A** — 2-hour human task [Lane G] | Decisive for Branch A viability | Blocks only if Branch A is chosen |
| **Budget envelope** | Lean WP fallback (lower) vs Astro+Sanity ($20K–60K est.) + $550–900/mo stack | Get a **fixed-scope quote** against the 12-page launch spec | The build-cost number is the biggest un-sourced figure in the model | **BLOCKS** go/no-go (payback math) |
| **Launch timing vs nor'easter season** | Full launch before Oct / phased with storm cluster first | **Storm/emergency/leak pages + LSA enrollment live before October**; rest can follow | Miss September publish → lose the whole storm season (8–12 wk ranking lag) [Lane B; Lane C] | Partial — storm cluster blocks; full site can phase |
| **East-End inclusion** | Exclude / informational-only / license first | **Exclude from advertising; informational content OK; gate CTAs** [Lane G] | Advertising unlicensed = violation | Decidable during build |
| **Eastern Building Supply structural advantage** | Design around it / ignore | **Flag, don't assume** — potential material-cost basis, contractor network, supplier relationships could underwrite pricing transparency and fulfillment, but no lane confirmed it's in scope | Could strengthen the transparency/pricing wedge and the operator question if leveraged | Decidable during build (but revisit the operator decision if it supplies the crew) |
| **Instant-quote tool** | Launch calibrated / launch cheap non-binding / defer | **Defer calibrated tool to phase 2** (no job-cost data); optional cheap lead-capture widget at launch (CL-7) | Uncalibrated price = credibility risk; it's not a moat anyway | Decidable during build |
| **Same-day replacement positioning** | Lead with it / support page only / drop | **Drop as primary** (claimed — H5 refuted); support page only if verified | Building on a claimed wedge wastes the launch | Decidable during build |

---

# PART 9 — PHASED ROADMAP

**Phase 0 — Foundations (pre-build).** Resolve Branch A/B + operator/crew + budget (Part 8 blockers). Verify Premium license if A. Secure Suffolk address + entity + Suffolk (and any town) licenses + insurance. Claim GBP (Suffolk address), Bing Places, BuildZoom. *Depends on:* Adam's decisions. *Success:* legal-to-advertise in the launch towns; GBP verified.

**Phase 1 — Storm-cluster launch (before October — HARD DEADLINE).** Ship: home, services hub, the urgent-service pages (emergency/storm/leak), 5–6 flagship deep town pages (western/central), `/financing/` with Acorn prequal, `/reviews/`, `/about/`, contact; the launch conversion stack (booking + missed-call-text-back + CallRail + 3-step form); LSA enrollment (2–5 wk lead time — start at licensing) [Lane C]; storm/emergency blog cluster. *Order rationale:* the emergency organic lane is open and has an October deadline; ranking lag is 8–12 weeks [Lane B]. *Depends on:* Phase 0. *Success:* storm/emergency pages indexed and LSA live before first nor'easter; first inspections booked online.

**Phase 2 — Depth + remaining towns (months 2–5).** Complete the 12 deep town pages; add metal/flat/inspection service pages; publish the cornerstone assets (Suffolk cost guide, shingle comparison, permit-by-town guide); review-velocity engine to 50+ then 100+; chamber membership in the base town; Reddit/Nextdoor presence begins. Ice-dam content by early November [Lane B]. *Success:* 12 town pages clearing the depth bar; review count climbing toward 100; ranking for `[service] [town]` + urgent-service long tail.

**Phase 3 — Scale + conversion depth (months 6–9).** Add top-6 town×service pages ({emergency, storm, leak, replacement-cost}); graduate ~5 high-demand hamlets; add skylights/gutters/siding; evaluate calibrated instant-price tool (if 20–30 jobs exist) and AI receptionist (if volume warrants); Best of Long Island nomination (window Jan 1–Aug 31) [Lane C]. *Success:* ~25–30 town pages; conversion optimized; second/third chamber memberships.

**Phase 4 — 12-month review.** CrUX field CWV data now available (resolves the PSI gap for own site) [Lane E]; reconcile the economics model against *actual* session/conversion/close data; decide East-End town-license expansion; consider same-day-replacement page only if capacity proven. *Success:* model inputs replaced with measured data; channel mix tuned.

**Calendar anchors:** storm/emergency + LSA **before October**; ice-dam content **by early November**; replacement revenue lands **spring/fall** (plan cash flow accordingly) [Lane G]; Best of LI nomination **Jan–Aug**.

---

# PART 10 — SOW HANDOFF PACKAGE

**Scope statement.** Design, build, and launch a new Suffolk-County-anchored residential roofing brand website on Astro + Sanity (WordPress lean-theme as named fallback), leading with transparency (license + itemized town pricing + §771-B compliance) and genuine local depth, targeting the urgent-service and cost-intent long tail across 12 hand-researched deep town pages, with a working booking + speed-to-lead + financing-prequal conversion layer, structured data, WCAG 2.2 AA compliance, and the storm/emergency cluster + LSA live before October 2026.

**In scope:** Astro+Sanity build; 12 deep town pages (flat `/areas/[town]/`) meeting the Part 3.6 depth bar; ~9 launch service pages incl. emergency/storm/leak/flat/metal/inspection; home/financing/reviews/about/gallery/contact/resources; internal-linking model; structured-data plan (Part 3.8); conversion stack (Part 3.9 launch tier); GA4 + Search Console + DNI call tracking; WCAG 2.2 AA; 301 redirect + broken-link discipline; editorial calendar seed content.

**Out of scope (launch):** auto-generated town×service grid; East-End advertising pages; calibrated instant-price tool; AI voice/chat receptionist; roofing CRM; Spanish-language/hreflang variants; skylights/gutters/siding pages; Wikidata/Knowledge-Panel/llms.txt investment; TikTok/voice programs.

**Deliverables with testable acceptance criteria:**
- 12 town pages, each with all 7 required CMS fields populated from primary sources (permit fee traceable to town fee schedule/eCode360, not a competitor claim); ≥3 named streets; FAQPage schema validates; 2,500–4,000 words. *Test:* page cannot publish with an empty required field; schema passes Rich Results Test.
- License number present in footer of every page + in-body on every town/service page. *Test:* automated presence check site-wide.
- Booking widget books a real inspection slot end-to-end. *Test:* complete a booking; confirmation fires GA4 key event.
- Financing prequal is a maintained third-party flow (no static page that can 404). *Test:* soft-pull flow completes.
- Speed-to-lead: form submit / missed call triggers SMS within 5 minutes. *Test:* timed end-to-end.
- WCAG 2.2 AA: automated scan (axe) clean of criticals + one manual keyboard/SR pass; accessibility statement published. *Test:* scan report + manual checklist.
- Performance: LCP hero ≤200KB, explicit width/height on all images, ≤3–4 async third-party scripts. *Test:* build-pipeline budget enforcement + CrUX post-launch.
- Storm/emergency/leak pages + LSA enrollment live before October. *Test:* indexed in Search Console; LSA active.

**Technical constraints/requirements:** static-first rendering; required-field CMS schema enforcing town-page uniqueness; canonical/self-referencing; split XML sitemaps by type; `RoofingContractor`/`Service`/`FAQPage`/`BreadcrumbList` JSON-LD; DNI preserving canonical NAP in HTML/schema; AVIF/WebP responsive images; self-hosted fonts; API/GBP-addressable booking layer (agentic-booking hedge); handoff documentation + "second developer can service it" as an acceptance criterion.

**Dependencies/assumptions:** Branch B decided and a real Suffolk address secured; Suffolk (+ any town) license + insurance in place; a real operator/crew to fulfill; legal review of §771-B/TCPA/review copy; fixed-scope build quote obtained. Session-volume assumptions are unverified pending a keyword tool.

**Success metrics (baseline → target):**
- Town/service organic sessions: 0 → measurable to town-page segment by month 6 (segmented via split sitemaps).
- Phone-click + form-submit key events: 0 → tracked from launch (sessions alone are not usable).
- Reviews: 0 → 50+ by month 6, 100+ by month 12 (compliant, ungated).
- Booked inspections via site: 0 → first within Phase 1.
- CWV: unmeasured → "Good" on CrUX once traffic permits.
- Storm cluster indexed before October: yes/no (binary gate).

**Known risks + mitigations:** unverified session volume → get keyword data before over-committing budget; developer dependency → conventional patterns + handoff docs (acceptance criterion); NY ADA suits → WCAG 2.2 AA from day one; §771-B non-compliance by copying competitors → legal review of all financing/insurance copy; capacity-vs-promise mismatch → sequence automation before any speed claim; instant-quote commoditization → don't build differentiation on it.

**Open questions the spec author must resolve (owner named):** Branch A/B (Adam); operator/crew (Adam); build budget/quote (Adam + build vendor); East-End license timing (Adam); exact 12th town (spec author + Lane B demand ranking); Cal.com vs Calendly (spec author); which cheap lead-capture widget, if any, at launch (spec author).

---

# APPENDIX — EVIDENCE INDEX

**Which lane supplied which key finding (and where the evidence is soft):**

| Finding | Lane | Strength |
|---|---|---|
| LI Roofing town pages ~6,000 words, priced, FAQPage schema | [Lane D], [Lane A] | **High** — direct verbatim fetch |
| Town-page depth bar / required-field protocol | [Lane D] | High — quoted anti-patterns (Renew 642w) |
| ≥3–4 competitors now show license # | [Lane A], [Lane B2-Claude] | High — verbatim quotes |
| Same-day replacement widely claimed (H5 refuted) | [Lane B], [Lane A - early draft] | High — direct SERP + homepages |
| 0/15 working booking/chat/text-to-quote | [Lane F] | High — 15-site fetch (JS-widget blind spot caveat) |
| Instant-quote commoditized; Bumble live | [Lane F - early draft] | High (Bumble fetch) / Medium (SaaS pricing = vendor claims) |
| §771-B roofing-specific compliance | [Lane G] | **High** — primary statute (nysenate.gov) |
| Southampton/E.Hampton/Shelter I. separate licenses | [Lane G] | High — town codes + legal commentary |
| SAB proximity decay → Suffolk address needed | [Lane C] | Medium — SEO-sourced, not Google-published |
| Directory dominance query-type-dependent (57%; ~70% vs ~10%) | [Lane B]; corroborated [Lane B1], [Lane B2] | High — 30-SERP tally |
| Emergency LSA-gated on mobile | [Lane B1-Gemini]; [Lane C] | Medium — B1 source-free but corroborated by C's LSA data |
| Astro+Sanity platform rec | [Lane E] | Medium — reasoned, agency-sourced cost ranges |
| Google spam policy = output uniqueness not method | [Lane E] | **High** — primary (developers.google.com) |
| NY #1 for ADA suits (1,108 in 2025) | [Lane E] | Medium — UsableNet vendor tracker, not PACER |
| Close 10–25% / conversion 0.5–5% | [Lane G] | Medium — converging vendor/industry sources |
| AI retrieval = same directory/review pool; add BuildZoom/Bing/Reddit | [Lane H] | High (retrieval pool) / Medium (citation-share figures) |
| Seasonality: revenue spring/fall, lead-capture Oct–Apr | [Lane G]; [Lane B1] | Medium-High |

**Softest foundations (flagged for the spec author):**
1. **Session volume (15–40/page/mo)** — *no keyword tool in any of the four keyword lanes (B, B1, B2, and the early B draft).* B1-Gemini's numeric volumes are modeled from population with **zero live sources, self-graded Low**. This is the single softest load-bearing input in the entire economics model. Measure before committing budget.
2. **Core Web Vitals** — never measured (PSI 429 across two sessions [Lane E]); competitor speed is architectural inference only.
3. **Map-pack composition** — never rendered by any lane (tool limit [Lane B, Lane C]); all "who ranks locally" is proxy.
4. **Backlink profiles** — zero data obtained [Lane C].
5. **Build cost** — no firm quote; $20K–60K is an agency-published range [Lane E].
6. **Manufacturer certification tiers** — all CLAIMED, none machine-verified (GAF locator 403s [Lane A]).
7. **First-party AI answers** — never observed; all AI-citation claims inferred [Lane H].
8. **Premium's license status** — unresolved (DCA tool blocks bots [Lane G]).

**On the B/B1/B2 three-way comparison:** all three converge that directories own head terms (H7), cost-intent is under-served, and emergency is organically soft — that convergence across independent runs is the strongest evidence in the keyword lane. They diverge on two points, both resolved: B1-Gemini alone claims emergency is LSA-walled (resolved as a *dual* organic+LSA play, CL-8) and B1 alone recommends launch-nested town×service pages at High confidence (rejected — it ran on zero sources vs. directly-fetched competitor pages, CL-1). B2-Claude is byte-identical to the root B early draft. Do not let B1's confident numeric volumes propagate as measured data — they are modeled.
