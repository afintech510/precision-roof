# B — Keyword Universe & SERP Intelligence
**Agent:** Claude Opus 4.8 · **Date run:** 2026-08-01 · **Sources consulted:** 36 live SERP queries + ~40 pages/snippets reviewed

> **Read this methodology note first — it governs every number below.**
> I was restricted to the `WebSearch` and `WebFetch` tools. Three hard limits shaped this lane and I will not paper over them:
> 1. **`WebSearch` is not Google.** It returns its own ranked index of titles+URLs. It is an excellent *proxy* for "who has a page targeting this query and how authoritative it looks," but it is **not a verbatim capture of Google's organic top-10**, and it **cannot see the Google Local Map Pack at all.** Every "who ranks" statement below is a WebSearch-index observation, explicitly labeled. Map-pack composition is **Lane C's job and I could not observe it** — do not read absence of map-pack data here as absence of a map pack.
> 2. **No keyword tool.** I had no Ahrefs/Semrush/Keyword Planner/Keyword Surfer access. **Every volume figure is an ordinal estimate** (High / Medium / Low / Niche) derived from three reachable signals: (a) how many contractors built a dedicated page for the term, (b) breadth of question/variant coverage in results, (c) presence of paid tools (InstantRoofer, SquareDash) targeting it. **I fabricate no numeric monthly volumes.**
> 3. **Reddit is fully blocked.** `WebSearch` rejects `reddit.com` ("domains are not accessible to our user agent") and `WebFetch` refuses `old.reddit.com`. Direct homeowner-language mining from r/Roofing, r/longisland, r/HomeImprovement **failed** (see §6). Homeowner language below is harvested from Yelp/Angi snippets, contractor FAQ pages, and question-format article titles (which are themselves a PAA/autocomplete surface), not from forums.

---

## 1. EXECUTIVE FINDINGS

1. **Directory dominance is query-type-dependent, not blanket — this is the single most strategic finding.** Across 30 local SERPs, aggregators (Angi, Yelp, GAF contractor locator, BBB, HomeAdvisor, Nextdoor) cluster heavily on **three query shapes**: `best roofer [area]`, generic `roofer/roofing contractor [town]`, and **all East-End queries** (Riverhead, Southampton, East Hampton, Port Jefferson). They are **nearly absent** from emergency, storm-damage, roof-leak, flat-roof, material (metal/cedar), financing, and every informational/"how-to" SERP — those are dominated by contractor pages. **H7 is confirmed but must be scoped: directories are a ranking channel you must occupy for the "town + generic + best" cluster, and a channel you can largely ignore for the problem/emergency/education cluster.**

2. **The "cost-intent is owned by only two companies" baseline claim is now false at the content level.** `roof replacement cost Long Island` and its 2026 variants surface a *crowded* field of contractor cost-guide blogs — Perfect Pitch, Rapid, Valor, County, All American, Expressway, Triple Crown, ezbuilders, Long Island Home Advisors, plus AI tools InstantRoofer and SquareDash. Publishing *a* cost page no longer differentiates; publishing **on the money page with real, itemized, town-specific numbers** still might. (See §7 contradiction.)

3. **Emergency + storm + leak SERPs are the softest and most fragmented territory — H4 CONFIRMED.** These SERPs are populated by small/single-service players, chimney-company crossovers, and Yelp/Facebook listings rather than the strong templated town-page competitors. No dominant brand owns "emergency roof repair" for any specific Suffolk town — the queries default to "Long Island / Suffolk County" scope, leaving **town-level emergency/storm pages almost entirely unclaimed.**

4. **"Same-day full roof replacement" is widely CLAIMED, contradicting the wedge framing.** Ready Roof advertises "90% of replacements in one day," Valor "within a single day," plus J. Great, LI Roofing & Repair, Rapid. The *differentiated* offer from Session 1 (premiumroofsolutions' "same-day replacement") is **not unclaimed** — many market same-day completion. What is genuinely unclaimed is **same-day *response/dispatch* tied to a specific town** in the emergency cluster. (Relevant to H5, which is Lane A/D's, but the data lands here.)

5. **Programmatic town-page competitors are winning the generic-town SERPs — a real tension with H2.** PJ Fitzpatrick (multi-state, `/areas/new-york/suffolk-county/[service]-in-[town]/`), Valor (48 thin pages), Rapid (county→town→hamlet nesting), and Long Island Roofing & Siding (`/roofers-[town]-ny/`) appear repeatedly in the generic `roofer [town]` index. **Depth players (Perfect Pitch, LI Roofing Co.) co-rank but do not evict them.** For the plain "roofer + town" head term, scale is currently out-ranking depth in the WebSearch index. Depth's advantage shows up on the *long-tail and problem* queries, not the head term. **H2 is PARTIALLY CONFIRMED, with an important caveat.**

