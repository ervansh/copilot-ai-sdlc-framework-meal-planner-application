# Agentic SDLC Framework

## Purpose

This document describes the reusable Agentic SDLC framework built during the
Meal Planner capstone.

The framework uses GitHub Copilot customization capabilities to guide software
delivery through explicit lifecycle stages, independent review roles, artifact
traceability, and human approval gates.

The framework is intentionally repository-driven.

It does not depend on a single application domain.

The Meal Planner application was used to exercise and validate the framework,
but the lifecycle is intended to be reusable for other software projects.

---

# Core Principles

## 1. Framework First

The reusable SDLC capability is created before it is used on the application.

For each lifecycle capability:

1. define the Agent
2. define the Skill
3. define the Prompt
4. run the capability against the application
5. inspect the resulting artifact
6. perform the required human gate
7. continue to the next stage

This prevents the application workflow from becoming an ad hoc sequence of
Copilot prompts.

---

## 2. Explicit Lifecycle Stages

The framework uses these lifecycle stages:

1. Requirements Analysis
2. Requirements Review and Approval
3. Architecture
4. Design Review
5. Architecture Approval
6. Implementation Planning
7. Implementation
8. Code Review
9. Final Verification
10. Pull Request Preparation

Each stage has a defined responsibility and output artifact.

Later stages must not silently perform work owned by an earlier stage.

---

## 3. Human-in-the-Loop Gates

Copilot may analyze, design, implement, review, and verify work.

Copilot must not invent human approval.

Important lifecycle decisions remain explicit human gates.

Examples:

- Requirements Approval
- Architecture Approval
- Implementation Plan Approval
- Implementation Task Acceptance

An agent must stop when a required gate has not passed.

---

## 4. Independent Review

The agent that creates an artifact must not automatically approve its own work.

Examples:

- Solution Architect creates architecture.
- Design Reviewer independently reviews architecture.
- Implementation Engineer writes code.
- Code Reviewer independently reviews completed code.
- Verification Engineer independently verifies the final application.

This separation makes review results more meaningful.

---

## 5. Artifact-Based State

Lifecycle state is stored in repository artifacts rather than inferred from chat
history.

Examples:

- requirements.md
- architecture.md
- design-review.md
- impl-plan.md
- implementation-log.md
- code-review.md
- verification.md
- pull-request.md

This allows another Copilot session or human reviewer to understand the current
state without relying on previous conversations.

---

# Repository Structure

The framework uses the following repository organization:

copilot-capstone/
├── .github/
│   ├── agents/
│   ├── skills/
│   ├── prompts/
│   ├── hooks/
│   └── copilot-instructions.md
├── framework-docs/
├── meal-planner/
│   ├── docs/
│   │   └── sdlc/
│   ├── src/
│   ├── tests/
│   └── CHANGELOG.md
└── README.md

`.github/` contains reusable Copilot customization.

`framework-docs/` documents the reusable framework.

`meal-planner/` contains the application and its application-specific SDLC
artifacts.

---

# Copilot Capability Model

The framework uses the following mental model.

## Agent = WHO

An Agent defines:

- role
- responsibility
- allowed scope
- prohibited actions
- artifact ownership
- entry gates
- stopping conditions
- available tools

Examples:

- Requirements Analyst
- Solution Architect
- Design Reviewer
- Implementation Planner
- Implementation Engineer
- Code Reviewer
- Verification Engineer
- Pull Request Preparer

---

## Skill = HOW

A Skill defines reusable methodology.

Examples:

- requirements-analysis
- architecture-design
- design-review
- implementation-planning
- task-implementation
- code-review
- final-verification
- pull-request-preparation

Skills should remain reusable across applications when possible.

They should not duplicate all application-specific instructions from the Agent.

---

## Prompt = WHAT NOW

A Prompt starts a specific workflow.

Examples:

- analyze Meal Planner requirements
- create Meal Planner architecture
- review Meal Planner design
- create implementation plan
- implement IMP-006
- perform final verification

A Prompt should provide enough application context to begin the task while
leaving methodology to the Skill and responsibilities to the Agent.

---

## Instructions = ALWAYS-ON REPOSITORY RULES

`.github/copilot-instructions.md` defines repository-wide rules such as:

- repository structure
- application paths
- SDLC lifecycle
- approval expectations
- framework-first behavior
- path invariants
- human-in-the-loop requirements

Instructions should contain rules relevant to many interactions.

---

## Hooks = DETERMINISTIC AUTOMATION

Hooks can execute commands at Copilot lifecycle events.

They are useful for deterministic guardrails such as:

- blocking dangerous commands
- enforcing policy
- logging activity
- running validation

In this project, hooks were deferred because the primary workflow was VS Code
Copilot Chat.

The current GitHub hook documentation describes repository hooks for Copilot
CLI and Copilot cloud agent.

