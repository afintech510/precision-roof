# RESEARCH AGENT BRIEFS — Suffolk County Roofing Website Build
**Eight parallel research lanes.** Each brief is self-contained and assumes a fresh session with no memory of prior work.

## How to run these

1. Start each agent in a **new session**.
2. Paste **`00-RESEARCH-BASELINE.md` in full**, then the brief for that lane.
3. Run all eight in parallel. They are designed not to overlap; where they touch, the boundary is stated explicitly in each brief.
4. Collect the eight output files and hand them, plus the baseline, to the Opus synthesis session (`02-SYNTHESIS-PROMPT.md`).

**Recommended model:** Opus for lanes A, B, D, H. Sonnet is sufficient for C, E, F, G if you're managing cost — but Opus everywhere produces a better synthesis input.

---

## THE OUTPUT CONTRACT — applies to every lane

Non-negotiable. The synthesis session depends on all eight files sharing this shape.

Write your findings to a single markdown file named exactly as specified in your brief. Structure it as:

```
# [LANE LETTER] — [Lane name]
**Agent:** [model] · **Date run:** [date] · **Sources consulted:** [count]

## 1. EXECUTIVE FINDINGS
5–10 bullets. The things that would change a build decision. Lead with the
highest-impact finding, not the first thing you found.

## 2. [Lane-specific sections per your brief]

## 3. DECISIONS THIS RESEARCH FORCES
Every finding that requires a human or architectural decision, stated as a
decision with options and a recommendation:
  - DECISION: [what must be decided]
    Options: [A / B / C with tradeoffs]
    Recommendation: [yours, with reasoning]
    Confidence: [High / Medium / Low]
    Reversibility: [Cheap to change later / Expensive / One-way door]

## 4. HYPOTHESES TESTED
For each baseline hypothesis in your lane (H1–H7): CONFIRMED / REFUTED /
PARTIALLY CONFIRMED / INSUFFICIENT EVIDENCE — with the evidence.
Refuting a baseline hypothesis is a valuable result. Say so plainly.

## 5. CONFIDENCE LEDGER
| Finding | Confidence | Basis | What would raise confidence |
Every material claim gets a row. Be honest about weak ones.

## 6. WHAT I COULD NOT VERIFY
Explicit list. What you tried, why it failed, what it would take.

## 7. CONTRADICTIONS WITH THE BASELINE
Anything in 00-RESEARCH-BASELINE.md that your research contradicts. Quote the
baseline claim, state your finding, cite the source. Do not silently overwrite.

## 8. SOURCES
Full markdown links. Note which are primary, which are vendor/marketing content,
and which are SEO-industry opinion rather than data.
```

### Rules that apply to all lanes

- **Use WebSearch and WebFetch. Never use bash/curl/python/wget to fetch URLs.** If WebFetch fails, note it and move on — do not route around it.
- **Quote exact text** for anything you assert about a competitor's page. Paraphrase is not evidence.
- **Date-stamp volatile findings.** SERPs and site content change.
- **Distinguish measured from claimed.** "GAF Master Elite" on a site is a *claim*; verified against GAF's contractor locator is a *fact*. Say which.
- **Vendor blogs are not neutral sources.** A roofing SEO agency's post about roofing SEO is marketing. Cite it if useful, label it as such.
- **Do not pad.** A short section that says "I found three things and here they are" beats four paragraphs of hedging. If a section of your brief yields nothing, say "nothing found" and move on.
- **Falsify, don't confirm.** You are being paid to find where the baseline is wrong.

---

# LANE A — Deep Competitive Teardown
**Output file:** `A-competitive-teardown.md`
**Boundary:** You own *what competitors do and how well*. You do NOT own keyword data (Lane B), map pack composition (Lane C), or technical stack details beyond what's visible (Lane E).

## Objective
Produce the definitive competitive intelligence file for residential roofing in Suffolk County — deep enough that the SOW can be written against it without re-research.

## Scope
Analyze **15–20 competitors**. Start with the seven in the baseline, then add from the unanalyzed list in §1 of the baseline, then find more yourself. Prioritize by SERP presence over brand recognition.

