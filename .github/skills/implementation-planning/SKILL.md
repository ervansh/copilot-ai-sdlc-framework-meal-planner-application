---

name: implementation-planning
description: "Reusable methodology for converting approved software requirements and architecture into a dependency-ordered implementation plan. Use when decomposing work into concrete tasks, defining dependencies, priorities, test expectations, completion criteria, blockers, implementation sequence, and requirement traceability before coding begins."
--------------------------------------------------

# Implementation Planning Skill

## Purpose

Provide a repeatable method for converting approved design into executable
implementation work.

This skill defines HOW implementation planning should be performed.

It does not define the Implementation Planner persona.

It does not perform implementation.

## Planning Method

### Step 1 — Verify SDLC Gates

Confirm:

* requirements are approved
* architecture is approved
* latest Design Review permits implementation planning
* no unresolved major design findings remain

Stop when a required gate has not passed.

### Step 2 — Extract Implementation Obligations

Identify implementation obligations from:

* FR requirements
* NFR requirements
* acceptance criteria
* validation rules
* architecture components
* architecture decisions
* design-review conclusions

Do not plan features outside approved scope.

### Step 3 — Identify Foundational Work

Find work that other implementation depends on.

Examples may include:

* project/tooling initialization
* core domain contracts
* catalogue schema
* state contracts
* persistence contracts

Only include foundations justified by approved architecture.

### Step 4 — Decompose by Coherent Outcome

Create tasks that produce concrete implementation outcomes.

Each task should have:

* one clear objective
* bounded implementation scope
* clear dependencies
* clear test expectations
* objective completion criteria

Avoid giant multi-feature tasks.

Avoid meaningless microtasks.

### Step 5 — Establish Dependencies

For every task determine what must exist first.

Represent dependencies using task IDs.

Prefer dependency order over arbitrary chronological ordering.

### Step 6 — Assign Priority

Use:

* P0 for foundational work
* P1 for required MVP behavior
* P2 for required supporting hardening or verification preparation

Priority does not replace dependency relationships.

### Step 7 — Plan Testing With Implementation

For every task identify appropriate tests.

Do not postpone all testing until the end.

Separate where useful:

* unit tests
* component tests
* integration tests
* browser workflows
* persistence tests
* accessibility checks
* responsive checks
* performance verification

### Step 8 — Preserve Traceability

Map each:

* FR
* NFR
* AC

to one or more tasks.

Also map important architecture components and ADRs to implementation tasks.

Unmapped requirements must remain visible as planning defects.

### Step 9 — Identify Blockers

Mark a task `BLOCKED` only when work cannot safely begin.

Document:

* blocker
* source
* required resolution

A normal dependency on another planned task does not automatically mean the
task is blocked.

### Step 10 — Define Completion Criteria

Each task must have objective completion criteria.

Good completion criteria describe:

* implemented behavior
* test status
* integration expectations
* documentation or configuration outcome where relevant

Avoid subjective completion criteria such as:

"Looks good."

### Step 11 — Build Execution Sequence

Order tasks based on dependencies.

Identify safe parallel work only where tasks do not depend on unfinished shared
contracts.

### Step 12 — Review Plan Completeness

Before handoff verify:

* every requirement is covered
* every acceptance criterion is covered
* architecture decisions are represented
* tests are planned
* blockers are explicit
* sequence is dependency-correct
* no application code was written

## Task Quality Checklist

A valid implementation task should answer:

* What will be implemented?
* Why is it required?
* Which requirements does it satisfy?
* Which architecture decision does it follow?
* What does it depend on?
* How will it be tested?
* How will completion be determined?

If those answers are unclear, refine the task.

## Human Boundary

Implementation Planning does not authorize implementation.

The final plan must remain:

`DRAFT — PENDING HUMAN APPROVAL`

until a human explicitly approves it.
