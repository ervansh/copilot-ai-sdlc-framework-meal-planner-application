# Meal Planner Agentic SDLC Retrospective

## Purpose

This document records the practical lessons learned while building and
exercising the Agentic SDLC framework using the Meal Planner application.

The value of the capstone was not only producing a working application.

The project exposed several framework, architecture, integration, and
verification issues that would have been difficult to identify in a purely
theoretical workflow.

---

# Final Outcome

The Meal Planner completed:

- Requirements Analysis
- Requirements Approval
- Architecture
- multiple Design Review iterations
- Architecture Approval
- Implementation Planning
- 15 implementation tasks
- human acceptance for implementation tasks
- independent Code Review
- Final Verification
- Pull Request Preparation

Final Code Review:

PASS

Final Verification:

PASS WITH OBSERVATIONS

Pull Request Preparation:

ALLOWED

Remote pull request creation was prepared but not completed in the available
environment.

---

# Final Verified Application

Final Verification confirmed:

- 19/19 functional requirements passed
- 5/5 non-functional requirements passed
- 24/24 acceptance criteria passed
- 94 Vitest tests passed
- 21 browser workflow tests passed
- lint passed
- TypeScript checks passed
- production build passed

One non-blocking observation remained:

moderate development-tooling advisories involving @vitest/mocker.

The finding was treated as development-tooling risk rather than a production
runtime vulnerability.

---

# Lesson 1 — Review Artifacts Are Historical Evidence

One of the first framework defects appeared during Implementation Planning.

The planner read:

design-review.md

and saw historical values such as:

Architecture Approval: PENDING HUMAN APPROVAL

It then blocked Implementation Planning even though:

architecture.md

had subsequently been explicitly approved.

The problem was not the Design Review.

The problem was source-of-truth ownership.

## Correct Rule

Architecture Approval belongs to:

architecture.md

Design Review Outcome belongs to:

design-review.md

A review artifact must not override a later lifecycle decision owned by another
artifact.

## Framework Change

Later agents were updated with explicit source-of-truth rules.

This became one of the most important reusable framework principles.

---

# Lesson 2 — Explicit Task IDs Were More Reliable Than Prompt Placeholders

The first implementation prompt attempted to obtain a task ID using a prompt
input placeholder.

The resulting Copilot run did not receive a concrete IMP task value.

Copilot correctly stopped rather than choosing a READY task automatically.

## Improvement

The implementation workflow changed to explicit chat input:

Task ID: IMP-001

The prompt still defined the workflow, but the human supplied the exact task.

This had two benefits:

- scope became obvious
- accidental autonomous task selection was prevented

---

# Lesson 3 — One Task at a Time Worked Well

The implementation plan contained 15 tasks.

Instead of asking Copilot to implement the entire application at once, the
framework executed one task per run.

Flow:

READY
  ↓
implement
  ↓
test
  ↓
record evidence
  ↓
PENDING HUMAN ACCEPTANCE
  ↓
human acceptance
  ↓
DONE

This approach provided frequent checkpoints.

It also made dependency enforcement practical.

Examples:

IMP-006 could not run until IMP-003 and IMP-005 were DONE.

IMP-009 depended on preference, generation, replacement, and persistence work.

---

# Lesson 4 — Human Acceptance Should Be Separate From Implementation Success

Implementation agents were not allowed to mark their own tasks DONE.

After successful implementation they reported:

IMPLEMENTED — PENDING HUMAN ACCEPTANCE

The human then explicitly accepted the task.

Only then did:

READY

become:

DONE

This created a meaningful human-in-the-loop boundary without requiring humans
to manually write all application code.

---

# Lesson 5 — Domain Tests Can Pass While the Real Application Still Cannot Use a Feature

This was one of the most important technical discoveries.

The original bundled catalogue contained:

7 Breakfast recipes

7 Lunch recipes

7 Dinner recipes

A generated weekly plan requires:

7 Breakfast assignments

7 Lunch assignments

7 Dinner assignments

and recipes may not repeat.

Therefore a complete generated plan consumed every recipe of each meal type.

The replacement algorithm itself was correct.

Synthetic domain tests showed that replacement could succeed when another
candidate existed.

But the production catalogue never left an unused candidate.

Therefore successful replacement was unreachable in the real application.

## Discovery

Browser workflow verification exposed this issue.

## Correction

The catalogue was expanded to:

8 Breakfast recipes

8 Lunch recipes