For **each** competitor, capture:
- Exact title tag and meta description for homepage + one town page + one service page
- Above-the-fold value proposition and primary CTA, quoted
- Full trust stack: certifications (and whether verifiable via GAF/Owens Corning/CertainTeed contractor locators), license numbers, insurance figures, BBB status, review counts and ratings, years in business, named owner/team, awards
- Complete offer architecture: financing terms with exact APRs and durations, warranty terms with exact years and named manufacturer programs, guarantees, published pricing, promos
- Lead capture: every form field, step count, any quiz/funnel, lead magnets, SMS consent handling
- Service taxonomy — the exact list of services and how they're URL'd
- Town page inventory: count, URL pattern, and a **depth assessment** of 2–3 sampled pages (word count, genuine local detail vs. name-swap, local proof, FAQ, internal links)
- Content library: post count, publishing cadence, most recent post date, topic clusters
- Visual/brand quality assessment — is this a template, a custom build, or an agency template?

## Required analysis beyond the inventory
1. **The tiering.** Sort all competitors into tiers by actual threat. Justify each placement.
2. **The offer matrix.** One table: every competitor × every offer dimension. Find the dimensions where *nobody* competes.
3. **Message map.** What positioning territory is claimed, by whom, and what is unclaimed. Be specific — "quality" is not a position; "we still pick up the phone" is.
4. **The soft underbelly.** For each Tier 1 competitor, the specific, exploitable weakness — broken pages, inconsistent claims, thin content, unverifiable badges.
5. **Verification pass.** Spot-check at least 5 manufacturer certification claims against the manufacturer's own contractor locator. Report any that don't verify. This is high-value and nobody does it.
6. **Commercial vs. residential split.** How many of these serve both, and does anyone own commercial/flat/low-slope in Suffolk?

## Hypotheses in your lane
H1 (market bar is low), H2 (depth beats volume), H5 (same-day is unclaimed), H6 (license/pricing transparency is a differentiator).

---

# LANE B — Keyword Universe & SERP Intelligence
**Output file:** `B-keyword-serp.md`
**Boundary:** You own *what people search and what ranks*. You do NOT own map pack composition (Lane C) or content structure recommendations (Lane D) — you supply the data those lanes consume.

## Objective
Build the complete keyword universe for residential roofing in Suffolk County, mapped to intent and to the page types that should target them. This is the single most load-bearing research lane — the entire content architecture is downstream of it.

## Scope

**1. Build the keyword matrix.** Systematically, not opportunistically. The dimensions:
- **Services:** roof replacement, roof repair, roof installation, leak repair, flat/low-slope, metal, cedar shake, slate, skylight, chimney flashing, gutters, siding, storm damage, emergency, inspection, maintenance, ventilation, ice dam
- **Geography:** every Suffolk town and major hamlet. At minimum: Huntington (+ Melville, Greenlawn, Halesite, Cold Spring Harbor, Northport, East Northport, Dix Hills, Commack), Smithtown (+ St. James, Nesconset, Kings Park, Hauppauge, Nissequogue), Islip (+ Bay Shore, Brentwood, Central Islip, Sayville, West Islip, Holbrook, Ronkonkoma, Bohemia), Babylon (+ West Babylon, Lindenhurst, Deer Park, Amityville, Copiague, Wyandanch), Brookhaven (+ Patchogue, Medford, Coram, Selden, Centereach, Farmingville, Port Jefferson, Setauket, Rocky Point, Miller Place, Shirley, Mastic, Bellport), Riverhead, Southold, Southampton, East Hampton, Shelter Island, Smithtown
- **Modifiers:** near me, cost, price, best, top rated, cheap, affordable, emergency, 24 hour, same day, free estimate, financing, licensed, insured, reviews, companies, contractors, [year]
- **Materials/brands:** GAF, Timberline HDZ, Owens Corning Duration, CertainTeed Landmark, architectural shingles, asphalt vs. metal
- **Problem/informational:** signs you need a new roof, how long does a roof last, roof leak causes, ice dams, insurance claim, repair vs. replace, roof warranty, how long does replacement take, do I need a permit

