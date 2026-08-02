# Meta-Agent Review: Phase 05e — Operator Dashboard

You are an adversarial code reviewer. Verify Phase 05e independently — focus on auth, PII access logging, and the no-GET-side-effect resend.

## Documents to Read
1. **Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED) — §7.1, §2.5, §8
2. **Operator prompt:** `docs/build/suffolk-roofing-phase-05e-operator-dashboard.md`
3. Builder report + auth, read endpoints, resend flow on disk

## What Phase 05e Should Have Built
**Objective:** Auth-gated dashboard with server-only PII reads that log access, and a safe single-use signed-POST resend. **Spec:** 2.5, 7.1, 8. **Implements:** F-023.

## Review Checklist — dangerous parts first
- [ ] **Auth:** all dashboard routes require Cloudflare Access/OIDC + MFA; unauthenticated access denied; no permanent basic-auth
- [ ] **PII:** client never reads the op-store directly; **every lead-PII read writes an `operator_access_log` row**
- [ ] **Resend — no GET side effects:** the emailed link lands on a confirm page; resend executes only via authenticated **POST with a single-use short-TTL signed token**; the token cannot be replayed
- [ ] Resend dispatches through the Phase-05b DO+Queue send path (respects suppression/per-phone cap) — not a bypass
- [ ] Failed-send queue view lists leads needing follow-up
- [ ] Standing gate exits 0; `npm run build` exits 0; no `npm install`/`git push`; no review-engine/SEO built

## Output Requirements
Valid JSON, standard schema. `verdict` literal; `issues_found` feeds the fixer.

## Verdict Definitions
- **PROMOTE** — auth enforced, every PII read logged, resend is replay-safe POST-only through the 05b path.
- **FIX** — a GET side effect, an unlogged PII read, a replayable token, a direct client op-store read, or a send-path bypass; list precise `issues_found`.
- **ESCALATE** — an auth/privacy architecture question needing a human.

> **HEAVY phase.** A second independent reviewer may judge this diff; disagreement force-escalates to a cross-vendor adjudicator rather than an ordinary fix cycle.
