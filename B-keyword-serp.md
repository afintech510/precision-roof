# B — Keyword Universe & SERP Intelligence
**Agent:** Claude (Sonnet 5, chat) · **Date run:** Aug 1, 2026 · **Sources consulted:** 3 live SERP pulls (7–9 results each), no paid keyword-volume tool

**Scope note up front:** This is a first-pass, reduced-depth run — 3 SERPs pulled live, not the 25 the brief specifies, and no keyword-volume tool (Ahrefs/SEMrush/Keyword Surfer) was available. Treat this as directional and a template for the full pass, not a substitute for it. Flagged explicitly per finding below.

## 1. EXECUTIVE FINDINGS
- The three query types tested return **three structurally different SERPs** — this is the single most important finding and it should drive the content plan's page-type priorities.
- **"Signs you need a new roof" (informational)** is a legitimate content-marketing battleground: 7 of 7 results were contractor-written blog posts, zero directories, zero aggregators. This is the most winnable SERP type of the three tested.
- **"Emergency roof repair Suffolk County"** surfaces an almost entirely different competitor set than the branded/service queries in the baseline — Smart Choice Contracting, All Weather Roofing, GNP Roofing, ProHome Construction, Cross County Roofing, Sunrise Roofing & Chimney, Ready Roof LI, Superior Siding & Roofing. **None of the baseline's seven "Tier 1" competitors showed up in this pull.** This corroborates H4 (soft, fragmented territory) but the fragmentation is broader than the baseline's five-query snapshot suggested — it's not just weak, it's a genuinely open field with no incumbent.
- **"Roof replacement [town], NY" cost-intent queries are directory- and aggregator-heavy** even at the town level — HomeAdvisor, Angi, and PJ Fitzpatrick (a multi-state roll-up, not a local independent) occupied results alongside town-specific local players. Confirms baseline's directory-dominance concern (H7) even at long-tail granularity, not just head terms.
- **Two previously unidentified competitors surfaced** with dedicated town-page architecture worth adding to Lane A's competitor list: **Long Island Exterior Co.** (longislandexteriorco.com — runs /roofing/[town]-ny-[zip] URL pattern, cites local architecture style and Building Dept address per town, claims "no subcontractors ever") and **Rapid Restore / Rapid Restore NY** (rapidrestoreny.com — same domain as baseline's "Rapid Roofing," confirms it's actively publishing long-form blog content, e.g. a 2026-dated "roof warning diagnostic guide").
- Cost figures in the wild are wider than the baseline's economics section: one aggregator (Homeyou) shows Huntington averaging **$7,102–$8,147**, well under the baseline's $9,000–$15,000 range; Long Island Exterior Co. publishes **$7,500–$40,000**. The baseline's $11,500 midpoint sits inside this range but the low end is softer than assumed — worth flagging to Lane G for the economics model.
- Metal roofing cost content is being actively published at the town level (SkyLuxe Construction: $10–16/sq ft installed, Huntington-specific) — a materials-comparison angle beyond the baseline's asphalt focus.

## 2. KEYWORD MATRIX — FIRST PASS
Full matrix per the baseline's dimensions (service × geography × modifier × material × informational) was not built at scale in this pass — that requires the full 25+ SERP run plus a keyword tool. What's below is what the 3 test queries actually returned, annotated.

| Query tested | Intent | SERP composition | Target page type implied |
|---|---|---|---|
| "roof replacement cost Huntington NY" | Commercial-investigation | Aggregator (Homeyou), local contractor site (Long Island Exterior Co.), materials-specific contractor (SkyLuxe/metal), Angi directory, PJ Fitzpatrick, HomeAdvisor, HomeAdvisor cost-guide subpage | Town × service page with published price range |
| "emergency roof repair Suffolk County NY near me" | Transactional, urgent | 7 distinct independent contractor sites, zero directories, zero baseline Tier-1 names | Dedicated emergency/storm landing page — open field |
| "signs you need a new roof / how long does a roof last Long Island" | Informational | 7 contractor blog posts (e-architect, Nationwide, Perfect Pitch, Rapid Restore ×2, Triple Crown, Expressway, Strong Credit Repair — an odd finance-adjacent entrant), zero directories | Blog/resource content, strong internal-link source to money pages |

