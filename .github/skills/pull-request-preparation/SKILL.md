---
name: pull-request-preparation
description: >
  Reusable methodology for preparing a completed and verified software change
  for pull request review, including lifecycle gate checks, Git safety,
  changelog preparation, PR summaries, test evidence, known limitations,
  reviewer checklists, safe commit/push operations, and pull request creation.
---

# Pull Request Preparation Skill

## Purpose

Provide a repeatable method for turning completed and verified software work
into a review-ready pull request.

This skill defines HOW Pull Request Preparation is performed.

It does not implement product changes.

It does not merge pull requests.

## Method

### Step 1 — Verify Lifecycle Gates

Confirm:

- requirements approved
- architecture approved
- design review passed
- implementation plan approved
- implementation complete
- code review passed
- final verification permits PR preparation

Stop if a required gate fails.

### Step 2 — Inspect Repository State

Check:

- current branch
- default branch
- remote
- staged changes
- unstaged changes
- untracked files
- existing commits

Do not discard user work.

### Step 3 — Isolate the Change Safely

Use an existing non-default working branch when appropriate.

If currently on the default branch, create a purpose-specific feature branch.

Never overwrite or force-update another branch.

### Step 4 — Prepare the Changelog

Summarize completed product behavior.

Use verified evidence.

Record actual known limitations.

Do not invent versions or dates when they are not part of the release process.

### Step 5 — Prepare the PR Narrative

Create:

- Summary
- Changes Made
- Test Evidence
- Known Limitations
- Reviewer Checklist

The PR should help a reviewer understand both product behavior and verification
evidence without reading every SDLC artifact first.

### Step 6 — Review the Diff

Inspect:

- Git diff
- whitespace errors
- unexpected generated files
- secrets
- unrelated modifications
- stale temporary files

Do not use PR preparation as an excuse for unrelated cleanup.

### Step 7 — Commit Safely

Stage only relevant files.

Use an informative commit message.

Do not rewrite existing commit history without explicit instruction.

### Step 8 — Push Safely

Use a normal push.

Set upstream where needed.

Never force push.

### Step 9 — Create the Pull Request

Determine the actual base and head branches.

Create the PR with an explicit:

- title
- base
- head
- body

Do not merge it.

### Step 10 — Verify Remote PR State

Confirm:

- PR exists
- PR number
- PR URL
- PR state
- head branch
- base branch

Do not infer creation success from command intent alone.

### Step 11 — Record Evidence

Record PR metadata in the SDLC evidence artifact.

Keep known limitations visible.

### Step 12 — Stop for Human Review

The PR is a human-review gate.

Do not merge automatically.

Final state:

`PULL REQUEST CREATED — READY FOR HUMAN REVIEW`