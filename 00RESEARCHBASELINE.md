# RESEARCH BASELINE — Suffolk County Roofing Contractor Website
**Status:** Verified findings from Session 1 (competitive audit, July 29 2026)
**Purpose:** Shared context document. Every downstream research agent receives this verbatim.
**Do not treat anything here as final.** It is a starting floor, not a ceiling. Your job is to go deeper, and to correct anything here that is wrong.

---

## 0. Project framing

Adam (adam@easternbuilding.supply) is developing a **new residential roofing contractor website targeting Suffolk County, Long Island, NY**. The original entry point was a possible lead-gen partnership with the owner of `premiumroofsolutions.com`; that site turned out to be an unfinished WordPress theme demo with essentially zero digital assets, which means any engagement is effectively a **greenfield build**, not a remediation.

**Two unresolved branches the synthesis session must resolve — flag evidence for both, do not assume:**

| Branch | Description | Implications |
|---|---|---|
| **A — Partner build** | New site built for Premium Roofing Solutions (existing operator, existing phone, existing crew, claimed 1377+ projects) | Inherits an operator, a license question, a Nassau-registered address, and near-zero brand equity. Faster to revenue. |
| **B — New brand** | A net-new roofing brand/entity for Suffolk County | Full control of NAP, GBP, domain, brand. No operator attached — needs one. Slower to revenue, cleaner asset. |

A third possibility worth evidence-gathering: Adam's business is **Eastern Building Supply**. A building-supply operator entering roofing lead-gen or roofing services has potential structural advantages (material cost basis, contractor network, supplier relationships, existing local B2B footprint). **No agent should assume this is in scope, but any agent who encounters a relevant angle should flag it.**

**Downstream pipeline:** parallel research agents → Opus synthesis session → `spec-pipeline` skill (SOW → Architecture Spec → adversarial review → LOCKED spec) → `build-prompter` skill (BUILDPLAN + operator prompts).

---

## 1. The competitive set (verified July 29 2026)

Seven competitors analyzed at homepage + 2–6 internal pages each, with sitemap inspection.

| Company | Domain | Town pages | License # shown | Mfr. certification | Reviews shown | Financing terms published | Pricing published | Blog posts |
|---|---|---|---|---|---|---|---|---|
| **LI Roofing Co.** | liroofingco.com | 19 (deep, 4.5–6.5k words) | **Yes** — Suffolk #53241-H, Nassau #H2815200000 | GAF Master Elite + CertainTeed SELECT | 4.9★ / 312+ | 0%/18mo; 5.99–9.99% APR; example payments | **Yes** — $9.5k–16.5k replacement | Blog + guides hub |
| **Rapid Roofing** (Rapid Restore) | rapidrestoreny.com | 34 (county→town→hamlet nesting) | No | Owens Corning Platinum | "300+" / "400+" (inconsistent) | Service Finance Co.; 24mo deferred; 9.99%/5yr | Cost blog only | 90 |
| **County Roofing Systems** | countyroofingsystems.com | ~9 (**none in Suffolk**) | No | Triple: GAF + OC + CertainTeed | 150+ five-star | 0% up to 5yr; "from $149/mo" | **Yes** — $7.5k–15k FAQ | 53 |
| **Valor Roofing** | valorli.com | 48 (thin, template) | No | GAF (tier unstated) | None shown | Acorn Finance, no on-site terms | No | Exists |
| **Renew Roofing Solutions** | renewroofs.com | 24 (thinnest, ~650w) | No | Owens Corning Preferred | None shown | "0%" claimed, page 404s | No | Minimal |
| **Bumble Roofing** (franchise) | bumbleroofing.com/suffolk-county/ | 10 | No | GAF Master Elite + OC Preferred | None shown | Vague, page 404s | No | Active hub |
| **Perfect Pitch Roofing** | perfectpitchroofing.com | 4 (**highest quality per page**) | No | GAF Master Elite + Installation Excellence Award | 4.9★ / 140 | $0 down, page 403s | Cost blog only | 15 |

