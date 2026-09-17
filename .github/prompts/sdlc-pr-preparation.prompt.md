# SDLC Pull Request Preparation — Meal Planner

Application:

`meal-planner/`

Current SDLC stage:

`Pull Request Preparation`

Use the `pr-preparer` custom agent.

Apply the project's `pull-request-preparation` methodology.

## Source Artifacts

Read completely:

`meal-planner/docs/sdlc/requirements.md`

`meal-planner/docs/sdlc/architecture.md`

`meal-planner/docs/sdlc/design-review.md`

`meal-planner/docs/sdlc/impl-plan.md`

`meal-planner/docs/sdlc/implementation-log.md`

`meal-planner/docs/sdlc/code-review.md`

`meal-planner/docs/sdlc/verification.md`

Also inspect current Git repository state.

## Entry Gate

Verify:

- Requirements Status = APPROVED
- Architecture Status = APPROVED
- Architecture Approval = APPROVED
- Design Review Outcome = PASS
- Implementation Plan Status = APPROVED
- IMP-001 through IMP-015 = DONE
- Code Review Outcome = PASS
- Final Verification Outcome = PASS or PASS WITH OBSERVATIONS
- Pull Request Preparation = ALLOWED

Use:

`architecture.md`

as the authoritative source for final human Architecture Approval.

Use:

`verification.md`

as the authoritative source for Final Verification and PR Preparation gate.

If any gate fails:

1. identify the failed gate
2. identify the authoritative artifact
3. do not create the pull request
4. stop

## Repository Checks

Before changing Git state run appropriate checks for:

- git status
- current branch
- default/base branch
- origin remote
- GitHub CLI availability
- GitHub CLI authentication

Do not assume the default branch is `main`.

Do not expose authentication information in output.

## Branch Rule

If currently on a non-default branch containing the completed Meal Planner
work, use that branch.

If currently on the default branch, create:

`feature/meal-planner-mvp`

if available.

Never overwrite an existing branch.

Never force push.

## Changelog

Create or update:

`meal-planner/CHANGELOG.md`

Use:

# Changelog

## Unreleased

### Added

Summarize the delivered Meal Planner MVP.

### Verification

Use only final verified results.

### Known Limitations

Include actual non-blocking observations.

Do not invent a release number.

## PR Evidence

Create:

`meal-planner/docs/sdlc/pull-request.md`

Include:

# Meal Planner Pull Request Preparation

## Metadata
## Repository State
## Summary
## Changes Made
## Test Evidence
## Known Limitations
## Reviewer Checklist
## Pull Request Status

## Required PR Body

The actual pull request body must contain:

## Summary

## Changes Made

## Test Evidence

## Known Limitations

## Reviewer Checklist

## Test Evidence

Use the current Final Verification artifact.

Current verified evidence must be taken from:

`meal-planner/docs/sdlc/verification.md`

Do not invent counts.

## Known Observation

Preserve the Final Verification observation concerning the moderate
development-tooling advisory involving:

`@vitest/mocker`

Do not describe it as a production runtime vulnerability if verification says
otherwise.

Preserve actual browser-execution limitations accurately.

## Reviewer Checklist

Include checkboxes for review of:

- requirements
- architecture
- restrictions
- generation
- replacement
- persistence
- state/regeneration
- UI/accessibility/responsiveness
- automated verification
- known dependency observation
- scope compliance

## Git Safety

Before committing inspect:

- git diff
- git diff --check
- git status

Do not commit:

- credentials
- tokens
- temporary files
- build artifacts that are not part of the repository
- unrelated user changes

## Commit and Push

Commit only relevant completed work.

Use a descriptive commit message.

Push normally.

Never force push.

## Create Pull Request

Use the actual detected base and head branches.

Use title:

`feat: add Meal Planner MVP with Agentic SDLC`

unless repository context clearly requires a more precise equivalent.

Create a ready-for-review PR.

Do not create a draft unless explicitly requested.

Do not merge.

After creation verify the PR exists and record:

- PR number
- PR URL
- state
- head
- base

Update:

`meal-planner/docs/sdlc/pull-request.md`

with the final PR metadata.

Commit/push the metadata update if needed.

## Completion

Report:

- lifecycle gates
- branch
- base branch
- Git status
- commit
- push status
- PR title
- PR number
- PR URL
- PR state
- Final Verification outcome
- known limitations included

Finish with:

`SDLC Status: PULL REQUEST CREATED — READY FOR HUMAN REVIEW`

Stop.

Do not merge the pull request.