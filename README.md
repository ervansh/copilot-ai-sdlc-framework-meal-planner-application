# GitHub Copilot Agentic SDLC Capstone

## Overview

This repository demonstrates a hands-on **Agentic Software Development Life Cycle
(SDLC)** implemented with GitHub Copilot customization capabilities.

The project has two goals:

1. Build a reusable Agentic SDLC framework using GitHub Copilot.
2. Exercise that framework end-to-end by building a working **Meal Planner**
   web application.

The primary learning objective is not simply to generate application code with
Copilot.

The project demonstrates how Copilot can participate in a controlled software
delivery lifecycle using:

* Custom Instructions
* Custom Agents
* Agent Skills
* Prompt Files
* explicit SDLC artifacts
* independent review agents
* human approval gates
* task-level implementation acceptance
* executable verification evidence
* Pull Request preparation

The resulting workflow keeps humans responsible for approval decisions while
allowing specialized Copilot agents to perform analysis, design,
implementation, review, and verification.

---

# Project Status

The Meal Planner application has completed the full implemented SDLC workflow.

| Stage                        | Status                           |
| ---------------------------- | -------------------------------- |
| Requirements Analysis        | COMPLETE                         |
| Requirements Approval        | APPROVED                         |
| Architecture                 | COMPLETE                         |
| Design Review                | PASS                             |
| Architecture Approval        | APPROVED                         |
| Implementation Planning      | APPROVED                         |
| Implementation               | COMPLETE                         |
| Code Review                  | PASS                             |
| Final Verification           | PASS WITH OBSERVATIONS           |
| Pull Request Preparation     | COMPLETE                         |
| Remote Pull Request Creation | SKIPPED / ENVIRONMENT LIMITATION |

Final verification confirmed:

* 19 / 19 functional requirements passed
* 5 / 5 non-functional requirements passed
* 24 / 24 acceptance criteria passed
* 94 Vitest tests passed
* 21 browser workflow tests passed
* ESLint passed
* TypeScript checks passed
* production build passed

The remaining verification observation is a non-blocking development-tooling
dependency advisory involving `@vitest/mocker`.

---

# Repository Structure

```text
copilot-capstone/
├── .github/
│   ├── agents/
│   ├── skills/
│   ├── prompts/
│   ├── hooks/
│   └── copilot-instructions.md
│
├── framework-docs/
│   ├── agentic-sdlc-framework.md
│   ├── copilot-customization-guide.md
│   └── meal-planner-retrospective.md
│
├── meal-planner/
│   ├── docs/
│   │   └── sdlc/
│   │       ├── requirements.md
│   │       ├── architecture.md
│   │       ├── design-review.md
│   │       ├── impl-plan.md
│   │       ├── implementation-log.md
│   │       ├── code-review.md
│   │       ├── verification.md
│   │       └── pull-request.md
│   │
│   ├── src/
│   ├── tests/
│   ├── CHANGELOG.md
│   └── package.json
│
└── README.md
```

---

# Agentic SDLC Lifecycle

The framework uses the following lifecycle:

```text
Requirements Analysis
        ↓
Human Requirements Approval
        ↓
Architecture
        ↓
Independent Design Review
        ↓
Human Architecture Approval
        ↓
Implementation Planning
        ↓
Human Plan Approval
        ↓
Task-by-Task Implementation
        ↓
Human Task Acceptance
        ↓
Independent Code Review
        ↓
Independent Final Verification
        ↓
Pull Request Preparation
        ↓
Human Pull Request Review
```

Each stage produces repository evidence rather than relying only on Copilot
conversation history.

---

# Core Framework Model

The framework uses a simple mental model for Copilot customization.

## Instructions = ALWAYS

Repository-wide rules that should apply across many interactions.

Location:

```text
.github/copilot-instructions.md
```

Examples:

* repository structure
* SDLC lifecycle rules
* path conventions
* human approval requirements
* framework-first behavior