### Additional names surfaced in SERPs but NOT yet analyzed — high priority for the next pass
Right Angle Roofing & Siding (rightangleroofingandsiding.com / rightanglebuildersinc.com), Expressway Roofing & Chimney, PJ Fitzpatrick (multi-state), Advanced Roofer, Wagner Construction, Reliable Construction Guys / C&D, Ace American Roofing, King Quality, Clearview Roofing, Willmott Brothers (roofrepairhuntington.com), Anthony's Roofing, A1 Roofing NY, Top Cat Roofing (suffolkroofingandsiding.com), Brothers Aluminum, Babe Roof, MK Best Roofing, Rich's Construction, All Weather Roofing, GNP Roofing, Ready Roof LI, All American Home Improvement, HK Builders, DS Roofing, Roof Maxx.

---

## 2. Verified competitive gaps — the whitespace

These were consistent across **all seven** sites and are the highest-value findings from Session 1. **Verify each independently — do not inherit them on faith.**

1. **Zero of seven offer real online booking.** Every "Get an Estimate" flow terminates in a phone-callback lead form.
2. **Zero of seven offer live chat or text-to-quote.**
3. **"Instant quote" is universally oversold.** All advertise it; only Renew's satellite/ZIP tool is genuinely automated, and it is shallow.
4. **Six of seven show no license number** — a codified legal requirement in both counties (see §3). Only LI Roofing complies.
5. **Four of seven display no review count or star rating anywhere.**
6. **Three of seven have financing pages that 404 or 403** (Renew, Bumble, Perfect Pitch) — broken bottom-of-funnel pages.
7. **Only two of seven publish pricing** (LI Roofing, County Roofing) — so cost-intent search is owned by two companies.
8. **Schema is missing or unverified on most.** Confirmed absent on Rapid Roofing despite 300–400 review claims — none of it produces rich snippets.
9. **The page-count vs. depth split:** Valor (48) and Renew (24) run thin template doorway pages; LI Roofing (19) and Perfect Pitch (4) run genuinely local content. Perfect Pitch's Smithtown page is the single best local page found — it names Nesconset, Kings Park, Nissequogue, 1960s Capes, Route 347, Smithtown CSD, and town permitting.

---

## 3. Legal / compliance — verified against primary sources

**Suffolk County Code §563-17D:** *"All advertising for home improvement contracting shall contain the number of the home improvement license issued pursuant to this chapter."*

**Nassau County, Rules & Regulations Relating to the Home Improvement Business, §2(a):** *"All display advertising and promotional literature shall contain the licensee's license number as printed on the license."* §2(b) additionally requires the full company name exactly as licensed.

Other confirmed requirements:
- Suffolk license issued by the **Suffolk County Office of Consumer Affairs** (Dept. of Labor, Licensing & Consumer Affairs), Suffolk County Code **Chapter 563, Article II**. Roofing is not a separate category — it falls under general home improvement contracting.
- §563-17A: established place of business in NY State. §563-17B: written exam. §563-17C: proof of liability, property-damage and workers' comp insurance. §563-17J: current on child-support obligations.
- §563-15.1A: license number, business name, address, phone, and servicing employee's name required on every contract and paid receipt.
- Nassau requires a **separate** Home Improvement Business License via the Nassau County DCA.
- **County license does not automatically satisfy town/village licensing.** Case law is mixed — an East Hampton town license was found sufficient in one case; a Southampton town license was found insufficient without county licensing in a more recent one.

**Implication for the build:** the license number must be a first-class, template-level element (footer on every page, contact page, estimate documents), not an afterthought. This is also a **differentiation asset** — only one of seven competitors does it.

---

## 4. Market economics — sourced benchmarks

| Input | Value | Source basis |
|---|---|---|
| Asphalt roof replacement, avg LI home | **$9,000–$15,000** (~$11,500 typical) | Convergent: County Roofing, Perfect Pitch, All American, Expressway 2025–26 cost guides |
| Larger homes / architectural shingles | $17,000–$25,000+ | Same, upper band |
| Three-tab asphalt, per sq ft | $2.50–$3.50 | Same |
| All-materials range, per sq ft | $4–$11 | Same |
| Per square (100 sq ft), asphalt | $400–$700 labor + materials; tear-off adds $1–2/sq ft | Same |
| Close rate, solid sales process | 30–40% (top performers ~50%) | ProLine Roofing CRM |
| Close rate, shared platform leads | ~20% — leads resold to as many as 16 contractors | Industry reporting |
| Purchased lead cost | Angi $15–85+, HomeAdvisor $15–75+, Modernize $20–100+, Thumbtack $10–50+, Google LSA $20–80+ | Aged Lead Store 2026 guide |
| Effective cost per **booked job** via paid leads | **$500–$1,400+** | Ghostrep booked-job math |
| Peak demand | Jul–Aug, 6–8 week backlogs | LI contractor seasonality reporting |
| Best value/availability window | Sep–Oct (2–4 wk lead times, ~62% clear days in Sept) | Same |
| Emergency demand driver | **Nor'easters, Oct–Apr** (dominant); ice dams; hurricane season Jun–Nov secondary | LI storm reporting |

