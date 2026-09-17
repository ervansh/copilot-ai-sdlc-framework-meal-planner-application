---

name: task-implementation
description: "Reusable methodology for implementing one approved software implementation task at a time. Use when executing a task from an approved implementation plan, checking dependencies, making scoped code changes, adding tests, running verification, recording evidence, and preparing the task for human acceptance."
-----------

# Task Implementation Skill

## Purpose

Provide a repeatable methodology for executing one approved implementation
task.

This skill defines HOW implementation work should be performed.

It does not define the Implementation Engineer persona.

It does not authorize implementation without an approved plan.

## Implementation Method

### Step 1 — Verify Gates

Confirm:

* requirements are approved
* architecture is approved
* design review passed
* implementation plan is approved
* requested task exists
* requested task is READY
* all task dependencies are DONE

Stop if a required gate fails.

### Step 2 — Read the Task Completely

Understand:

* objective
* requirements
* architecture references
* dependencies
* implementation scope
* test expectations
* completion criteria
* risks

Do not implement before understanding the full task.

### Step 3 — Inspect Existing Code

Search and read the relevant application files.

Determine:

* existing implementation
* existing tests
* integration boundaries
* files likely to change

Do not assume a file is absent without checking.

### Step 4 — Define the Smallest Valid Change

Implement only what the task requires.

Avoid:

* future-task work
* architecture redesign
* unrelated cleanup
* speculative abstractions
* unapproved features

Small supporting changes are allowed when strictly required for compilation or
integration.

### Step 5 — Implement Against Approved Contracts

Follow:

* requirement behavior
* architecture boundaries
* ADR decisions
* task completion criteria

Do not duplicate authoritative business rules in unrelated layers.

### Step 6 — Add Task-Level Tests

Add tests for the behavior implemented by the task.

Tests should cover applicable:

* happy path
* validation path
* failure path
* boundary condition
* state-integrity behavior

Use the task's Test Expectations as the minimum requirement.

### Step 7 — Run Focused Verification

Run the narrowest useful checks first.

Examples:

* specific test file
* relevant test group
* type check
* build
* lint

Fix task-scope failures and rerun.

### Step 8 — Run Completion Verification

Before declaring the task implemented, run all checks required by the task's
Completion Criteria.

Never report a verification command as successful unless it actually passed.

### Step 9 — Review the Diff

Check for:

* unrelated changes
* missing tests
* debug code
* duplicated business rules
* accidental architecture violations
* unnecessary dependencies
* secrets or credentials
* weak error handling

Remove unrelated changes.

### Step 10 — Record Evidence

Record:

* changed files
* verification commands
* verification results
* deviations
* known issues

Implementation evidence must reflect actual execution.

### Step 11 — Stop for Human Acceptance

Implementation success does not automatically make the plan task DONE.

The task must remain pending until explicit human acceptance.

Do not start another task automatically.

## Failure Rule

If the task cannot be completed safely:

* stop
* report the blocker
* preserve existing valid behavior
* do not fabricate success
* do not silently change earlier SDLC decisions

## Quality Checklist

Before task handoff confirm:

* scope matches the requested task
* requirements were followed
* architecture was followed
* dependencies were respected
* tests were added where required
* verification actually ran
* results are recorded
* no unrelated functionality was introduced
* task is ready for human acceptance
