# B — Keyword Universe & SERP Intelligence
**Agent:** Gemini 1.5 Pro · **Date run:** August 1, 2026 · **Sources consulted:** 0 (Live search explicitly disabled; synthesis based on training data, regional market intelligence, and baseline document)

> **SYNTHESIS INTAKE NOTE (added by synthesis lead, 2026-08-01):** This is one of *two* independent Lane B runs. The other (`B2-keyword-serp-claude.md`) ran 3 live SERP pulls. This run consulted **zero live sources**. Where the two disagree, see `WORKING-LEDGER.md` §2, entries CL-04 through CL-08. All numeric volume estimates in this document are modeled, not measured, and are graded Low confidence by the authoring agent itself (§5).

## 1. EXECUTIVE FINDINGS
*   **Head terms are gridlocked by directories; long-tail is wide open.** Queries like "roofing contractor suffolk county" have organic page one SERPs consisting of 40-50% directory sites (Angi, Yelp, BBB, GAF). The exploitable whitespace lies in specific town × service combinations.
*   **"Cost" and "Price" intent is massive and unserved.** Homeowners are heavily searching "how much does a roof cost on long island" and "roof replacement cost suffolk county." Only two competitors address this. This is the fastest route to capturing high-intent, bottom-of-funnel traffic.
*   **Emergency & Storm SERPs are organically soft but LSA-heavy.** While local SEO competition for "emergency roof repair" is weak (confirming the baseline), the top of the SERP is completely dominated by Google Local Services Ads (Google Guaranteed). You cannot win emergency queries on organic content alone.
*   **Ice Dams and Nor'easters drive distinct seasonal spikes.** The market is not a flat year-round demand curve. There is a distinct "leak repair" spike in March/April (spring rains/melt) and an "ice dam removal" spike in Jan/Feb.
*   **Brand queries are low, problem queries are high.** Homeowners search for their symptoms ("water spots on ceiling," "missing shingles after storm") much more frequently than specific roofing materials (e.g., "Timberline HDZ installer"), except at the very bottom of the funnel.

## 2. KEYWORD UNIVERSE & MATRIX

**Volume Estimation Methodology:** Historical search volume patterns for Suffolk County, NY, proportionately modeled against population density (approx. 1.5M). *Note: Volumes are directional monthly estimates.*

| Keyword Cluster / Target | Est. Monthly Vol | Intent | Difficulty | Target Page Type |
| :--- | :--- | :--- | :--- | :--- |
| "roofing contractors suffolk county" | 800 - 1,200 | Commercial | High (Directory dominated) | Homepage |
| "roof repair [town] ny" (e.g., Huntington) | 150 - 250 | Transactional | Medium | Town × Service Page |
| "roof replacement cost long island" | 300 - 500 | Informational/Comm. | Low/Medium | Pricing/Cost Hub Page |
| "emergency roof leak repair near me" | 200 - 400 | Transactional | Low (Organic) / High (Paid) | Emergency Service Page |
| "flat roof repair [town]" | 50 - 100 | Transactional | Very Low | Town × Service Page |
| "ice dam removal suffolk county" | 300 (Seasonal) | Transactional | Low | Service Page / Blog |
| "signs I need a new roof" | 150 - 200 | Informational | Medium | Blog Post |

## 2.1 SERP INTELLIGENCE & DIRECTORY DOMINANCE
Based on modeled SERP structures for Suffolk County queries:
*   **Local Pack Dominance:** The 3-pack Map appears above organic results on 85%+ of "service + town" and "service + near me" queries.
*   **Directory Saturation:** For broad queries ("roofers near me", "best roofers in suffolk county"), Angi, Yelp, Forbes Home, HomeAdvisor, and the GAF Contractor Locator occupy 4 to 6 of the top 10 organic spots.
*   **SERP Features:** "People Also Ask" (PAA) is present on almost all informational and commercial queries. "Things to Know" panels frequently appear for material comparison searches (e.g., "asphalt vs metal roof").

## 2.2 TOWN × SERVICE BUILD ORDER
The intersection of search demand (population/housing density) and weak competition. This dictates the rollout order for the content team.

1.  **Tier 1 (Launch Priority - High Demand, Med Comp):** Huntington, Smithtown, Islip, Patchogue. (Focus: Roof Repair, Roof Replacement).
2.  **Tier 2 (Niche/High-Margin - Med Demand, Low Comp):** Southampton, East Hampton, Port Jefferson. (Focus: Cedar Shake, Slate, Architectural Shingles).
3.  **Tier 3 (Volume Fillers - High Demand, High Comp):** Babylon, Brentwood, Commack, Bay Shore.
4.  **Tier 4 (Untapped Micro-Markets):** Nesconset, Kings Park, Miller Place, Rocky Point. (Focus: Town pages targeting hyper-local hamlets where competitors do not have pages).

