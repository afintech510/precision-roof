# Phase 05e: Operator Dashboard
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00, Phase 02, Phase 05b
**Implements:** F-023
**Recommended:** `claude --max-turns 50`

---

## 1. Context
You are executing **Phase 05e: Operator Dashboard** — the auth-gated dashboard for leads, review-request status, and failed-send handling, including the emailed resend link. **Scope is strictly this phase.**

**Tech Stack (spec §1.2, §7.1):** Astro + Cloudflare Workers + Cloudflare Access/OIDC + D1. **Working Directory:** project root. **Spec File:** read §7.1, §2.5, §8 first.

### What Already Exists
Phase 02: `lead`, `message_log`, `operator_access_log`, `review_request` tables. Phase 05b: lead + message data flowing, the DO+Queue send path (reused for resend). Deps installed — **no `npm install`.**

### What You're Building
A dashboard where every lead-PII read goes through a server endpoint and is logged, and where the emailed resend link is a safe authenticated POST — never a GET side effect.

---

## 2. Objective & Deliverables
### Objective
After this phase, an authenticated operator can view leads / review-request status / failed-send queue via server endpoints that log every PII read, and resend a failed message via a single-use signed POST.
### Deliverables
1. Auth via Cloudflare Access / OIDC + MFA — spec §7.1.
2. Server-side read endpoints (no direct client reads of the op-store) writing `operator_access_log` — spec §7.1, §2.5.
3. Failed-send queue view — spec §8.
4. Emailed resend deep link → confirm page → authenticated **POST with single-use short-TTL signed token** — spec §7.1.

---

## 3. Implementation Instructions
### Task 1: Auth
**Spec:** §7.1. Cloudflare Access / OIDC + MFA — **not** permanent basic-auth. Sanity SSO is not assumed.

### Task 2: Server-only reads + access log
**Spec:** §7.1, §2.5.
> **CAUTION — PII.** Dashboard reads go through a **server endpoint**; the client never reads the op-store directly. Every read of lead PII writes an `operator_access_log` row (operator_id, action, lead_id, accessed_at, ip).

### Task 3: Failed-send queue + resend link
**Spec:** §7.1, §8.
> **CAUTION — no GET side effects; SMS trigger.** The emailed resend link lands on a **confirm page** and executes only as an authenticated **POST with a single-use, short-TTL signed token**. A GET must never resend. The resend goes through the Phase-05b DO+Queue send path (honors suppression/per-phone cap) — do not bypass it.

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] Dashboard routes require Cloudflare Access/OIDC + MFA; unauthenticated access is denied
- [ ] **Every lead-PII read writes an `operator_access_log` row** (verified by test)
- [ ] Client never reads the op-store directly (all reads via server endpoints)
- [ ] Resend link: **GET has no side effect**; resend executes only via authenticated POST with a single-use short-TTL signed token; token cannot be replayed
- [ ] Resend dispatches through the 05b send path (respects suppression/per-phone cap), not a bypass
- [ ] Failed-send queue view lists leads needing follow-up

---

## 5. Constraints
### Hard
- **Tool allowlist only.** **No `npm install`. No `git push`.**
- No GET side effects; no direct client op-store reads; no permanent basic-auth.
- Reuse the 05b send path for resend.
- Do NOT build the review engine (09) or SEO (06).
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results (incl. access-log + token-replay evidence); Ambiguities; Blocked Items; Decisions (token TTL, signing scheme); **Warnings for Next Phase** (auth config Phase 08 hardening reviews; access-log retention). Maintain `PHASE-05e-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 50`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-05e-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
- **Note:** HEAVY phase — a second independent reviewer may judge this diff; disagreement escalates rather than resolving as an ordinary fix.
