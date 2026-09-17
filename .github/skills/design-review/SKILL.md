---
name: design-review
description: >
  Reusable methodology for independently reviewing software architecture.
  Use when evaluating architecture against approved requirements, reviewing
  technology choices and component boundaries, assessing persistence,
  security, performance, reliability and testability, identifying design
  risks, classifying findings, and determining design-review readiness.
---

# Design Review Skill

## Purpose

Provide a repeatable methodology for independent software architecture review.

This skill defines HOW architecture reviews are performed.

It does not define the Design Reviewer persona.

It does not approve architecture.

## Review Method

### Step 1 — Verify Inputs

Confirm:

- requirements exist
- requirements are approved
- architecture exists
- architecture is awaiting design review

Stop if the required gate has not passed.

### Step 2 — Review Requirement Coverage

Compare architecture against:

- functional requirements
- non-functional requirements
- acceptance criteria
- explicit scope boundaries

Verify actual coverage rather than trusting existing traceability.

### Step 3 — Review Architectural Fit

Evaluate:

- architecture style
- complexity
- technology choices
- deployment model

Determine whether the architecture is appropriately simple while still
satisfying requirements.

### Step 4 — Review Responsibilities

Evaluate component boundaries and identify:

- overlapping ownership
- missing ownership
- duplicated business rules
- inappropriate coupling

Important rules should have a clear authoritative owner.

### Step 5 — Review Data and State

Evaluate whether the model supports:

- required entities
- lifecycle
- persistence
- invalid state prevention
- stale state
- dirty state

### Step 6 — Review Key Flows

Check normal and failure paths for important user workflows.

Verify that failures are safe and non-destructive where required.

### Step 7 — Review Persistence

Evaluate:

- storage suitability
- data lifetime
- versioning
- restore validation
- corruption handling
- replacement semantics

### Step 8 — Review Security

Review the architecture's actual threat surface.

Avoid demanding controls unrelated to the approved scope.

### Step 9 — Review NFR Support

For each architecture-relevant NFR:

- verify a design mechanism exists
- verify responsibility is clear
- verify later measurement is possible

Architecture review does not verify runtime achievement.

### Step 10 — Review Testability

Determine whether critical logic can be tested independently.

Check that testing responsibilities are understandable and do not overlap
ambiguously.

### Step 11 — Review Decisions and Risks

Evaluate ADRs and architecture risks.

Significant decisions should include meaningful rationale and consequences.

Significant risks should include practical mitigations.

### Step 12 — Classify Findings

Use:

- BLOCKER
- MAJOR
- MINOR
- OBSERVATION

Each finding must be:

- specific
- evidence-based
- impact-oriented
- actionable

### Step 13 — Determine Outcome

Use:

`PASS`

when there are no BLOCKER or MAJOR findings.

Use:

`PASS WITH MINOR CHANGES`

when only MINOR findings require correction.

Use:

`REWORK REQUIRED`

when BLOCKER or MAJOR findings exist.

Review outcome is not human Architecture Approval.

## Review Quality Checklist

Before completing a review verify:

- all relevant requirements were considered
- traceability was checked
- major technology decisions were reviewed
- component ownership was reviewed
- persistence was reviewed
- important data flows were reviewed
- security was reviewed
- NFRs were reviewed
- reliability was reviewed
- testability was reviewed
- deployment consistency was reviewed
- ADRs were reviewed
- architecture risks were reviewed
- every finding has severity and evidence
- every required change is actionable

## Human Boundary

Design Review may determine that architecture is ready for approval.

Only a human may actually approve it.