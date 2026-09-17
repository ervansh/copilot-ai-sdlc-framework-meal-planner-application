# SDLC Final Verification — Meal Planner

Application:

`meal-planner/`

Current SDLC stage:

`Final Verification`

Use the `verification-engineer` custom agent.

Apply the project's `final-verification` methodology.

## Source Artifacts

Read completely:

`meal-planner/docs/sdlc/requirements.md`

`meal-planner/docs/sdlc/architecture.md`

`meal-planner/docs/sdlc/design-review.md`

`meal-planner/docs/sdlc/impl-plan.md`

`meal-planner/docs/sdlc/implementation-log.md`

`meal-planner/docs/sdlc/code-review.md`

Also inspect application source, tests, configuration, and package manifests as
required for verification.

## Entry Gate

Verify:

* Requirements Status = APPROVED
* Architecture Status = APPROVED
* Architecture Approval = APPROVED
* latest Design Review Outcome = PASS
* Implementation Plan Status = APPROVED
* IMP-001 through IMP-015 = DONE
* Code Review Outcome = PASS
* Final Verification = ALLOWED

Use:

`architecture.md`

as the authoritative source for final Architecture Approval.

Use:

`code-review.md`

as the authoritative source for Code Review outcome and Final Verification
gate.

Do not use historical pre-approval architecture metadata from design-review.md
to fail the gate.

If any gate fails:

1. identify the failed gate
2. identify the authoritative artifact
3. do not create final verification results
4. stop

## Verification Objective

Independently verify that the completed Meal Planner satisfies the approved
software contract and is ready for Pull Request Preparation.

Do not implement fixes.

Do not create new functionality.

Do not alter tests to force successful verification.

## Requirements Verification

Verify individually:

FR-001 through FR-019

NFR-001 through NFR-005

AC-001 through AC-024

For every item record:

* evidence
* result

Use:

`PASS`

`FAIL`

or:

`NOT VERIFIED`

Do not collapse requirement ranges into one verification result.

## Product Verification

Verify actual evidence for:

* preference configuration
* weekly generation
* 21 fixed meal assignments
* meal-type compatibility
* dietary restrictions
* allergens
* excluded ingredients
* ingredient equivalence
* no duplicate recipes
* complete-plan failure
* weekly view
* daily view
* recipe details
* save/restore
* individual replacement
* stale-plan behavior
* preference changes
* explicit regeneration
* confirmation behavior
* corrupt persistence handling
* responsive layouts
* practical accessibility
* loading/progress behavior
* generation performance

## Independent Commands

Inspect current package scripts first.

Run appropriate existing commands for:

* complete Vitest suite
* complete browser workflow suite
* lint
* TypeScript check
* production build
* dependency audit

Where practical verify application startup.

Record:

* exact command
* PASS/FAIL
* actual counts/results

Do not claim browsers were executed unless they actually were.

## Browser Evidence

Record the browser actually exercised.

Record the viewports actually exercised.

Current historical implementation evidence includes Google Chrome browser
execution at representative:

* desktop
* tablet
* mobile

Reverify current browser tests.

Do not turn historical execution claims for Firefox, Edge, or Safari into
current verified coverage unless those browsers are actually run.

## Performance Verification

Verify current evidence for:

* normal real-catalogue generation timing
* three-second normal expectation
* node-budget failure
* active-time-budget failure
* distinction between budget exhaustion and infeasibility
* loading/yield behavior
* previous-plan preservation on failed regeneration

Do not fabricate slow browser execution merely to make loading visible.

Deterministic verification of delayed/yield behavior is valid when properly
tested.

## Dependency Audit

Run a non-destructive dependency audit.

Do not run:

`npm audit fix --force`

Record known findings accurately.

Determine whether findings affect:

* production runtime
* development tooling

Do not remediate dependencies during Final Verification.

## Documentation Verification

Check that:

* requirements remain approved
* architecture remains approved
* design review remains PASS
* implementation plan remains approved
* IMP-001 through IMP-015 remain DONE
* code review remains PASS
* implementation evidence is present
* known dependency findings remain documented
* browser coverage is not overstated
* verification counts are internally consistent

## Verification Issues

Use IDs:

`FV-001`

`FV-002`

and so on.

Severity:

* BLOCKER
* MAJOR
* MINOR
* OBSERVATION

Each issue must contain:

* Severity
* Area
* Evidence
* Issue
* Impact
* Required Action / Recommendation

## Final Outcome

Use exactly one:

`PASS`

`PASS WITH OBSERVATIONS`

or:

`FAIL`

PASS requires all required FR/NFR/AC items to be verified successfully.

PASS WITH OBSERVATIONS requires all required FR/NFR/AC items to pass while only
non-blocking observations remain.

FAIL applies when required behavior fails or remains materially unverified.

## Target Artifact

Create:

`meal-planner/docs/sdlc/verification.md`

Do not modify production source or tests.

## Pull Request Gate

If outcome is PASS or PASS WITH OBSERVATIONS:

`Pull Request Preparation: ALLOWED`

If outcome is FAIL:

`Pull Request Preparation: BLOCKED`

Do not create the Pull Request.

## Completion

Report:

* FR PASS count
* FR FAIL count
* FR NOT VERIFIED count
* NFR PASS count
* NFR FAIL count
* NFR NOT VERIFIED count
* AC PASS count
* AC FAIL count
* AC NOT VERIFIED count
* BLOCKER count
* MAJOR count
* MINOR count
* OBSERVATION count
* commands executed
* Final Verification outcome
* Pull Request Preparation status

Stop.

Do not begin Pull Request Preparation.