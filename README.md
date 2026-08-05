# Premium Roofing Solutions — website

Suffolk County residential roofing marketing site + lead-conversion stack.
Astro (static-first) + Sanity (headless CMS, not yet seeded) + Cloudflare
(Workers/Pages, D1, Durable Objects, Queues, KV). Spec: `suffolk-roofing-spec-v3.md`
(🔒 LOCKED v3). Build plan: `BUILDPLAN.md`.

This doc is the F-021 handoff checklist (spec §8, SOW §8) — everything a new
developer needs to run, test, and deploy the site without archaeology.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ Cloudflare Worker (@astrojs/cloudflare adapter, Workers static-assets│
│ model — one artifact, one deploy)                                    │
│                                                                        │
│  Static HTML (output: 'static', prerendered at build time)           │
│    /, /about, /contact, /services/*, /areas/*, /reviews, /financing, │
│    /accessibility, /estimate — served straight from dist/client      │
│                                                                        │
│  On-demand SSR routes (export const prerender = false)               │
│    /api/quote            → src/server/quote.ts                      │
│    /api/lead              → src/server/lead-intake.ts                │
│    /api/webhooks/calcom   → src/server/calcom.ts                    │
│    /api/webhooks/twilio   → src/server/twilio.ts                    │
│    /api/webhooks/callrail → src/server/callrail.ts                  │
│    /api/webhooks/postmark → src/server/postmark-webhook.ts          │
│    /api/webhooks/sanity-publish → src/server/sanity-publish.ts       │
│    /api/webhooks/sanity-job → src/server/sanity-job.ts              │
│    /api/operator/*        → src/server/dashboard.ts                 │
│    /unsubscribe           → src/server/unsubscribe.ts               │
└─────────────────────────────────────────────────────────────────────┘
        │                    │                  │
        ▼                    ▼                  ▼
   D1 (OP_STORE)        KV (PRICING_KV)    Queue (SMS_QUEUE) + Durable
   leads, consent,      materialized       Object (SMS_AUTHORITY) — async
   bookings,            pricing blob       SMS dispatch, live-bound via the
   suppression, etc.                       custom Worker entry (src/worker/
                                            entry.ts)
```

**Design pattern, everywhere:** pure core (`src/server/*.ts`, zero vendor
keys, unit-tested with `node:sqlite` loading all `migrations/*.sql`) + thin
route adapter (`src/pages/api/**.ts`, verifies signature/auth, builds a
D1-backed `repos`, calls the core, translates the result to an HTTP
response). Route handlers **must** read bindings via
`import { env } from 'cloudflare:workers'` — `Astro.locals.runtime.env` was
removed in Astro v6 and throws at runtime.

Content today comes from `src/lib/sample.ts` via the `src/lib/content.ts`
facade. Sanity (project `af66eilq`) is linked but **not yet seeded** — when
it is, only `content.ts`'s implementations change (same return shapes);
templates don't.

## Local development

```
npm run dev          # astro dev, sample content, no Cloudflare bindings
npm run typecheck     # astro check && tsc --noEmit
npm run lint          # eslint .
npm run test:unit     # vitest run — pure cores, zero vendor keys
npm run test:e2e      # playwright test — a11y (axe, WCAG AA) + CSP suites
npm run build         # astro build — also runs the perf-budget/CSP/
                       # seo-technical build-time gates (see below);
                       # spins up a local Miniflare instance to prerender
```

**Never `npm install`** — dependencies are managed manually; a stale
`package-lock.json` diff from an accidental install is a common footgun.

### Standing gate (run before every commit)

```
npm run typecheck && npm run lint && npx vitest run && npm run build && npx playwright test
```

`npm run build` is itself a gate, not just a compile step — three Astro
integrations run at `astro:build:done` and **throw (failing the build)** on
regression:

- `src/integrations/perf-budget.ts` — ≤4 third-party scripts per page, every
  `<img>` has explicit width/height.
- `src/integrations/csp.ts` — writes the report-only CSP + baseline security
  headers to `dist/client/_headers`.
- `src/integrations/seo-technical.ts` — split sitemaps, ≤30% exact-match
  anchor-text ratio, "no page >2 clicks from home" link-graph check, 301
  redirect discipline.

## Deploying

```
npm run build
npx wrangler deploy
```

Deploys the Worker artifact (`dist/server` + `dist/client` assets) per
`wrangler.toml`. **This is a production mutation** — get explicit sign-off
before running it; see "Current live topology" below for what's actually
live right now.

**Rollback:** `npx wrangler rollback` (Cloudflare keeps prior Worker
versions), or `git revert` + redeploy. Static content has no migration to
undo; D1 migrations are additive-first (see `migrations/rollback/`).

### Secrets

Set once per environment via `wrangler secret put <NAME>` (never commit
values; source of truth is Doppler). Full list + what gates on each one is
in `.env.example`. Every route that depends on a secret **degrades instead
of 500ing** when it's absent — Turnstile skips (never fails a quote
closed), webhooks return 503, the operator dashboard 403s without
Cloudflare Access. That's intentional, not a bug: a missing secret should
never be indistinguishable from a broken build.

**Rotation:** `wrangler secret put <NAME>` again with the new value —
takes effect on the next request, no redeploy needed. Rotate
`TURNSTILE_SECRET`/`TWILIO_AUTH_TOKEN`/webhook secrets independently; they
don't share a namespace or a rotation order dependency.

## Current live topology

*(update this section whenever the deploy target changes — it drifts fast in
this project; don't trust it blindly, verify with `wrangler deployments
list` / a live curl before relying on it)*

As of the last deploy verified in this repo's history: the Worker is live at
`https://precision-roof.parrstudio.workers.dev` with `/api/*` reachable.
`roof.benchworksai.com` / `precision-roof.pages.dev` (a separate, static-only
Cloudflare Pages project) also exist — check current DNS/custom-domain
config before assuming which one is canonical.

## Known gaps (not bugs — documented, deliberate deferrals)

1. ~~**DO/Queue consumer not wired.**~~ **Resolved (Phase 05b close-out).**
   `SmsAuthorityDO` and the Queue *consumer* (async SMS dispatch processing)
   are live-bound via a custom Worker entry (`src/worker/entry.ts`, wired as
   `main` in `wrangler.toml`) that composes the adapter's own `handle`
   function (imported from its `@astrojs/cloudflare/handler` subpath)
   alongside the DO class and `queue()`/`scheduled()` handlers — option (i)
   from `docs/build/PROPOSAL-api-wiring.md`'s addendum. A postbuild check
   (`scripts/build-worker-entry.mjs`, runs automatically after `npm run
   build`) asserts the compiled `dist/server/entry.mjs` still exports
   `fetch`/`SmsAuthorityDO`/`queue`/`scheduled`, so a future
   `@astrojs/cloudflare` upgrade that quietly changes this shape fails the
   build instead of silently shipping a broken Worker. SMS sending itself
   still needs `TWILIO_*` secrets provisioned (see `.env.example`) — never
   fails closed without them; `/api/lead` still captures every lead
   correctly either way.
2. **`RATE_LIMIT_KV` not provisioned.** `/api/quote` and `/api/lead` rate
   limiting (`src/server/rate-limit.ts`) is built and route-wired but
   inert — `wrangler kv namespace create RATE_LIMIT_KV` hasn't been run.
   Instructions are commented in `wrangler.toml`.
3. **Migration `0002` (resend_token) not applied to remote D1.** Local-only;
   `npx wrangler d1 migrations apply precision-roof-op --remote` is pending.
4. **CSP is report-only**, not enforced — per spec, intentionally launched
   this way to validate against real traffic before flipping
   `Content-Security-Policy-Report-Only` → `Content-Security-Policy` in
   `astro.config.ts`'s `csp({ reportOnly: false })`.
5. **No backup/restore drill yet** (spec §1.3 Phase 08 Task 4) — needs an R2
   bucket (not yet in `wrangler.toml`) and a preview-env restore exercise;
   out of scope for a change that can land without provisioning new prod
   infra.
6. **Phase 05c partially done.** Missed-call text-back
   (`/api/webhooks/callrail` → `src/server/callrail.ts`) is built, tested,
   and reuses the 05b send path. CallRail DNI (`src/components/CallRailDni.astro`,
   wired into every page via `BaseLayout`) is also built — it renders
   CallRail's swap.js loader when `siteSettings.callrailCompanyId` /
   `callrailScriptId` are set, and renders nothing (canonical numbers only)
   until then, since no live CallRail account exists yet. Still open: the
   Acorn/Wisetack financing facade on `/financing/` (needs a
   financing-vendor choice + a TCPA consent-basis decision) — requires
   Adam's input, not more code.
7. **Sanity not seeded** — every page currently renders from
   `src/lib/sample.ts`. Swapping `src/lib/content.ts` to real
   `@sanity/client` queries is a drop-in change (same return shapes) once
   the dataset has real content.
8. **`POSTMARK_WEBHOOK_SECRET` not provisioned.** `/api/webhooks/postmark`
   (Phase 09 Task 3 — bounce/complaint → `(email, address)` suppression) is
   built and route-tested but inert until the webhook URL + Basic Auth
   credential are configured in the Postmark UI and the secret is set via
   `wrangler secret put`. Same "degrades to 503, never fails closed" shape
   as every other unprovisioned secret here.
9. **`calcomLink` not set.** `/contact/`'s Cal.com booking facade
   (`src/components/CalcomFacade.astro` — spec §3.2/§4/§7.3, Phase 05a Task 1:
   interaction-loaded embed, immediate loading affordance, always-visible
   phone CTA, GA4 `client_id` forwarding, timeout fallback) is built and
   wired but renders its honest "coming soon, call us" state until
   `siteSettings.calcomLink` has a real value — no Cal.com account exists
   yet. Same "drop-in once Adam provides the value" shape as every other gap
   here. The `/api/webhooks/calcom` webhook it feeds has been live since
   `e32c0a5`; this closes the frontend half.

## How to add a town

Today (pre-Sanity-seed), towns are data in `src/lib/sample.ts`. Add an entry
to `sampleTowns: TownFull[]` — every field in `TownDepth` is required (spec
§2.2's non-swappable-field rule: building department, permit info, historic
overlay status *even when `applies: false`*, housing stock, at least one
local condition/named street/hamlet/landmark, and ≥1 FAQ). Also add pricing
bands (`PriceBand[]`) if the town should be quotable — the quote engine
(`src/server/quote.ts`) only prices towns present in
`getQuoteTowns()`/`getPricingRows()` (`src/lib/content.ts`), which filters
`sampleTowns` by `advertisingAllowed`. A town appears in
`/areas/[slug]/` automatically via `getStaticPaths`; add its slug to
`sampleTownNames` too if it should appear in the coverage grid on `/` and
service pages even before it has a detailed page.

East-End (non-advertising) towns go through `src/server/east-end-gate.ts`'s
ZIP table instead — they must **never** get a numeric price (§771-B; see the
CRITICAL comments in `quote.ts`).

After adding a town: `npm run build` (the seo-technical gate will re-check
anchor ratio + link depth against the new page) and
`npx playwright test e2e/a11y.spec.ts` if you add it to `e2e/a11y.spec.ts`'s
`ROUTES` list.

Once Sanity is seeded, this becomes "publish a `town` document" instead —
the required-field publish gate (spec §2.2, Phase 01) enforces the same
non-swappable fields at the CMS layer.
