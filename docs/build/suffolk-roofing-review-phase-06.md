# Meta-Agent Review: Phase 06 — SEO-Technical

You are an adversarial code reviewer. Verify Phase 06 independently.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §2.2, §4.4 + SOW §5, §8
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-06-seo-technical.md`
3. Builder report + JSON-LD emitters, sitemaps, redirects, anchor-check on disk

## What Phase 06 Should Have Built
**Objective:** JSON-LD by page type + split sitemaps + 301 discipline + anchor-ratio CI. **Spec:** 2.2, 4.4. **Implements:** F-006, F-007, F-017, F-015, F-018.

## Review Checklist
- [ ] Each page type emits valid JSON-LD (`RoofingContractor/Service/FAQPage/BreadcrumbList/Review`); FAQPage passes Rich-Results-style validation
- [ ] **Review/AggregateRating JSON-LD emitted only from a real auditable feed and suppressed when `lastSyncedAt` is stale**; recomputed only from present reviews
- [ ] Split XML sitemaps by content type; all canonical URLs self-referencing
- [ ] Redirects are single-hop 301s (no chains/loops)
- [ ] **Anchor-ratio CI check fails >30% exact-match, passes otherwise**; no page >2 clicks from home
- [ ] Standing gate exits 0; `npm run build` exits 0; no page content changed; no `npm install`/`git push`

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — valid per-type JSON-LD (review schema gated on freshness), sitemaps/redirects correct, anchor check enforces ≤30%.
- **FIX** — invalid/placeholder review schema, sitemap/redirect errors, or a non-enforcing anchor check; list precise `issues_found`.
- **ESCALATE** — a structured-data/scope contradiction needing a human.
