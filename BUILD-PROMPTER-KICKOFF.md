# Build-Prompter Kickoff — precision-roof, targeting the graph-engineer orchestrator

> **How to use this file:** paste the contents below into a fresh Claude Code session with
> `cwd = C:\Users\adam\projects\precision-roof`. It is self-contained — it runs the
> `build-prompter` skill's Steps 0–4 but modifies them in several load-bearing ways so the
> output is consumable by the unattended `graph-engineer` LangGraph orchestrator rather than by
> a human pasting prompts one at a time.

**Spec:** `suffolk-roofing-spec-v3.md` (confirm this is LOCKED before proceeding — if not marked LOCKED, ask before continuing)
**SOW:** `SOW-suffolk-roofing.md`
**Operator:** Claude Code, but the consumer is NOT a human pasting prompts one at a time — it's an unattended LangGraph orchestrator ("graph-engineer") that runs phases automatically overnight. Read this entire prompt before starting; it modifies the standard build-prompter skill in several load-bearing ways.

Run the `build-prompter` skill's Steps 0–4 (validate → analyze → buildplan → operator prompts → review prompts), with the following graph-engineer-specific modifications at each step. If the `build-prompter` skill isn't loaded, follow the process below directly — it's self-contained.

---

## Step 0 — Validation

Standard build-prompter validation: confirm spec v3 is locked, confirm the SOW exists, assess spec adequacy (schema + API + component architecture all present). If any of the 5 CRITICAL findings from the prior adversarial review are still unresolved in v3 — Sanity `job` doc missing customer contact; operational-store schema still Postgres-typed against a SQLite/D1 target; synchronous SMS send in `/api/lead`; no webhook idempotency; SMS rate-limiting that doesn't cap per-destination-phone or restrict to NANP — **STOP and report which ones remain before continuing.** Do not paper over an unresolved CRITICAL with a build-prompter workaround; it needs a spec fix.

## Step 1 — Analysis & phase structure

