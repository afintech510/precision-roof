# Phase 05c: CallRail DNI + Financing — status

**Task 1 (DNI + canonical NAP):** done (`src/components/CallRailDni.astro`, `4fb4a7f`).
**Task 2 (missed-call text-back + number ownership):** done. Ownership resolved
as CallRail-webhook-driven (`src/pages/api/webhooks/callrail.ts`) rather than
ANI passthrough — reuses the 05b DO+Queue send path, no second SMS pipeline
(`c6baef6`).
**Task 3 (financing facade):** facade shell built this run
(`src/components/FinancingFacade.astro`, wired into `src/pages/financing.astro`).

## What's done vs. blocked on Task 3

Built, code-complete, gate-green:
- `FinancingFacade.astro` — same degrade-gracefully shape as `CalcomFacade`:
  interaction-loaded, immediate loading affordance, phone CTA always visible,
  honest "coming soon" card when `site.financingLink` is unset (it is, today —
  no `sample.ts` value set, matching `calcomLink`'s precedent).
- `SiteSettings.financingLink?: string` added to `src/lib/types.ts`.

Still blocked, not attempted this run — genuine vendor-choice ambiguity:
- **Which lender.** Spec §4 names Acorn/Wisetack as alternatives without
  picking one; that's Adam's call, not inferred here.
- **Embed contract.** Neither vendor's exact merchant integration (hosted
  prequal URL vs. a JS SDK like Cal.com's embed.js) is confirmed. The facade
  treats `financingLink` as a plain URL loaded in an iframe as the safer,
  vendor-agnostic default — if the chosen vendor requires a script widget
  instead, the loader in `FinancingFacade.astro` needs revisiting once known.
- **CSP `frame-src`.** Deliberately left untouched (`src/lib/csp.ts` already
  documents why: "the financing vendor is not yet chosen ... so it isn't
  allow-listed until that decision lands"). No iframe ever renders while
  `financingLink` is unset, so this isn't a live gap yet — but it blocks
  Phase 08 Task 1 (CSP enforce) until a vendor + domain are known.

## Warning for Phase 08

Task 1 (CSP enforce) cannot proceed honestly until this phase's vendor
decision lands and `frame-src`/`connect-src` are updated for the real
lender domain — enforcing now would either break the eventual financing
embed or ship a still-report-only policy under a different name.
