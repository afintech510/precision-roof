# LANE H — AI Search, GEO/AEO & Emerging Discovery
**Agent:** Claude Opus 4.8 · **Date run:** 2026-08-01 · **Sources consulted:** ~30 (see §8)

> **Method limitation, stated up front.** I cannot directly query ChatGPT, Gemini, Perplexity, or trigger Google AI Overviews from this environment — I only have `WebSearch` (US Google-backed results) and `WebFetch`. So this lane is built two ways: (1) I ran the actual homeowner queries through WebSearch and read *what ranks and what gets aggregated*, which is a reasonable proxy for the retrieval pool ChatGPT (Bing-backed) and Google AIO draw from; and (2) I synthesized published third-party citation audits for local trades. **I did not personally observe a single live AI Overview or a live ChatGPT answer for a Suffolk roofing query.** Every claim about "what AI names/cites" is therefore inferred from ranking data + published audits, not first-party observation. This is the single biggest weakness in this lane and the synthesis session should treat the citation-pattern findings as *directional, not measured*. Almost the entire published corpus on GEO/AEO is SEO-agency marketing content; I have flagged data points by source quality throughout.

---

## 1. EXECUTIVE FINDINGS

1. **The AI-discovery pool is the same directory-and-review pool as classic local SEO — not a separate game.** Running "best roofer Suffolk County NY" and "roof replacement Smithtown NY who to call" surfaced Yelp, BBB, HomeAdvisor, Diamond Certified, and a mix of contractor sites — the identical sources AI assistants retrieve from. **The winning move for AI visibility is 90% the same work Lanes B/C/D already prescribe** (real local pages, GBP, reviews, NAP consistency, directory presence). There is very little *net-new* AI-specific build required. This largely **confirms H7 extended to AI**: directory/review presence is the AI citation channel.

2. **Reddit is the highest-leverage AI-citation surface, and it is genuinely different from classic SEO.** Across published audits Reddit is the single most-cited domain in AI answers — ~21% of Google AI Overview citations and 20–24% of Perplexity citations (Omniscient Digital / everything-pr indices, both third-party but not peer-reviewed). For a local trade this means an authentic presence in **r/longisland** and **r/HomeImprovement** threads is the one emerging channel that classic SEO doesn't already cover. It is also the easiest to get wrong (spam = ban).

3. **BuildZoom and Bing Places are underrated, roofing-specific AI-citation assets.** A 2026 trades audit (BiziQ, vendor blog) reports BuildZoom appeared in ChatGPT citations for **100% of trades tested**, because AI engines use it to verify license/permit history — exactly the compliance data this project already plans to lead with. And because ChatGPT's live web retrieval is **Bing-backed**, a claimed **Bing Places** profile is a cheap, direct requirement most competitors ignore. These two are the closest thing to an "AI-specific" to-do list, and both are low-cost.

