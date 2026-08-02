# Pre-Flight — precision-roof → graph-engineer orchestrator

Status of the 5 pre-flight steps that must complete before the orchestrator's first run.
(Steps are from `BUILD-PROMPTER-KICKOFF.md`; this is the human/pre-flight lane, not build-prompter's job.)

| # | Step | Status | Notes |
|---|------|--------|-------|
| 1 | `git init` + initial scaffold commit | ✅ done | repo on `main`; scaffold committed |
| 2 | Install deps once, commit `package-lock.json` | ✅ done | `npm install` run manually; lockfile committed |
| 3 | Confirm `package.json` has `build`/`typecheck`/`lint`/`test:*` | ✅ done | scripts match Phase 00's standing gate |
| 4 | Doppler dev config with vendor keys | ⏳ **needs keys from Adam** | see key table below |
| 5 | `--dry-run --phases 00` against the orchestrator | ⏳ blocked on (4) + Cloudflare/Sanity ids | run after keys land |

## Standing gate (must stay green from Phase 00 on)
```
npm run typecheck
npm run lint
npx vitest run --coverage --reporter=json --outputFile=.vitest.json
npx playwright test --reporter=json
```

## Keys needed

### Needed NOW (unblocks D1 creation + Sanity link + dry-run)
| Key | Where it goes | How to get it |
|-----|---------------|---------------|
| `CLOUDFLARE_ACCOUNT_ID` | Doppler + `wrangler.toml` context | Cloudflare dashboard → account id |
| `CLOUDFLARE_API_TOKEN` | Doppler / `wrangler login` | token with D1 + Workers/Pages edit |
| `D1_DATABASE_ID` | `wrangler.toml` (`TODO_D1_DATABASE_ID`) | output of `npx wrangler d1 create precision-roof-op` |
| `SANITY_PROJECT_ID` | Doppler / `.env` | sanity.io → project settings |
| `SANITY_DATASET` | Doppler / `.env` | usually `production` |
| `SANITY_API_TOKEN` | Doppler / `.env` | sanity.io → API → editor token |

### Needed per phase (can land later, before that phase runs)
| Phase | Keys |
|-------|------|
| 05a booking | `CALCOM_API_KEY`, `CALCOM_WEBHOOK_SECRET`, `GA4_MEASUREMENT_ID`, `GA4_API_SECRET` |
| 05b lead/SMS | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`/`TWILIO_PHONE_NUMBER`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` (+ A2P 10DLC registration) |
| 05c callrail/financing | `CALLRAIL_API_KEY`, `CALLRAIL_ACCOUNT_ID`, `FINANCING_PARTNER`+`FINANCING_API_KEY`+`FINANCING_PARTNER_ID` (+ ANI-passthrough verification) |
| 05e dashboard | `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD` |
| 06 reviews | `GBP_CLIENT_ID`, `GBP_CLIENT_SECRET`, `GBP_REFRESH_TOKEN` |
| 09 email | `POSTMARK_SERVER_TOKEN` **or** `AWS_SES_*` |

Full template with placeholders: `.env.example`. Never commit filled-in secrets — Doppler (dev) + Cloudflare secrets are the runtime sources.

## Remaining manual pre-flight commands (run once keys land)
```
# Cloudflare
npx wrangler login                         # or set CLOUDFLARE_API_TOKEN
npx wrangler d1 create precision-roof-op   # paste id into wrangler.toml
# Sanity
npx sanity login && npx sanity init --project <id> --dataset production  # Phase 01 owns full studio
# Doppler
doppler setup                              # select dev config, import .env.example keys
# Playwright browsers (for real E2E phases)
npx playwright install chromium
# Then, against the orchestrator:
<orchestrator> --dry-run --phases 00
```
