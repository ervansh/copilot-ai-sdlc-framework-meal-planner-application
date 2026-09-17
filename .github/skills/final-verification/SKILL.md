---

name: final-verification
description: "Reusable methodology for independently verifying a completed software product against approved requirements, non-functional requirements, acceptance criteria, implementation evidence, browser workflows, tests, performance, build quality, dependencies, and SDLC documentation before pull request preparation."
------------

# Final Verification Skill

## Purpose

Provide a repeatable method for final SDLC verification after implementation
and independent Code Review are complete.

This skill defines HOW final verification is performed.

It does not implement fixes.

It does not replace Code Review.

It does not create a pull request.

## Verification Method

### Step 1 — Verify Lifecycle Gates

Confirm:

* requirements approved
* architecture approved
* design review passed
* implementation plan approved
* implementation tasks complete
* Code Review passed
* Final Verification allowed

Stop if a required gate has not passed.

### Step 2 — Establish the Verification Contract

Extract:

* every FR
* every NFR
* every AC
* important architecture invariants
* implementation evidence
* Code Review observations

Use approved artifacts as the verification baseline.

### Step 3 — Inspect Actual Product Evidence

Use:

* source code where needed
* automated tests
* browser tests
* implementation evidence
* build results
* runtime/startup evidence

Do not rely on summaries alone.

### Step 4 — Execute Independent Regression

Run existing:

* unit/integration tests
* browser tests
* lint
* type checking
* production build
* appropriate dependency audit

Record actual results.

### Step 5 — Verify Requirements Individually

For each FR, NFR, and AC:

1. identify evidence
2. execute or inspect relevant verification
3. assign PASS, FAIL, or NOT VERIFIED

Never infer PASS from another requirement.

### Step 6 — Verify Cross-Component Workflows

Verify important end-to-end boundaries:

* preferences → generation
* generation → display
* replacement → state
* save → storage → restore
* preference change → stale plan
* regeneration → new generation snapshot
* failure → preservation of prior valid state

### Step 7 — Verify Failure Behavior

Exercise meaningful failures:

* invalid data
* insufficient candidates
* impossible plan
* search-budget exhaustion
* no replacement candidate
* corrupt persistence
* failed regeneration

Confirm failure is explicit and non-destructive where required.

### Step 8 — Verify NFR Evidence

Review:

* accessibility
* persistence
* integrity
* performance
* browser/responsive behavior

Do not overstate evidence.

### Step 9 — Verify Documentation Consistency

Check lifecycle artifacts for:

* status consistency
* traceability
* historical-state correctness
* known limitations
* accurate test/browser claims

Historical artifacts do not need to be rewritten simply because later gates
have completed.

### Step 10 — Classify Verification Issues

Use:

* BLOCKER
* MAJOR
* MINOR
* OBSERVATION

Only non-blocking limitations should be observations.

### Step 11 — Determine Outcome

Use:

`PASS`

when all required verification succeeds and no issue remains.

Use:

`PASS WITH OBSERVATIONS`

when all required behavior is verified but non-blocking limitations remain.

Use:

`FAIL`

when required verification fails or remains materially unverified.

### Step 12 — Stop at the Pull Request Gate

Verification does not create the pull request.

If verification passes, allow the PR Preparation stage.

If verification fails, return the work to the appropriate earlier SDLC stage.