---

## Agent = WHO

A specialized role with responsibilities, boundaries, tools, entry gates, and
stopping conditions.

Location:

```text
.github/agents/
```

Examples:

```text
requirements-analyst.agent.md
solution-architect.agent.md
design-reviewer.agent.md
implementation-planner.agent.md
implementation-engineer.agent.md
code-reviewer.agent.md
verification-engineer.agent.md
pr-preparer.agent.md
```

---

## Skill = HOW

Reusable methodology that explains how a class of task should be performed.

Location:

```text
.github/skills/<skill-name>/SKILL.md
```

Examples:

```text
requirements-analysis/
architecture-design/
design-review/
implementation-planning/
task-implementation/
code-review/
final-verification/
pull-request-preparation/
```

---

## Prompt = WHAT NOW

A reusable workflow starter that tells Copilot which application workflow to
execute now.

Location:

```text
.github/prompts/
```

Examples:

```text
sdlc-requirements.prompt.md
sdlc-architecture.prompt.md
sdlc-design-review.prompt.md
sdlc-implementation-plan.prompt.md
sdlc-implement-task.prompt.md
sdlc-code-review.prompt.md
sdlc-final-verification.prompt.md
sdlc-pr-preparation.prompt.md
```

---

## Hook = DETERMINISTIC AUTOMATION

Hooks execute commands at defined Copilot lifecycle events.

Repository hook configuration belongs under:

```text
.github/hooks/
```

Hooks were intentionally deferred in this project because the main exercise was
performed through VS Code Copilot Chat.

A future iteration can exercise hooks through GitHub Copilot CLI or Copilot
cloud agent.

Potential framework hooks include:

* blocking destructive Git operations
* secret scanning
* audit logging
* policy validation
* validating expected SDLC evidence before agent completion

---

# Specialized Agents

## Requirements Analyst

Purpose:

Convert an initial user story into a complete, traceable requirements artifact.

Output:

```text
meal-planner/docs/sdlc/requirements.md
```

Key responsibilities:

* clarification questions
* functional requirements
* non-functional requirements
* acceptance criteria
* validations
* scope boundaries
* assumptions
* traceability

---

## Solution Architect

Purpose:

Convert approved requirements into an implementation-ready architecture.

Output:

```text
meal-planner/docs/sdlc/architecture.md
```

Key responsibilities:

* architecture drivers
* components
* technology choices
* data models
* data flows
* persistence
* performance
* reliability
* testability
* ADRs
* traceability

---

## Design Reviewer

Purpose:

Independently review the architecture.

Output:

```text
meal-planner/docs/sdlc/design-review.md
```

Possible outcomes:

```text
PASS
PASS WITH MINOR CHANGES
REWORK REQUIRED
```

The Design Reviewer does not grant human Architecture Approval.

---

## Implementation Planner

Purpose:

Convert approved requirements and architecture into dependency-ordered
implementation work.

Output:

```text
meal-planner/docs/sdlc/impl-plan.md
```

The Meal Planner implementation plan contains:

```text
IMP-001 through IMP-015
```

Each task defines:

* objective
* requirements
* architecture references
* dependencies
* priority
* implementation scope
* test expectations
* completion criteria
* risks

---

## Implementation Engineer

Purpose:

Implement exactly one approved implementation task at a time.

Workflow:

```text
READY
  ↓
Dependency Check
  ↓
Implementation
  ↓
Tests
  ↓
Verification
  ↓
IMPLEMENTED — PENDING HUMAN ACCEPTANCE
  ↓
Human Acceptance
  ↓
DONE
```

The agent must not automatically start another task.

---

## Code Reviewer

Purpose:

Independently inspect the completed implementation.

Review areas include:

* correctness
* architecture compliance
* error handling
* security
* privacy
* test quality
* maintainability
* meaningful duplication
* dependency safety
* scope compliance

