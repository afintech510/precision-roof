# Review Synthesis Methodology

This document defines how to parse, consolidate, and present review findings for human decision-making.

## Parsing Review Outputs

The user will paste review results in one of these formats:
1. **Clean JSON** — Parse directly
2. **JSON in code fences** — Strip markdown fences, then parse
3. **JSON with preamble text** — Extract the JSON object from surrounding text
4. **Mangled/partial JSON** — Some models won't follow the schema. Extract findings manually from the text.

### Handling Malformed Responses

If a model returns prose instead of JSON, extract findings into the standard schema yourself. Map informal severity language:
- "This is a showstopper" / "deal-breaker" / "will break in production" → CRITICAL
- "Significant concern" / "major gap" / "should address" → HIGH
- "Worth considering" / "could improve" / "minor risk" → MEDIUM
- "Nice to have" / "suggestion" / "nitpick" → LOW

## Consolidation Process

### Step 1: Normalize All Findings

Create a unified list with global IDs. Include the `dimension` field for cross-cutting analysis:

```markdown
| Global ID | Original ID | Reviewer | Severity | Dimension | Title |
|-----------|-------------|----------|----------|-----------|-------|
| REV-001 | GUARDIAN-003 | GUARDIAN | CRITICAL | Security | No rate limiting on auth endpoints |
| REV-002 | FOUNDATION-001 | FOUNDATION | HIGH | Data | Missing index on orders.customer_id |
| REV-003 | ADVOCATE-007 | ADVOCATE | HIGH | UX | No empty state for new users |
| REV-004 | BRIDGE-002 | BRIDGE | HIGH | Security | Auth token not validated on webhook handler |
```

### Step 2: Detect Overlaps (Critical with Full-Scope Reviews)

Because each reviewer covers ALL dimensions, overlap is expected and valuable. The more reviewers who independently flag the same issue, the higher confidence it's real.

Common convergence patterns:

- GUARDIAN flags "no rate limiting" (Security) + BRIDGE flags "auth endpoint has no throttling" (Security) → Same issue, merge. Two reviewers = high confidence.
- FOUNDATION flags "missing session table" (Data) + GUARDIAN flags "no session persistence" (Security) + ADVOCATE flags "users get logged out randomly" (UX) → Same root cause from three angles. Merge, cite all three. Three reviewers = very high confidence.
- FOUNDATION flags "order_count not computable from schema" (Data) + BRIDGE flags "API endpoint promises data schema can't produce" (Integration) → Same data gap. Merge.

When merging:
- Use the most specific title
- Combine descriptions — note each reviewer's perspective, as the multi-angle view adds value
- Take the highest severity
- List all contributing reviewer IDs
- Use the most actionable recommendation (or combine them)
- Track the `dimension` each reviewer classified it under — if different reviewers put the same issue in different dimensions, that signals the issue is cross-cutting

### Step 3: Consensus Severity Adjustment

If 3+ reviewers independently flag the same issue, bump severity up one level (max CRITICAL). This signals strong consensus that the issue is real.

If only one reviewer flags something at HIGH or CRITICAL, don't automatically downgrade — but note it's a single-source finding so the human can weigh confidence.

### Step 4: Categorize and Sort

Group findings by:
1. CRITICAL findings first (must review before any build work)
2. HIGH findings by category
3. MEDIUM findings by category
4. LOW findings last

## Decision Gate Format

Present the consolidated findings as a markdown document:

```markdown
# Review Synthesis: [Project Name] — Cycle [N]

**Spec Version Reviewed:** v[N]
**Reviewers:** [List models used]
**Total Findings:** [count] (Critical: X, High: X, Medium: X, Low: X)
**Overlap Rate:** [X findings merged from Y originals] — [higher overlap = more confidence in those findings]

## Consensus Findings (flagged by multiple reviewers)

These findings were independently identified by 2+ reviewers, indicating high confidence:

| ID | Severity | Title | Reviewers | Category | Recommendation | Decision |
|----|----------|-------|-----------|----------|----------------|----------|
| REV-001 | CRITICAL | [title] | GUARDIAN, BRIDGE | Security | [rec] | ⬜ |

## CRITICAL Findings

| ID | Severity | Title | Reviewer | Category | Recommendation | Decision |
|----|----------|-------|----------|----------|----------------|----------|
| REV-003 | CRITICAL | [title] | [source] | [cat] | [rec] | ⬜ |

## HIGH Findings

[Same table format]

## MEDIUM Findings

[Same table format]

## LOW Findings

[Same table format]

## Commendations

[Aggregate what reviewers praised — helps calibrate confidence in the spec's strong areas]

## Build Readiness Assessment

[Aggregate the overall_risk_assessment from each reviewer]

| Reviewer | Build Readiness | Confidence | Top Risk |
|----------|----------------|------------|----------|
| GUARDIAN | [READY/CAVEATS/NOT READY] | [HIGH/MED/LOW] | [their #1 risk] |
| FOUNDATION | ... | ... | ... |
| ADVOCATE | ... | ... | ... |
| BRIDGE | ... | ... | ... |

**Consensus:** [If 3+ say READY or READY WITH CAVEATS, the spec is likely in good shape. If any say NOT READY, address their CRITICAL findings first.]

## Dimension Coverage Heatmap

[Show which dimensions got the most findings — reveals where the spec is weakest]

| Dimension | CRITICAL | HIGH | MEDIUM | LOW | Total |
|-----------|----------|------|--------|-----|-------|
| Security | X | X | X | X | X |
| Data | ... | ... | ... | ... | ... |
| UX | ... | ... | ... | ... | ... |
| Integration | ... | ... | ... | ... | ... |
| Business Logic | ... | ... | ... | ... | ... |
| Performance | ... | ... | ... | ... | ... |
| Operations | ... | ... | ... | ... | ... |
| Traceability | ... | ... | ... | ... | ... |

---

## Decision Instructions

For each finding, mark one:
- **APPROVE** — Incorporate this change into the next spec version
- **REJECT** — Do not incorporate (provide brief reasoning)
- **DEFER** — Add to backlog for future consideration

Return this document with your decisions filled in.
```

## Post-Decision Processing

After the user returns their decisions:

### Changelog Generation

```markdown
# Changelog: [Project Name] Spec v[N] → v[N+1]

**Date:** [date]
**Review Cycle:** [N]
**Reviewers:** [models]

## Approved Changes
| ID | Change Summary | Spec Sections Modified |
|----|---------------|----------------------|
| REV-001 | Added rate limiting to auth endpoints | 3.1, 7.1 |

## Rejected Changes
| ID | Change | Reason for Rejection |
|----|--------|---------------------|
| REV-008 | Add GraphQL layer | Over-engineering for current scale |

## Deferred to Backlog
| ID | Change | Defer Rationale |
|----|--------|----------------|
| REV-012 | Add WebSocket support | Phase 2 feature |
```

### Re-Review Decision

Recommend another review cycle if:
- Any CRITICAL findings were approved (the fix itself needs verification)
- 5+ HIGH findings were approved (substantial spec changes)
- Structural changes to schema or auth model were made

Do NOT recommend another cycle if:
- Only MEDIUM/LOW findings were addressed
- Changes were additive (new sections added, not existing ones restructured)
- The user explicitly says the spec is ready

Typical healthy pattern: 2-3 review cycles, with finding count decreasing each cycle.
