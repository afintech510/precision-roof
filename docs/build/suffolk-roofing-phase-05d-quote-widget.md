# Phase 05d: Quote Widget
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00, Phase 01, Phase 02
**Implements:** F-014
**Recommended:** `claude --max-turns 50`

---

## 1. Context
You are executing **Phase 05d: Quote Widget** — the non-binding lead-capture estimate widget (promoted to Launch by SPEC-016), `/api/quote`, and the `/api/webhooks/sanity-publish` pricing-blob materialization it reads. **Scope is strictly this phase.**

**Tech Stack (spec §1.2):** Astro + Cloudflare Workers + D1/KV + Sanity webhook. **Working Directory:** project root. **Spec File:** read §3.2 (quote + sanity-publish), §2.4, §4 first.

### What Already Exists
Phase 01: `townPricing` with `provisional` + staleness. Phase 05b: the East-End ZIP→town gate table (import it — do not rebuild). Deps installed — **no `npm install`.**

### What You're Building
A transparent estimate widget that reads a materialized pricing blob, never quotes a price for a gated town, and never fails closed into invisibility.

---

## 2. Objective & Deliverables
### Objective
After this phase, the widget produces a clearly-labeled non-binding estimate range from town + service + size using CMS pricing, gated towns get the no-price informational payload, and the blob rematerializes on Sanity publish.
### Deliverables
1. `QuoteWidget` island with network-error state — spec §4 `[C2-017]`.
2. `POST /api/quote` reading the materialized blob — spec §3.2.
3. `POST /api/webhooks/sanity-publish` rematerializing the pricing blob — spec §3.2 `[C2-023]`.

---

## 3. Implementation Instructions
### Task 1: sanity-publish blob materialization
**Spec:** §3.2 `[C2-023]`.
> **CAUTION — idempotency + staleness.** Verify + **dedupe** the webhook, rematerialize the pricing blob, store `blob_built_at`, and alarm on blob-age/rev divergence. This is a webhook — record it in `webhook_events` and do not double-process a redelivery.

### Task 2: `/api/quote`
**Spec:** §3.2.
> **CAUTION — a quoted price is advertising (§771-B / East-End).** East-End gated towns return the **no-price informational payload**, never a numeric range. Distinguish out-of-area vs malformed so the client can render a warm Suffolk hand-off + phone CTA for a near-market ZIP **without** the server confirming which combos are priced. Reads the materialized blob; if Turnstile is unavailable, still return a rate-limited estimate or the book path — a transparency feature must never fail closed into invisibility. Import the East-End gate table from Phase 05b.

### Task 3: QuoteWidget island
**Spec:** §4 `[C2-017]`. Roof size × material × town price-range from CMS data (not a hardcoded number); a visible **"non-binding estimate"** disclosure; a network-error state (inline "call [tel:]" + retry + fetch timeout, `aria-live`). Provisional combos → heavy-disclaimer range.

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] Widget produces an estimate range from town + service + size, pulled from `townPricing` (not hardcoded); "non-binding estimate" disclosure visible
- [ ] **East-End gated town/ZIP → `/api/quote` returns the no-price informational payload, never a numeric range**
- [ ] Unknown/out-of-area ZIP is distinguished from malformed; near-market ZIP renders warm hand-off + phone CTA without the server acting as a priced-combo oracle
- [ ] Turnstile unavailable → widget still returns a rate-limited estimate or book path (never blank/failed-closed)
- [ ] `sanity-publish` redelivery → blob rematerialized once (idempotent), `blob_built_at` updated
- [ ] Provisional combo → heavy-disclaimer range, not a bare number

---

## 5. Constraints
### Hard
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- A price for a gated town is a hard failure. Import (do not rebuild) the 05b gate table.
- No hardcoded estimate numbers; the blob is the source.
- Do NOT build the dashboard (05e) or review engine (09).
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results (incl. gated-town no-price evidence); Ambiguities; Blocked Items; Decisions (blob store: KV vs D1; cache-purge trigger); **Warnings for Next Phase** (blob-staleness alarm Phase 08 observability wires; `connect-src` for `/api/quote`). Maintain `PHASE-05d-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 50`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-05d-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
- **Note:** HEAVY phase — a second independent reviewer may judge this diff; disagreement escalates rather than resolving as an ordinary fix.