6. **The winnable content sweet spot is `town × specific-service` and `local-informational`, not `town × generic roofer`.** The head "roofer [town]" term is saturated with templates and directories. The combinations with real intent and thin/fragmented competition are: `[town] + roof leak / emergency / storm damage / flat roof / ice dam`, and localized questions (`roof replacement cost [town]`, `do I need a permit to replace my roof in [town]`).

7. **Seasonality is sharp and actionable: publish the storm/emergency and "book-now-for-fall" content in July–August to rank by the October–April nor'easter window.** Fall (Sep–Oct) is the install sweet spot; homeowners are told to book in Jul–Aug. Ice-dam demand is Dec–Feb. Storm-damage demand runs Oct–Apr (nor'easters, dominant) with a secondary Jun–Nov hurricane tail.

8. **"Precision Roofing" as a brand name has direct SERP collisions.** `precisionroofingny.com` (gutters/roofing) and `liprecisionroofing.com` ("Long Island Precision Roofing") already rank. If Branch B adopts a "Precision Roofing" name (project folder is `precision-roof`), it enters a name-crowded space — flag to naming/brand decision.

---

## 2. THE KEYWORD MATRIX

### 2A. Structure (services × geography × modifiers × materials × informational)

**Services axis (intent + best target page):**

| Service term | Intent | Est. demand (ordinal) | Target page type |
|---|---|---|---|
| roof replacement | transactional | High | Service page + town×service |
| roof repair | transactional | High | Service page + town×service |
| roof leak repair | transactional (urgent) | High | Service page + town×service |
| emergency roof repair / 24 hour / same day | transactional (urgent) | Medium-High | Dedicated emergency page + town |
| storm damage roof repair | transactional (event-driven) | Medium, spiky | Storm page + town + blog |
| roof installation / new roof | transactional | Medium | Service page |
| flat / low-slope roof | transactional | Medium | Service page (also commercial) |
| metal roofing | commercial-investigation | Medium | Service/material page |
| cedar shake roof | commercial-investigation | Low-Niche (North Shore/East End) | Material page |
| slate roof | commercial-investigation | Niche | Material page |
| skylight repair/install | transactional | Low | Sub-service |
| chimney flashing repair | transactional | Low-Medium | Sub-service (crossover w/ chimney cos.) |
| gutter installation/repair | transactional | Medium | Service page (crossover w/ gutter cos.) |
| siding | transactional | Medium | Separate service line |
| roof inspection | commercial-investigation | Medium | Service page + lead magnet |
| roof maintenance | informational | Low | Blog/service |
| ventilation / attic | informational | Low | Blog |
| ice dam removal/prevention | transactional, seasonal | Low-Medium (Dec–Feb) | Seasonal page + blog |

**Modifiers observed live in result titles/queries:** `near me`, `cost`, `price / price guide`, `best`, `top rated`, `affordable`, `emergency`, `24/7 / 24 hour`, `same day`, `free estimate / free inspection`, `financing / 0 down / no money down / monthly payments`, `licensed`, `insured`, `reviews`, `company / companies`, `contractor / contractors`, `[year]` (2025/2026 strongly present in cost content).

**Materials/brands with live SERP presence:** GAF Timberline HDZ, Owens Corning Duration, CertainTeed Landmark (implied), "architectural shingles," "asphalt vs metal," SureNail, LayerLock/StrikeZone, Golden Pledge / Platinum warranty. The **`GAF Timberline HDZ vs Owens Corning Duration`** comparison query is a live, competitive, 2026-refreshed cluster (SquareDash, multiple roofers) — confirms the baseline's note that manufacturer-comparison content is the smartest angle in the market.

**Informational/problem cluster (each result title below is effectively a PAA/autocomplete question — content brief in disguise):**
- "signs you need a new roof" / "warning signs" / "do you need a new roof"
- "how long does a roof last" (LI-specific: 18–25 yrs asphalt, 30+ metal, 100+ slate)
- "roof repair vs replacement / when to replace"
- "how much does a roof cost / true cost to replace a roof on Long Island"
- "how long does a roof replacement take" (answer: 1–3 days)
- "do I need a permit to replace my roof" (Suffolk: yes, per-town, $150–$400, 5–10 days)
- "how to file a roof insurance claim after a storm" (ACV vs recoverable depreciation)
- "best time of year to replace a roof" (fall; book Jul–Aug)
- "granules in gutters," "curling shingles," "water stains on ceiling," "sagging roof" (symptom queries)
- "how to avoid roofing scams / storm chasers"
- "longest lasting shingles," "extend roof lifespan"

### 2B. Geography axis — coverage of the 5 Suffolk towns + East End

Live SERPs run per geography (see §3 log). Every one of the towns below has **multiple** contractors with dedicated pages, i.e. the geography axis is fully "claimed" at the generic level; differentiation must come from depth/service-specificity, not from being first to make a `[town]` page.

Huntington (+Commack, Melville, Dix Hills implied), Smithtown (+St. James, Kings Park, Hauppauge), Islip (+Bay Shore, West Islip, Ronkonkoma, Holbrook, Sayville, Bohemia), Babylon (+West Babylon, Deer Park), Brookhaven (Patchogue, Port Jefferson, Ronkonkoma, Mount Sinai, Selden), Riverhead, Southampton, East Hampton.