4. **llms.txt is vaporware for this use case — do not build the site around it.** Ahrefs analyzed 137K sites and found **97% of llms.txt files are never fetched** by AI bots; Google's John Mueller compared it to the deprecated keywords meta tag and confirmed no AI crawler has claimed to extract info from it. Ship one if it's free (it's harmless), but assign it zero strategic weight.

5. **AI Overviews are frequent on local queries but the CTR damage is concentrated on *informational* intent, not the transactional queries that book roofing jobs.** AIO reportedly appears on ~68% of local queries (Whitespark) but zero-click is 74% for informational vs. **~31% for transactional** searches (SparkToro/Datos-lineage data). "Emergency roof repair near me" and "roof replacement [town]" are transactional — homeowners still click/call. The blog/informational layer will lose clicks to AIO; the money pages are more insulated. This reshapes *where* to expect AIO erosion, not whether to build.

6. **Structured data's role in AI is real but modest and correlational — worth doing, not worth obsessing over.** Google explicitly states "no special schema is needed" for AIO/AI Mode. Vendor studies claim schema lifts AI citations (BrightEdge "+44%," various "2.5x") but these are correlational and self-interested. LocalBusiness/RoofingContractor + FAQ + Review schema is cheap and clearly helps *entity understanding*; treat it as table stakes (Lane E owns implementation), not a growth lever.

7. **Entity/Knowledge-Panel work for a brand-new small roofer is mostly low-ROI vanity — with two cheap exceptions.** Wikidata + Knowledge Panel take 3–12 months and matter far more for brands people search by name than for "roofer near me" intent. **Do** nail Organization/LocalBusiness schema with `sameAs` links and consistent NAP (cheap, compounds). **Skip** chasing a Wikipedia article or paid Knowledge-Panel services at launch — a new contractor has no notability basis and the effort is better spent on reviews.

8. **The channel mix is shifting, but classic local SEO + GBP + reviews is still the correct *primary* investment for 2026–2027.** AI discovery for local trades is downstream of the same signals. The honest 2–3 year risk is **agentic booking** (an AI that schedules the inspection directly) and **on-SERP resolution** — both favor whoever has the cleanest structured data, real reviews, and (per Lane F) an actual bookable/API-addressable booking layer. Build those; do not over-invest in llms.txt, TikTok, or Wikidata.

---

## 2. AI ASSISTANT CITATION PATTERNS (observed + published)

### 2a. What the retrieval pool looks like for the real queries (first-party WebSearch, 2026-08-01)

I ran the homeowner queries the brief specifies. These are Google organic results, not an AI answer, but they are the substrate AI retrieval draws from:

- **"best roofer Suffolk County NY"** → top surfaces were **Yelp** (category page), **BBB**, **Diamond Certified**, plus contractor sites (Z Best, Rapid Restore/Rapid Roofing, longislandroofs.com, Reliable Construction Guys/C&D, LI Roof Repair, Sunrise Roofing). **Directory/review platforms occupy the top of the pool; no single contractor "owns" the answer.**
- **"roof replacement Smithtown NY who to call"** → **HomeAdvisor**, **Bumble Roofing**, **Perfect Pitch** (the baseline's "best local page"), plus a wave of programmatic multi-town lead-gen sites (serenzia.com, roofangels.org, langandsonroofing per-town subdomains, longislandexteriorco per-ZIP pages). **Programmatic town/ZIP pages are already saturating this pool** — relevant to Lane D/E's thin-page warning.

**Inference:** an AI assistant answering these would most likely (a) name 3–6 businesses pulled from Yelp/BBB/HomeAdvisor aggregations and a few strong contractor sites, and (b) cite the directories more readily than any one contractor. To be *named*, you need to appear in the aggregators' lists; to be *cited by URL*, you need a fact-dense page that directly answers the query. Both are achievable and both are Lane C/D work.

### 2b. Published citation audits (all third-party, none peer-reviewed — treat as directional)

| Source claim | Figure | Source & quality |
|---|---|---|
| Reddit share of all AI citations (cross-engine) | ~40% top domain; **~21% of Google AIO** citations | everything-pr / Omniscient index — SEO-industry aggregation |
| Reddit share of Perplexity citations | **20–24%** (highest single-domain concentration anywhere) | everything-pr Perplexity index |
| YouTube share of AIO citations | **~18.8%** | Omniscient Digital via SEJ |
| BuildZoom in ChatGPT citations for trades | **100% of trades tested** | BiziQ (vendor blog, small audit, method not disclosed) |
| ChatGPT live retrieval backend | **Bing** → Bing Places is a direct input | BiziQ / multiple |
| Overlap of AI-cited URLs with Google top 10 | **only ~12%**; 28.3% of ChatGPT's most-cited pages have zero Google organic visibility | Ahrefs (cited via BiziQ) — the most credible of these |
| Owned vs. external citations, branded queries | ~23% owned / **77% external** | Omniscient Digital (23K citations) |

**Pattern read-out for reverse-engineering (H7 test):** AI assistants for local trades lean **review platforms + trade-verification directories + Reddit/YouTube**, with contractor sites cited when they hold a directly-answering, fact-dense page. This is *not* a world where AI overwhelmingly cites Angi/Yelp to the exclusion of contractor sites (which would kill the on-site strategy) — the ~77% external / Ahrefs low-overlap data says a well-built contractor page *can* be cited even without top Google rankings. So on-site content still matters for AI, but **off-site (reviews, BuildZoom, Bing Places, Reddit) is the differentiated AI lever.**

### 2c. Why each source type gets cited (the mechanism)

- **Review platforms (Yelp/BBB/HomeAdvisor):** structured, entity-resolved, high-authority, freshness via new reviews → default "who's good" answer substrate.
- **Trade directories (BuildZoom, GAF locator):** authoritative *verification* of license/cert/permit — AI uses them to fact-check claims. Directly reinforces this project's compliance-as-trust thesis.
- **Reddit:** treated as "authentic human opinion"; disproportionate weight; the one channel where a genuinely helpful comment outperforms a polished page.
- **Contractor site:** cited when it has the *specific fact* the query wants (a real Smithtown permit fee, a real price range) and reasonable freshness. Generic name-swap town pages don't get cited — same failure mode Lane D flags for SEO.

---

## 3. GEO/AEO REQUIREMENTS — real vs. speculation

**REAL (evidence-backed or logically necessary):**
- **NAP/entity consistency across directories** — universally cited, and it's the same requirement classic local SEO already has. Real.
- **Fact-dense, directly-answering pages** (tables, real numbers, FAQ blocks, question-formatted H2s) — consistent across audits and matches how extraction works. Real.
- **Off-site presence** (reviews on 3+ platforms with 25+ recent reviews per BiziQ; BuildZoom; Bing Places) — real and roofing-specific.
- **Reddit/YouTube presence** — real, evidenced by citation share; hard to game legitimately.
- **Bing indexation matters more than it used to** — real, because ChatGPT retrieval is Bing-backed. Ensure Bing Webmaster Tools submission + Bing Places. Cheap.

**SPECULATION / OVERSOLD (SEO-industry confident-nonsense zone):**
- **llms.txt** — refuted (see §4/§1.4). Vaporware for citations.
- **Precise schema "lift" percentages** ("+44%," "2.5x") — correlational vendor studies; directionally plausible, numbers not trustworthy.
- **"Speakable schema" as a growth lever** — negligible; Google deprioritized it.
- **Wikidata/Knowledge Panel as near-term AI unlock for a new local contractor** — oversold (see §5).
- **Any claim of a distinct, buildable "AEO checklist" separate from good local SEO** — mostly repackaging. The distinct parts are Reddit, BuildZoom, Bing Places. That's it.

**Third-party citation value vs. own site:** the 77%-external / 12%-overlap data says **being cited/mentioned on third-party sites (reviews, Reddit, local news, BuildZoom) is more valuable for AI than for classic SEO.** This argues for weighting Lane C's off-site budget slightly higher than a pure-SEO plan would.

---

## 4. GOOGLE AI OVERVIEWS — frequency, citations, CTR, defense

- **Frequency:** AIO on ~48% of all tracked queries (Feb 2026) and **~68% of local-business queries** (Whitespark). Informational local queries trigger it 92%+; hybrid "average cost of X in [city]" ~97%. So this project's **cost guides and informational blog posts will very often sit under an AIO.**
- **What it cites for local:** GBP, Yelp, Houzz, Angi, local news, industry directories, plus Reddit (~21%) and YouTube (~18.8%).
- **CTR impact:** when AIO appears, zero-click jumps to ~83% and organic CTR drops ~18–60% depending on study. **But transactional queries are only ~31% zero-click** — homeowners ready to hire still act. Net: expect real click erosion on the *informational* layer, limited erosion on *money* pages.
- **Defensive strategy (concrete):**
  1. Structure cost/FAQ content to *be the cited source* (tables, direct one-sentence answers, real Suffolk numbers) — capture the citation even if you lose the click.
  2. Keep transactional pages phone/booking-forward — the surviving clicks convert ~23% better (Datos-lineage), so conversion optimization > traffic panic.
  3. Own the queries AIO is *weakest* on — per baseline §5, emergency/storm SERPs are the most fragmented; AIO has thin sourcing there → opportunity (reinforces H4).
  4. Don't write purely informational content that only answers what AIO already answers with no path to conversion — it will be zero-click. Every info page needs a local hook + CTA.

---

## 5. ENTITY & KNOWLEDGE GRAPH for a new roofer

| Tactic | Achievable for a new Suffolk roofer? | Verdict |
|---|---|---|
| **Organization/LocalBusiness/RoofingContractor schema + `sameAs`** (GBP, Yelp, BBB, FB, LinkedIn) | Yes, day one | **DO — cheap, compounds, feeds entity confidence** |
| **Consistent NAP everywhere** | Yes | **DO — foundational** |
| **Google Business Profile as primary entity anchor** | Yes | **DO — this *is* the entity for local** |
| **BuildZoom / Bing Places verified profiles** | Yes | **DO — roofing-specific AI citation assets** |
| **Wikidata entry** | Technically possible but needs sourced notability; risk of deletion for a non-notable local business | **SKIP at launch; revisit if press coverage accrues** |
| **Google Knowledge Panel** | 3–12 months, needs entity recognition; low intent-value for "roofer near me" | **SKIP as a goal; it may emerge from GBP + consistency anyway** |
| **Wikipedia article** | No notability basis | **SKIP — waste / risk of embarrassing deletion** |

**Bottom line:** entity work for this business = GBP + schema + NAP + BuildZoom/Bing. The Wikidata/Wikipedia/Knowledge-Panel industry pitch is a waste of launch budget.

---

## 6. VOICE & CONVERSATIONAL SEARCH

- The headline voice stats ("76% of voice is near-me," "58% use voice for local") are **recycled 2018–2019 figures** that circulate every year — I distrust them and flag them as unreliable. Voice adoption is real but "not growing as fast as predicted" (Invoca/DemandSage both concede this).
- **Practical implication is small and free:** the content formatting that helps voice (question-format headings, concise direct answers) is the *same* formatting that helps AIO/AEO extraction. So you get voice optimization as a byproduct of doing AEO well. **No dedicated voice investment warranted.**
- Do **not** build a separate "voice strategy," buy speakable-schema services, or optimize for smart-speaker booking. Low ROI for a 20-year-repurchase home service.

---

## 7. ADJACENT DISCOVERY CHANNELS — sized honestly

| Channel | Honest size for Suffolk roofing | Recommendation |
|---|---|---|
| **Reddit (r/longisland, r/HomeImprovement, r/Roofing)** | Real, dual-value: referral traffic **and** AI-citation surface (~21% of AIO citations). Etiquette-sensitive: overt promotion = downvote/ban. | **DO — but as a genuine participant.** Owner answers roofing questions helpfully, discloses affiliation when asked, never drops links cold. Highest-leverage *emerging* channel. Low cash, real time cost. |
| **Nextdoor** | Meaningful for LI home services; one recommendation reportedly drives 5–15 neighborhood calls/yr; first 5–10 recs disproportionately set neighborhood ranking (House Escort, vendor). | **DO — claim the business page, seed early recommendations from real customers.** Best organic referral channel for this specific market. |
| **Local Facebook groups** (town/community groups) | Real referral demand — baseline §5 even had a *Facebook page* rank for "emergency roof repair LI." Groups have anti-solicitation rules. | **DO lightly — presence + responding when tagged; don't spam.** Storm-event timing is the unlock. |
| **YouTube** | ~18.8% of AIO citations; before/after + tear-off content performs; but production cost is real and *local* roofing YouTube rarely scales to a channel. | **SELECTIVE — post job walkthroughs/before-afters as an AI-citation + trust asset, not a subscriber play.** Embed on town/service pages. Don't chase "roofing YouTuber" status. |
| **TikTok / Instagram** | Short-form has high ROI *claims* (Sprout "41%"); good for brand recall between 15–25yr cycles; weak for direct high-ticket lead gen. One cited case: $650 FB ads → $120K post-hail (that's *paid geo-targeting*, not organic TikTok). | **LOW PRIORITY at launch.** IG as a portfolio/proof mirror of the gallery is fine (cheap). Skip TikTok as a lead channel. The real social lever is *paid, post-storm, geo-targeted Facebook*, which is Lane F/paid territory. |
| **Email/SMS on a 20-yr repurchase cycle** | You will not "retain" a roofing customer for a 2nd roof. **Value is referrals + reviews + repairs/maintenance/gutters, not repurchase.** Email ROI "3,800%" stats are B2C-retail and don't transfer. | **DO a lightweight lifecycle:** post-job review request (drives the review engine that feeds everything above), annual maintenance/gutter check-in, referral ask. **Not** a newsletter. TCPA/consent per Lane F. |

**Channel-mix answer (the brief's second hypothesis):** Classic local SEO + GBP + reviews remains the correct **primary** investment. The mix *is* shifting at the margin toward **off-site/AI-adjacent** surfaces (Reddit, Nextdoor, BuildZoom, Bing Places, review velocity) — collectively maybe a 15–25% reallocation of *effort* (not necessarily cash) versus a 2022 playbook. It is **not** shifting toward llms.txt, Wikidata, voice, or TikTok.

---

## 7b. THE 2–3 YEAR VIEW (what makes this build obsolete)

**What could make it obsolete:**
1. **Agentic booking** — an AI assistant that books the inspection directly via API/GBP messaging, bypassing the website's forms. *Defense:* build the booking layer (Lane F) to be API/GBP-addressable and machine-readable, not a bespoke JS form only a human can use.
2. **On-SERP/on-assistant resolution** — the homeowner never reaches the site. *Defense:* be the *cited entity* (reviews, structured facts, GBP) so you win the answer even without the click.
3. **Google AI Mode expansion** replacing the map pack with a conversational recommendation. *Defense:* same signals — GBP completeness, reviews, entity consistency.

**Build now, survives:** clean structured data, a complete/optimized GBP, a real review-velocity engine, genuinely local fact-dense pages, NAP/entity consistency, BuildZoom + Bing Places, an API-addressable booking layer, and a Reddit/Nextdoor referral presence. All of these pay off in *both* the current and the AI-mediated future.

**Do NOT over-invest in:** llms.txt, Wikidata/Wikipedia, dedicated voice-search work, speakable schema, TikTok organic, a newsletter, or any "AEO service" that isn't just good local SEO relabeled.

---

## 3. DECISIONS THIS RESEARCH FORCES

- **DECISION: How much budget/effort to divert from classic SEO to AI-specific channels?**
  Options: (A) Ignore AI, pure classic SEO. (B) Classic SEO primary + a defined off-site/AI layer (Reddit, Nextdoor, BuildZoom, Bing Places, review velocity, fact-dense content). (C) AI-first / GEO-agency package.
  Recommendation: **B.** The AI channel is largely *served by* the same signals; the incremental AI-specific work is cheap and high-leverage. C is buying repackaged SEO at a premium.
  Confidence: **High.** Reversibility: **Cheap to change later.**

- **DECISION: Ship llms.txt?**
  Options: (A) Yes as harmless hygiene. (B) Skip. (C) Invest in maintaining a rich one.
  Recommendation: **A** — auto-generate a minimal one, spend zero ongoing effort. Not C.
  Confidence: **High.** Reversibility: **Cheap.**

- **DECISION: Pursue Wikidata/Knowledge Panel at launch?**
  Options: (A) Yes, agency package. (B) Schema+GBP+`sameAs` only; revisit entity in year 2. (C) Full Wikipedia push.
  Recommendation: **B.** Confidence: **Medium-High.** Reversibility: **Cheap.**

- **DECISION: Formalize a Reddit/Nextdoor presence, and who runs it?**
  Options: (A) Owner-run genuine participation. (B) Agency-run (high spam/ban risk). (C) None.
  Recommendation: **A**, with etiquette guardrails. This is the emerging channel with real, defensible upside. Confidence: **Medium** (referral volume unproven for *this* operator). Reversibility: **Cheap.**

- **DECISION: Is the booking layer built to be machine/agent-addressable?**
  Options: (A) Standard human web form. (B) Form + structured/API-exposed availability + GBP booking/messaging enabled.
  Recommendation: **B** — cheapest insurance against the agentic-booking future; overlaps Lane F.
  Confidence: **Medium.** Reversibility: **Expensive-ish** if retrofitted later — decide at architecture time.

---

## 4. HYPOTHESES TESTED

**H7 (directory presence is a ranking channel) — extended to AI citation sources: CONFIRMED (and strengthened for AI).**
Evidence: WebSearch retrieval pools for the real queries are directory-dominated (Yelp/BBB/HomeAdvisor/Diamond Certified); published audits put review platforms + trade directories (BuildZoom 100% of trades) + Reddit at the center of AI citations; ChatGPT retrieval is Bing-backed (Bing Places = direct input). Directory/review presence is *more* important for AI than for classic SEO, per the 77%-external / 12%-Google-overlap data. Caveat: this is inference + third-party audits, not first-party AI observation.

**Channel-mix sub-hypothesis (is classic local SEO still the right primary investment, or is the mix shifting?): PARTIALLY CONFIRMED — shifting at the margin, not overturned.**
Classic local SEO + GBP + reviews remains correct as primary. The mix is genuinely shifting toward off-site/AI-adjacent surfaces (Reddit, Nextdoor, BuildZoom, Bing Places, review velocity) and away from thin-content volume. It is NOT shifting toward the hyped items (llms.txt, Wikidata, voice, TikTok). So: evolve the classic playbook, don't replace it.

---

## 5. CONFIDENCE LEDGER

| Finding | Confidence | Basis | What would raise confidence |
|---|---|---|---|
| AI retrieval pool = same directory/review pool as classic local SEO | High | First-party WebSearch on the real queries + audits | Live ChatGPT/Perplexity runs on these exact queries |
| Reddit is the top AI-citation surface | Medium-High | Multiple third-party indices agree | A peer-reviewed / first-party audit; Reddit share for *roofing* specifically |
| BuildZoom cited for 100% of trades in ChatGPT | Low-Medium | Single vendor audit, method undisclosed | Independent replication; first-party ChatGPT test |
| ChatGPT retrieval is Bing-backed → Bing Places matters | High | Widely documented | — |
| llms.txt is ineffective for citations | High | Ahrefs 137K-site study + Mueller statements | — |
| AIO on ~68% of local queries; transactional ~31% zero-click | Medium | Whitespark + SparkToro/Datos-lineage; blogs recycle | Direct access to the underlying studies |
| Schema helps AI citations modestly (correlational) | Low-Medium | Vendor studies + Google's "not required" stance | Controlled first-party test |
| Wikidata/Knowledge Panel low-ROI for new local roofer | Medium-High | Reasoning + entity-timeline data | Counter-example of a small contractor winning via Wikidata |
| Nextdoor drives real LI home-service referrals | Medium | Vendor claims + market fit; no hard local data | Operator-level referral data |
| Voice search is a non-priority | Medium-High | Stagnant adoption; recycled stats | Fresh, credible voice-usage study |
| Agentic booking is the main obsolescence risk | Medium | Trend reasoning, not measured | Evidence of AI agents booking home-service jobs at volume |

---

## 6. WHAT I COULD NOT VERIFY

- **First-party AI answers.** I could not query ChatGPT/Claude/Gemini/Perplexity or force a live Google AI Overview. All "what AI names/cites for Suffolk roofing" claims are inferred from ranking data + third-party audits. **To fix:** run the brief's query list directly in each assistant (5+ reps each, log named companies + cited URLs). This is the single most valuable follow-up and is a ~2-hour manual task for Adam.
- **Roofing/Suffolk-specific citation data.** All citation-share numbers are cross-industry. No source breaks out "who does Perplexity cite for Suffolk roofing."
- **Credibility of the citation indices.** everything-pr / Omniscient / BiziQ are SEO-industry publishers; methods are thin or undisclosed. Numbers are directional.
- **Nextdoor/Reddit referral volume for a roofer specifically** — only vendor generalizations.
- **Whether Premium Roofing Solutions / any Branch-A entity currently appears in any AI answer** — not testable here.

---

## 7. CONTRADICTIONS WITH THE BASELINE

No hard contradictions. Two **extensions/refinements**:

- Baseline **H7**: *"Directory presence (GAF locator, Angi, BBB, Yelp) is itself a ranking channel worth budgeting for."* My finding **strengthens and extends** this: it's also the primary **AI-citation** channel, and the baseline's list should add **BuildZoom, Bing Places, Reddit, and Nextdoor** as first-class AI-era citation/discovery surfaces — not just classic directories.
- Baseline §5 observation that **emergency/storm SERPs are the most fragmented** — I add that this fragmentation extends to AI: thin sourcing there means AIO/assistants are *weakest* on storm/emergency queries, making H4 territory attractive for AI capture too, not just classic SERP.

---

## 8. SOURCES

Primary / first-party observation:
- WebSearch results for "best roofer Suffolk County NY" and "roof replacement Smithtown NY who to call" (Google, 2026-08-01) — *primary observation of the retrieval pool.*

Most credible third-party data:
- [Ahrefs — We Analyzed 137K Sites: 97% of llms.txt Files Never Get Read](https://ahrefs.com/blog/llmstxt-study/) — *data study, credible.*
- [Search Engine Journal — Google Says LLMs.txt Is Purely Speculative (Mueller)](https://www.searchenginejournal.com/google-says-llms-txt-is-purely-speculative-for-now/577576/) — *reporting on primary statements.*
- [Search Engine Journal — AI Overviews Now Answer Most Local Searches (Whitespark / Omniscient data)](https://www.searchenginejournal.com/ai-overviews-now-answer-most-local-searches-how-to-get-your-business-cited/580757/) — *reporting on studies.*
- [Search Engine Land — Google zero-click searches reach 68% in early 2026](https://searchengineland.com/google-zero-click-searches-2026-study-479717) — *reporting on SparkToro/Datos-lineage clickstream.*

SEO-industry opinion / vendor content (useful but self-interested — treat numbers as directional):
- [BiziQ — Why ChatGPT Recommends One Contractor Over Another](https://biziq.com/blog/why-chatgpt-recommends-one-contractor-over-another-and-how-to-be-the-one/) — *vendor; source of BuildZoom/Bing Places trades-audit claims.*
- [everything-pr — AI Platform Citation Source Index 2026](https://everything-pr.com/ai-platform-citation-source-index-2026) and [Perplexity Citation Source Index 2026](https://everything-pr.com/perplexity-citation-source-index-2026) — *SEO-industry aggregation.*
- [Contently — Top 10 Sources LLMs Cite Most in 2026](https://contently.com/2026/04/29/top-sources-llms-cite/) — *vendor blog.*
- [Medium (Ewan Mak) — Reddit GEO Playbook](https://medium.com/@tentenco/reddit-geo-playbook-how-to-get-cited-by-chatgpt-and-perplexity-in-2026-75607d1d2b01) — *opinion.*
- [Globerunner — Structured Data in 2026: The Schema AI Actually Uses](https://globerunner.com/structured-data-schema-markup-ai-2026/) and [Digital Applied — Schema Markup After March 2026](https://www.digitalapplied.com/blog/schema-markup-after-march-2026-structured-data-strategies) — *vendor; schema-lift claims.*
- [ClickRank — Knowledge Graph SEO 2026 Guide](https://www.clickrank.ai/knowledge-graph-seo-guide/) and [Reputation X — Where Knowledge Panels Get Info](https://www.reputationx.com/blog/knowledge-panel-sources) — *vendor.*
- [House Escort — Nextdoor Marketing for Contractors](https://houseescort.com/resources/nextdoor-marketing-for-contractors/) — *vendor; Nextdoor referral claims.*
- [Invoca — 40+ Voice Search Stats 2026](https://www.invoca.com/blog/voice-search-stats-marketers) and [DemandSage — Voice Search Statistics 2026](https://www.demandsage.com/voice-search-statistics/) — *vendor; recycled figures, flagged unreliable.*
- [Web Tonic — Roofing Digital Marketing Stats 2026](https://www.webtonic.io/blog/roofing-digital-marketing-statistics) and [Pipeline On — Social Media for Roofers](https://pipelineon.com/blog/social-media-marketing-for-roofers/) — *vendor; social/YouTube ROI claims.*