---

## 5. SERP snapshot — five queries run July 2026

| Query | Who ranked (in order observed) |
|---|---|
| roofer suffolk county ny | Rapid Roofing, Right Angle, Advanced Roofer, Wagner Construction, Reliable Construction Guys, Ace American, Valor |
| roof repair huntington ny | PJ Fitzpatrick, Angi, Yelp, GAF locator, BBB, Roof Maxx, King Quality, LI Roofing & Siding, Willmott Brothers, Clearview |
| roof replacement smithtown ny | PJ Fitzpatrick, GAF directory, HomeAdvisor, Bumble, Expressway, Perfect Pitch, Valor |
| emergency roof repair long island | LI Roofing & Repair Service (Facebook), GNP, Rapid Roofing, Ready Roof LI, LI Roofing, G&V, others |
| storm damage roof repair suffolk county | Expressway, All Weather Roofing, Suffolk Roofing, Rich's Construction |

**Repeat winners across multiple queries:** Rapid Roofing, Valor Roofing, Expressway Roofing & Chimney, PJ Fitzpatrick, Perfect Pitch Roofing.

**Two structural observations:**
- **Directory pages occupy significant SERP real estate** — GAF contractor locator, Angi, Yelp, HomeAdvisor, BBB all rank as pages in their own right. Presence on those platforms is a ranking channel, not just a citation.
- **Emergency and storm-damage SERPs are the weakest and most fragmented** of the five — one top result was a Facebook page. This is the softest territory found.

---

## 6. What could NOT be verified in Session 1 — open items