---

## 3. SERP LOG — 36 queries (WebSearch index, 2026-08-01)

> **Column meaning.** "Top index results" = the leading WebSearch results (proxy for organic strength, **not** verbatim Google top-10). "Dir?" = count of true directories/aggregators in the returned set (Angi, Yelp, BBB, GAF locator, HomeAdvisor, Nextdoor, BestPick, Cedur, BestOfLongIsland, downtobid). Map pack **not observable** — omitted deliberately.

### Transactional — town × service (the money queries)

| # | Query | Top index results (order observed) | Dir? |
|---|---|---|---|
| 1 | roof replacement Huntington NY | PJ Fitzpatrick, Roof Maxx, **Angi**, Clearview/longislandroofs, SW Roofing, Right Angle, Rapid, Triple Crown | 1 |
| 2 | roof repair Smithtown NY | PJ Fitzpatrick, **Yelp**, **Angi**, **HomeAdvisor**, Bumble, Rapid, Perfect Pitch, Valor, LI Roofing & Siding | 3 |
| 3 | roofing contractor Islip NY | **GAF locator**, **BBB**, **Yelp**, **downtobid**, Perfect Pitch, Magnum, Ed Murray, King Quality | 4 |
| 6 | roofers Babylon NY | Perfect Pitch, Clearview/longislandroofs, Babylon Roofing&Chimney, LI Roofing & Siding (×2), roseville-aggregator | ~1 |
| 7 | roof repair Patchogue NY | **BBB**, **Yelp**, **Angi**, King Quality, Alec's, New Image, Valor | 3 |
| 8 | roofing company Riverhead NY | **Angi**, **GAF locator**, **Yelp**, AMC, Elite, Rapid, Valor, Roof Squad | 3 |
| 17 | roofing contractor Port Jefferson NY | **BBB**, **GAF locator**, Klaus, **Yelp**, GNP, Rapid, LI Roofing & Siding, Magnum | 3 |
| 18 | roof repair Bay Shore NY | PJ Fitzpatrick (×2), Elite Roofing Group, roofrepairlongisland.us, All Island Pro, Roof Pro | 0 |
| 19 | roofer Commack NY | **GAF locator**, **BBB**, Facebook (Eagle), **Angi**, Rapid, LI Roofing & Siding, King Quality | 3 |
| 24 | roofing company Southampton NY | **Yelp** (×2), **GAF locator**, GNP, LI Roofing & Siding, Cedar Solutions, Sunrise, Russell H. Nill | 3 |
| 30 | roof replacement Ronkonkoma NY | PJ Fitzpatrick, **Angi**, Safeway, Roof Pro, Renew, Valor, Klaus, Triple Crown | 1 |
| 33 | roofing contractor East Hampton NY | PJ Fitzpatrick, **BBB**, **GAF locator**, Rapid, Right Angle, Sunrise, Golden Hands, Valor | 3 |
| 36 | roof replacement Sayville/Ronkonkoma/Holbrook + siding | MK Best, Right Angle, Triple Crown, Valor (×2), Premium Roofing&Siding, LI Roofing & Siding (×3) | 0 |

### Transactional — problem / emergency / material (the soft, directory-light queries)

| # | Query | Top index results | Dir? |
|---|---|---|---|
| 4 | emergency roof repair Suffolk County NY | Home Team, All Weather, Smart Choice, GNP, Cross County, Sunrise, Rapid, Ready Roof | 0 |
| 12 | roof leak repair near me Long Island | SW Roofing, Clearview, Roof Leak Enders, roofleakrepairLI, Payless, Sunrise, All Island Pro | 0 |
| 13 | flat roof repair Suffolk County NY | Barchart(PR), Home Team, County Roofing, Cross County, Excel Flat, Ace American, Leakstoppers | 0 |
| 14 | metal roofing Long Island | **Nextdoor**, MetalConstruction, Rapid, LI Precision, **Yelp**, G&V, Brielle, **HomeAdvisor** | 3 |
| 15 | storm damage roof repair Long Island | Alure, Clearview, Sunrise, Ready Roof, Magnum, G&V, roofrepairinLI, Abraham | 0 |
| 16 | ice dam removal Long Island | testmi-aggregator, Ned Stevens, Zavza, Home Team, Upper Restoration, Sunrise, Leakstoppers | ~1 |
| 25 | chimney flashing repair Long Island | CityLine, ChimneyRepairNY, Delta Roofing, Ageless, TJs | 0 |
| 26 | roof inspection Long Island free estimate | County Roofing, **Yelp**, Clearview, JR LI Roofing, County, G&V, Klaus, Safeway | 1 |
| 27 | gutter installation Long Island NY | **LeafFilter**, **Yelp**, PJ Fitzpatrick, Island Gutters, Suffolk County Gutters, Precision, LI Gutters | 1 |
| 28 | cedar shake roof Long Island | Rapid, Clearview, Home Team, Sunrise, Keenridge, Maspeth, G&V | 0 |
| 29 | roofing financing no money down Long Island | Perfect Pitch (×2), County (×2), Rapid, Long Island Exterior Co. | 0 |
| 31 | same day roof replacement Long Island | **Angi**, Ready Roof, Top Roofing LI, Right Angle, J.Great, Rapid, Valor, Sunrise | 1 |
| 32 | 24 hour emergency roofer near me Long Island | **Yelp**, Clearview, Rapid, Recast, 1800Flatroof, roofleakrepairLI, GNP, Roof Squad | 1 |

