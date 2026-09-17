---

name: code-review
description: "Reusable independent software code-review methodology for checking completed implementation against approved requirements and architecture, including correctness, security, error handling, tests, maintainability, duplication, dependency safety, and scope compliance before final verification."
------------------------------------------------------------------

# Code Review Skill

## Purpose

Provide a repeatable methodology for independent review of completed software
implementation.

This skill defines HOW Code Review is performed.

It does not implement fixes.

## Review Method

### Step 1 — Verify Review Preconditions

Confirm:

* requirements approved
* architecture approved
* design review passed
* implementation plan approved
* implementation tasks complete

Do not review incomplete implementation as if it were final.

### Step 2 — Establish the Review Baseline

Read:

* requirements
* architecture
* implementation plan
* implementation evidence

Identify the approved behaviors and architectural constraints before inspecting
code.

### Step 3 — Inspect Actual Implementation

Review source code directly.

Do not rely only on implementation summaries or test counts.

Trace important behaviors from:

input
→ validation
→ domain behavior
→ state
→ persistence/presentation

where relevant.

### Step 4 — Review Correctness

Look for:

* missing requirement behavior
* incorrect edge cases
* invariant violations
* partial-success behavior where all-or-nothing is required
* stale-state errors
* mutation errors
* unsafe fallback behavior

### Step 5 — Review Architecture Compliance

Check component ownership and ADR compliance.

Flag business rules implemented in inappropriate layers when this creates
correctness or maintenance risk.

### Step 6 — Review Failure Handling

Exercise important failure paths.

Check that semantically different failures remain distinguishable.

Ensure failures preserve valid state where required.

### Step 7 — Review Security and Privacy

Evaluate the real application threat surface.

Check inputs, outputs, persistence, dependencies, secrets, and external
communications.

Do not invent controls irrelevant to the architecture.

### Step 8 — Review Tests

Inspect test assertions and coverage quality.

Verify important behavior is actually asserted.

Do not equate high test count with strong test quality.

### Step 9 — Review Maintainability

Evaluate:

* readability
* responsibilities
* duplication
* type modeling
* unnecessary complexity
* mutation
* coupling

Avoid purely stylistic findings without meaningful impact.

### Step 10 — Review Dependencies

Inspect dependency declarations and available audit evidence.

Distinguish:

* runtime dependencies
* development tooling
* exploitable application risk
* advisory-only tooling risk

Do not force dependency upgrades during review.

### Step 11 — Verify Scope

Ensure implementation contains only approved functionality.

Report unapproved scope expansion.

### Step 12 — Execute Independent Checks

Run appropriate:

* tests
* lint
* type check
* build
* browser tests
* dependency audit

Record actual results.

### Step 13 — Classify Findings

Use:

* BLOCKER
* MAJOR
* MINOR
* OBSERVATION

Severity must reflect impact, not personal preference.

### Step 14 — Determine Outcome

`PASS`

when no required correction remains.

`PASS WITH MINOR CHANGES`

when only required minor corrections remain.

`REWORK REQUIRED`

when BLOCKER or MAJOR findings exist.

### Step 15 — Stop at the Gate

Do not fix production code as the independent reviewer.

Return required corrections to Implementation.

Do not perform final Verification.