**2. For each keyword cluster, determine:**
- Estimated monthly volume — use whatever free sources you can reach (Google autocomplete, People Also Ask, related searches, Keyword Surfer-type public data, Reddit/forum language). **Be explicit that these are estimates and state your method.** Do not fabricate precise volumes.
- Intent classification: transactional / commercial-investigation / informational / navigational
- Difficulty proxy: who ranks, how strong are they, is the SERP dominated by directories or by contractors
- Target page type: homepage / service page / town page / town×service page / blog post / FAQ

**3. Run and document at least 25 actual SERPs.** For each: the top 10 organic results, whether a map pack is present and where, and which SERP features appear (People Also Ask, featured snippet, video, images, sitelinks, "Things to know"). Record the exact PAA questions — they are content briefs in disguise.

**4. The town × service matrix.** Which combinations have real search demand and weak competition? Rank them. This becomes the build order for the content plan.

**5. Seasonality.** Map query demand across the calendar. When does "ice dam" spike? When does "storm damage"? What should be published in August to rank by November?

**6. Directory dominance.** Quantify how much of page one is Angi/Yelp/BBB/GAF/HomeAdvisor across your 25 SERPs. If directories own 40% of page one, that changes strategy materially.

**7. Long-tail and question mining.** Harvest People Also Ask, autocomplete, Reddit (r/Roofing, r/longisland, r/HomeImprovement), Quora, and local Facebook groups for the actual language Long Island homeowners use. Direct quotes are gold — they become headlines and FAQ entries.

## Hypotheses in your lane
H2 (depth beats volume), H4 (emergency/storm is soft), H7 (directory presence is a ranking channel).

---

# LANE C — Local SEO, Map Pack, Citations & Link Authority
**Output file:** `C-local-authority.md`
**Boundary:** You own *off-site and map-based visibility*. You do NOT own on-site content (Lane D) or on-page keyword targeting (Lane B).

## Objective
Determine exactly what it takes to win the local pack in Suffolk County towns, and what authority-building the launch plan needs.

## Scope

**1. Map pack composition.** For at least 12 Suffolk towns, determine who occupies the 3-pack for "[service] [town] ny" queries. Record business name, review count, rating, and — critically — **whether their listed address is inside that town.** Look for patterns: are proximity-to-centroid, review count, or category selection driving placement? Note that Google's map UI resists automated access; use SERP results, third-party aggregators, and any accessible surface, and be explicit about method and limits.

**2. Google Business Profile strategy.** Research current best practice for a **service-area business (SAB)** vs. a storefront listing in home services. Specifically: can an SAB rank in towns it does not have an address in, and how far does the radius realistically extend on Long Island? What are the category, service, product, photo, post, and Q&A optimization levers that actually move rankings in 2026? What is the current state of review-gating rules and what is compliant?