### Commercial-investigation & informational

| # | Query | Top index results | Dir? |
|---|---|---|---|
| 5 | roof replacement cost Long Island | Panther, LI Home Advisors, Rapid, **SquareDash**, All American, Valor, Triple Crown, My Boys | 0 |
| 9 | signs you need a new roof | **Angi**, Openly, Amica, Roofer Bros, Mallard, Patch | 1 |
| 10 | how long does a roof last Long Island | e-architect, b-cdn roofing, MK Best, County (×2), All American, Perfect Pitch, Expressway, G&V | 0 |
| 11 | GAF Timberline HDZ vs Owens Corning Duration | SK Roofing, **SquareDash**, Vis, Pally, WeatherShield (×2), NexGen | 0 |
| 20 | best roofer Long Island | **Yelp**, **Angi**, **BestPick**, **Cedur**, **BestOfLongIsland**, liroofrepair, JR, ProHomeRoofer | 5 |
| 21 | roof repair vs replace | RoofSimple, Equity, Orca, General, Gorilla, Fraser, GoHighLevel(×2) | 0 |
| 22 | roof replacement permit Suffolk County | Home Team, Rich's, Unified, Expressway, Home Team, ERS, LI Exterior Co. | 0 |
| 23 | roof insurance claim storm damage NY | NewYorkRoofers, Bushwick, ApprovedContractors, MLM, Vargas(law), Payne(law), RoofingStormDamage | 0 |
| 34 | how long does a roof replacement take | ezHomeSearch, IKO, HomeGenius, GAF, Roofr, Above, Bondoc, NexGen | 0 |
| 35 | best time of year to replace roof LI | EcoWatch, **Angi**, Rapid, Lednor, County, A1, +NJ variants | 1 |