Hooks should therefore be added only when the execution surface supports them.

---

# Lifecycle Artifacts

The Meal Planner exercise used these application artifacts:

meal-planner/docs/sdlc/
├── requirements.md
├── architecture.md
├── design-review.md
├── impl-plan.md
├── implementation-log.md
├── code-review.md
├── verification.md
└── pull-request.md

Each artifact has a specific responsibility.

---

# Source-of-Truth Rules

A critical framework rule is:

Lifecycle fields must be evaluated from the artifact that owns them.

Do not use every artifact as an authority for every lifecycle state.

## Requirements Approval

Authoritative artifact:

meal-planner/docs/sdlc/requirements.md

Example state:

Requirements Status: APPROVED

---

## Architecture Approval

Authoritative artifact:

meal-planner/docs/sdlc/architecture.md

Example states:

Architecture Status: APPROVED

Architecture Approval: APPROVED

A Design Review artifact may correctly show historical metadata such as:

Architecture Approval: PENDING HUMAN APPROVAL

That value describes the state when Design Review occurred.

It must not override a later human approval stored in architecture.md.

---

## Design Review Outcome

Authoritative artifact:

meal-planner/docs/sdlc/design-review.md

Example:

Review Outcome: PASS

---

## Implementation Plan Approval

Authoritative artifact:

meal-planner/docs/sdlc/impl-plan.md

Example:

Implementation Plan Status: APPROVED

---

## Implementation Completion

Authoritative artifacts:

meal-planner/docs/sdlc/impl-plan.md

and:

meal-planner/docs/sdlc/implementation-log.md

The implementation plan records task status.

The implementation log records execution and human acceptance evidence.

---

## Code Review Outcome

Authoritative artifact:

meal-planner/docs/sdlc/code-review.md

Example:

Review Outcome: PASS

---

## Final Verification Outcome

Authoritative artifact:

meal-planner/docs/sdlc/verification.md

Example:

PASS

or:

PASS WITH OBSERVATIONS

---

# Stage 1 — Requirements Analysis

## Role

Requirements Analyst

## Inputs

- user story
- business request
- available source documentation
- repository instructions

## Output

requirements.md

## Responsibilities

- clarify ambiguous requirements
- distinguish confirmed facts from assumptions
- define functional requirements
- define non-functional requirements
- define acceptance criteria
- identify scope
- identify out-of-scope behavior
- record unresolved questions
- maintain traceability

## Important Rule

Do not begin architecture while requirements remain unresolved.

---

# Stage 2 — Requirements Approval

Requirements remain pending until a human explicitly approves them.

Example:

Requirements Status: APPROVED

No later stage should infer approval from silence.

---

# Stage 3 — Architecture

## Role

Solution Architect

## Inputs

- approved requirements
- repository instructions

## Output

architecture.md

## Responsibilities

- identify architecture drivers
- define components and ownership
- define data model
- define major data flows
- define persistence model
- define validation boundaries
- address NFRs
- define architecture decisions
- define risks
- establish traceability

Architecture must remain consistent with approved scope.

---

# Stage 4 — Design Review

## Role

Independent Design Reviewer

## Input

- requirements.md
- architecture.md

## Output

design-review.md

## Finding Severities

BLOCKER

MAJOR

MINOR

OBSERVATION

## Outcomes

PASS

PASS WITH MINOR CHANGES

REWORK REQUIRED

The reviewer does not approve architecture.

It only determines whether the architecture is ready for human approval.

---

# Stage 5 — Architecture Approval

After Design Review succeeds, a human explicitly approves architecture.

Example:

Architecture Status: APPROVED

Architecture Approval: APPROVED

Design Review remains historical evidence and does not need to be rewritten.

---

# Stage 6 — Implementation Planning

## Role

Implementation Planner

## Input

- approved requirements
- approved architecture
- successful design review

## Output

impl-plan.md

## Responsibilities

Convert design into:

- dependency-ordered tasks
- priorities
- requirements mappings
- architecture mappings
- test expectations
- completion criteria
- blockers
- execution sequence

Tasks use stable IDs:

IMP-001
IMP-002
IMP-003
...

The plan must not write production code.

---

# Stage 7 — Implementation

## Role

Implementation Engineer

Implementation is performed one approved task at a time.

Example workflow:

IMP-005 = READY
        ↓
dependency check
        ↓
implementation
        ↓
tests
        ↓
verification
        ↓
IMPLEMENTED — PENDING HUMAN ACCEPTANCE
        ↓
human acceptance
        ↓
IMP-005 = DONE

This model prevents the agent from implementing the entire application without
review checkpoints.

---

# Task-Level Human Acceptance

An Implementation Engineer must not automatically mark its task DONE.

After implementation:

Task Execution Status:

IMPLEMENTED — PENDING HUMAN ACCEPTANCE

After human acceptance:

Task Status:

