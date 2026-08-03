# Proposal — wiring the handler cores into `/api/*` (SSR) + the deploy model

**Status:** DRAFT for Adam's review. Design only — no code, no deploy, no keys used.
**Author:** autonomous build session (2026-08-02). **Spec:** `suffolk-roofing-spec-v3.md` §3.1–3.3, §7.1.

This is the "propose + pause" queue item. It turns the pure, unit-tested handler
cores (`src/server/*`) into live endpoints and picks the deploy model. It needs
an architecture sign-off **and** vendor keys, so nothing here is executed yet.

---

## 1. What already exists (green, committed)

Pure functions over the D1 repos, each fully unit-tested with `node:sqlite`, zero
vendor keys:

| Core | File | Spec |
|---|---|---|
| Cal.com booking | `src/server/calcom.ts` | §3.2 `/api/webhooks/calcom` |
| Twilio status + inbound | `src/server/twilio.ts` | §3.2 `/api/webhooks/twilio` |
| Quote engine + East-End gate | `src/server/quote.ts`, `src/server/east-end-gate.ts` | §3.2 `/api/quote` |
| Operator dashboard (audited reads + resend token) | `src/server/dashboard.ts` | §7.1 |
| Data layer | `src/db/repositories.ts`, `migrations/0001`, `migrations/0002` | §2.5 |

Each core takes `(input, repos, deps)` and returns a decision object. The routes
below are **thin adapters**: verify the signature/identity, build a D1-backed
`repos`, call the core, translate the result to an HTTP response.

---

## 2. Deploy-model decision (the crux)

`astro.config.ts` is `output: 'static'` + `adapter: cloudflare()`. Today we ship
with `wrangler pages deploy dist/client` — a **pure static** upload; there is no
server at runtime.

Adding `/api/*` means opting specific routes into on-demand rendering
(`export const prerender = false`). That produces a **Worker** alongside the
static assets. Two ways to run it:

- **Option A — Astro SSR endpoints on the Worker (RECOMMENDED).** Put endpoints
  in `src/pages/api/**.ts`. The cloudflare adapter compiles them into the same
  Worker that serves the static assets (Workers static-assets model, which
  `wrangler.toml` already describes). Bindings (`OP_STORE`, KV, DO, Queue) arrive
  via `context.locals.runtime.env`. **One artifact, one deploy, one binding set.**
  Deploy shifts from `pages deploy dist/client` to the adapter's Worker deploy
  (`wrangler deploy`, driven by the built `dist/`).
- **Option B — separate Pages Functions (`functions/api/*.ts`).** Keeps the
  static Pages deploy but splits API code out of Astro into a parallel
  hand-written runtime. Two mental models, duplicated binding wiring, cores
  imported across the boundary. **Not recommended** — no upside over A here.

**Recommendation: Option A.** It matches the adapter already configured and the
existing `wrangler.toml` bindings, and keeps everything in one typed codebase.
The cost is the deploy-command change (static→Worker) and that the site now has a
running server — acceptable and expected once there's an API.

> ⚠️ This is the main thing to approve: **moving off the static-only Pages deploy
> onto the adapter's Worker deploy.** Everything else follows from it.

---

## 3. Route inventory

`P` = requires `prerender = false`. All webhooks record idempotency in
`webhook_events` (already supported by the cores).