**3. Review velocity and volume benchmarks.** What review count is table stakes to compete in a Suffolk town 3-pack? Current leaders show 140–312. What is the realistic acquisition rate, what tooling do contractors use (Podium, Birdeye, NiceJob, GatherUp), what does it cost, and what are the compliance constraints (Google's review-gating policy, FTC rules on incentivized reviews)?

**4. Citation and directory audit.** Build the definitive NAP citation list for a Long Island roofing contractor: the general aggregators, the industry-specific ones (GAF/Owens Corning/CertainTeed contractor locators, NRCA, Angi, Houzz, Thumbtack, BuildZoom, Porch), and the **hyper-local** ones (Long Island chambers of commerce, town business directories, Newsday listings, Patch, Nextdoor, LI Business News, local BIDs). Rank by value. Note cost and whether each is a ranking channel or just a citation.

**5. Backlink profiles.** Using whatever free tools you can reach, profile the backlinks of the top 5 competitors. What kinds of links do they have? Local news, chambers, supplier pages, sponsorships, HARO, directories, spam? Identify **specific, replicable link opportunities** in Suffolk County — named organizations, not categories.

**6. Local trust signals unique to Long Island.** What do Suffolk homeowners actually check? Is there a county contractor-license lookup consumers use? Do local Facebook groups and Nextdoor drive meaningful referral volume? Is there a "Best of Long Island" awards program worth entering?

**7. Google Local Services Ads.** Requirements, cost per lead in this market, the Google Guaranteed badge, and how LSA placement interacts with organic and map results. Is this a launch-phase necessity or a later optimization?

## Hypotheses in your lane
H1 (market bar is low), H7 (directory presence is a ranking channel).

---

# LANE D — Content Architecture & Topical Authority
**Output file:** `D-content-architecture.md`
**Boundary:** You own *what pages exist and what goes on them*. You consume Lane B's keyword data conceptually but do NOT duplicate keyword research. You do NOT own technical implementation (Lane E).

## Objective
Design the complete information architecture and content plan for the new site — page by page — such that the spec can be written directly from it.

## Scope

**1. Reverse-engineer the best local pages in the market.** Deep-read at minimum: LI Roofing Co.'s Huntington and Smithtown pages, Perfect Pitch's Smithtown page, Rapid Roofing's nested hamlet pages, and by contrast Valor's and Renew's thin pages. Produce an **anatomy** of the winning town page: every section, in order, with word counts and the specific type of local detail in each. Then produce the anti-pattern anatomy from the thin ones.

**2. Design the site architecture.** Full URL structure, page inventory, and hierarchy. Resolve explicitly:
- Town pages vs. town×service pages vs. both. What's the URL pattern and how deep does it nest?
- How many town pages at launch vs. phase 2? Justify with a depth-vs-volume argument, not a number pulled from the air.
- How do hamlets relate to towns — separate pages, sections, or FAQ mentions?
- Service page taxonomy — what are the real services, named the way customers search (note the baseline's finding that the reference site invented categories nobody searches)
- Where do commercial/flat roofing live, if at all?
- Blog/resource hub structure and its relationship to money pages

**3. Internal linking model.** Specify the actual rules: town→town (adjacency? hub?), town→service, service→town, blog→money page, breadcrumbs. Draw the graph. Anchor text conventions.

**4. Town page content sourcing plan.** The hard part — what makes a town page *genuinely* local rather than a name-swap. For 3 sample towns, research and document: the town building department (address, permit process, fee range, inspection requirements), dominant housing stock and era, roofing-relevant local conditions (salt air on the north/south shores, tree cover, historic districts, HOA prevalence), notable neighborhoods and hamlets, and any local roofing quirks. **Then write the repeatable research protocol** so the remaining towns can be done at scale.

**5. Editorial plan.** 12 months. Topic, target cluster, intent, target page it supports, publish month (seasonally aligned), and format. Include the three lanes the baseline identifies: seasonal, hyperlocal, comparison. Note that County Roofing's manufacturer-comparison content ("GAF vs Owens Corning vs CertainTeed") is the smartest angle found in the market and is worth beating.

**6. Trust and proof content.** Design the systems, not just the pages: case study template, before/after gallery structure (with town tagging so it feeds town pages), review display, license/insurance display, warranty explainer, financing explainer, "meet the crew," and the about/founder story. Note what the market does badly here — four of seven show no reviews at all.

**7. Conversion copy direction.** Value proposition options, headline formulas, CTA language, objection-handling content. Ground this in the actual language homeowners use (Lane B is mining that; you should too, independently).

## Hypotheses in your lane
H2 (depth beats volume), H4 (emergency/storm content is soft), H5 (same-day positioning), H6 (transparency as differentiator).

---

# LANE E — Platform, Technical SEO & Performance Benchmarking
**Output file:** `E-platform-technical.md`
**Boundary:** You own *how it gets built and how fast it runs*. You do NOT own conversion tooling and integrations (Lane F) or content (Lane D).

## Objective
Recommend the technical platform and specify the technical SEO requirements, benchmarked against what competitors actually run.

## Scope

**1. Competitor stack detection.** For the top 8 competitors: CMS/platform, page builder, theme, hosting, CDN, SEO plugin, analytics and tracking, chat/form tooling, any CRM. Use publicly observable signals — page source patterns, sitemap structure, response headers, known plugin fingerprints. The baseline notes Rank Math on at least two sites and heavy WordPress prevalence.

**2. Core Web Vitals benchmark.** Run PageSpeed Insights on the homepage and one town page for the top 8 competitors, mobile and desktop. **The baseline's Session 1 hit API rate limits — pace your requests and retry.** Record LCP, CLS, INP/TBT, FCP, Speed Index, and the performance/SEO/accessibility scores. Produce the ranked table. **What is the bar to beat, and is anyone actually fast?** If the whole market is slow, that's a real differentiator and a ranking factor.

**3. Platform recommendation.** Evaluate honestly against this project's actual needs — 20–40 initial pages growing to 100+, heavy local content, image-heavy galleries, form/booking integrations, non-technical content editing after handoff, and a small-business budget:
- WordPress (which stack — classic, block, headless?)
- Next.js / Astro + a headless CMS (Sanity, Payload, Contentful)
- Webflow
- Static site generator + Git-based CMS
For each: build cost, ongoing cost, editor experience for a non-technical owner, SEO capability, performance ceiling, scaling behavior for programmatic town pages, and lock-in risk. **Give one recommendation and defend it against the strongest counterargument.**

**4. Programmatic vs. hand-written town pages.** This is the central technical/editorial tension. Research how to get the SEO benefit of scale without producing the thin doorway pages that Valor and Renew have. What is the current state of Google's guidance on programmatically-generated local pages? Where is the line? Propose a hybrid model if one is defensible.

**5. Technical SEO requirement spec.** Concrete and implementable: URL conventions, canonical strategy, XML sitemap structure (indexed? split by type?), robots.txt, pagination, breadcrumbs, hreflang (needed? Spanish-language market on Long Island is worth assessing), 404/301 strategy, HTTPS/HSTS, structured data plan (which types on which pages — LocalBusiness/RoofingContractor, Service, FAQPage, Review/AggregateRating, BreadcrumbList, ImageObject, VideoObject), image optimization and formats, lazy loading, font loading, third-party script budget.

**6. Analytics and measurement.** GA4 configuration, Search Console, call tracking (which vendor, and how to avoid NAP inconsistency with dynamic number insertion), form and booking event tracking, heatmapping, and the specific KPI set this build should be judged on.

**7. Accessibility and legal.** WCAG 2.2 AA requirements, and the real-world ADA litigation exposure for small-business sites in New York — this is a live risk in NY and worth a clear-eyed assessment rather than boilerplate.

## Hypotheses in your lane
H1 (market bar is low — test it on performance specifically), H2 (depth vs. volume, from the technical angle).

---

# LANE F — Conversion, Lead Capture & Sales Technology
**Output file:** `F-conversion-tech.md`
**Boundary:** You own *turning a visitor into a booked job*. You do NOT own the platform decision (Lane E) or content/copy (Lane D) — you specify what the conversion layer must do.

## Objective
Specify the booking and quoting layer that the baseline identifies as the market's clearest whitespace (H3), grounded in what's actually buildable and what it costs.

## Scope

**1. Verify the gap.** The baseline claims zero of seven competitors have live chat, text-to-quote, or real online booking. **Test this yourself across 15+ Suffolk roofing sites.** Note anything that has appeared since. If the gap is real, quantify it. If it's closing, say so — that changes the strategy.

**2. Instant estimate technology.** The real research question here. Evaluate aerial/satellite roof measurement platforms — EagleView, Hover, Roofr, GAF QuickMeasure, Nearmap, RoofSnap — on: API availability, cost per report, turnaround time, accuracy, whether they can power a genuine self-service instant ballpark on a website, and what integration actually looks like. **Distinguish "measurement for the contractor" from "instant price for the homeowner."** Most vendors sell the former; the latter is what would differentiate. Is a credible instant price range achievable, and what are the risks of publishing one?

**3. Booking and scheduling.** Evaluate options for genuine online inspection booking against real crew availability: standalone (Calendly, Cal.com, Acuity), roofing-specific (JobNimbus, AccuLynx, Roofr, JobProgress, Leap), and general field-service (ServiceTitan, Housecall Pro, Jobber). For each: cost, roofing fit, calendar sync fidelity, and whether it can be embedded in a marketing site without feeling bolted on.

**4. Speed-to-lead.** Research the actual data on response time vs. close rate in home services. Then specify the stack that delivers it: instant SMS auto-response, call routing, missed-call-text-back, after-hours handling, AI voice/chat receptionists (evaluate seriously — this is moving fast and roofing is a common use case). What's the realistic cost?

**5. Financing integration.** The baseline notes competitors publish 0%/18mo, 9.99% APR, $0 down. Research the actual lender landscape for roofing contractors — Service Finance Company, GreenSky, Acorn Finance, Hearth, Wisetack, Sunlight, Foundation Finance. Dealer fees, approval mechanics, soft-pull prequalification, and — critically — whether an **embedded inline prequalification widget** is available versus a link-out. LI Roofing publishes real terms; three competitors have financing pages that 404. Publishing real terms with an embedded widget would lead the market.

**6. Form design and CRO.** Field count vs. conversion rate data, multi-step vs. single-step for high-ticket home services, mobile form patterns, SMS consent capture that is **TCPA-compliant** (research current 2026 requirements carefully — the one-to-one consent rules and their litigation history matter), progressive profiling, and exit-intent. Ground recommendations in data, not opinion.

**7. Trust-at-conversion.** What appears next to the form and the phone number. Review widgets (which vendor, what it costs in performance), license number display, insurance badges, certification badges, guarantee language, response-time promises. Note the baseline finding: Valor promises "respond within 24 hours," which reads slow — what's the right promise?

**8. Call tracking and attribution.** Vendors, dynamic number insertion done without breaking NAP consistency, whisper messages, recording and NY consent law (New York is one-party consent — confirm), and how to attribute a booked job back to a town page.

**9. The recommended stack.** One integrated recommendation with total monthly cost, implementation complexity, and a phased rollout — what ships at launch vs. phase 2.

## Hypotheses in your lane
H3 (booking layer is category-leading whitespace) — this is your primary hypothesis to prove or kill.

---

# LANE G — Market, Operations, Compliance & Economics
**Output file:** `G-market-ops-compliance.md`
**Boundary:** You own *the business and legal reality the site sits inside*. You do NOT own marketing tactics.

## Objective
Establish the operational, legal, and financial constraints that the SOW must respect — and pressure-test the economics.

## Scope

**1. Licensing — go deeper than the baseline.** The baseline confirms Suffolk §563-17D and Nassau §2(a) advertising requirements. Extend:
- The full application process, cost, timeline, exam, bond and insurance minimums for the Suffolk Home Improvement Contractor license
- Same for Nassau
- **Town and village licensing within Suffolk** — the baseline notes case law is mixed. Which Suffolk towns/villages require separate licensing? This directly affects which towns the site can legally advertise in.
- Is there a public license lookup consumers (and Adam) can use? Verify whether Premium Roofing Solutions holds a valid Suffolk license — relevant to Branch A.
- NY State requirements layered on top of county ones
- Penalties for unlicensed advertising

**2. Permitting by town.** For at least 6 Suffolk towns: is a permit required for reroofing, what does it cost, how long does it take, are there inspection requirements, and are there historic-district or coastal overlays. This is both a compliance input and — per Lane D — premium town-page content.

**3. Insurance and bonding.** What a Suffolk roofing contractor must carry, typical costs, and what should be displayed publicly.

**4. Advertising and consumer law.** NY Home Improvement Contract requirements (written contract thresholds, mandatory clauses, three-day right of cancellation), deposit limits and escrow rules, warranty disclosure obligations, and the rules on advertising claims like "#1 rated," "best," and unverified review counts. Several competitors make claims that may not survive scrutiny — assess the exposure of matching them.

**5. Insurance-claim roofing.** A significant channel in storm markets. What are the rules in NY on contractors assisting with insurance claims, public adjuster licensing boundaries, and the legality of waiving or absorbing deductibles (this is prosecuted in some states — determine NY's position). Then: how much of the Suffolk market is insurance-driven, and should the site build for it?

**6. Market sizing.** Suffolk County housing stock: number of single-family homes, age distribution, ownership rate, median home value, and the implied annual reroof demand. Cross-reference with roof lifespan. This turns the revenue model from a guess into an estimate.

**7. Pressure-test the economics.** The baseline's Session 1 model assumed 15–40 sessions/town page/month, 3–6% conversion, 30% close, $11,500 average job. **Challenge every one of those numbers with sourced benchmarks.** Are local service page conversion rates really 3–6%? Is 30% close realistic for web leads specifically (as opposed to referrals)? Rebuild the model with defensible inputs and produce conservative/base/optimistic bands with the arithmetic shown. Also model **customer acquisition cost and payback period** for the build investment.

**8. Competitive operations.** Crew size, subcontractor vs. W-2 models (LI Roofing makes W-2 employment a selling point), typical job duration, and the capacity constraint the baseline flags: same-day replacement plus 6–8 week summer backlogs is an operational claim that must be verifiable before it's marketed.

**9. Seasonality and cash flow.** Refine the baseline's Oct–Apr nor'easter / Jul–Aug peak picture with data. What does the demand curve look like month by month, and what does that imply for launch timing? The baseline suggests the storm cluster must be live before October.

## Hypotheses in your lane
H4 (storm season is the opportunity), H6 (compliance as differentiator), and the economics underlying all of them.

---

# LANE H — AI Search, GEO/AEO & Emerging Discovery
**Output file:** `H-ai-search-geo.md`
**Boundary:** You own *discovery channels that aren't classic blue-link SEO*. You do NOT own traditional SERP analysis (Lane B).

## Objective
Determine how Suffolk County homeowners will find a roofer through AI assistants in 2026–2027, and what the site must do to be the answer.

## Scope

**1. Test the assistants directly.** Ask ChatGPT, Claude, Gemini, Perplexity, and Google AI Overviews the queries a homeowner would actually ask: "who's the best roofer in Suffolk County," "I need my roof replaced in Smithtown NY, who should I call," "how much does a roof cost in Huntington NY," "emergency roof repair near Bay Shore." **Record which companies get named and — critically — which sources get cited.** Run each query more than once; note variance. This is the highest-value work in this lane because almost nobody has this data for a local trade market.

**2. Reverse-engineer the citations.** For every source an AI cites, determine why: is it a directory, a review platform, a competitor's own page, a local news article, a Reddit thread? Is there a pattern? If AI assistants overwhelmingly cite Angi and Yelp for this market, the strategy is different than if they cite contractor sites directly.

**3. GEO/AEO requirements.** What is the current, evidence-backed understanding of how to become citable by LLMs? Distinguish real findings from SEO-industry speculation — this space is full of confident nonsense. Cover: structured data's actual role, content formatting for extractability, entity consistency and knowledge-graph presence, llms.txt (is it real or vaporware?), the value of being cited on third-party sites vs. your own, and whether Bing indexation matters more than it used to.

**4. Google AI Overviews specifically.** For the local roofing queries in Lane B's set, how often does an AI Overview appear, what does it say, and what does it cite? What happens to click-through when it does? Is there a defensive strategy?

**5. Entity and knowledge graph.** How does a new local business establish itself as a recognized entity? Wikidata, Google Knowledge Panel, consistent sameAs linking, Organization schema. What's actually achievable for a small roofing contractor and what's a waste of time?

**6. Voice and conversational search.** How much of local home-services search is voice, and does it change the content requirements (question-formatted headings, concise direct answers, speakable content)?

**7. Adjacent discovery channels.** Assess and size, honestly — say when something isn't worth it: Nextdoor (looks meaningful for LI home services), local Facebook groups, YouTube (roofing content performs; is local roofing YouTube viable?), TikTok/Instagram for trades, Reddit (r/longisland, r/Roofing — what's the etiquette and is there a non-spammy play?), and email/SMS retention for a business with a 20-year repurchase cycle.

**8. The two-to-three year view.** Where is local discovery heading, and what would make this build obsolete? Recommend what to build now that survives it, and explicitly name what not to over-invest in.

## Hypotheses in your lane
H7 (directory presence as a channel) — extended to AI citation sources. Plus: is classic local SEO still the right primary investment, or is the channel mix shifting?
