# SDLC Implementation Task — Meal Planner

Application:

`meal-planner/`

Current SDLC stage:

`Implementation`

Use the `implementation-engineer` custom agent.

Apply the project's `task-implementation` methodology when relevant.

## Requested Task

The concrete implementation task ID must be supplied explicitly by the user in
the same chat request that runs this prompt.

Expected format:

`Task ID: IMP-###`

Example:

`Task ID: IMP-001`

Do not select a task automatically.

If no concrete task ID is supplied:

1. do not modify application code
2. ask for the task ID
3. stop

## Source Artifacts

Read:

`meal-planner/docs/sdlc/requirements.md`

`meal-planner/docs/sdlc/architecture.md`

`meal-planner/docs/sdlc/design-review.md`

`meal-planner/docs/sdlc/impl-plan.md`

Also follow:

`.github/copilot-instructions.md`

## Gate Source-of-Truth Rules

### Requirements

Authoritative artifact:

`meal-planner/docs/sdlc/requirements.md`

Required state:

`APPROVED`

### Architecture

Authoritative artifact:

`meal-planner/docs/sdlc/architecture.md`

Required states:

`Architecture Status: APPROVED`

and:

`Architecture Approval: APPROVED`

Do not use Architecture Status or Architecture Approval metadata from
`design-review.md` for this gate.

The Design Review artifact represents the state at review time and may contain
historical pre-approval architecture metadata.

### Design Review

Authoritative artifact:

`meal-planner/docs/sdlc/design-review.md`

Required result:

`Review Outcome: PASS`

There must be no unresolved BLOCKER or MAJOR findings.

Use `design-review.md` only for the independent review result and findings.

Do not require it to contain final human Architecture Approval.

### Implementation Plan

Authoritative artifact:

`meal-planner/docs/sdlc/impl-plan.md`

Required state:

`Implementation Plan Status: APPROVED`

### Task

The user must explicitly provide:

`Task ID: IMP-###`

The selected task must:

- exist in impl-plan.md
- have Status = READY
- have every dependency marked DONE

If Dependencies = None, the dependency gate passes.

## Execution Rules

Implement exactly the requested task.

Use the task's:

- Objective
- Requirements
- Architecture References
- Implementation Scope
- Test Expectations
- Completion Criteria

as the execution contract.

Do not:

- change approved requirements
- redesign approved architecture
- implement another IMP task
- add unapproved functionality
- weaken existing valid tests
- skip verification
- automatically mark the task DONE
- automatically start the next task

## Implementation Process

1. Read the requested task completely.
2. Inspect relevant existing application files.
3. Determine the minimum required changes.
4. Implement only the requested scope.
5. Add the required task-level tests.
6. Run focused verification.
7. Fix failures within current-task scope.
8. Run completion checks.
9. Review changes for scope drift.
10. Record implementation evidence.
11. Stop for human acceptance.

## Application Paths

Production source:

`meal-planner/src/`

Tests:

`meal-planner/tests/`

SDLC evidence:

`meal-planner/docs/sdlc/`

Do not create application source files at repository root.

## Implementation Evidence

Create or update:

`meal-planner/docs/sdlc/implementation-log.md`

For the task record:

- Task ID
- Execution Status
- Requirements
- Architecture References
- Files Added
- Files Modified
- Tests Added
- Verification Commands
- Verification Results
- Implementation Notes
- Deviations
- Known Issues

Use:

`Execution Status: IMPLEMENTED — PENDING HUMAN ACCEPTANCE`

after successful implementation and verification.

Do not change the task in impl-plan.md from READY to DONE automatically.

## Completion Response

Report:

- task ID
- files added
- files modified
- tests added
- commands actually executed
- verification results
- deviations
- known issues

Finish with:

`Task Execution Status: IMPLEMENTED — PENDING HUMAN ACCEPTANCE`

`Next Action: Human task acceptance`

Stop.