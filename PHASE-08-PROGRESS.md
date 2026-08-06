# Phase 08: Hardening — status

Audited this run (no code changes — everything buildable without a vendor
decision or a live deploy was already shipped by prior sessions).

**Task 1 (CSP enforce):** blocked, not flipped. `astro.config.ts` still calls
`csp()` (report-only). Confirmed against `PHASE-05c-PROGRESS.md`'s own
warning: enforcing now would either break the eventual financing-vendor
iframe or ship a still-report-only policy under a different name, since
`frame-src`/`connect-src` can't include a lender domain nobody has picked yet
(`src/lib/csp.ts`'s own comment says the same). The acceptance criterion also
requires confirming Cal.com/Turnstile/GA4/financing "still load under it" —
that needs a live deploy, which is out of scope for this builder. Report-only
already runs clean with zero violations across the `e2e/csp.spec.ts` route
matrix, so the moment Adam either (a) picks a financing vendor or (b)
explicitly says "flip it without waiting on financing," this is a one-line
change (`csp({ reportOnly: false })`) plus updating that spec file's header
assertions — no other work needed.

**Task 2 (rate-limit hardening):** done. `src/server/rate-limit.ts` (fixed-window,
KV-shaped, unit-tested) is wired into `/api/lead` and `/api/quote` — the two
routes with real abuse cost (SMS spend, quote compute). Inert in practice
until `RATE_LIMIT_KV` is provisioned (README known-gap #2), but that's a
`wrangler kv namespace create` action, not code.

**Task 3 (retention/purge):** done. `src/server/retention.ts` +
`retention-cron.ts` prune `webhook_events` past the provider retry window,
scrub `lead` consent columns at 24mo, and — verified — never touch
`consent_record`/`suppression`. Cron registered in `wrangler.toml`
(`10 3 * * *`). Sanity `job` PII purge stays out of scope (needs
`SANITY_API_TOKEN`, documented in the file itself).

**Task 4 (backup/restore verification):** blocked. Needs a real R2 bucket
and a preview-env restore exercise against actual infrastructure — no
buildable code slice remains.

**Task 5 (F-021 handoff docs):** effectively done, already in README.md
(architecture diagram, local dev, deploy/rollback commands, secrets +
rotation, "how to add a town" runbook, known-gaps list). What's left —
"add-a-town runbook dry-run by someone other than Adam," "deploy/rollback
exercised once," "restore drill performed" — are human/infra actions, not
code.

## Bottom line

Every remaining Phase 08 item is blocked on either a vendor decision
(financing) or a real deploy/infra step, both outside this builder's
guardrails. Phases 06, 07, 09, and 10 are fully built and tested already.
There is currently no unblocked, buildable increment left in the BUILDPLAN
queue — the next hourly run should re-check this file first and skip
straight to reporting "still blocked" unless one of the above has changed.