8 Dinner recipes

24 recipes total.

Browser testing then verified:

- successful replacement
- no-candidate replacement
- no duplicate introduction
- unrelated assignments unchanged
- no unapproved replacement confirmation

## Lesson

A correct algorithm does not guarantee that production data makes the feature
usable.

End-to-end verification must use realistic production data.

---

# Lesson 6 — Feasibility and Generation Should Be Separate Responsibilities

Implementation Planning separated:

IMP-005
Shared eligibility and feasibility

from:

IMP-006
Bounded weekly-plan generation

This proved useful.

Eligibility answered:

Can this recipe legally be used?

Feasibility answered:

Are there enough valid candidates for the required plan shape?

Generation answered:

How do we find a complete valid assignment?

This separation reduced domain complexity and made testing easier.

---

# Lesson 7 — Search Budget Exhaustion Is Not the Same as Infeasibility

The architecture introduced defensive generation limits.

The implementation used:

- node budget
- active search time budget

A critical semantic rule was:

Search budget exhausted

does not mean:

No valid plan exists.

The generator therefore used distinct typed outcomes.

This difference was checked during:

- implementation
- Code Review
- Final Verification

## Lesson

Operational limits must not silently change business meaning.

---

# Lesson 8 — Snapshot Authority Needed Careful Design

The application distinguishes:

currentPreferences

from:

activePlan.generationPreferenceSnapshot

This matters when the user edits preferences after generating a plan.

The existing plan remains valid under the preferences used to create it.

The plan becomes stale relative to current preferences, but it is not silently
modified.

Replacement must use:

activePlan.generationPreferenceSnapshot

not:

currentPreferences

until explicit regeneration succeeds.

## Why This Matters

Without this rule:

1. user generates Vegetarian plan
2. user changes current preference to Vegan
3. user replaces one meal
4. replacement uses Vegan
5. old meals still reflect Vegetarian generation

The plan now mixes preference authorities.

The architecture review process caught and corrected this before
implementation.

---

# Lesson 9 — Test Counts Must Be Reconciled

After IMP-012 the reported full suite had:

79 passing tests.

IMP-013 added:

6 tests.

The initial IMP-013 completion summary then incorrectly reported:

74 tests.

Rather than accepting the task, verification was stopped.

Copilot was instructed to inspect actual test discovery.

Final reconciliation found:

13 test files
85 tests passed
0 failed
0 skipped

The 74 value was an inaccurate summary rather than lost test coverage.

## Lesson

Never trust a test-count summary blindly.

When numbers move unexpectedly:

- inspect discovered files
- inspect skipped tests
- rerun the suite
- record actual evidence

---

# Lesson 10 — Browser Tests Added Value Beyond UI Testing

Browser verification was initially thought of primarily as a UI check.

In practice it detected:

- persistence reload integration problems
- replacement callback wiring problems
- the production-catalogue replacement defect

Therefore browser tests were validating system integration, not only visuals.

## Lesson

End-to-end tests are particularly valuable at boundaries between:

- UI
- state
- domain
- persistence
- production data

---

# Lesson 11 — Manual Verification Still Has a Place

During the responsive implementation task, automated browser viewport tooling
was temporarily unavailable.

Instead of claiming success, the workflow recorded:

NOT RUN

Human viewport checks were then used for:

- desktop
- tablet
- mobile

This preserved evidence quality.

## Lesson

Human verification is acceptable when it is explicit and recorded.

It should not be silently replaced with assumed automation.

---

# Lesson 12 — Independent Code Review Should Re-run Verification

The Code Reviewer did not simply read the implementation log.

It independently executed:

- tests
- browser tests
- lint
- TypeScript checks
- build
- dependency audit

It also inspected source and test quality.

The final Code Review returned:

PASS

with one dependency observation.

## Lesson

Independent review should inspect actual implementation and execute relevant
checks whenever possible.

---

# Lesson 13 — Final Verification Should Verify Every Requirement Individually

Final Verification produced explicit tables for:

FR-001 through FR-019

NFR-001 through NFR-005

AC-001 through AC-024

Every item received evidence and a result.

Final counts were:

FR PASS: 19
FR FAIL: 0
FR NOT VERIFIED: 0

NFR PASS: 5
NFR FAIL: 0
NFR NOT VERIFIED: 0

AC PASS: 24
AC FAIL: 0
AC NOT VERIFIED: 0

## Lesson

