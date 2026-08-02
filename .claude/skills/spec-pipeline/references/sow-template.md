# Statement of Work Template

Use this template structure when generating SOW documents. Adapt section depth to project complexity — a simple landing page doesn't need the same detail as a multi-service platform.

## Template

```markdown
# Statement of Work: [Project Name]
**Version:** 1.0
**Date:** [Date]
**Prepared for:** [Client/Stakeholder]
**Prepared by:** [Author / Tenth Ave Digital]

---

## 1. Executive Summary

[2-3 paragraphs: What is being built, for whom, and why. This should be readable by a non-technical stakeholder in under 60 seconds.]

## 2. Project Objectives

| ID | Objective | Success Metric | Priority |
|----|-----------|----------------|----------|
| O-001 | [Business objective] | [Measurable outcome] | MUST / SHOULD / COULD |
| O-002 | ... | ... | ... |

## 3. Feature Set

### 3.1 Core Features (Must-Have)

| ID | Feature | Description | User Story | Acceptance Criteria |
|----|---------|-------------|------------|---------------------|
| F-001 | [Feature name] | [What it does] | As a [user], I want to [action] so that [benefit] | [Testable criteria] |
| F-002 | ... | ... | ... | ... |

### 3.2 Enhancement Features (Nice-to-Have)

| ID | Feature | Description | Dependency | Deferred Until |
|----|---------|-------------|------------|----------------|
| F-050 | [Feature name] | [What it does] | [Requires F-XXX] | Phase 2 / Post-Launch |

### 3.3 Explicitly Out of Scope

List features, integrations, or capabilities that are NOT included in this engagement. Be specific — this prevents scope creep.

- [Thing that might be assumed but is not included]
- [Adjacent feature that's been discussed but deferred]

## 4. Users & Personas

### Persona: [Name]
- **Role:** [Who they are]
- **Goal:** [What they're trying to accomplish]
- **Technical Comfort:** [Low / Medium / High]
- **Key Workflows:** [What they'll do in the system, step by step]
- **Pain Points:** [What's frustrating about their current process]

[Repeat for each persona]

## 5. Competitive & Design References

| Reference | URL | What to Emulate | What to Avoid |
|-----------|-----|-----------------|---------------|
| [Competitor/Inspiration] | [URL] | [Specific element] | [Specific element] |

## 6. Technical Constraints & Existing Infrastructure

### Existing Stack
- **Frontend:** [Framework, hosting]
- **Backend:** [Language, framework]
- **Database:** [Type, hosting]
- **Hosting:** [Provider, plan]
- **Domain:** [Domain name, registrar]
- **Integrations:** [Current third-party services]

### Constraints
- [Hard constraint — e.g., "Must run on existing Hetzner VPS"]
- [Budget constraint — e.g., "No paid API services over $50/month"]
- [Timeline constraint — e.g., "MVP by [date]"]

## 7. Assets & Materials

| Asset | Status | Location/Notes |
|-------|--------|----------------|
| Logo / Brand kit | [Available / Needed] | [Where it is or what's needed] |
| Copy / Content | [Available / Needed] | ... |
| Photography / Media | [Available / Needed] | ... |
| Existing database / data | [Available / Needed] | ... |

## 8. Delivery Phases & Timeline

### Phase 1: [Phase Name] — [Target Date]
**Deliverables:**
- [Specific deliverable tied to Feature IDs]
- [Another deliverable]

**Milestone Criteria:** [How we know this phase is complete]

### Phase 2: [Phase Name] — [Target Date]
[Same structure]

## 9. Commercial Terms (if applicable)

[Pricing model, payment schedule, ownership terms — or reference separate agreement]

## 10. Assumptions & Dependencies

- [Assumption about client availability, content delivery, access, etc.]
- [External dependency — e.g., "Stripe account must be active before Phase 2"]

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk description] | Low/Med/High | Low/Med/High | [How to prevent or respond] |

## 12. Sign-Off

By confirming this SOW, the stakeholder agrees that the scope, features, and phases described above accurately represent the intended project.

- [ ] **SOW Confirmed** — [Name] — [Date]
```

## Guidance for SOW Generation

- Write for a non-technical reader who needs to make business decisions. No jargon unless defined.
- Every feature MUST have a unique ID (F-001, F-002, etc.) — these trace forward into the spec.
- Acceptance criteria should be binary: you can test it and say yes or no.
- The "Out of Scope" section is as important as the feature set. Be explicit.
- If the user provides rough notes, transform them into structured entries. Don't ask them to fill in a form.
- For solo/indie projects where the user is both client and builder, lighten the commercial and sign-off sections but keep the rigor everywhere else.
