# Phase 00: Environment
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** none
**Implements:** Infrastructure (F-001)
**Recommended:** `claude --max-turns 25`

---

## 1. Context

You are executing **Phase 00: Environment** of the Suffolk County roofing website build. **Your scope is strictly this phase.** No feature code — this phase stands up the project skeleton and the complete test-command surface only.

**Tech Stack (spec §1.2):** Astro (static-first) + Sanity (headless CMS); Cloudflare Pages/Workers, **D1** operational store, Durable Objects, Queues, KV/R2; Vitest (unit) + Playwright (E2E). Later phases add Twilio, Cal.com, CallRail, Acorn/Wisetack, Postmark/SES, GA4, Turnstile.
**Working Directory:** project root.
**Spec File:** `suffolk-roofing-spec-v3.md` — READ FIRST. Source of truth.

### What Already Exists
Nothing built. **Dependencies are already installed — do NOT run `npm install` or `npm ci`.** `package.json` and `node_modules` are present; if a script or config references a package, assume it is installed.

### What You're Building
The Astro scaffold, the Sanity project link, the Cloudflare D1 migration tool wiring, and a **fully working test-command surface** (vitest + playwright, each with one trivially-passing spec) so the orchestrator's post-phase gate runs identically from this phase onward.

---

## 2. Objective & Deliverables

### Objective
After this phase, `npm run build`, `npm run typecheck`, `npm run lint`, and the two test runners all exit 0 on an empty-but-valid project, and the D1 migration tool is wired.

### Deliverables
1. Astro project structure + `astro.config` — spec §1.2, §4.
2. Cloudflare `wrangler.toml` with a D1 binding + a migrations directory + migration command — spec §1.3, §2.5.
3. Sanity project/dataset link + `sanity.config` (schema types come in Phase 01) — spec §2.
4. `vitest.config.*` + one passing unit test (e.g. `src/__tests__/smoke.test.ts`).
5. `playwright.config.*` + one passing placeholder spec (e.g. `e2e/smoke.spec.ts`).
6. `package.json` scripts: `build`, `typecheck`, `lint`, `test:unit`, `test:e2e` (names must satisfy the allowlist patterns in §5).
7. `.env.example` documenting every env var referenced (Doppler is the runtime source) — spec §1.3.

---

## 3. Implementation Instructions

### Task 1: Astro + TypeScript scaffold
**Spec:** §1.2, §4. Create the Astro project, `tsconfig` in strict mode, `src/` layout. `npm run typecheck` must map to `astro check && tsc --noEmit` (or equivalent) and exit 0.

### Task 2: Lint
Wire ESLint (+ Astro plugin) so `npm run lint` exits 0 on the scaffold. No warnings-as-errors surprises — a clean scaffold must pass.

### Task 3: Cloudflare + D1 migration tooling
**Spec:** §1.3, §2.5. Add `wrangler.toml` with a D1 database binding and a `migrations/` directory. Provide a `test:*`-or-build-compatible path to apply migrations locally; do NOT create feature tables here (Phase 02 owns the schema). Confirm `wrangler d1 migrations list` resolves against the binding.

### Task 4: Sanity link
**Spec:** §2. Initialize `sanity.config` pointing at the project/dataset. Do NOT define document types — Phase 01 owns the schema. A `sanity` build/typecheck must not error.

### Task 5: Test surface (both runners, each green)
Configure Vitest and Playwright. Write **one** trivially-passing spec in each. Do NOT defer "real" test infrastructure to a later phase — the placeholder specs must exist and pass now so the gate is live from Phase 00.

### Task 6: Scripts + env docs
Finalize `package.json` scripts and `.env.example`. Every secret the build will need (Sanity, Cloudflare, Twilio, Cal.com, CallRail, GA4, Postmark/SES, Turnstile) gets a documented placeholder.

---

## 4. Acceptance Criteria

Run all before reporting done. **This is the orchestrator's standing gate — it runs identically after every phase.**
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npx vitest run --coverage --reporter=json --outputFile=.vitest.json` exits 0
- [ ] `npx playwright test --reporter=json` exits 0
- [ ] `npm run build` exits 0
- [ ] `wrangler d1 migrations list` resolves against the configured binding
- [ ] `.env.example` documents every referenced env var
- [ ] No `npm install`/`npm ci` was run

---

## 5. Constraints

### Hard (violation = phase failure)
- **Tool allowlist — use nothing outside it:** `Edit, Write, Read, Glob, Grep, Bash(npm run build), Bash(npm run typecheck), Bash(npm run lint), Bash(npm run test:*), Bash(npx vitest:*), Bash(npx playwright:*), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), mcp__supabase, mcp__playwright, mcp__filesystem`.
- **No `npm install` / `npm ci`** — dependencies are already installed.
- **No `git push`** — the orchestrator owns commits/pushes.
- No npm/npx scripts outside `build`, `typecheck`, `lint`, `test:*` / `vitest` / `playwright`. If you think you need another script, rename it to fit one of those patterns.
- Follow the tech stack in §1.2 exactly. No substitutions.

### Soft (document deviations)
- Mark spec gaps `// SPEC-AMBIGUITY: …` and blocked items `// BLOCKED: …`.
- Establish the project structure other phases will follow; document any structural choice.

---

## 6. Completion Protocol

Provide: **Files Created / Modified** tables; **Acceptance Criteria Results** table (criterion, PASS/FAIL, evidence — e.g. exit codes); **Spec Ambiguities**; **Blocked Items**; **Decisions Made** (lint config, directory layout, test-runner versions); **Warnings for Next Phase** (where Phase 01 puts Sanity schema types; where Phase 02 puts migrations). Write `PHASE-00-PROGRESS.md` as you go.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 25`.
- **Resumption (--continue):** re-read this prompt, inspect the filesystem, read `PHASE-00-PROGRESS.md`, resume at the first incomplete task, do not restart.
- **Autonomy:** spec defines it → follow exactly; spec silent → reasonable choice + `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` and skip.
