# A — Deep Competitive Teardown
**Agent:** Claude Opus 4.8 · **Date run:** 2026-08-01 · **Sources consulted:** 24 (8 competitor sites fetched verbatim, 9 SERP/search passes, 3 town-page depth fetches, 3 manufacturer-locator verification attempts, 1 financing page)

> **Method + honesty note up front.** Everything labeled *"quoted"* is verbatim text pulled by WebFetch on 2026-08-01. WebFetch's HTML→markdown conversion **strips `<head>` on most sites**, so many meta descriptions and some exact `<title>` tags could not be captured — flagged inline. Three sites (countyroofingsystems.com, anthonysroofing.com, and every gaf.com contractor-locator page) returned **HTTP 403 to the fetcher** — bot protection — so their data is from SERP snippets, not live fetch. This 403 wall is itself a material finding (see §6 and the Verification Pass). "GAF Master Elite on a site" = claim; I was **unable to machine-verify a single tier** against GAF's own locator because GAF blocks the fetcher. I could only confirm *listing existence* via search-result URLs.

---

## 1. EXECUTIVE FINDINGS

1. **The baseline's headline whitespace claim — "only 1 of 7 shows a license number" — is already stale. At least THREE now display Suffolk license numbers.** LI Roofing Co (Suffolk #53241-H, Nassau #H2815200000 — quoted in-body on its town pages), **Right Angle Roofing & Siding ("Suffolk County Lic #51,886-H")**, and **Clearview Roofing ("Suffolk #55260-H", plus Nassau/Southampton/Long Beach numbers)**. License display is still a *minority* behavior and still a differentiator (H6), but "nobody but LI Roofing does it" is refuted. Anyone advertising in Suffolk without the number is in violation of Code §563-17D regardless.

2. **The real ceiling is set by ONE page type: LI Roofing Co's town pages are ~6,500–7,000 words with per-square-footage pricing tables, named streets (Landing Ave, Edgewood Ave, Mill Rd, Harbor Rd), school districts, permit turnaround times, in-body license numbers, and FAQPage schema.** This is not "ordinary things done competently" — it is the single most sophisticated local page in the market and it is the bar to beat. H1 ("market bar is low") is only half true: the *median* is low; the *top* is not trivially beatable.

3. **Depth beats volume — but only when paired with reviews and links (H2, qualified).** The thin-volume players (Valor 48 pages ~850w name-swap; Renew 24 pages ~650w) are visibly weaker. But **Rapid Roofing ranks #1 for many head terms on 34 nested pages of only *moderate* depth (~2,000–2,500w) because it also has 300+ reviews, Owens Corning Platinum, and a dense internal-link mesh.** Pure depth without authority is not sufficient; pure volume without depth is losing.

