# Phase 05a: Booking (Cal.com)
**Project:** Suffolk County Residential Roofing Website
**Spec:** `suffolk-roofing-spec-v3.md` (🔒 LOCKED v3)
**Build Plan:** `BUILDPLAN.md`
**Prerequisites:** Phase 00, Phase 01, Phase 02
**Implements:** F-008, F-015 (booking_completed)
**Recommended:** `claude --max-turns 50`

---

## 1. Context
You are executing **Phase 05a: Booking** — the Cal.com free-tier embed, the `/api/webhooks/calcom` handler, `booking` upserts, walk-up `lead` creation, and the single server-side GA4 `booking_completed` event. **Scope is strictly this phase.** No SMS/lead form (05b), no financing (05c).

**Tech Stack (spec §1.2):** Astro + Cloudflare Workers + D1 + Cal.com + GA4 Measurement Protocol. **Working Directory:** project root. **Spec File:** read §3.2 (calcom), §2.5 (booking), §1.1 (GA4 MP) first.

### What Already Exists
Phase 02 created `booking`, `lead`, `webhook_events` tables. Phase 04 has core pages. Deps installed — **no `npm install`.**

### What You're Building
A facade-loaded Cal.com "Book a Free Inspection" embed and an idempotent booking webhook that never orphans a walk-up booking and fires exactly one attributed GA4 event.

---

## 2. Objective & Deliverables
### Objective
After this phase, a real inspection slot can be booked end-to-end, the webhook upserts a `booking` (creating a `lead` when none exists), and exactly one server-side GA4 `booking_completed` fires with the real `client_id`.
### Deliverables
1. Cal.com facade embed — spec §4, §7.3 (CSP `frame-src`).
2. `POST /api/webhooks/calcom` — verify + idempotent + upsert `booking` + create `lead` when `leadId` absent — spec §3.2, §2.5.
3. Server-side GA4 `booking_completed` via Measurement Protocol with captured `client_id` — spec §1.1, §3.2.

---

## 3. Implementation Instructions
### Task 1: Cal.com facade embed
**Spec:** §4, §7.3. Load on interaction (facade pattern) with an immediate loading affordance + always-visible phone CTA (slow load must never read as a dead button). Capture the browser GA4 `client_id`/`session_id`/`gclid` and forward via Cal.com booking metadata for walk-up attribution.

### Task 2: Idempotent booking webhook
**Spec:** §3.2, §2.5, §3.3.
> **CAUTION — idempotency (prior CRITICAL class).** Derive the idempotency key from **Cal.com booking uid + trigger type** and record it in `webhook_events`; re-delivered webhooks must not double-process. Validate `leadId` exists + cross-check phone/email before linking; on mismatch/absent, **create/link a `booking` + minimal `lead`** (`source=booking_direct`) so walk-up bookings are never orphaned.

### Task 3: Single server-side GA4 event
**Spec:** §1.1, §3.2.
> **CAUTION.** Fire `booking_completed` **once, server-side**, via Measurement Protocol with the captured `client_id` + `api_secret`. **No client-side booking event.** For walk-up bookings with no prior form, use the `client_id` forwarded in Cal.com metadata; if genuinely absent, mark the event **unattributed** — **never mint a random `client_id`** (it corrupts source/medium).

---

## 4. Acceptance Criteria
- [ ] Standing gate green; `npm run build` exits 0
- [ ] A booking completes end-to-end (E2E test against Cal.com sandbox/mocked webhook)
- [ ] **Re-delivered calcom webhook (same uid+trigger) → no duplicate `booking`, no duplicate GA4 event** (idempotency test)
- [ ] Walk-up booking with no `leadId` → a `booking` + minimal `lead` (`source=booking_direct`) are created (not orphaned)
- [ ] Exactly **one** server-side GA4 `booking_completed` fires per booking; walk-up with no `client_id` is marked unattributed, never random
- [ ] Facade shows a loading affordance + visible phone CTA before embed load

---

## 5. Constraints
### Hard
- **Tool allowlist only** (Edit/Write/Read/Glob/Grep; `Bash(npm run build|typecheck|lint)`, `Bash(npm run test:*)`, `Bash(npx vitest:*|playwright:*)`, `Bash(git status|diff|add|commit:*)`, `mcp__supabase`, `mcp__playwright`, `mcp__filesystem`). **No `npm install`. No `git push`.**
- No client-side booking GA4 event; no minted `client_id`.
- Do NOT build the lead form/SMS (05b) or financing (05c).
### Soft
- `// SPEC-AMBIGUITY` / `// BLOCKED`; reference spec sections by number.

---

## 6. Completion Protocol
Files Created/Modified; Acceptance Criteria Results (include idempotency + attribution evidence); Ambiguities; Blocked Items; Decisions; **Warnings for Next Phase** (booking/lead rows 05e dashboard reads; CSP `frame-src` entries Phase 08 must include). Maintain `PHASE-05a-PROGRESS.md`.

---

## 7. Execution & Orchestration
- **Recommended:** `claude --max-turns 50`. **Resumption:** re-read prompt, inspect filesystem, read `PHASE-05a-PROGRESS.md`, resume at first incomplete task.
- **Autonomy:** defined → exact; silent → `// SPEC-AMBIGUITY`; contradictory → `// ESCALATE` + skip.
- **Note:** HEAVY phase — a second independent reviewer may judge this diff; reviewer disagreement escalates rather than resolving as an ordinary fix.