Final Meal Planner Code Review:

```text
PASS
```

---

## Verification Engineer

Purpose:

Independently verify that the final product satisfies the approved software
contract.

It verifies each:

```text
FR
NFR
AC
```

individually.

Possible results for each item:

```text
PASS
FAIL
NOT VERIFIED
```

Final Meal Planner Verification:

```text
PASS WITH OBSERVATIONS
```

---

## Pull Request Preparer

Purpose:

Package verified work into a review-ready Pull Request.

Required PR sections:

```text
Summary
Changes Made
Test Evidence
Known Limitations
Reviewer Checklist
```

The PR preparation artifact was successfully created.

Remote PR creation was not executed because the available environment did not
provide reliable Git/GitHub remote execution.

---

# Source-of-Truth Rules

One of the most important framework lessons is that every lifecycle state has an
authoritative artifact.

| Lifecycle Decision           | Authoritative Artifact  |
| ---------------------------- | ----------------------- |
| Requirements Approval        | `requirements.md`       |
| Architecture Approval        | `architecture.md`       |
| Design Review Outcome        | `design-review.md`      |
| Implementation Plan Approval | `impl-plan.md`          |
| Implementation Task Status   | `impl-plan.md`          |
| Implementation Evidence      | `implementation-log.md` |
| Code Review Outcome          | `code-review.md`        |
| Final Verification Outcome   | `verification.md`       |
| PR Preparation Evidence      | `pull-request.md`       |

Historical review artifacts should not override later lifecycle decisions.

For example, a Design Review may correctly contain:

```text
Architecture Approval: PENDING HUMAN APPROVAL
```

while the subsequently approved architecture contains:

```text
Architecture Approval: APPROVED
```

The architecture artifact owns the final approval state.

---

# Meal Planner Application

The application built through the framework is a local single-user Meal Planner.

## Supported Preferences

Diet types:

```text
Omnivore
Vegetarian
Vegan
```

Supported allergens:

```text
Nuts
Dairy
Gluten
Eggs
Soy
Shellfish
```

Users can also maintain custom excluded ingredients.

---

# Weekly Plan

The generated plan contains:

```text
7 days
×
3 meals per day
=
21 meal assignments
```

Supported meal types:

```text
Breakfast
Lunch
Dinner
```

The application enforces:

* exactly one recipe per slot
* meal-type compatibility
* dietary restrictions
* allergen restrictions
* excluded ingredients
* ingredient-equivalence rules
* no exact recipe repetition within the week

If a complete valid plan cannot be created, the application returns a failure
instead of silently relaxing restrictions.

---

# Recipe Catalogue

The application uses an application-owned bundled recipe catalogue.

Final bundled catalogue:

```text
24 recipes
```

Distribution:

```text
8 Breakfast
8 Lunch
8 Dinner
```

Recipes include structured metadata such as:

* stable recipe ID
* recipe name
* meal type
* dietary compatibility
* allergens
* structured ingredients
* cooking instructions
* preparation time
* serving size

The catalogue is validated before planning logic uses it.

---

# Meal Replacement

Users can replace one meal while preserving:

* meal type
* dietary restrictions
* allergen restrictions
* excluded ingredients
* recipe uniqueness
* all unrelated assignments

Replacement uses the active plan's original:

```text
generationPreferenceSnapshot
```

rather than automatically using newly edited current preferences.

If no replacement candidate exists, the existing meal remains unchanged.

---

# Preference Changes and Stale Plans

The application keeps:

```text
currentPreferences
```

separate from:

```text
activePlan.generationPreferenceSnapshot
```

Changing preferences does not silently alter an existing plan.

Instead, the plan can become:

```text
stale
```

The existing plan remains viewable.

The new preferences influence meal selection only after explicit successful
regeneration.

---

# Persistence

The application uses versioned browser `localStorage`.

It persists:

* current preferences
* active plan
* generation preference snapshot
* required catalogue/version metadata