Traceability becomes much stronger when each requirement must demonstrate its
own evidence.

---

# Lesson 14 — Dependency Advisories Need Context

The project reported two moderate audit advisories involving:

@vitest/mocker

The finding was in the development test toolchain.

It was not identified as a production runtime vulnerability.

The available remediation involved a breaking Vitest upgrade.

The framework therefore did not run:

npm audit fix --force

Instead the issue remained visible as an observation.

## Lesson

Do not treat all audit findings as equivalent.

Consider:

- dependency type
- runtime exposure
- exploit context
- upgrade risk
- remediation impact

Never force dependency upgrades simply to produce a clean audit number.

---

# Lesson 15 — PR Preparation Must Not Fabricate Remote State

Pull Request Preparation successfully generated:

- PR summary
- changes
- test evidence
- known limitations
- reviewer checklist
- intended PR title

However, the workspace did not expose:

- Git metadata
- a branch
- a remote
- GitHub CLI

The PR Preparer therefore correctly recorded:

PREPARED — NOT YET CREATED

rather than claiming success.

A later attempt also encountered a Copilot model-provider high-demand error.

## Lesson

Remote actions require actual remote capability.

If Git/GitHub execution is unavailable:

- prepare the artifact
- record the limitation
- do not fabricate a PR URL or number

---

# Lesson 16 — Do Not Automatically Attribute Capacity Errors to the Free Plan

The capstone was performed using Copilot Free.

Copilot Free provides limited agent usage.

A later Copilot run returned a model-provider high-demand message.

The project did not prove that the Free plan alone caused that specific error.

Possible factors include:

- plan limits
- agent usage limits
- model capacity
- service demand
- client availability

## Lesson

Separate observed behavior from assumed cause.

Record:

what happened

instead of claiming:

why it happened

unless official evidence confirms the cause.

---

# Lesson 17 — Hooks Should Be Tested Only on Supported Surfaces

The original capstone included:

Agents
Prompts
Instructions
Skills
Hooks

The primary project workflow used VS Code Copilot Chat.

Current GitHub documentation describes Copilot hooks for:

- Copilot CLI
- Copilot cloud agent

Therefore hooks were not fabricated as a VS Code test.

They remain a future framework exercise.

## Candidate Future Hook Experiments

- deny force push
- deny destructive reset
- audit tool calls
- run secret scanning
- verify evidence before agent stop

---

# What Worked Especially Well

The strongest parts of the framework were:

- explicit stage ownership
- artifact-based state
- source-of-truth rules
- independent review
- task-level human acceptance
- dependency-aware implementation
- test execution after each task
- browser integration testing
- requirement-by-requirement final verification

---

# What Should Be Improved in the Next Project

## 1. Establish Source-of-Truth Rules Earlier

The framework initially discovered approval-ownership problems during planning
and implementation.

Future projects should define artifact ownership at the beginning.

## 2. Include Realistic Data Feasibility During Architecture Review

The exact-seven-recipes problem could have been detected earlier by explicitly
checking whether production data supports replacement after a complete plan.

## 3. Define Evidence Requirements Up Front

Each task should specify whether verification requires:

- unit tests
- integration tests
- browser tests
- human visual checks
- performance measurements

## 4. Automate Git Environment Readiness Early

Before PR Preparation, verify much earlier that:

- repository is Git-backed
- origin exists
- branch exists
- GitHub CLI or another PR mechanism is available

## 5. Exercise Hooks Separately Using Copilot CLI

The next learning iteration should use the same repository framework with
Copilot CLI to test deterministic hooks.

---

# Recommended Next Learning Exercise

Reuse the framework on a second application.

Do not rewrite all agents.

Reuse:

- requirements methodology
- architecture methodology
- review methodology
- implementation planning
- task execution
- code review
- verification

Change only application-specific prompts and artifacts where possible.

This will test whether the framework is genuinely reusable rather than merely
a Meal Planner solution.

---

# Final Assessment

The Meal Planner capstone demonstrated that GitHub Copilot can participate in a
structured Agentic SDLC when its responsibilities are constrained by:

- explicit roles
- artifact ownership
- approval gates
- independent review
- dependency ordering
- test evidence
- human acceptance
- traceability

The most important learning was not that Copilot could write the application.

The most important learning was how to prevent an agentic workflow from
silently skipping lifecycle decisions, confusing historical state, claiming
unverified results, or expanding scope.

That control structure is the reusable product of the capstone.