DONE

Only then may dependent tasks become eligible.

---

# Implementation Evidence

implementation-log.md records:

- task
- requirements
- architecture references
- files added
- files modified
- tests
- commands
- verification results
- deviations
- known issues
- human acceptance

This provides an auditable implementation history.

---

# Stage 8 — Code Review

## Role

Independent Code Reviewer

## Inputs

- approved requirements
- approved architecture
- implementation plan
- implementation log
- application source
- tests

## Output

code-review.md

## Required Review Areas

- correctness
- architecture compliance
- error handling
- security and privacy
- test quality
- maintainability
- meaningful duplication
- dependency safety
- scope compliance

## Outcomes

PASS

PASS WITH MINOR CHANGES

REWORK REQUIRED

The reviewer must inspect actual code and tests rather than relying only on
implementation summaries.

---

# Stage 9 — Final Verification

## Role

Verification Engineer

## Output

verification.md

Final Verification checks whether the completed application demonstrably
satisfies the approved software contract.

It verifies individually:

- every functional requirement
- every non-functional requirement
- every acceptance criterion

Results use:

PASS

FAIL

NOT VERIFIED

A requirement must not be marked PASS simply because the implementation plan
claims it was implemented.

---

# Verification Scope

Final Verification includes:

- unit and integration tests
- browser workflows
- lint
- type checking
- production build
- runtime startup
- performance
- persistence
- failure behavior
- accessibility evidence
- responsive evidence
- dependency audit
- documentation consistency

---

# Stage 10 — Pull Request Preparation

## Role

Pull Request Preparer

## Inputs

- completed implementation
- Code Review PASS
- Final Verification PASS or PASS WITH OBSERVATIONS

## Outputs

- CHANGELOG.md
- pull-request.md
- Git commit/push when environment permits
- GitHub Pull Request when environment permits

## Required PR Sections

- Summary
- Changes Made
- Test Evidence
- Known Limitations
- Reviewer Checklist

The PR Preparer must not merge the pull request.

---

# Rework Loops

The lifecycle supports explicit return paths.

Examples:

Architecture
    ↓
Design Review
    ↓
REWORK REQUIRED
    ↓
Architecture Rework
    ↓
Design Review Again

Implementation
    ↓
Code Review
    ↓
REWORK REQUIRED
    ↓
Implementation Correction
    ↓
Code Review Again

Final Verification
    ↓
FAIL
    ↓
appropriate earlier stage
    ↓
re-verification

This is preferable to silently correcting defects during an independent review.

---

# Traceability Model

The framework maintains traceability across:

Requirement
    ↓
Architecture
    ↓
Implementation Task
    ↓
Code
    ↓
Test
    ↓
Verification Evidence

This makes it possible to answer:

- Why does this code exist?
- Which requirement does it satisfy?
- Which architecture decision owns it?
- Which test verifies it?
- Has it been independently verified?

---

# Failure Handling Principles

Agents should stop rather than fabricate success.

Examples:

If Architecture Approval is missing:

stop Implementation Planning.

If a dependency task is not DONE:

stop task implementation.

If browser execution is unavailable:

record NOT VERIFIED rather than PASS.

If Git metadata is unavailable:

prepare PR evidence but do not claim a PR was created.

---

# Historical Artifacts

Review artifacts represent the lifecycle state at the time they were produced.

Do not rewrite every historical artifact whenever a later gate changes state.

For example:

design-review.md may contain:

Architecture Approval: PENDING HUMAN APPROVAL

even after:

architecture.md

later records:

Architecture Approval: APPROVED

This is correct historical evidence.

---

# Framework Reuse Checklist

When applying this framework to a new application:

1. create the application directory
2. configure repository instructions
3. define the initial user story
4. run Requirements Analysis
5. approve requirements
6. run Architecture
7. run independent Design Review
8. approve architecture
9. create implementation plan
10. approve implementation plan
11. execute implementation tasks one at a time
12. accept each task
13. run independent Code Review
14. run Final Verification
15. prepare the Pull Request
16. preserve all SDLC evidence

---

# Current Framework Status

The framework was exercised end-to-end using the Meal Planner application.

Validated capabilities include:

- custom instructions
- specialized agents
- reusable skills
- prompt-driven workflows
- requirements gates
- architecture review
- human approvals
- dependency-ordered implementation
- task-level human acceptance
- independent code review
- final traceability verification
- PR preparation

Hooks remain deferred for a future Copilot CLI or Copilot cloud-agent exercise.

---

# Official GitHub Documentation Basis

Copilot customization concepts in this framework are based on current GitHub
documentation for:

- Copilot customization options
- Custom agents configuration
- Agent skills
- Prompt files
- Repository custom instructions
- Copilot hooks
- Copilot plans and usage availability

Always re-check GitHub documentation when adopting the framework because
feature availability and preview status can change.