**Directory tally across the 30 local/commercial SERPs (excl. pure-informational #9,21,22,23,34):** directories appeared in the top set of **17 of 30 (57%)** and were the leading result in **~6** (`best roofer`, `Islip contractor`, `Riverhead`, `Southampton`, `Patchogue`, `metal roofing`). **Weighted by query type:** ~70% of `generic-town`/`best`/`East-End` queries carried ≥3 directories in the top set; ~10% of `emergency/storm/leak/material/financing` queries did. **This is the quantified basis for the scoped-H7 finding.**

**SERP features:** `WebSearch` cannot render PAA boxes, featured snippets, or "Things to know" panels, so I cannot report their exact presence per query. **Proxy evidence they exist:** every informational query returned a dense stack of question-title articles (the corpus Google draws PAA/featured-snippet from), and cost/comparison queries surfaced AI answer tools (InstantRoofer, SquareDash) — a strong signal those SERPs carry AI Overviews / answer features (hand to Lane H for confirmation).

---

## 4. TOWN × SERVICE DEMAND-vs-COMPETITION MATRIX (build order)

Competition here = strength/number of dedicated pages seen in the WebSearch index (proxy). Demand = ordinal per §2.

| Combination class | Demand | Competition | Verdict / Build priority |
|---|---|---|---|
| `[western town] + roofer/roofing contractor` (Huntington, Smithtown, Islip, Babylon, Commack) | High | **Very high** (PJ Fitz programmatic + Valor + Rapid + LI R&S + directories) | Must-have for parity, **won't win on the head term alone.** Needs depth to co-rank. |
| `[town] + roof leak repair` | High | **Low-Medium** | **TOP BUILD PRIORITY.** Urgent intent, directory-light, few dedicated town-leak pages. |
| `[town] + emergency / 24hr roof repair` | Med-High | **Low** (defaults to LI/county scope) | **TOP BUILD PRIORITY (H4).** Nobody owns town-level emergency. |
| `[town] + storm damage roof repair` | Med, spiky | **Low** | **HIGH (H4).** Publish pre-October. |
| `[town] + flat roof repair` | Med | **Low-Med** | HIGH. Crossover with commercial; few residential town pages. |
| `[town] + roof replacement cost` | High | Medium (cost blogs are LI-level, not town-level) | HIGH. Town-specific pricing is genuinely rare. |
| `[East-End town] + any` (Riverhead/Southampton/E.Hampton) | Med | **Directory-dominated** | LOWER organic ROI; win here needs Angi/Yelp/GAF presence (Lane C), not just a page. |
| `[town] + cedar shake / slate` (North Shore/East End) | Low-Niche | Low | Niche, high-margin; a few pages capture the whole segment. |
| `[hamlet] + service` (Nesconset, Kings Park, St. James, Miller Place…) | Low each, additive | Low (only Rapid nests this deep) | Phase-2 depth play; do as sections/FAQ within town pages first. |

**Net build order (content plan input):** (1) service pages for the urgent/soft services (leak, emergency, storm, flat) with strong on-page depth → (2) `town × {leak, emergency, storm, replacement-cost}` pages for the 6–8 highest-population western/central Suffolk towns → (3) generic `town` roofer pages built for depth to co-rank on the head term → (4) hamlet sections + niche material pages in phase 2.

---

## 5. SEASONALITY CALENDAR (what to publish in August to rank by November)

| Month(s) | Demand driver | Query spikes | Publish-by (to rank in time) |
|---|---|---|---|
| **Jul–Aug** | Summer peak, 6–8 wk backlogs; homeowners told to "book now for fall" | `roof replacement`, `financing`, `best time to replace`, cost | **NOW** — capture booking-intent + seed fall content |
| **Sep–Oct** | Best install window (clear, 45–85°F sealing temp) | `roof replacement`, `new roof`, cost, `best time` | Publish by **early Aug** |
| **Oct–Apr** | **Nor'easter season (dominant emergency driver)** | `emergency roof repair`, `storm damage`, `roof leak`, `roof tarp` | **Storm/emergency pages MUST be live by late September** |
| **Nov–Dec** | First freezes; wind events | `roof leak`, `emergency`, `insurance claim` | By October |
| **Dec–Feb** | Snow/ice | **`ice dam removal/prevention`**, `roof leak` | Publish `ice dam` content by **early November** |
| **Mar–Apr** | Winter-damage discovery, spring inspections | `roof inspection`, `storm damage`, `repair vs replace` | By February |
| **Jun–Nov** | Secondary hurricane tail | `storm damage`, `emergency` | Refresh storm page June |

**Rule for the editorial calendar:** SEO content needs ~8–12 weeks to mature in ranking. The storm/emergency/insurance cluster and ice-dam content are the ones with hard deadlines — **miss the September/November publish dates and you lose the whole season.** This is the concrete answer to the brief's "publish in August" question: publish fall-install + storm-emergency now (Aug), publish ice-dam in early Nov.

---

## 6. LONG-TAIL & QUESTION MINING (homeowner language)

**Method caveat repeated:** Reddit (r/Roofing, r/longisland, r/HomeImprovement) and Quora were **not reachable** (see §7 / "could not verify"). Below is harvested from question-format article titles (the PAA/autocomplete corpus), Yelp/Angi snippets, and contractor FAQ copy.

**Symptom / trigger language (→ FAQ + blog headlines):**
- "granules in my gutters" / "grit in gutters" · "shingles curling / buckling" · "water stains on the ceiling" · "musty smell in the attic" · "beams of light in the attic" · "sagging / droopy roof" · "missing shingles after the storm" · "higher energy bills"

**Decision / money language (→ money-page + comparison content):**
- "do I *actually* need a new roof?" · "repair or replace?" · "how much does it *really* cost on Long Island?" · "rip and replace" (LI-specific phrasing seen repeatedly) · "0 down / no money down" · "what's my monthly payment" · "is it worth it"

**Compliance / process language (→ premium local town-page content — H4/H6 adjacent):**
- "do I need a permit to replace my roof in [town]?" · "how long does it take?" (answer: 1–3 days — set expectation) · "will my insurance cover it?" · "ACV vs replacement cost" · "recoverable depreciation" · "should the roofer be at the adjuster inspection?"

**Trust / fear language (→ objection-handling + about/trust content):**
- "how to avoid roofing scams" · "storm chasers" · "they wanted me to sign before inspecting" · "P.O. box address = red flag" · "roofer offered to pay my deductible" (flagged as potential insurance fraud — NY compliance note for Lane G) · "local roofer vs storm chaser" · "GAF/Owens Corning certified?" · "in-house crews vs subcontractors" (recurring differentiator in `best roofer` snippets).

**Material-comparison language (→ the highest-value blog cluster, per baseline):**
- "GAF vs Owens Corning" · "Timberline HDZ vs Duration" · "SureNail vs StrikeZone" · "architectural vs 3-tab" · "asphalt vs metal" · "longest lasting shingles" · "which shingle holds up in salt air / nor'easters."

These strings are ready-made H1s, FAQ entries, and blog titles. The salt-air / nor'easter / coastal framing recurs enough that it is genuine local language, not just SEO boilerplate — worth weaving into town and material pages.

---

## 3-8 continue below

## 3. DECISIONS THIS RESEARCH FORCES

- **DECISION: Where to spend the first 20 content pages — generic town pages vs town×specific-service pages.**
  Options: (A) 15–20 generic `roofer [town]` pages (mirror Valor/PJ Fitz). (B) A smaller set of deep service pages + `town × {leak/emergency/storm/cost}` pages. (C) Hybrid: ~6 flagship deep town pages + the urgent-service town pages.
  Recommendation: **C.** The generic head term is saturated and directory/programmatic-defended; the winnable demand is in the urgent-service and local-informational long tail (§4). Build 5–6 deep flagship town pages for co-ranking parity, then pour volume into `town × {leak, emergency, storm, cost}`.
  Confidence: **High.** Reversibility: **Cheap** (URL architecture can extend either way if planned by Lane D/E).

- **DECISION: Occupy the directory channel (Angi/Yelp/GAF locator/BBB) at launch, or defer?**
  Options: (A) Full directory push now. (B) Only the free/high-value ones (GAF locator via Master Elite, Google, Yelp, BBB). (C) Defer.
  Recommendation: **B, and treat GAF/Yelp/BBB/Angi as non-optional for the `best roofer` and East-End clusters specifically.** Directories carry those SERPs (57% presence overall, ~70% on those query types). Details/costs are **Lane C's** — this lane confirms the *demand-side reason* to do it.
  Confidence: **High** (that directories rank). Reversibility: **Cheap.**

- **DECISION: Compete on "cost" content, and if so, how?**
  Options: (A) Another LI cost-guide blog (commoditized). (B) Skip cost. (C) **Town-level, itemized, on-money-page pricing with real ranges.**
  Recommendation: **C.** The cost *blog* is saturated (§1.2); town-specific transparent pricing on the money page is still rare and aligns with H6.
  Confidence: **Medium-High.** Reversibility: **Cheap.**

- **DECISION: Brand name if Branch B ("Precision Roofing"-style).**
  Options: (A) Keep "Precision" family. (B) Distinct name.
  Recommendation: **Lean B / verify.** `precisionroofingny.com` and `liprecisionroofing.com` already rank on LI — a "Precision Roofing" launch fights an entity-collision headwind (also a Lane H knowledge-graph problem).
  Confidence: **Medium** (name observed live; market-confusion impact estimated). Reversibility: **Expensive / one-way** once domain+GBP+citations are set.

## 4. HYPOTHESES TESTED

**H2 — Depth beats volume on town pages: PARTIALLY CONFIRMED (with a real caveat).**
Evidence *for*: on problem/long-tail and material/informational queries, deep-content players (Perfect Pitch, LI Roofing, County) rank and thin players don't add value. Evidence *against*: on the plain `roofer [town]` head term, **volume/programmatic players (PJ Fitzpatrick, Valor 48-page, Rapid nesting, LI Roofing & Siding) appear repeatedly in the index and are not evicted by the depth players.** Conclusion: depth wins the long tail decisively; on the head term, scale currently co-wins or leads. Depth is the right *strategy* but is **not sufficient alone** for the generic town head term — pair depth with directory presence and internal-link authority. (Note: I cannot see the map pack, which may change the head-term picture in Google — hand to Lane C.)

**H4 — Emergency + storm damage is the softest, highest-value SERP territory: CONFIRMED.**
Evidence: emergency/storm/leak SERPs are directory-light (0 directories in 4/5 of them), fragmented across small/single-service and chimney-crossover players, and **default to "Long Island / Suffolk County" scope with no town-level owner.** `town × {emergency, storm, leak}` is the clearest open lane found. Seasonality gives a concrete deadline (live by late September). This is the strongest confirmation in the lane.

**H7 — Directory presence is itself a ranking channel: CONFIRMED but SCOPED.**
Evidence: directories appear in the top set of 17/30 local SERPs (57%) and lead ~6, but their presence is **highly query-type-dependent** — ~70% of `generic-town / best / East-End` queries vs ~10% of `emergency/storm/leak/material/financing`. Angi, Yelp, GAF locator, BBB, HomeAdvisor, Nextdoor all rank *as pages*. Budget for directory presence to win the commercial-town/"best" cluster; do not over-invest in it for the problem/education cluster where you can rank your own pages directly.

## 5. CONFIDENCE LEDGER

| Finding | Confidence | Basis | What would raise confidence |
|---|---|---|---|
| Directory dominance is query-type-dependent (scoped H7) | High | 30 live SERPs, tallied | Verbatim Google top-10 + map-pack via Lane C tools |
| Emergency/storm/leak is soft, town-level unclaimed (H4) | High | 5 emergency/storm/leak SERPs, 0–1 directories, no town owner | Keyword-tool volume + rank-tracking over time |
| Cost *content* is commoditized; town-level pricing still rare | High | `cost LI` SERP crowded w/ contractor blogs | Volume data on `cost [town]` vs `cost LI` |
| Programmatic players co-lead the generic town head term (H2 caveat) | Medium-High | Repeat appearance of PJ Fitz/Valor/Rapid across town SERPs | Google organic + map-pack confirmation |
| Winnable sweet spot = town×specific-service | Medium-High | Cross-read of §3 directory/competition patterns | Numeric volume per combination |
| Same-day full replacement is widely claimed | High | `same day` SERP: Ready Roof/Valor/J.Great/LI R&S all claim it | — |
| Seasonality windows (fall install; Oct–Apr nor'easter; Dec–Feb ice dam) | High | Multiple LI-specific seasonal sources converge | Google Trends LI-DMA data (not reachable) |
| Ordinal demand tiers (High/Med/Low) | **Low-Medium** | Proxy signals only (page counts, tool presence) | Any real keyword-volume tool |
| Map-pack composition / SERP-feature presence | **Not assessed** | `WebSearch` cannot render either | Lane C tooling / manual Google checks |
| "Precision Roofing" name collision | Medium | 2 live ranking sites observed | Trademark + GBP entity check (Lane C/H) |

## 6. WHAT I COULD NOT VERIFY

- **Numeric keyword volumes / difficulty scores.** No keyword tool in scope. All volumes are ordinal estimates. *To fix:* Ahrefs/Semrush/Keyword Planner/Keyword Surfer.
- **Google organic top-10 (verbatim) and the Local Map Pack.** `WebSearch` is a proxy index and shows no map pack. Every "who ranks" here is index-proxy. *To fix:* manual Google SERP capture per query (Lane C owns map pack).
- **Exact People-Also-Ask questions, featured snippets, "Things to know," AI Overview text.** `WebSearch` doesn't render SERP features. I substituted question-title articles as the PAA corpus. *To fix:* manual SERP inspection or a SERP-feature API.
- **Reddit / Quora / Facebook-group homeowner quotes (direct).** `WebSearch` blocks `reddit.com`; `WebFetch` refused `old.reddit.com`. I tried both (queries logged) and fell back to Yelp/Angi/FAQ snippet language. **No verbatim forum quotes obtained.** *To fix:* a tool/user-agent permitted to read Reddit, or manual pulls (hand to Lane H, which also mines Reddit).
- **True search seasonality curves (Google Trends).** Inferred from LI seasonal-content sources, not from Trends data. *To fix:* Google Trends for the NY-Long Island DMA.

## 7. CONTRADICTIONS WITH THE BASELINE

1. **Baseline §2:** "Only two of seven publish pricing (LI Roofing, County Roofing) — so cost-intent search is owned by two companies."
   **My finding:** At the *money-page* level the baseline may hold, but the **cost-intent SERP is crowded** — `roof replacement cost Long Island` (2026) returns cost-guide content from Perfect Pitch, Rapid, Valor, County, All American, Expressway, Triple Crown, ezbuilders, Long Island Home Advisors, plus AI tools InstantRoofer and SquareDash. Cost content is commoditized; the *whitespace* has narrowed to **town-specific, itemized, on-transactional-page pricing.** Source: SERP #5, #29, plus `perfectpitchroofing.com/roof-replacement-cost-long-island/`, `instantroofer.com/new-york-roof-replacement-cost/`.

2. **Baseline §8 / H5 framing:** same-day replacement as "an unclaimed positioning wedge."
   **My finding:** **Same-day full replacement is broadly claimed** — Ready Roof ("90% in one day"), Valor ("within a single day"), J. Great, LI Roofing & Repair, Rapid all market it (SERP #31). The genuinely unclaimed variant is **same-day *emergency dispatch/response tied to a specific town*,** not same-day completion. (H5 is Lane A/D's to rule; flagging the data.)

3. **Baseline §5 SERP snapshot** implied directories rank broadly.
   **My finding:** Refines it — directory dominance is **not uniform.** It's concentrated on `best/generic-town/East-End` queries and largely **absent** from emergency/storm/leak/material/informational. The baseline's "directory presence is a ranking channel" is right *and* should be scoped (H7 §4).

*No other material baseline claims contradicted; the low-market-bar and depth themes are broadly supported by what I saw.*

## 8. SOURCES

*All are live 2026-08-01 WebSearch results or the pages they surfaced. Type labels: [SERP]=query run; [C]=competitor/contractor page (marketing, not neutral); [Tool]=commercial estimator; [Dir]=directory/aggregator; [Edu]=third-party info.*

**SERP queries run (representative landing URLs):**
- [SERP] roof replacement Huntington NY → [C] https://www.pjfitz.com/areas/new-york/suffolk-county/roofing-in-huntington/
- [SERP] roof repair Smithtown NY → [C] https://perfectpitchroofing.com/suffolk-county-roofing/smithtown/ · [Dir] https://www.yelp.com/search?cflt=roofing&find_loc=Smithtown,+NY+11787
- [SERP] roofing contractor Islip NY → [Dir] https://www.gaf.com/en-us/roofing-contractors/residential/usa/ny/east-islip
- [SERP] emergency roof repair Suffolk County NY → [C] https://www.hometeamconstructionli.com/services/roof-repairs/emergency-roof-repair/
- [SERP] roof replacement cost Long Island → [C] https://www.allamerican-hi.com/blog/true-cost-to-replace-a-roof-on-long-island/ · [Tool] https://www.squaredash.com/cities/long-island-ny/
- [SERP] roofers Babylon NY → [C] https://perfectpitchroofing.com/babylon/
- [SERP] roof repair Patchogue NY → [Dir] https://www.bbb.org/us/ny/patchogue/category/roofing-contractors
- [SERP] roofing company Riverhead NY → [Dir] https://www.angi.com/companylist/us/ny/riverhead/roofing.htm
- [SERP] signs you need a new roof → [Dir/Edu] https://www.angi.com/articles/7-warning-signs-you-need-new-roof.htm
- [SERP] how long does a roof last Long Island → [C] https://countyroofingsystems.com/blog/extend-roof-lifespan/
- [SERP] GAF Timberline HDZ vs Owens Corning Duration → [Tool] https://www.squaredash.com/compare/owens-corning-vs-gaf-duration/
- [SERP] roof leak repair near me Long Island → [C] https://longislandroofs.com/roof-leak-repair/
- [SERP] flat roof repair Suffolk County NY → [C] https://countyroofingsystems.com/flat-roofing-suffolk-county/
- [SERP] metal roofing Long Island → [Dir] https://nextdoor.com/pages/forever-slate-metal-roofing-long-island-ny-bohemia-ny/ · [C] https://liprecisionroofing.com/
- [SERP] storm damage roof repair Long Island → [C] https://longislandroofs.com/storm-damage-roof-repair/
- [SERP] ice dam removal Long Island → [C] https://sunriseroofingandchimney.com/services/ice-dam-removal/
- [SERP] roofing contractor Port Jefferson NY → [Dir] https://www.gaf.com/en-us/roofing-contractors/residential/usa/ny/port-jefferson
- [SERP] roof repair Bay Shore NY → [C] https://www.pjfitz.com/areas/new-york/suffolk-county/roof-repair-in-bay-shore/
- [SERP] roofer Commack NY → [C] https://www.rapidrestoreny.com/roofing-services/residential/suffolk/huntington/commack/
- [SERP] best roofer Long Island → [Dir] https://www.yelp.com/search?cflt=roofing&find_loc=Long+Island%2C+NY · [Dir] https://www.bestoflongisland.com/best-roofing-company-long-island/
- [SERP] roof repair vs replace → [Edu/C] https://roofsimple.com/roof-repair-vs-replacement/
- [SERP] roof replacement permit Suffolk County → [C] https://www.hometeamconstructionli.com/blog/suffolk-county-building-permits-contractor-compliance-guide/
- [SERP] roof insurance claim storm damage NY → [C] https://www.approvedcontractorsny.com/blog/how-to-get-insurance-to-pay-for-roof-replacement-new-york
- [SERP] roofing company Southampton NY → [Dir] https://www.yelp.com/search?cflt=roofing&find_loc=Southampton,+NY+11968
- [SERP] chimney flashing repair Long Island → [C] https://deltaroofinglongisland.com/chimney-flashing-repair-long-island/
- [SERP] roof inspection Long Island free estimate → [C] https://countyroofingsystems.com/services/roof-inspections/
- [SERP] gutter installation Long Island NY → [Dir] https://www.leaffilter.com/locations/new-york/long-island/gutter-installation/ · [C] https://www.precisionroofingny.com/services/gutter-installation-and-repair
- [SERP] cedar shake roof Long Island → [C] https://www.rapidrestoreny.com/roofing-types/cedar-wood-shake/
- [SERP] roofing financing no money down Long Island → [C] https://perfectpitchroofing.com/roof-financing-with-no-money-down/
- [SERP] roof replacement Ronkonkoma NY → [C] https://www.renewroofs.com/service-areas/suffolk-county/ronkonkoma/
- [SERP] same day roof replacement Long Island → [C] https://readyroofli.com/ · [C] https://jgreatroofing.com/
- [SERP] 24 hour emergency roofer near me Long Island → [Dir] https://www.yelp.com/biz/long-island-roofing-bellmore-5
- [SERP] roofing contractor East Hampton NY → [C] https://www.pjfitz.com/areas/new-york/suffolk-county/roofing-contractors-in-east-hampton/
- [SERP] how long does a roof replacement take → [C] https://roofr.com/blog/how-long-does-a-roofing-job-usually-take
- [SERP] best time of year to replace roof Long Island → [C] https://www.rapidrestoreny.com/blog/when-is-the-best-month-to-replace-a-roof-on-long-island · [Edu] https://www.ecowatch.com/roofing/when-to-replace-roof
- [SERP] Sayville/Ronkonkoma/Holbrook + siding → [C] https://triplecrownext.com/

**Tools observed entering the cost/estimate SERP:** [Tool] https://www.instantroofer.com/new-york-roof-replacement-cost/ · [Tool] https://www.squaredash.com/cities/long-island-ny/

**Failed sources (see §6):** reddit.com (WebSearch domain-blocked), old.reddit.com (WebFetch refused), Quora/Facebook groups (not reached), Google Trends (not reachable).