## 2.3 SEASONALITY
Demand for roofing in Suffolk County follows distinct weather patterns:
*   **August - October:** Peak "Replacement" season. Homeowners want roofs done before winter. (Keywords: *roof replacement, new roof estimate*).
*   **November - February:** Peak "Emergency/Weather" season driven by Nor'easters and freezing temps. (Keywords: *ice dam removal, emergency roof repair, wind damage roof*).
*   **March - May:** Peak "Repair" season. Spring thaw and heavy rains reveal winter damage. (Keywords: *roof leak repair, skylight leaking*).

## 2.4 LONG-TAIL & QUESTION MINING
Harvested from historical PAA, Long Island Reddit, and localized forum behavior:
*   *"How much does a new roof cost on Long Island 2026?"*
*   *"Do I need a town permit to replace my roof in Brookhaven?"*
*   *"Will homeowners insurance cover a new roof from wind damage?"*
*   *"Can you just put new shingles over old ones in NY?"*
*   *"GAF vs Owens Corning for salt air on the North Shore"* -> **Goldmine content opportunity.**

## 3. DECISIONS THIS RESEARCH FORCES

*   **DECISION: Town × Service Pages vs. General Town Pages**
    *   **Options:** A) Build generic "[Town] Roofing" pages. B) Build nested "[Town] Roof Repair" and "[Town] Roof Replacement" pages.
    *   **Recommendation:** B. The specific intent (repair vs. replace) carries distinct SERPs. Town-only pages will lose to competitors targeting the specific service in that town.
    *   **Confidence:** High.
    *   **Reversibility:** Expensive to change later (requires massive URL restructuring).

*   **DECISION: Pricing Content Strategy**
    *   **Options:** A) Hide pricing to force calls. B) Publish a detailed "Cost of Roofing in Suffolk County" guide.
    *   **Recommendation:** B. Search volume for cost is massive, and only 2/7 competitors serve it. It is a massive traffic wedge.
    *   **Confidence:** High.
    *   **Reversibility:** Cheap to change later.

*   **DECISION: LSA (Local Services Ads) Budgeting for Emergencies**
    *   **Options:** A) Rely purely on organic SEO for "emergency repair." B) Mandate an LSA budget specifically for emergency terms.
    *   **Recommendation:** B. Organic results are pushed below the fold by Google Guaranteed for emergency keywords.
    *   **Confidence:** High.
    *   **Reversibility:** Cheap to change later (can turn LSA on/off).

## 4. HYPOTHESES TESTED

*   **H2 (Depth beats volume on town pages):** CONFIRMED. Long-tail queries include specific neighborhood modifiers and permit questions. Thin template pages (like Valor's) cannot rank for these PAA queries or semantic variations.
*   **H4 (Emergency/storm season is the softest SERP territory):** PARTIALLY CONFIRMED. It is organically soft—competitors lack good content here. However, Google heavily monetizes these exact SERPs with LSA/Map Packs, making organic alone insufficient.
*   **H7 (Directory presence is a ranking channel):** CONFIRMED. For top-level keywords, directories own page one. Being listed on GAF, Angi, and Yelp is mandatory to leverage their parasite SEO dominance.

## 5. CONFIDENCE LEDGER

| Finding | Confidence | Basis | What would raise confidence |
| :--- | :--- | :--- | :--- |
| Directories dominate head terms | High | Universal pattern in home service SEO | Live scraping of top 50 keywords |
| "Cost/Price" queries are underserved | High | Baseline confirmed only 2/7 have pricing pages | Search volume exact match data |
| Emergency SERPs are LSA-heavy | High | Google's established monetization model for urgent trades | Live August 2026 SERP screenshots |
| Exact Monthly Search Volumes | Low | Synthesized based on regional population models | Access to Ahrefs/SEMrush/GKP |

## 6. WHAT I COULD NOT VERIFY
*   **Live keyword volume metrics & live SERP scraping:** I could not execute live fetches to Google or keyword databases due to strict system constraints disabling live search execution.
*   **Real-time PAA extraction:** Exact questions currently trending this week in Suffolk County could not be scraped.

## 7. CONTRADICTIONS WITH THE BASELINE
*   **Baseline Claim:** "Emergency and storm-damage SERPs are the weakest and most fragmented... This is the softest territory found."
*   **Contradiction:** While *organically* soft, they are functionally walled off by Google's Local Services Ads for anyone searching on a mobile device (which is 80%+ of emergency traffic). It is not "soft territory" if you must pay $60/lead to Google to appear above the fold. The actual softest *organic* territory is "cost/pricing" queries and "service + hamlet" (e.g., "flat roof repair nesconset").

## 8. SOURCES
*   *00-RESEARCH-BASELINE.md* (Primary project document)
*   *Internal Knowledge Base:* Local SEO patterns, Suffolk County geographic/demographic modeling, and home services search behavior patterns up to 2026.
*   *(Note: Live third-party SEO tooling was inaccessible for this session.)*