4. **"Same-day" (H5) is more contested than the baseline thought — but the specific wedge survives.** "Same-day service" / "same-day repair" / "same-day free estimates" is actively claimed by **Sunrise Roofing & Chimney, Empire Gen Roofing, and L.I.N.Y Roofing**. What remains genuinely **unclaimed as a headline positioning is same-day full roof *replacement*** — none of the 18 markets it as their core wedge (only the reference site premiumroofsolutions.com does, and it's a dead demo). H5 is PARTIALLY REFUTED for "same-day service," CONFIRMED for "same-day replacement."

5. **Pricing transparency is owned by exactly two firms — and one of them just weaponized it.** LI Roofing Co now publishes **town-specific per-home-size pricing** (Smithtown ranch/cape $9,500–$13,500; split $12,500–$18,500; colonial $15,000–$23,000). County Roofing publishes ranges ($7.5k–15k, "from $149/mo"). Everyone else hides price. Cost-intent search is a two-horse race (H6 confirmed).

6. **Financing is a mess of broken pages and a few real offers.** Real, specific terms: LI Roofing (0%/18mo, 5.99–9.99% APR), Rapid (Service Finance Co: 24-mo deferred + 10% dealer fee, or 9.99%/5yr + 4% dealer fee — **no embedded prequal widget, just a request form**), Right Angle ("72-month interest-free" and "12 months no interest no payments"), King Quality (0% for 5yr, $0 down). Broken/hidden: Valor, Renew, Bumble, Perfect Pitch ($0-down claimed but the baseline's 403 on the terms page persists). **Nobody has an inline soft-pull prequalification widget** — link-outs and forms only.

7. **Commercial/flat/low-slope is genuinely under-owned by the residential-SERP competitors, and the firms that DO own it are separate specialists.** Among residential players only County Roofing (Keith Schmied, "over 35 years," EPDM/TPO/modified bitumen) and Clearview (60+ yrs, TPO/EPDM/PVC/SBS/BUR) meaningfully claim flat/commercial. The dedicated flat-roof SERP is a *different* set — IslandWide Commercial, Maspeth, Mayancelas, longislandflatroof.com — who don't compete on residential terms. **A residential roofer that credibly claims flat/low-slope faces almost no residential-brand competition there.**

8. **Two nearly identical brand names will cause NAP/entity confusion and must be disambiguated in the build: "LI Roofing Co" (liroofingco.com, the market leader, Nassau phone 516-529-2997) vs. "Long Island Roofing and Siding" (liroofingandsiding.com, Ronkonkoma — a different company).** The baseline's "LI Roofing" references are the former.

---

## 2. COMPETITOR TEARDOWN

### 2.1 Verbatim capture — the analyzed set

Notation: *(q)* = verbatim-quoted from a live 2026-08-01 fetch; *(s)* = from SERP snippet (site 403'd or not fetched); "—" = not found / not shown.

**LI Roofing Co — liroofingco.com — TIER 1 (market leader)**
- Homepage title *(q)*: "Long Island Roofing Company | Roof Repair & Replacement Nassau & Suffolk". Meta desc: stripped.
- Town-page title *(q)*: "Roofing Companies Smithtown NY | Flat Roofing & Shingle | GAF Master Elite | LI Roofing Co."
- Service-page H1 *(q)*: "Long Island Roof Repair"; value prop *(q)* "Fast response. Honest diagnosis. Lasting fix."
- Above-fold *(q)*: "Long Island Roofing, Built to Last Since 2014." / "Your roof is our reputation."
- Primary CTA *(q)*: "Get a Free Estimate" + "Call Us Direct (516) 529-2997". Also a secondary "Instant Estimator" tool referenced.
- Certs *(q)*: "GAF Master Elite", "CertainTeed SELECT ShingleMaster", "BBB A+ Accredited".
- License *(q)*: "Nassau HIC #H2815200000", "Suffolk HIC #53241-H" (shown in footer AND in town-page body).
- Reviews *(q)*: "4.9 / 5 (312 Google reviews)".
- Financing *(q)*: "0% promos, quick pre-qualify"; baseline documents 5.99–9.99% APR + example payments.
- Warranty *(q)*: "10-year workmanship warranty"; "GAF Golden Pledge… 25-year coverage on both materials and workmanship."
- Pricing *(q)*: homepage $9,500–$16,500 replacement; town page adds per-size tables (above).
- Trust *(q)*: "Licensed Since 2014", "1,850+ Long Island roofs since 2014", owner "Tom Gallagher", "18 Full-time crew", "Mon–Sat, 7am to 6pm".
- Lead form *(q)*: Name*, Phone*, Email, Long Island ZIP*, "Interested in" dropdown, "Timeline" dropdown. Single step.
- Service taxonomy *(q)*: Roof Repair / Roof Replacement / Flat Roofing / Metal Roofing / Commercial Roofing / Gutters & Skylights. URL pattern `/services/<slug>`, towns `/areas/suffolk-county/<town>`.

**Rapid Roofing (Rapid Restore) — rapidrestoreny.com — TIER 1**
- Title/meta: stripped by fetcher.
- Above-fold *(q)*: "Family-owned Roofing Company in Long Island"; "Our Big 3 Guarantee" = "Stress Free, Easy Experience." / "Economical, Affordable Pricing." / "Exceptional, World-Class Roof Install."
- CTA *(q)*: "Get Your Free Roof Estimate".
- Certs *(q)*: "Owens Corning Platinum Preferred Contractor", "Angi Super Service Award", "BBB A+".
- License: — (none shown; **§563-17D violation risk**).
- Reviews *(q)*: "300+ 5-star reviews" (baseline flags inconsistent 300+/400+).
- Financing *(q, financing page)*: Service Finance Company; 24-mo deferred-interest + 10% dealer fee; 9.99%/5yr + 4% dealer fee; "3, 7, 10 and 15-year plans." No prequal widget.
- Warranty *(q)*: "Manufacturer-backed warranties" (unspecified).
- Pricing: — (cost blog only). Phone *(q)*: 631.201.8078.
- Town page (Smithtown) *(q)*: ~2,000–2,500w, names hamlets Commack/Hauppauge/Kings Park/Nesconset/St. James, landmarks "Smithtown Landing Golf Course to Blydenburgh County Park", 40+ internal links, **no FAQ**.

**Perfect Pitch Roofing — perfectpitchroofing.com — TIER 1**
- Title/meta: stripped. Above-fold *(q)*: "Long Island's Trusted Roofing Contractor — Suffolk County, NY".
- CTA *(q)*: "Free Online Estimate".
- Certs *(q)*: "GAF Master Elite® Roofing Contractor", "GAF Installation Excellence Award", "BBB A+".
- License: — (none shown).
- Reviews *(q)*: "4.9" / "140 verified Google reviews".
- Financing *(q)*: "$0 Down Payment Plans Available", "4 convenient payment plans with $0 down" (baseline: terms page 403s).
- Warranty *(q)*: "100% Lifetime Warranty On All Materials & Labor".
- Pricing: — (cost blog only). Phone *(q)*: (631) 737-3328. Owner referenced as "Joe."
- Town page (`/suffolk-county-roofing/smithtown/`) *(q)*: ~2,800w, genuinely local — quotes "St. James, Nesconset, Kings Park, Hauppauge, Head of the Harbor, Nissequogue, Commack, and Fort Salonga", "Smithtown CSD, Kings Park CSD, Hauppauge UFSD, and Commack UFSD", "1960s ranch in Nesconset", "Long Island Sound nor'easters, summer hail, and the oak-canopy leaf load", FAQ present, links to Huntington/Babylon/Islip.

**County Roofing Systems — countyroofingsystems.com — TIER 1 (site 403'd the fetcher; data = SERP + baseline)**
- Certs *(s)*: triple GAF + Owens Corning + CertainTeed. Reviews *(s)*: "150+ five-star."
- Financing *(s)*: 0% up to 5yr, "from $149/mo." Pricing *(s)*: $7.5k–15k FAQ. Blog: 53 posts.
- Owner *(s)*: "Keith Schmied… over 35 years." **Owns flat/commercial**: "EPDM roofing, TPO roofing membrane, modified bitumen." Town pages: ~9, **none physically in Suffolk** (baseline).

**Right Angle Roofing & Siding — rightangleroofingandsiding.com — TIER 1 (NEW to deep analysis)**
- Title *(q)*: "Roofing Contractor Long Island | Roofers Suffolk & Nassau County". Meta: stripped.
- Above-fold *(q)*: "Paying Attention to Every Detail". CTA *(q)*: "Contact us for a Free Estimate!" (631-849-8988).
- Certs *(q)*: "GAF Master Elite® Certified", "A+ rated… Better Business Bureau."
- License *(q)*: "**Suffolk County Lic #51,886-H**".
- Reviews *(q)*: "**900+ reviews**" on Google.
- Financing *(q)*: "100% financing available"; "18-month, interest-free financing"; "**72 Month Interest-Free Financing** or 12 Months, NO Interest No Payments."
- Warranty *(q)*: "Life Time Warranty." Pricing: —. Owner *(q)*: "Maxwell." "over 10 years of experience."

**Clearview Roofing (longislandroofs.com) — TIER 1/2 (incumbent, 60+ yrs)**
- Title *(q)*: "Long Island Roofing Contractor | Clearview Roofers". Above-fold *(q)*: "Long Island Roofing Experts | Clearview Roofing".
- CTA *(q)*: "Request a Quote" / "Call 631-262-7663".
- Certs *(q)*: "Timberline GAF certified shingle roofer" (note: *not* Master Elite claimed here).
- License *(q)*: "Nassau # H18H7230000 | Suffolk #55260-H | Southampton NY #L005556 | Long Beach NY# 12474" — **the most town/village license coverage of anyone found.**
- Reviews *(q)*: "over 400 reviews and a 4.9/5 rating" (HomeAdvisor).
- Financing: — . Warranty: — . Owner: —. "Over 60+ years… since 1961."
- **Owns flat/commercial** *(q)*: "TPO, EPDM, PVC, SBS, and Built-Up roofing."

**Anthony's Roofing — anthonysroofing.com — TIER 2 (site 403'd; data = SERP)**
- Certs *(s)*: "Certified GAF Master Elite", "Golden Pledge® Warranty… up to 50 years."
- Reviews/awards *(s)*: "over 17,000 happy customers"; "BEST OF L.I." 2012–2025 (multiple years); "Dan's Papers Platinum"; BBB A+.
- Financing *(s)*: "financing options" (vague). License: — . Location: Bohemia.

**King Quality Construction — kingquality.com — TIER 1/2 (brand-heavy, big spend)**
- Certs *(s)*: "**3 Star Presidential Club award… only company… in New York State**" (GAF's highest tier); "Premium System Professional… only winner… on Long Island." 50-yr non-prorated GAF warranty.
- Financing *(s)*: "0% financing for 12 months"; "finance… 5 years at 0% with $0 down."
- Reviews *(s)*: mixed (praised materials/warranty; one complaint re: installing "in pouring down rain"). Location: Bohemia. Licensed by DCA *(s)*.

**Expressway Roofing & Chimney — expresswayroofingandchimney.com — TIER 2**
- *(s)*: "family-owned… over 22 years", "GAF certified" (tier unstated), residential + commercial + chimney + flat (TPO/EPDM/modified bitumen), siding, gutters, skylights. Strong blog/education content. GAF listing exists (Manorville).

**PJ Fitzpatrick — pjfitz.com — TIER 2 (regional multi-state, programmatic)**
- *(s)*: founded 1980 by Pete Fitzpatrick, "over 40 years", "serves 118 cities", 4.7/5 (149 reviews, Best Pick). Roofing + windows + siding + gutters. "does not offer flat roof." "limited lifetime warranty on materials and labor." Ranks via programmatic `/areas/<county>/roofing-contractors-in-<town>/` pages. Not a Suffolk-pure roofer.

**Valor Roofing — valorli.com — TIER 3 (thin-volume)**
- Title *(q)*: "Valor Roofing: Premier Long Island Roofing & Repair Contractor". Meta *(q)*: "The number one roof installation & leak repair contractor in Long Island, NY. Above average roofs. Above average homeowners."
- Above-fold *(q)*: "Premier Long Island Roofer". CTA *(q)*: "Contact Us" (weak — no estimate CTA above fold).
- Certs *(q)*: "GAF-certified" (tier unstated). License: — . Reviews *(q)*: "8 individual… reviews" (no aggregate rating).
- Financing *(q)*: page exists, no terms. Warranty *(q)*: "30-Year Guarantee." Owner *(q)*: "Tommy", "30+ years experience." Phone 631-602-7071.
- **Response promise *(q)*: "Submit a request, and we'll respond within 24 hours"** — reads slow.
- Town page *(q)*: ~850w name-swap; opener "At Valor Roofing, we are committed to delivering roofing solutions that stand the test of time for homeowners in Smithtown, NY." No FAQ, no local detail, listed address is Sayville not Smithtown.

**Renew Roofing Solutions — renewroofs.com — TIER 3 (thinnest)**
- Title *(q)*: "Home - Renew Roofing Solutions | Roofing Contractor Suffolk County | Licensed Roofing Company | Affordable Roof Installation on Long Island Roof Repair Replace" (keyword-stuffed title).
- Above-fold *(q)*: "Protecting Homes. Restoring Peace of Mind. With Owens Corning."
- CTA *(q)*: "Get My Free Roof Estimate". Certs *(q)*: "Owens Corning Preferred Contractor." License: — . Reviews: — .
- Financing *(q)*: "0% Financing Available" (baseline: page 404s). Pricing: —. Owner: —. Phones 516-212-0307 / 914-415-7702.
- **Satellite tool *(q)*: "Enter your ZIP code… to check service availability and start your free satellite roof estimate. No obligation."** — the only genuinely automated ZIP-gated tool found, but shallow.

**Bumble Roofing (franchise) — bumbleroofing.com/suffolk-county/ — TIER 3**
- *(s)*: national franchise, Smithtown page exists, "free roofing estimate", GAF Master Elite + OC Preferred claimed (baseline), financing page 404s (baseline). No reviews/license shown.

**Sunrise Roofing & Chimney — sunriseroofingandchimney.com — TIER 3 (same-day claimant)**
- *(s)*: "Licensed & Insured, Family Owned", "**Same Day Service**" for repairs/replacement, Nassau & Suffolk, roofing + chimney.

**Additional same-day / lower-tier names surfaced:** Empire Gen Roofing ("same day", "25 years"), L.I.N.Y Roofing ("same day free estimates"), Sav A Roof, New Image GC Roofing (Smithtown page), Level Up Roofing & Chimney (Smithtown page), EZ Roofing (Suffolk/Nassau/Queens), C&D Suffolk Siding & Roofing ("same-day inspection"). These are Tier 3 — present in SERPs, thin trust stacks, not analyzed to full depth.

**Distinct-but-confusable:** Long Island Roofing and Siding (liroofingandsiding.com, Ronkonkoma) — separate from the leader "LI Roofing Co."

---

### 2.2 The tiering (by actual SERP + trust threat)

- **TIER 1 — must out-build these:** LI Roofing Co (content + pricing + license + reviews leader), Rapid Roofing (SERP volume + reviews + OC Platinum), County Roofing (content + commercial + pricing), Right Angle (900+ reviews + license + aggressive financing + GAF ME), Perfect Pitch (highest per-page quality + reviews). King Quality is Tier 1 on *brand/ad spend* (3-Star President's Club) but weaker on local-organic town content.
- **TIER 2 — credible, beatable on depth/UX:** Clearview (huge tenure + commercial + multi-town licenses, but dated site, no financing/pricing), Anthony's (awards + volume, but 403/thin web trust surface, vague financing), Expressway (tenure + education content), PJ Fitzpatrick (regional programmatic muscle, generic, no flat roof).
- **TIER 3 — thin, exploitable, or non-organic:** Valor (48 thin pages, 24-hr response promise, no reviews/license), Renew (thinnest, 404 financing), Bumble (franchise, 404 financing), Sunrise/Empire/LINY/Sav A Roof/New Image/Level Up/EZ/C&D (SERP-present, thin trust).

### 2.3 The soft underbelly — per Tier 1 competitor

- **LI Roofing Co:** Its town pages are Nassau-phone-fronted (516-529-2997) — a *Nassau* number on Suffolk town pages is a subtle local-signal weakness a Suffolk-native number beats. Only "312 Google reviews" vs Right Angle's 900+. No commercial depth beyond a thin "Commercial Roofing" nav item. Owner story is present but light.
- **Rapid Roofing:** **No license number displayed = live §563-17D violation** and a direct attack surface ("licensed and displayed vs. not"). Review counts are self-contradictory (300+/400+). Schema confirmed absent in baseline despite the review claims → no rich snippets. No pricing.
- **County Roofing:** **Zero town pages physically in Suffolk** and the site 403s aggressively (bot-hostile, possible over-blocking of legit crawlers). Content-heavy but the local-proximity signal is weak.
- **Right Angle:** "72 Month Interest-Free Financing" is an extraordinary claim that likely means deferred-interest, not true 0%/72mo — a compliance/accuracy soft spot (NY advertising-claim exposure). Thin unique town content relative to LI Roofing.
- **Perfect Pitch:** Only 4 town pages — **coverage gap**; most Suffolk towns have no Perfect Pitch page at all. Financing terms page 403/absent. No license number (§563-17D risk). No pricing.

### 2.4 Commercial vs. residential split

Of the ~18 residential-SERP competitors, only **County Roofing and Clearview** meaningfully own flat/low-slope/commercial; Expressway and Bumble mention it secondarily. The dedicated commercial-flat SERP (IslandWide, Maspeth, Mayancelas, longislandflatroof.com) is a *separate* competitive universe that does not contest residential terms. **Nobody bridges both well from a modern, conversion-optimized residential brand.** Flat/low-slope on a residential site is close to open territory.

---

## 3. DECISIONS THIS RESEARCH FORCES

- **DECISION: License number as a template-level element.**
  Options: (A) footer + contact only; (B) footer + in-body on every town/service page + on estimate docs.
  Recommendation: **B.** LI Roofing already does in-body town-page display and it is both legally required (§563-17D) and a live differentiator vs. Rapid/Perfect Pitch/Valor/Renew.
  Confidence: High · Reversibility: Cheap.

- **DECISION: Depth-first town pages vs. volume.**
  Options: (A) 40+ thin Valor-style pages fast; (B) 15–20 LI-Roofing-depth pages; (C) hybrid — deep hub towns + thin hamlet stubs.
  Recommendation: **B, trending C in phase 2.** The evidence (LI Roofing 7k-word pages and Perfect Pitch 2.8k-word pages rank; Valor 850w and Renew 650w lag) is unambiguous. Build fewer, deeper, then add hamlet stubs *linked to* deep town hubs.
  Confidence: High · Reversibility: Expensive (page architecture).

- **DECISION: Publish pricing?**
  Options: (A) hide (12 of 18 do); (B) ranges (County); (C) town × home-size tables (LI Roofing).
  Recommendation: **C.** It is the leader's sharpest weapon, owns cost-intent search, and only two firms do it. Match-and-exceed with per-size tables.
  Confidence: High · Reversibility: Cheap.

- **DECISION: The positioning wedge.**
  Options: (A) same-day service (contested — Sunrise/Empire/LINY); (B) same-day full *replacement* (unclaimed); (C) transparency/licensed-and-priced (contested by LI Roofing); (D) commercial+residential bridge (open).
  Recommendation: **Lead with B (same-day replacement, capacity permitting) reinforced by C, and quietly claim D.** B and D are the least-contested territories. **Caveat: same-day replacement is an operational promise that must be verified before it is marketed — see Lane G.**
  Confidence: Medium · Reversibility: Cheap (copy).

- **DECISION: Financing presentation.**
  Options: (A) link-out (all competitors); (B) publish real terms + inline soft-pull prequal widget.
  Recommendation: **B.** Nobody has an embedded prequal widget and three competitors' financing pages are broken — leading here is easy. (Vendor mechanics = Lane F.)
  Confidence: Medium · Reversibility: Cheap.

- **DECISION: Disambiguate brand from "LI Roofing Co" / "Long Island Roofing and Siding."**
  Recommendation: pick a name with no LI-Roofing collision to avoid entity/NAP confusion.
  Confidence: High · Reversibility: One-way door (brand).

---

## 4. HYPOTHESES TESTED

- **H1 (market bar is low): PARTIALLY CONFIRMED.** The *median* competitor is beatable with basics — 12 of 18 hide pricing, most hide license, four show no reviews, several have 404 financing pages, Valor's above-fold CTA is merely "Contact Us." BUT the *ceiling* is high: LI Roofing's 7k-word priced town pages, King Quality's 3-Star President's Club brand, and Right Angle's 900+ reviews are not "ordinary." The bar to *enter and beat the bottom* is low; the bar to *beat the top* is real. Refining the baseline: it wins by doing ordinary things *at extraordinary depth*.

- **H2 (depth beats volume on town pages): CONFIRMED, qualified.** Deep pages (LI Roofing, Perfect Pitch) visibly outrank thin-volume pages (Valor 48, Renew 24). Evidence: Valor's ~850w name-swap (address in Sayville, no FAQ, no local detail) vs. LI Roofing's ~6,500–7,000w with streets/schools/permits/pricing/FAQ schema. Qualifier: Rapid ranks well on *moderate* depth + reviews + links, so depth must be paired with off-site authority (Lane C) to fully cash in.

- **H5 (same-day is unclaimed): PARTIALLY REFUTED.** "Same-day service/repair/estimate" is actively claimed by Sunrise, Empire Gen, and L.I.N.Y. What is still unclaimed is **same-day full roof *replacement* as a headline position** — no analyzed competitor markets it (only the dead reference site did). The wedge survives if narrowed to "replacement"; the generic "same-day" is taken.

- **H6 (license/pricing transparency is a differentiator): CONFIRMED, but the baseline's counts are stale.** License numbers are now shown by ≥3 (LI Roofing, Right Angle, Clearview), not 1 — still a minority, still differentiating, but the gap is narrowing. Pricing transparency remains rare (2 of 18) and is the stronger of the two levers.

---

## 5. CONFIDENCE LEDGER

| Finding | Confidence | Basis | What would raise confidence |
|---|---|---|---|
| LI Roofing town pages ~6.5–7k words, priced, with FAQ schema | High | Live fetch 2026-08-01, verbatim quotes | Raw HTML word count + Search Console data |
| ≥3 competitors now display Suffolk license numbers | High | Verbatim quotes (LI Roofing, Right Angle, Clearview) | Cross-check vs Suffolk Consumer Affairs license lookup |
| Right Angle "900+ reviews", Lic #51,886-H, 72-mo financing | High | Verbatim fetch | Confirm review count on Google profile directly |
| Only 2 of 18 publish pricing | Medium-High | Fetched 8 + SERP for rest | Fetch every competitor's cost page |
| County Roofing owns commercial/flat, Keith Schmied 35yr | Medium | SERP snippets only (site 403'd) | Live fetch (blocked) or phone verify |
| No competitor has inline prequal widget / live booking | Medium | 8 fetched + baseline; not all 18 fetched | Test all 18 forms end-to-end (Lane F) |
| Same-day *service* claimed by Sunrise/Empire/LINY | Medium | SERP snippets, not deep fetch | Fetch those homepages verbatim |
| GAF/OC/CertainTeed tiers as *claimed* | Medium | On-site claims quoted | Locator verification (blocked — see §6) |
| GAF/OC/CertainTeed tiers as *verified* | **Low** | **Could not verify — locators 403 the fetcher** | Manual browser check of gaf.com locator |
| Rapid, Perfect Pitch, Valor, Renew show no license | Medium-High | Verbatim fetch of each | Full-site crawl to rule out a buried page |

---

## 6. WHAT I COULD NOT VERIFY

- **Manufacturer certification TIERS against the official locators — the core of the Verification Pass.** Every `gaf.com/en-us/roofing-contractors/...` page (the locator, the Smithtown list, and individual company pages for Anthony's, King Quality, Express Way) returned **HTTP 403 to WebFetch** — bot protection. I therefore could **not machine-confirm a single "Master Elite" claim** against GAF's own directory. I *could* confirm **listing existence** because these companies have live gaf.com listing URLs surfaced in search (a listing = GAF-certified at *some* level), but not the specific tier. Owens Corning and CertainTeed locators were not separately reachable either. **Net: all tier claims in this report are CLAIMED, not VERIFIED.** Verifying them requires a real browser session (Lane C/E tooling) — flagged as a high-value manual task.
- **County Roofing Systems and Anthony's Roofing full sites** — both 403'd the fetcher; their data is SERP-snippet only.
- **Exact meta descriptions and some `<title>` tags** — WebFetch strips `<head>` on most sites; captured where the fetcher surfaced them, marked "stripped" otherwise.
- **Full form-field / step-count inventory for all 18** — only fetched forms directly for a subset; the "no live booking / no prequal widget" claim is strong for the fetched set + baseline but not exhaustively tested across all 18 (that is Lane F's explicit job).
- **Blog post counts / cadence for most competitors** — relied on baseline numbers (Rapid 90, County 53, Perfect Pitch 15) rather than re-counting; not re-verified this session.

---

## 7. CONTRADICTIONS WITH THE BASELINE

1. **Baseline §2:** *"Six of seven show no license number… Only LI Roofing complies."* **My finding:** Beyond the baseline seven, **Right Angle ("Suffolk County Lic #51,886-H") and Clearview ("Suffolk #55260-H") both display Suffolk license numbers**, and Clearview also displays Southampton and Long Beach town/village licenses. Source: verbatim fetches 2026-08-01. License display is more common than "1 of 7" once the set is widened — still a minority, but the whitespace is narrower than stated.

2. **Baseline §8 H5:** *"Same-day / rapid replacement is an unclaimed positioning wedge."* **My finding:** "Same-day *service*" is claimed by Sunrise Roofing & Chimney, Empire Gen Roofing, and L.I.N.Y Roofing (SERP snippets). Only same-day *replacement* remains unclaimed. The hypothesis needs narrowing.

3. **Baseline §1 table:** lists LI Roofing at *"19 (deep, 4.5–6.5k words)"*. **My finding:** the Smithtown page now measures **~6,500–7,000 words with per-size pricing tables** — depth has *increased* since Session 1; the leader is actively widening its moat. Treat the target as a moving one.

4. **Baseline §1 phone framing:** the reference to "LI Roofing" should not be conflated with **"Long Island Roofing and Siding" (liroofingandsiding.com, Ronkonkoma)**, a distinct company that surfaces in the same SERPs. The leader "LI Roofing Co" fronts a **Nassau 516-529-2997** number even on Suffolk town pages — a minor local-signal contradiction to its "Suffolk specialist" positioning.

---

## 8. SOURCES

Competitor sites (primary — live verbatim fetch 2026-08-01):
- [LI Roofing Co — home](https://liroofingco.com/) · [Smithtown town page](https://liroofingco.com/areas/suffolk-county/smithtown) · [Roof repair service page](https://liroofingco.com/services/roof-repair)
- [Rapid Roofing / Rapid Restore — home](https://www.rapidrestoreny.com/) · [Smithtown page](https://www.rapidrestoreny.com/roofing-services/residential/suffolk/smithtown/) · [Financing](https://www.rapidrestoreny.com/financing/)
- [Perfect Pitch — home](https://perfectpitchroofing.com/) · [Smithtown page](https://perfectpitchroofing.com/suffolk-county-roofing/smithtown/)
- [Right Angle Roofing & Siding — home](https://www.rightangleroofingandsiding.com/)
- [Clearview Roofing — home](https://longislandroofs.com/)
- [Valor Roofing — home](https://www.valorli.com/) · [Smithtown page](https://www.valorli.com/smithtown-ny-roofer/)
- [Renew Roofing Solutions — home](https://renewroofs.com/)

Competitor sites (secondary — SERP snippet only; site 403'd or not fetched):
- [County Roofing Systems](https://countyroofingsystems.com/) — *fetcher 403* · [Anthony's Roofing](https://anthonysroofing.com/) — *fetcher 403* · [King Quality](https://kingquality.com/about-us/) · [Expressway Roofing & Chimney](https://expresswayroofingandchimney.com/) · [PJ Fitzpatrick](https://www.pjfitz.com/areas/roofing-contractors-in-suffolk-county/) · [Sunrise Roofing & Chimney](https://sunriseroofingandchimney.com/) · [Bumble Roofing Suffolk](https://bumbleroofing.com/suffolk-county/smithtown)

Manufacturer locators (verification attempt — **all returned HTTP 403 to fetcher**, so used only to confirm listing existence via URL, not tier):
- [GAF contractor locator — Smithtown](https://www.gaf.com/en-us/roofing-contractors/residential/usa/ny/smithtown) · [GAF listing — Anthony's](https://www.gaf.com/en-us/roofing-contractors/residential/usa/ny/bohemia/anthonys-roofing-1003898) · [GAF listing — King Quality](https://www.gaf.com/en-us/roofing-contractors/residential/usa/ny/bohemia/king-quality-construction-inc-1100695)

Directories / aggregators (SEO/marketing context, not neutral data):
- [Yelp — Roofing Suffolk County](https://www.yelp.com/search?cflt=roofing&find_loc=Suffolk+County,+NY) · [BBB — Roofing near New Suffolk](https://www.bbb.org/us/ny/new-suffolk/category/roofing-contractors) · [Best of Long Island — Best Roofing Company](https://www.bestoflongisland.com/best-roofing-company-long-island/) · [Best Pick Reports — PJ Fitzpatrick](https://www.bestpickreports.com/roofers/long-island/pj-fitzpatrick-of-long-island)

SEO-industry opinion (marketing content, cited for cert-requirement context only, not as data):
- [Econo Roofing — CertainTeed SELECT ShingleMaster](https://econo-roofing.com/about/certainteed-select-shinglemaster/) · [Arrington Roofing — SELECT ShingleMaster](https://arringtonroofing.com/certifications/certainteed-select-shinglemaster)
