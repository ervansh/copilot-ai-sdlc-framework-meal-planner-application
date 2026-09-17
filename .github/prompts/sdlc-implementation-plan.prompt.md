# SDLC Implementation Planning — Meal Planner

Application:

`meal-planner/`

Current SDLC stage:

`Implementation Planning`

Use the `implementation-planner` custom agent.

Apply the project's `implementation-planning` methodology when relevant.

## Source Artifacts

Read completely:

`meal-planner/docs/sdlc/requirements.md`

`meal-planner/docs/sdlc/architecture.md`

`meal-planner/docs/sdlc/design-review.md`

## Entry Gate

Before planning implementation, read all three source artifacts completely.

### Requirements Gate

From:

`meal-planner/docs/sdlc/requirements.md`

verify:

`Requirements Status: APPROVED`

The requirements artifact is the authoritative source for Requirements
Approval.

### Architecture Gate

From:

`meal-planner/docs/sdlc/architecture.md`

verify:

`Architecture Status: APPROVED`

and:

`Architecture Approval: APPROVED`

The architecture artifact is the authoritative source for human Architecture
Approval.

### Design Review Gate

From:

`meal-planner/docs/sdlc/design-review.md`

verify:

`Review Outcome: PASS`

and verify that no unresolved BLOCKER or MAJOR findings remain.

The Design Review artifact is the authoritative source for independent review
outcome.

IMPORTANT:

Do not require `design-review.md` to say:

`Architecture Approval: APPROVED`

The Design Reviewer is not authorized to approve architecture.

A successful Design Review may historically contain:

`Architecture Approval: PENDING HUMAN APPROVAL`

That is valid because human approval occurs after Design Review.

If `architecture.md` subsequently records explicit human Architecture Approval,
that later approval satisfies the Architecture Approval gate.

Do not modify `design-review.md` merely to reflect later human approval.

## Complete Gate Condition

Implementation Planning may proceed only when:

- Requirements Status = APPROVED
- Architecture Status = APPROVED
- Architecture Approval = APPROVED
- latest Design Review Outcome = PASS
- no unresolved BLOCKER findings remain
- no unresolved MAJOR findings remain

If any condition fails:

1. identify the failed condition
2. identify its authoritative artifact
3. do not create `impl-plan.md`
4. stop

Never infer approval.

## Target Artifact

Create:

`meal-planner/docs/sdlc/impl-plan.md`

## Planning Task

Create a complete, dependency-ordered implementation plan for the approved Meal
Planner MVP.

Do not implement the application.

Do not write production code.

Do not write test code.

Do not change approved requirements or architecture.

## Required Planning Coverage

The plan must cover all implementation work required by the approved artifacts,
including where applicable:

* project and tooling setup
* application structure
* domain types and contracts
* recipe catalogue contract
* recipe catalogue data
* catalogue validation
* ingredient normalization and equivalence
* preference validation
* recipe eligibility
* weekly meal-plan generation
* bounded/asynchronous generation behavior
* generation failure outcomes
* meal replacement
* application state coordination
* immutable generation preference snapshots
* stale-plan behavior
* dirty-state behavior
* local persistence
* save workflow
* restore workflow
* corrupt-storage handling
* weekly plan UI
* daily plan view
* recipe details
* preference UI
* confirmation flows
* validation/error messages
* loading/progress behavior
* responsive design
* accessibility behavior
* unit testing
* integration testing
* browser workflow testing
* persistence testing
* accessibility testing
* responsive testing
* performance verification preparation

Derive the actual tasks from the approved requirements and architecture.

Do not create tasks for out-of-scope features.

## Task Format

Use stable task identifiers:

`IMP-001`

`IMP-002`

and so forth.

Every task must contain:

### Objective

### Requirements

Include relevant FR, NFR, and AC identifiers.

### Architecture References

Include relevant components, architecture sections, and ADRs.

### Dependencies

Use task IDs or:

`None`

### Priority

Use:

`P0`

`P1`

or:

`P2`

### Status

Use:

`READY`

or:

`BLOCKED`

### Implementation Scope

### Test Expectations

### Completion Criteria

### Risks / Notes

## Dependency Planning

Order foundational contracts before dependent implementation.

Do not order tasks solely by requirement number.

Identify where tasks can safely run in parallel.

Do not claim parallel execution where tasks depend on the same unfinished
contract.

## Testing Rule

Testing must be planned alongside implementation.

Do not create only one generic final testing task.

Each behavior-oriented implementation task must identify the relevant tests
needed for that task.

Dedicated integration/browser/performance verification preparation tasks may
also be included.

## Traceability

Create explicit mappings for every:

FR-001 through FR-019

NFR-001 through NFR-005

AC-001 through AC-024

Each must map to at least one implementation task.

Also map relevant:

ADR-001 through the latest approved ADR

to appropriate tasks.

Do not use one blanket traceability row.

## Blockers

If no task is currently blocked, write:

`No implementation tasks are blocked.`

If a genuine blocker exists, identify:

* affected task
* blocking issue
* source artifact
* required resolution

Do not silently resolve a requirement or architecture ambiguity.

## Implementation Plan Structure

Create:

# Meal Planner Implementation Plan

## Metadata

## Planning Summary

## Source Artifacts

## Implementation Strategy

## Dependency Overview

## Implementation Tasks

## Blocked Tasks

## Requirement and Acceptance-Criteria Traceability

## Architecture Traceability

## Testing Strategy

## Recommended Execution Sequence

## Parallelization Opportunities

## Implementation Risks

## Plan Review Checklist

## Approval

## Plan Status

Use:

`Implementation Plan Status: DRAFT — PENDING HUMAN APPROVAL`

The planner must not approve its own plan.

## Completion

After writing the plan, report:

* total tasks
* READY tasks
* BLOCKED tasks
* P0 tasks
* P1 tasks
* P2 tasks
* major workstreams
* requirement traceability status
* architecture traceability status
* whether the plan is ready for human review

Then stop.

Do not begin implementation.
