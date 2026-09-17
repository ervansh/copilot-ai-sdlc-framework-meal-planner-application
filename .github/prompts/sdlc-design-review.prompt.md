# SDLC Design Review — Meal Planner

Application:

`meal-planner/`

Current SDLC stage:

`Design Review`

Use the `design-reviewer` custom agent.

Apply the project's `design-review` methodology when relevant.

## Source Artifacts

Read completely:

`meal-planner/docs/sdlc/requirements.md`

and:

`meal-planner/docs/sdlc/architecture.md`

## Entry Gate

Verify:

- Requirements document status = APPROVED
- Requirements approval status = APPROVED
- Architecture status = DRAFT — PENDING DESIGN REVIEW
- Architecture approval is not already granted

If the gate has not passed:

1. explain what is blocking Design Review
2. do not create design-review.md
3. stop

## Target

Create:

`meal-planner/docs/sdlc/design-review.md`

## Review Task

Perform an independent senior architecture review.

Do not assume the architecture is correct because another Copilot agent created
it.

Review:

1. requirements coverage
2. architecture simplicity
3. technology choices
4. component boundaries
5. conceptual data model
6. key data flows
7. meal-plan generation design
8. meal replacement design
9. persistence
10. validation ownership
11. error handling
12. security and privacy
13. performance
14. accessibility
15. responsive design
16. reliability
17. data integrity
18. testability
19. deployment consistency
20. architecture decisions
21. requirement traceability
22. architecture risks

## Specific Review Checks

Pay particular attention to:

- whether the 21-slot generation design can detect impossible assignments
- whether hard dietary restrictions can ever be bypassed
- whether generation and replacement share one eligibility rule
- whether `localStorage` is sufficient for the approved persistence scope
- how corrupted or obsolete persisted state is handled
- whether preference edits can accidentally alter an existing plan
- whether the 3-second generation requirement has a reasonable architectural
  strategy
- whether responsive/accessibility requirements have clear architectural support
- whether testing-tool responsibilities are clearly separated
- whether architecture decisions are sufficiently justified
- whether every FR and NFR has a valid architectural home

## Findings

Use stable IDs:

`DR-001`

`DR-002`

...

Every finding must contain:

- Severity
- Area
- Evidence
- Issue
- Impact
- Recommendation

Severity must be one of:

- BLOCKER
- MAJOR
- MINOR
- OBSERVATION

Do not manufacture findings just to produce a larger review.

If an architecture area is satisfactory, say so.

## Review Outcome

Choose exactly one:

`PASS`

`PASS WITH MINOR CHANGES`

`REWORK REQUIRED`

Rules:

- Any BLOCKER or MAJOR finding => REWORK REQUIRED
- Only MINOR findings => PASS WITH MINOR CHANGES
- No required corrections => PASS

## Output Document

Create:

`meal-planner/docs/sdlc/design-review.md`

with:

# Meal Planner Design Review

## Metadata
## Review Scope
## Executive Summary
## Requirements Coverage Review
## Architecture Simplicity Review
## Technology Review
## Component Review
## Data Model Review
## Data Flow Review
## Generation Design Review
## Replacement Design Review
## Persistence Review
## Validation and Error Handling Review
## Security and Privacy Review
## Performance Review
## Accessibility and Responsive Design Review
## Reliability and Data Integrity Review
## Testability Review
## Deployment Review
## ADR Review
## Traceability Review
## Risk Review
## Findings
## Review Outcome
## Required Actions
## Human Approval Gate

## Approval Boundary

Do not approve architecture.

If Review Outcome is PASS:

Architecture Approval: PENDING HUMAN APPROVAL

If Review Outcome is PASS WITH MINOR CHANGES:

Architecture Approval: PENDING REQUIRED MINOR CHANGES

If Review Outcome is REWORK REQUIRED:

Architecture Approval: BLOCKED PENDING REWORK

## Completion

After creating the review, report:

- Review Outcome
- BLOCKER count
- MAJOR count
- MINOR count
- OBSERVATION count
- required changes
- whether human Architecture Approval is currently allowed

Then stop.

Do not create implementation tasks.

Do not modify application source code.

Do not proceed to Implementation Planning.