Persisted data is treated as untrusted and validated before restoration.

Only one active saved plan is supported.

---

# User Interface

The implemented UI supports:

* preference configuration
* weekly plan view
* daily plan view
* recipe details
* plan generation
* meal replacement
* save
* restore/reload
* stale-plan messaging
* regeneration
* confirmation flows
* loading/error states
* desktop layout
* tablet layout
* mobile layout
* keyboard-accessible interactions

The project does not claim formal WCAG certification.

---

# Technology Stack

The approved architecture uses:

```text
React
TypeScript
Vite
Vitest
browser workflow testing
localStorage
```

Business rules are kept outside the presentation layer in framework-independent
TypeScript domain modules.

---

# Running the Meal Planner

From the repository root:

```bash
cd meal-planner
npm install
npm run dev
```

Open the local URL reported by Vite.

Typically:

```text
http://127.0.0.1:5173/
```

---

# Build

```bash
cd meal-planner
npm run build
```

---

# Unit and Integration Tests

```bash
cd meal-planner
npm test
```

Final verified result:

```text
14 test files
94 tests passed
0 failed
```

---

# Browser Workflow Tests

```bash
cd meal-planner
npm run test:browser -- --reporter=list
```

Final verified result:

```text
21 passed
0 failed
```

Verified representative viewports:

```text
Desktop: 1440 × 900
Tablet:   768 × 1024
Mobile:   390 × 844
```

Actual browser execution used installed Google Chrome.

Firefox, Edge, and Safari were not executed during the final capstone run.

---

# Lint

```bash
cd meal-planner
npm run lint
```

Final verification:

```text
PASS
```

---

# TypeScript Verification

```bash
cd meal-planner
npx tsc -b --pretty false
```

Final verification:

```text
PASS
```

---

# Dependency Audit

The final verification recorded two moderate dependency advisories involving:

```text
@vitest/mocker
```

These affect the development/test toolchain rather than the shipped application
runtime.

The project intentionally did not run:

```bash
npm audit fix --force
```

because the available remediation required a breaking dependency upgrade.

The advisory remains a tracked non-blocking observation.

---

# Performance

Representative real-catalogue generation during implementation verification was
observed at:

```text
0–4 ms
```

under the executed scenarios.

The architecture also uses defensive search limits.

Search-budget exhaustion is treated differently from confirmed infeasibility.

The application never interprets a search timeout as proof that no valid plan
exists.

---

# SDLC Evidence

Application-specific SDLC evidence is stored under:

```text
meal-planner/docs/sdlc/
```

## Requirements

```text
requirements.md
```

Contains:

* scope
* FRs
* NFRs
* acceptance criteria
* validation rules
* traceability

## Architecture

```text
architecture.md
```

Contains:

* components
* data model
* flows
* persistence
* performance
* ADRs
* traceability

## Design Review

```text
design-review.md
```

Contains the independent architecture review.

Final result:

```text
PASS
```

## Implementation Plan

```text
impl-plan.md
```

Contains:

```text
IMP-001 through IMP-015
```

with dependencies and requirement mappings.

## Implementation Log

```text
implementation-log.md
```

Contains:

* files changed
* tests
* verification commands
* implementation evidence
* human acceptance

## Code Review

```text
code-review.md
```

Final result:

```text
PASS
```

## Final Verification

```text
verification.md
```

Final result:

```text
PASS WITH OBSERVATIONS
```

## Pull Request Preparation

```text
pull-request.md
```

Contains:

* PR summary
* changes
* test evidence
* known limitations
* reviewer checklist
* intended PR title

Remote creation remained environment-dependent.

---

# Framework Documentation

More detailed framework documentation is available under:

```text
framework-docs/
```

## Agentic SDLC Framework

```text
framework-docs/agentic-sdlc-framework.md
```

Explains:

