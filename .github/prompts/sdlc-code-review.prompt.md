# SDLC Code Review — Meal Planner

Application:

`meal-planner/`

Current SDLC stage:

`Code Review`

Use the `code-reviewer` custom agent.

Apply the project's `code-review` methodology.

## Source Artifacts

Read:

`meal-planner/docs/sdlc/requirements.md`

`meal-planner/docs/sdlc/architecture.md`

`meal-planner/docs/sdlc/design-review.md`

`meal-planner/docs/sdlc/impl-plan.md`

`meal-planner/docs/sdlc/implementation-log.md`

Also inspect:

`meal-planner/src/`

`meal-planner/tests/`

and project configuration/dependency files.

## Entry Gate

Verify:

* Requirements Status = APPROVED
* Architecture Status = APPROVED
* Architecture Approval = APPROVED
* latest Design Review Outcome = PASS
* Implementation Plan Status = APPROVED
* every IMP-001 through IMP-015 task = DONE

Use:

`architecture.md`

as the source of truth for final Architecture Approval.

Do not use historical pre-approval architecture metadata from:

`design-review.md`

to fail the gate.

If implementation is incomplete:

1. identify the incomplete task
2. do not create a final Code Review outcome
3. stop

## Review Objective

Perform an independent review of the completed Meal Planner implementation.

Do not trust implementation summaries alone.

Inspect source code and tests.

Do not modify production code.

## Required Review Checklist

Review:

### Correctness

* requirements behavior
* restriction enforcement
* complete-plan invariants
* generation failure behavior
* replacement behavior
* persistence
* stale state
* dirty state
* regeneration

### Security

* input handling
* unsafe rendering
* localStorage validation
* secrets
* unexpected external calls
* dependency exposure

### Error Handling

* invalid/missing data
* impossible plans
* search-budget failures
* replacement failures
* corrupt persistence
* storage failures
* failed regeneration

### Tests

Inspect actual assertions for:

* happy paths
* invalid data
* missing data
* restriction failures
* generation
* replacement
* persistence
* state transitions
* browser workflows

### Code Clarity

Review:

* responsibilities
* naming
* type safety
* complexity
* mutation
* coupling

### DRY

Identify meaningful duplicate business logic.

Do not raise stylistic duplication without concrete maintenance/correctness
impact.

### Dependency Safety

Inspect:

* package.json
* lock file
* npm audit results

Specifically review the documented moderate development-tooling findings
involving `@vitest/mocker`.

Do not run destructive forced remediation.

### Scope

Verify no unapproved features were added.

## Independent Verification

Run appropriate current project commands for:

* Vitest
* browser tests
* lint
* TypeScript check
* production build
* npm audit

Record exact results.

Do not claim cross-browser execution that was not performed.

## Findings

Use:

`CR-001`

`CR-002`

etc.

Each finding contains:

* Severity
* Area
* Evidence
* Issue
* Impact
* Recommendation

Severity:

* BLOCKER
* MAJOR
* MINOR
* OBSERVATION

## Outcome

Use exactly:

`PASS`

`PASS WITH MINOR CHANGES`

or:

`REWORK REQUIRED`

Rules:

* any BLOCKER or MAJOR → REWORK REQUIRED
* only required MINOR findings → PASS WITH MINOR CHANGES
* no required corrections → PASS

## Target Artifact

Create:

`meal-planner/docs/sdlc/code-review.md`

Do not modify production source or tests during independent review.

## Verification Gate

If PASS:

`Final Verification: ALLOWED`

If PASS WITH MINOR CHANGES:

`Final Verification: BLOCKED PENDING REQUIRED MINOR CHANGES`

If REWORK REQUIRED:

`Final Verification: BLOCKED`

## Completion

Report:

* BLOCKER count
* MAJOR count
* MINOR count
* OBSERVATION count
* commands executed
* Code Review outcome
* required actions
* whether Final Verification is allowed

Stop.

Do not begin Verification.