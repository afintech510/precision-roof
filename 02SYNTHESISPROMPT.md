# SYNTHESIS SESSION PROMPT
**Run in:** a fresh Claude Opus session
**Inputs to attach:** `00-RESEARCH-BASELINE.md` + all eight lane outputs (`A-` through `H-`)
**Output:** a single synthesis document that `spec-pipeline` can consume directly

---

## Paste everything below into the new session, after attaching the nine files.

---

You are the synthesis lead on a greenfield web build. Eight research agents have run in parallel across separate lanes, plus a baseline audit from an earlier session. Nine documents are attached. Your job is **not** to summarize them. Summarizing nine documents produces a tenth document nobody reads.

Your job is to **resolve them into a single decided position** that a specification can be written from — and to be honest about what is still undecided and why.

## Context

Adam (adam@easternbuilding.supply) is building a new residential roofing contractor website targeting **Suffolk County, Long Island, NY**. The project began as an audit of `premiumroofsolutions.com` for a possible lead-gen partnership; that site proved to be an unfinished WordPress theme demo, making this effectively a greenfield build. `00-RESEARCH-BASELINE.md` has the full framing, including two unresolved branches (partner build vs. new brand).

After you, this goes to the `spec-pipeline` skill: intake & advisory → SOW → Architecture Spec → adversarial multi-model review → synthesis → LOCKED spec → `build-prompter`. **Write for that consumer.** The SOW author should be able to work from your document without reopening the nine source files.

## How to work

**1. Read all nine first. Resolve conflicts before you write anything.**

The lanes will contradict each other — that's the point of running them separately. Where two agents disagree, do not average them and do not pick the more confident one. Go to the underlying evidence, decide which is better supported, and **state the conflict and your resolution explicitly.** A resolved contradiction is more valuable than an unnoticed agreement.

Watch particularly for these predictable collisions:
- Lane B (keyword volume favors many pages) vs. Lane D (quality favors few) vs. Lane E (programmatic generation vs. Google's thin-content stance) — this is the **central architectural tension** of the whole project. Resolve it concretely: a number, a URL pattern, and a content-depth standard.
- Lane C (map pack may matter more than organic) vs. Lane B (organic strategy) — if the 3-pack drives most leads, the content investment thesis weakens. Weigh them.
- Lane F (build the booking layer) vs. Lane G (operator capacity may not support it) — a booking system against crew availability requires crew availability to be real.
- Lane H (AI discovery may be reshaping the channel) vs. Lanes B/C/D (classic SEO investment) — decide the channel mix, don't hedge.
- Any lane contradicting the baseline. §7 of each lane output flags these. Take them seriously; the baseline was a first pass.

**2. Grade the evidence.**

Not all findings are equal. A quoted competitor page is strong. A keyword volume estimated from autocomplete is weak. An SEO agency's blog post about SEO is marketing. Carry confidence forward — do not let a Low-confidence finding from lane B become a High-confidence assertion in your synthesis because it got repeated. **If the load-bearing evidence for a major recommendation is weak, say so in the recommendation itself.**

**3. Decide. Then say what would change your mind.**

The failure mode here is a document full of "consider" and "it depends." Every section should end with a position. Where you genuinely cannot decide, name the specific missing information and what it would cost to get it — do not disguise a research gap as balanced analysis.

## Required output

A single markdown file: `SYNTHESIS-suffolk-roofing.md`

### Part 1 — Strategic position (2 pages max, written for a human decision-maker)
The market in one paragraph. The opportunity in one paragraph. The strategy in one paragraph. Then the five decisions that matter most, each in two sentences. Someone should be able to read only this part and know what's being built and why.

### Part 2 — Contradiction ledger
Every conflict between lanes or against the baseline. For each: the two positions, the evidence for each, your resolution, and your confidence. Do this early — it earns trust in everything after it.

### Part 3 — The decided architecture
- Positioning and value proposition — the specific territory this site claims and why it's defensible
- Complete site map: every page, its URL, its target intent, and its priority phase
- Town coverage: exactly which towns, in what order, at what content depth, with the reasoning
- Service taxonomy, named as customers search
- Internal linking model
- Content depth standard — the concrete bar a town page must clear to ship
- Technical platform, with the strongest counterargument addressed
- Structured data plan by page type
- The conversion stack: what ships at launch, what ships in phase 2, and what it costs monthly

### Part 4 — The competitive thesis
The tiered competitive picture, condensed. Then the specific, named whitespace this build occupies — and for each piece of whitespace, why the incumbents haven't taken it and how long the window stays open. If a gap is closing, say so.

### Part 5 — Hypothesis verdicts
H1–H7 from the baseline, each: CONFIRMED / REFUTED / PARTIALLY CONFIRMED / INSUFFICIENT EVIDENCE, with the deciding evidence and which lane supplied it. **Refuted hypotheses are the most valuable output of this section** — they prevent building the wrong thing. Give them room.

### Part 6 — Economics
The reconciled model. Traffic, conversion, close rate, job value, revenue — conservative/base/optimistic, with arithmetic shown and every input sourced. Build cost, ongoing cost, CAC, payback period. Compare against the paid-lead alternative ($500–$1,400 per booked job). **State the assumptions that, if wrong, break the model.**

### Part 7 — Compliance and risk register
Licensing, permitting, advertising law, TCPA, ADA/WCAG, insurance-claim rules. Each as: requirement → what the build must do → who owns it → what happens if it's skipped. Separate **legal requirements** from **best practices** — do not blur them.

### Part 8 — Open decisions for Adam
Everything that needs a human, framed as a decision with options, a recommendation, and consequences. At minimum: Branch A vs. Branch B, budget envelope, launch timing against nor'easter season, operator/crew arrangement, and whether Eastern Building Supply creates any structural advantage worth designing around. **Flag which of these block the SOW and which can be decided during the build.**

### Part 9 — Phased roadmap
Phase 0 through launch through 12 months. Each phase: what ships, why that order, what it depends on, and how success is measured. Anchor to the calendar — the research indicates the storm/emergency cluster should be live before October, and that is a real deadline.

### Part 10 — SOW handoff package
Written specifically for `spec-pipeline`:
- **Scope statement** — one paragraph, unambiguous
- **In scope / out of scope** — explicit lists, no gray area
- **Deliverables** with acceptance criteria that can actually be tested
- **Technical constraints and requirements**
- **Dependencies and assumptions**
- **Success metrics** with baselines and targets
- **Known risks** with mitigations
- **Open questions** the spec author must resolve, each with the decision owner named

### Appendix — Evidence index
Which lane supplied which key finding, and where the weak evidence is. So the spec author can trace any claim back and knows which foundations are soft.

## Standards

- **Cite the lane** for every material claim: `[Lane C]`, `[Lane F]`, `[baseline §4]`. The spec author must be able to trace anything.
- **Distinguish measured from claimed from estimated** throughout. A competitor's "GAF Master Elite" badge is a claim until verified against GAF's locator; Lane A was asked to verify a sample of these.
- **No unsourced numbers.** If a figure has no source, either find one or label it an assumption.
- **Kill your darlings.** If the research refutes something in the baseline — including the strategic hypotheses, the whitespace claims, or the revenue model — say it plainly and early. The baseline was one session's work and it expects to be corrected.
- **Length is not a virtue.** Part 1 should be readable in four minutes. The rest should be as long as the content requires and not one section longer. If a lane produced little of value, say so in one line rather than manufacturing substance from it.

Begin by reading all nine documents completely. Do not start writing until you have the contradiction ledger drafted — it will restructure everything else.