| Item | Why it failed | Priority to resolve |
|---|---|---|
| Core Web Vitals / PageSpeed for any site | PageSpeed Insights API rate-limited (429) | **High** — needed for platform decision |
| Google review counts and star ratings, any company | Google's review UI is not machine-readable; Yelp blocks automated access via robots.txt | High — all cited ratings are self-reported or aggregator-sourced |
| Schema presence on most competitors | JSON-LD is stripped by HTML→markdown conversion | High — confirmed absent only on Premium and Rapid Roofing |
| Actual keyword volumes and difficulty | No keyword tool access in Session 1 | **Critical** — entire content plan depends on it |
| Backlink profiles | Not attempted | **Critical** |
| Map pack composition per town | Not attempted | **Critical** |
| Whether Premium Roofing Solutions holds a valid license | Only that no number is published | High (Branch A only) |
| Town-by-town permit requirements and fees | Only Huntington ($400–600, via LI Roofing's page) | Medium — needed for town page content |

---

## 7. Confirmed detail on the reference site (`premiumroofsolutions.com`)

Retained because it defines Branch A and because several findings are reusable competitive intelligence. All verified by live fetch July 29 2026.

- Running an unedited WordPress theme, **"Caymana"** (ThemeJunction). `og:site_name` = "Caymana Roofing" across the site. The homepage "Inquire Here!" CTA links to `https://caymana.co/roofing/contact/` — the vendor's demo.
- Lorem Ipsum on About, Services, and all six service sub-pages. Six blog posts, all dated Aug 23 2023, all Lorem Ipsum, one published three times at duplicate URLs.
- `/teams/george-clooney/` exists — placeholder staff page, company "Romada Co.", fabricated metrics.
- `/gallery/` — 44 images, **all with empty `src` attributes**. Nothing renders.
- Third phone number `+51-(0)-888-455-369` (Peru country code) in a theme widget on four service pages.
- NAP: phone 631-849-0044 and unlabeled second number 631-849-0040; email `services@premiumroofingsolutions.com` (**different domain than the website**, `premiumroofsolutions.com`); address **825 East Gate Blvd, Garden City, NY 11530** — a Nassau County shared office building that also returns a real-estate brokerage, a wellness business and a mortgage branch in search.
- Zero structured data. Six competing H1s on the homepage. One 46-character meta description duplicated across all 17 pages: *"Premium roofing services with quality you can trust."*
- Footer: *"Copyright © Studio One Marketing"* — an agency credit, not the client's.
- Service taxonomy is theme-invented: "Roof Cornering," "Roof Layer Fixing," "Roof Frame Design," "Roof Siding Corner" — categories no homeowner searches.
- Ten self-hosted testimonials, no third-party corroboration. Seven are Nassau towns, one is Long Island City (Queens), only three are Suffolk. "Bayshore" is misspelled (correct: Bay Shore). Links to `reviewshark.com` — a reputation tool, not an independent platform.
- No BBB, Yelp, Angi or HomeAdvisor profile found. Did not appear in any of the five SERPs in §5.
- **Genuinely good:** `/roofing-replacement-services/` and `/same-day-roofing-replacement-services/` contain real, unique, well-written copy. And **same-day roof replacement** is a real differentiated offer that none of the seven competitors market.

---

## 8. Working strategic hypotheses (to be tested, not assumed)

These emerged from Session 1. Each agent should treat the ones in their lane as **hypotheses to falsify**, and report evidence either way.

- **H1.** The market bar is low. The leader (LI Roofing Co.) wins by doing ordinary things competently — license numbers, reviews, real town pages, published prices — not by doing anything sophisticated.
- **H2.** Depth beats volume on town pages. Google's helpful-content direction disfavors Valor's 48 thin pages; 15–20 genuinely local pages should outperform them.
- **H3.** A real booking/quoting layer is category-leading in this market because nobody has one.
- **H4.** Emergency + storm damage (nor'easter season, Oct–Apr) is the softest and highest-margin SERP territory.
- **H5.** Same-day / rapid replacement is an unclaimed positioning wedge.
- **H6.** Publishing license numbers and real pricing is a trust differentiator, not just compliance.
- **H7.** Directory presence (GAF locator, Angi, BBB, Yelp) is itself a ranking channel worth budgeting for.

---

## 9. Source list from Session 1

Primary/legal: [Suffolk County Home Improvement License Law (PDF)](https://suffolkcountyny.gov/Portals/0/formsdocs/consumeraffairs/CA-L01a_Home_Improvement_License_Law.pdf) · [Suffolk County Code Art. II (eCode360)](https://ecode360.com/14947425) · [Suffolk Licensing & Consumer Affairs](https://suffolkcountyny.gov/Departments/Labor/Licensing-and-Consumer-Affairs) · [Nassau Home Improvement Regulations (PDF)](https://nassaucountyny.gov/DocumentCenter/View/11174/Home-Improvement---Regulations-0524?bidId=) · [Nassau — Who Must Be Licensed](https://www.nassaucountyny.gov/3465/Who-Must-Be-Licensed) · [NY Contractor Licensing — Caravella](https://www.liconstructionlaw.com/construction/licensing-requirements-for-home-improvement-contractors-subcontractors-in-new-york-state/)

Competitors: [liroofingco.com](https://liroofingco.com/) · [rapidrestoreny.com](https://www.rapidrestoreny.com/) · [countyroofingsystems.com](https://countyroofingsystems.com/) · [perfectpitchroofing.com](https://perfectpitchroofing.com/) · [valorli.com](https://www.valorli.com/) · [bumbleroofing.com/suffolk-county/](https://bumbleroofing.com/suffolk-county/) · [renewroofs.com](https://www.renewroofs.com/) · [premiumroofsolutions.com](https://premiumroofsolutions.com/)

Market: [County Roofing cost guide](https://countyroofingsystems.com/blog/roof-replacement-cost/) · [Perfect Pitch cost guide](https://perfectpitchroofing.com/roof-replacement-cost-long-island/) · [All American pricing guide](https://www.allamerican-hi.com/blog/how-much-does-a-new-roof-cost-in-long-island-pricing-guide-for-2025/) · [Expressway cost per square](https://expresswayroofingandchimney.com/average-roofing-cost-per-square-on-long-island/) · [Ghostrep lead economics](https://www.ghostrep.ai/blog/roofing-lead-cost-benchmarks) · [Aged Lead Store 2026 guide](https://agedleadstore.com/roofing-leads-cost-guide/) · [ProLine close rates](https://useproline.com/what-is-a-good-closing-rate-in-roofing-sales/) · [Best month to replace a roof on LI](https://www.rapidrestoreny.com/blog/when-is-the-best-month-to-replace-a-roof-on-long-island)