* lifecycle stages
* human gates
* source-of-truth ownership
* artifact model
* independent review
* task-level implementation

## Copilot Customization Guide

```text
framework-docs/copilot-customization-guide.md
```

Explains:

```text
Instructions = ALWAYS
Agent        = WHO
Skill        = HOW
Prompt       = WHAT NOW
Hook         = DETERMINISTIC AUTOMATION
```

## Meal Planner Retrospective

```text
framework-docs/meal-planner-retrospective.md
```

Documents practical lessons discovered while exercising the framework.

Examples include:

* historical approval-state confusion
* prompt task-ID handling
* production-data feasibility
* snapshot authority
* browser integration defects
* test-count reconciliation
* dependency advisory handling
* PR environment limitations

---

# Important Lessons

The project demonstrated several important Agentic SDLC principles.

## Do Not Infer Approval

Human lifecycle approval must be explicit.

## Separate Creation From Review

Agents should not automatically approve their own output.

## Keep Lifecycle State in Artifacts

Do not rely exclusively on conversation history.

## Verify Dependencies Before Implementation

An implementation task should not run before prerequisite tasks are complete.

## Implement One Task at a Time

Controlled execution makes review and failure recovery easier.

## Require Human Task Acceptance

Successful implementation is not the same as acceptance.

## Test Real Production Data

Correct algorithms can still produce unreachable features when production data
is insufficient.

## Browser Tests Validate Integration

Browser verification can detect state, persistence, data, and wiring defects
that domain tests miss.

## Never Fabricate Remote Actions

If GitHub access, Git metadata, or CLI capability is unavailable, prepare the
artifact and record the limitation instead of inventing a Pull Request.

---

## Hooks Status

Repository hooks are implemented under:

.github/hooks/

Implemented hook events:

- sessionStart
- preToolUse
- postToolUse
- errorOccurred

The hooks provide:

- Agentic SDLC context injection
- destructive-command protection
- verification-evidence reminders
- minimal execution/error auditing

Runtime execution remains unverified in this capstone because the primary
execution surface was VS Code Copilot Chat.

GitHub currently documents repository hook execution for:

- GitHub Copilot CLI
- Copilot cloud agent

Therefore:

Hooks Implementation Status: COMPLETE

Hooks Runtime Verification Status:
DEFERRED — REQUIRES COPILOT CLI OR COPILOT CLOUD AGENT

---

# Reusing the Framework

To validate that the framework is genuinely reusable, the recommended next
exercise is to apply the same `.github/` SDLC capabilities to a second
application.

The goal should be to reuse:

* Agents
* Skills
* lifecycle gates
* review methodology
* implementation methodology
* verification methodology

while changing primarily:

* application requirements
* application artifacts
* application-specific prompts

This tests whether the repository contains a reusable Agentic SDLC framework
rather than only a Meal Planner workflow.

---

# Official GitHub Documentation

The GitHub Copilot customization approach used by this repository is based on
official GitHub documentation covering:

* Copilot customization options
* repository custom instructions
* prompt files
* custom agents
* agent skills
* Copilot hooks
* GitHub Copilot plans and availability

GitHub Copilot capabilities evolve over time.

Before adopting this framework for production governance, review the current
GitHub documentation for feature availability, preview status, supported
clients, plans, and organization policies.

---

# Capstone Result

The project successfully demonstrated an end-to-end Agentic SDLC in which
GitHub Copilot participated in:

```text
Requirements
Architecture
Design Review
Implementation Planning
Implementation
Code Review
Final Verification
Pull Request Preparation
```

while humans retained explicit control over approval gates.

The reusable result of this capstone is therefore not only the Meal Planner
application.

It is the **control structure around the agents**:

```text
Role boundaries
+
Artifact ownership
+
Human approvals
+
Dependency ordering
+
Independent review
+
Executable evidence
+
Traceability
```

That structure is the foundation for using GitHub Copilot as part of a
disciplined software delivery process.