Follow build-prompter's normal dependency-mapping process, but size phases against a **hard constraint build-prompter doesn't natively know about**: graph-engineer force-escalates any phase whose diff exceeds ~2000 changed lines to a cross-vendor adjudicator instead of promoting it. Budget each phase to roughly *one feature cluster, one integration, one data-model change, or one page-template family* — not whole SOW-level phases. Concretely, expect something close to this shape (adjust based on what's actually in the locked v3 spec):

```
00-environment          (no feature code — Astro scaffold, Sanity project link, D1/Supabase
                         migration tool wired, FULL test-command surface stood up: vitest config,
                         playwright config with a passing placeholder spec, package.json scripts)
01-content-schema       (Sanity schema: town/service/townPricing/job/review/faq/post/siteSettings,
                         required-field publish gate — job document MUST carry resolvable
                         customer contact per the CRITICAL fix)
02-operational-store    (lead/message_log/review_request/opt_out schema in the CHOSEN engine's
                         native types — no timestamptz/uuid if D1/SQLite)
03a-service-pages       (3 urgent services + hub)
03b/03c-town-pages      (split launch towns across 2 phases — these are content-heavy and will
                         approach the diff-size ceiling on their own)
04-core-pages           (home/about/contact/reviews/warranties/gallery)
05a-booking-cal         (Cal.com + idempotent webhook + single GA4 booking_completed emitter)
05b-lead-intake-twilio  (3-step form + speed-to-lead via async dispatch, not inline + TCPA
                         consent snapshot + per-phone daily send cap)
05c-callrail-financing  (DNI + Acorn/Wisetack — must resolve which platform owns the inbound
                         number, CallRail or Twilio, per the HIGH finding)
06-seo-technical        (JSON-LD, sitemaps, internal linking/anchor-ratio check, redirects)
07-accessibility-perf   (WCAG 2.2 AA, performance budget CI gate)
08-hardening            (rate limiting, webhook idempotency ledger, retention/backup)
[Phase-2 SOW scope, later]: 09-review-request-engine, 10-quote-widget, 11-cornerstone-content
```

Present this structure for approval as build-prompter normally does, adjusted to whatever v3 actually contains.

## Step 2 — BUILDPLAN.md **and phases.json**

> phases.json is new — build-prompter's standard output list doesn't include it, but the orchestrator requires it.

Generate BUILDPLAN.md exactly as build-prompter normally does (mermaid dependency graph, phase summary table, feature traceability table, risk register, rollback strategies).

**Additionally**, generate `docs/build/phases.json` — a bare JSON array (not wrapped in an object), one entry per phase, matching this exact schema. All 10 keys are required; a missing key crashes the orchestrator with no graceful fallback:

```python
{
  "id": str,                  # e.g. "01" or "05b" — must match the phase's operator/review filenames
  "name": str,                # e.g. "content-schema"
  "prompt_file": str,         # e.g. "suffolk-roofing-phase-01-content-schema.md" — must be the EXACT
                              # filename you create in docs/build/, byte for byte, no subdirectories
  "review_file": str,         # e.g. "suffolk-roofing-review-phase-01.md" — same constraint
  "depends_on": [str],        # other phase ids
  "max_turns": int,           # MUST be exactly one of 25, 50, 75, 100 (Low/Medium/High/Very High)
  "intensity": str,           # MUST be exactly one of "LIGHT", "MEDIUM", "HEAVY" -- any other string crashes
  "parallelizable": bool,     # currently informational only in the orchestrator; set it honestly anyway
  "spec_sections": [str],     # spec section numbers this phase implements
  "sow_features": [str]       # F-XXX ids this phase implements
}
```

**Derive `intensity`** from this mapping (already build-prompter's own convention from review-checkpoints.md, just made explicit per-phase): Environment Setup→LIGHT; Schema/data-model phases (01, 02)→HEAVY; plain content/page phases (03a/03b/03c/04)→MEDIUM; integration phases touching money, SMS, or webhooks (05a/05b/05c)→HEAVY; SEO-technical (06)→MEDIUM; accessibility/perf (07)→MEDIUM; hardening (08)→MEDIUM; the review-request engine (09, Phase 2 scope)→HEAVY given it's where the CRITICAL job-contact-field bug lived.

HEAVY matters mechanically, not just as a label: it triggers two independent reviewer sessions on that phase, and if they disagree, the orchestrator force-escalates to a cross-vendor adjudicator rather than treating it as an ordinary fix cycle.

**Derive `max_turns`** from complexity: Low=25 (environment, hardening-config-only work), Medium=50 (most content/integration phases), High=75 (content-heavy town-page batches, the Twilio integration), Very High=100 (only if a phase turns out unavoidably large — better to split it instead).

Present phases.json alongside BUILDPLAN.md for approval, same gate as build-prompter's normal Step 2 stop.

## Step 3 — Operator prompts

Follow build-prompter's standard 7-section template (Context / Objective & Deliverables / Implementation Instructions / Acceptance Criteria / Constraints / Completion Protocol / Execution & Orchestration), with these graph-engineer-specific additions:

**The orchestrator's builder tool allowlist is exactly this** — do not write instructions assuming anything outside it:

```
Edit, Write, Read, Glob, Grep,
Bash(npm run build), Bash(npm run typecheck), Bash(npm run lint),
Bash(npm run test:*), Bash(npx vitest:*), Bash(npx playwright:*),
Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*),
mcp__supabase, mcp__playwright, mcp__filesystem
```

No `npm install`/`npm ci` (dependency installation happens ONCE, manually, before the orchestrator ever runs — Phase 00's prompt must say explicitly "dependencies are already installed, do not run npm install"). No `git push` (the orchestrator's own commit step owns that). No arbitrary npm/npx scripts outside build/typecheck/lint/test:* — if a phase seems to need another script, rename it to fit one of those four patterns.

**Phase 00's acceptance criteria MUST include the full test-command surface working**, because the orchestrator's gate runs identically after every phase starting with Phase 00 itself:

```
npm run typecheck   (must exit 0)
npm run lint        (must exit 0)
npx vitest run --coverage --reporter=json --outputFile=.vitest.json   (must exit 0)
npx playwright test --reporter=json                                   (must exit 0)
```

Phase 00 needs at least one trivially-passing placeholder test in each of vitest and playwright — don't defer "real" test infrastructure to a later phase.

**Bake each relevant CRITICAL/HIGH finding into that phase's "dangerous parts" callout AND a matching acceptance criterion** (not just a spec section reference) — for example, in `05b-lead-intake-twilio`:

> CAUTION: The spec review flagged this as CRITICAL. The speed-to-lead SMS must never block the request path — persist the lead and return 201 first, then dispatch via a queue/`ctx.waitUntil()`. See spec Section [X] for the required approach.
>
> Acceptance criterion: "`/api/lead` returns 201 within [N]ms even when the Twilio call is mocked to hang — verify with a test that stalls the outbound SMS call and asserts the response isn't blocked on it."

Do this same pattern for: the D1/SQLite-native-types requirement in `02-operational-store`, webhook idempotency in every webhook-touching phase (Cal.com, Twilio, Sanity job-complete), the per-phone-per-day SMS send cap, and the CallRail/Twilio number-ownership resolution in `05c`.

Standard build-prompter guidance otherwise applies unchanged: reference spec sections by number rather than inlining them, mark ambiguities as `// SPEC-AMBIGUITY:`, use the PHASE-NN-PROGRESS.md handshake for `--continue` resumption, one fresh session per phase.

## Step 4 — Review prompts

Generate review-phase-NN prompts exactly per build-prompter's standard review-checkpoints.md template and JSON verdict schema — **no changes needed here**, it's already compatible with what the orchestrator consumes:

- `verdict["verdict"]` read literally as `PROMOTE`/`FIX`/`ESCALATE`
- `verdict["acceptance_criteria"]` as a list of `{criterion, result: PASS|FAIL, evidence}` summed for the commit message
- `verdict["issues_found"]` as a list of `{severity, file, description, fix}` fed directly to the fixer

Do NOT generate the "Generating Fix Instructions" per-phase templates from review-checkpoints.md — the orchestrator has its own built-in fixer that consumes `issues_found` automatically; that part of Step 4 is redundant here.

For HEAVY-intensity phases, note in the review prompt that a second, independent reviewer session may also be judging the same diff, and disagreement between them escalates rather than resolving as an ordinary fix.

---

## Before handing this off to the orchestrator (pre-flight — not build-prompter's job)

- [ ] `git init` precision-roof (it isn't a git repo yet) and make an initial commit of the scaffold.
- [ ] Install all dependencies once, manually — `package-lock.json` committed — before the orchestrator's first run.
- [ ] Confirm package.json defines `build`, `typecheck`, `lint`, and `test:*` scripts matching what Phase 00 stood up.
- [ ] Doppler dev config set up with the vendor keys the build will actually need.
- [ ] Validate with a `--dry-run --phases 00` against the orchestrator before trusting a full run — per its own rollout ladder, do not start at a full autonomous night.

## Verification (self-check before declaring the prompt set done)

- Cross-check the drafted phase list's `depends_on` graph has no cycles and matches real technical dependencies (schema before content, content before pages, pages before conversion-stack wiring, conversion-stack before hardening).
- Confirm every field in each phases.json entry is one of the 10 required `Phase` keys, with `intensity ∈ {LIGHT,MEDIUM,HEAVY}` and `max_turns ∈ {25,50,75,100}` — a mechanical check against the orchestrator's `state.py` schema.
- Confirm every SOW feature (F-001..F-022) appears in at least one drafted phase's `sow_features` — the same integrity check build-prompter's traceability table requires.