**Preliminary PAA-adjacent language harvested from result snippets** (not a formal PAA pull — that requires SERP feature scraping the brief specifies):
- "repair vs. replace" framed explicitly by age brackets (under 15 yrs = repair candidate, over 20 = replacement) — recurring across 3 independent sources, suggests this is a stable, quotable framework worth building an interactive/quiz asset around.
- Coastal/salt-air language ("North Shore," "South Shore," "salt air corrosion") appears as a differentiator move by Long Island Exterior Co. and the "10 Signs" guide — town-specific coastal exposure is being used as a local-authenticity signal by at least 2 competitors already, ahead of what the baseline's town-page anatomy sample showed.

## 3. DECISIONS THIS RESEARCH FORCES
- DECISION: Whether to build a dedicated **emergency/storm landing page (county-level, not per-town)** ahead of town×service pages.
  Options: (A) Build it first, single county-wide page, get it indexed before Oct storm season; (B) Fold emergency into each town page as a section; (C) Do both — a hub emergency page plus an emergency mention on every town page.
  Recommendation: (C). The tested SERP shows zero incumbent authority here — a standalone hub page is the fastest page to rank precisely because there's no entrenched competition, and it can launch before the full town-page build is done.
  Confidence: Medium (based on one SERP pull, needs the full 12+ town emergency-query set the brief specifies)
  Reversibility: Cheap to change later
- DECISION: Whether published pricing should lead with a range as low as the market's low end ($7,100s) or anchor near the baseline's $11,500 midpoint.
  Options: (A) Publish the full observed range with drivers explained (roof size, material, tear-off layers); (B) Anchor high to avoid underselling; (C) Don't publish a number, use "starting at" language only.
  Recommendation: (A) — the baseline already flags published pricing as a differentiator (H6); a defensible, explained range out-trusts a vague "starting at."
  Confidence: Low — only 4 pricing data points seen, Lane G's fuller economics pass should override this.
  Reversibility: Cheap to change later

## 4. HYPOTHESES TESTED
- **H2 (depth beats volume):** INSUFFICIENT EVIDENCE from this pass — no head-to-head ranking comparison was run between deep vs. thin town pages in this session. Lane A/D territory more than Lane B; flagging back.
- **H4 (emergency/storm is soft):** PARTIALLY CONFIRMED, and stronger than the baseline suggested. The one emergency SERP pulled here showed total turnover of competitor identity vs. the branded-service SERPs — not just "softer," but effectively a different, winnable market.
- **H7 (directory presence is a ranking channel):** CONFIRMED at the town × cost-intent query level, not just head terms. Angi, HomeAdvisor, and multi-state roll-up PJ Fitzpatrick all appeared in a single-town, cost-modified query — directories aren't just competing on broad terms, they're present in long-tail too.

## 5. CONFIDENCE LEDGER
| Finding | Confidence | Basis | What would raise confidence |
|---|---|---|---|
| Emergency SERP has no incumbent overlap with branded Tier-1 competitors | Medium | 1 live SERP pull | Run across all 12+ towns the brief specifies |
| Informational "signs you need a roof" queries are directory-free | Medium | 1 live SERP pull | Repeat across 5–10 informational variants |
| Cost SERPs are directory-heavy even at town granularity | Medium | 1 live SERP pull | Repeat across 6–8 towns × cost modifier |
| Two new competitors (Long Island Exterior Co., confirmed Rapid Restore activity) | High | Directly observed pages/URLs | N/A — direct observation |
| Pricing range wider than baseline ($7.1K low end) | Low | Single aggregator source (Homeyou), not cross-verified | Cross-check against 3+ more sources, verify aggregator methodology |