| Route | Method | Verification | Core | Bindings | Secrets |
|---|---|---|---|---|---|
| `/api/lead` | POST `P` | Turnstile (+ fallback), NANP/E.164 validate | *(05b/05c lead core — not yet built)* | OP_STORE, DO, Queue | TURNSTILE_SECRET |
| `/api/quote` | POST `P` | Turnstile best-effort (never fail closed) | `computeQuote` | OP_STORE, **KV (pricing blob)** | TURNSTILE_SECRET |
| `/api/webhooks/calcom` | POST `P` | Cal.com signature | `handleCalcomWebhook` | OP_STORE | CALCOM_WEBHOOK_SECRET, GA4_API_SECRET, GA4_MEASUREMENT_ID |
| `/api/webhooks/twilio` | POST `P` | Twilio `X-Twilio-Signature` | `handleTwilioStatus` / `handleTwilioInbound` | OP_STORE | TWILIO_AUTH_TOKEN |
| `/api/webhooks/sanity-publish` | POST `P` | Sanity webhook secret | *(blob materializer — Task 1 of 05d, not yet built)* | OP_STORE, KV | SANITY_WEBHOOK_SECRET, SANITY_API_TOKEN |
| `/api/operator/leads`, `/leads/:id`, `/failed-sends` | GET `P` | Cloudflare Access / OIDC + MFA | `viewLead`, `listFailedSends` | OP_STORE | (Access-configured) |
| `/api/operator/resend` | POST `P` | Access + single-use signed token | `authorizeResend` → 05b send path | OP_STORE, DO, Queue | RESEND_TOKEN_SECRET |
| `/api/operator/resend/confirm` | GET `P` | Access; **verify only, no side effect** | `verifyResendToken` | OP_STORE | RESEND_TOKEN_SECRET |
| `/unsubscribe` | GET+POST `P` | one-click token | *(email suppression — Phase 2)* | OP_STORE | — |

---

## 4. New bindings + secrets needed (all currently absent)

**Bindings to add to `wrangler.toml`:**
- `KV` namespace for the materialized pricing blob (quote + sanity-publish).
- Durable Object (per-phone/budget/suppression authority) — **Phase 05b**, the
  SMS send path `/api/lead` and resend both depend on it.
- Queue for async SMS dispatch — **Phase 05b**.

**Secrets (Doppler → `wrangler … secret put`, a PAUSED prod action):**
`TURNSTILE_SECRET`, `CALCOM_WEBHOOK_SECRET`, `TWILIO_AUTH_TOKEN`,
`SANITY_WEBHOOK_SECRET`, `SANITY_API_TOKEN`, `GA4_API_SECRET`,
`GA4_MEASUREMENT_ID`, `RESEND_TOKEN_SECRET`, email provider keys (Postmark/SES).
Cloudflare Access/OIDC + MFA is configured in the dashboard, not as a secret.

---

## 5. Prerequisites / blockers

1. **DO + Queue (Phase 05b)** must land before `/api/lead` and resend dispatch —
   the cores assume that send path exists (suppression/per-phone cap live there).
2. **Two cores still missing** before their routes: the **lead intake core**
   (05b/05c) and the **sanity-publish blob materializer** (05d Task 1). The quote
   read path needs the blob to exist in KV.
3. **Migration 0002** (`resend_token`) must be applied to **remote D1** before the
   resend route works — currently local-only, deferred as a prod mutation
   (see memory `pending-remote-d1-migration-0002`).
4. **CSP** (`§5.9`): add `connect-src` for `/api/*`, GA4, CallRail; `frame-src`
   cal.com + financing + `challenges.cloudflare.com`.
5. **Keys** must exist in Doppler; several routes are otherwise untestable end-to-end.

---

## 6. Testing strategy

- Cores stay unit-tested as-is (the valuable logic — already done).
- Add **route-level integration tests** with `@cloudflare/vitest-pool-workers`
  (Miniflare) exercising binding wiring, signature verification, and the
  static↔SSR split, using local D1 + KV. No live vendor calls.
- Keep the axe a11y matrix + perf-budget gates green through the deploy-model change.

---

## 7. Suggested rollout order (once approved + keyed)

1. Approve Option A; add KV binding; wire the deploy-model change behind a build
   that still passes the static gate for prerendered pages.
2. `/api/quote` first (lowest risk: no send path, degrades gracefully) + the
   sanity-publish blob materializer + KV.
3. `/api/webhooks/calcom` and `/api/webhooks/twilio` (idempotent, cores ready).
4. Phase 05b DO+Queue + `/api/lead`.
5. Operator dashboard routes behind Access; apply migration 0002 to remote D1.
6. CSP report-only → enforce; email/unsubscribe (Phase 2).

**Decisions requested from Adam:** (a) approve Option A + the static→Worker deploy
shift; (b) green-light provisioning the §4 secrets in Doppler; (c) confirm the
rollout order above (quote-first).