## 6. WHAT I COULD NOT VERIFY
- No keyword-volume tool was used — all volume/difficulty claims in the full brief remain untested. This is the highest-priority gap; the brief itself calls this "the single most load-bearing research lane" and this pass does not close that gap.
- Did not run the full town × service matrix (7 towns × ~19 services = 100+ combinations specified in the brief) — only 3 total queries.
- Did not mine Reddit (r/Roofing, r/longisland), Quora, or local Facebook groups for homeowner language — brief calls for this explicitly, not attempted here.
- Did not quantify directory SERP-share as a percentage across 25 SERPs — only qualitative observation across 3.
- Seasonality calendar (when "ice dam" spikes vs. "storm damage") not mapped — no trends-tool access in this pass.

## 7. CONTRADICTIONS WITH THE BASELINE
- Baseline §5 lists five SERP snapshots and states "Emergency and storm-damage SERPs are the weakest and most fragmented of the five." This pass's single emergency-query pull supports "fragmented" but the *degree* is larger than the baseline's framing suggests — this wasn't just the weakest of five queries, it returned essentially zero overlap with the seven Tier-1 competitors the baseline spent most of its effort profiling. Worth revisiting whether Lane A's competitor set needs the emergency-query names (Smart Choice, All Weather, GNP, ProHome, Cross County, Sunrise, Ready Roof LI, Superior Siding & Roofing) added for the synthesis.
- Baseline's cost figures ($9,000–$15,000, ~$11,500 typical) sit at the upper-middle of what this pass observed ($7,102–$40,000 depending on source and material). Not a contradiction so much as a range the baseline collapsed — worth Lane G reconciling with more sources.

## 8. SOURCES
- [Homeyou — Huntington roof replacement cost](https://www.homeyou.com/ny/roof-replacement-huntington-costs) — aggregator/lead-gen, cost data self-reported as "based on 43 completed projects," methodology not disclosed
- [Long Island Exterior Co. — Huntington town page](https://www.longislandexteriorco.com/roof-replacement/huntington-ny-11743) — competitor primary source, town-page architecture example
- [SkyLuxe Construction — Huntington metal roofing](https://www.skyluxeconstruction.com/services/metal-roofing/huntington-ny/) — competitor primary source
- [Angi — Huntington roofers directory](https://www.angi.com/companylist/us/ny/huntington/roofing.htm) — directory/aggregator
- [PJ Fitzpatrick — Huntington roofing](https://www.pjfitz.com/areas/new-york/suffolk-county/roofing-in-huntington/) — multi-state roll-up, primary source
- [HomeAdvisor — Huntington roofing services](https://www.homeadvisor.com/c.Roofing.Huntington.NY.-12061.html) — directory/aggregator
- [Smart Choice Contracting — emergency roof repair](https://www.smartchoiceli.com/emergency-roof-repair) — competitor primary source, shows Suffolk license # HI-62204 displayed
- [All Weather Roofing — emergency repair](https://www.allweatherroofing.com/emergency-roof-repair) — competitor primary source
- [GNP Roofing and Siding — emergency repair](https://www.gnpli.com/long-island-suffolk-county-24-7-emergency-roof-repair-company/) — competitor primary source
- [ProHome Construction — Suffolk emergency repair](https://prohomeroofer.com/locations/residential-roof-emergency-repairs-in-suffolk-county-ny/) — competitor primary source
- [Rapid Restore NY — roof replacement guide](https://www.rapidrestoreny.com/blog/roof-replacement-guide-long-island-costs-insurance-timeline-when-to-replace/) — competitor primary source (baseline's "Rapid Roofing")
- [Perfect Pitch Roofing — 5 signs blog](https://perfectpitchroofing.com/5-signs-its-time-to-replace-your-roof-in-long-island/) — competitor primary source
- [Expressway Roofing & Chimney — repair vs. replace](https://expresswayroofingandchimney.com/what-are-the-top-signs-that-a-roof-needs-to-be-replaced-rather-than-just-repaired/) — competitor primary source
- [Triple Crown Exteriors — signs you need a new roof](https://triplecrownext.com/signs-you-need-a-new-roof-long-island/) — competitor primary source, newly surfaced
