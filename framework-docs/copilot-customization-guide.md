# GitHub Copilot Customization Guide

## Purpose

This document explains how the Agentic SDLC framework uses GitHub Copilot
customization capabilities.

The key capabilities are:

- Custom Instructions
- Custom Agents
- Agent Skills
- Prompt Files
- Hooks

Each solves a different problem.

The most important design rule is:

Do not put the same responsibility into every customization file.

---

# Mental Model

Use this model:

Instructions = ALWAYS

Agent = WHO

Skill = HOW

Prompt = WHAT NOW

Hook = DETERMINISTIC EVENT AUTOMATION

MCP = EXTERNAL SYSTEMS

---

# 1. Custom Instructions

## Purpose

Custom Instructions define repository-wide expectations that should apply
across many Copilot interactions.

Repository-level instructions live at:

.github/copilot-instructions.md

Examples:

- repository structure
- coding expectations
- SDLC lifecycle
- human approval rules
- application paths
- framework paths
- artifact naming
- architectural conventions

## Good Instruction

Always place application source under:

<application-root>/src/

## Bad Instruction

Implement the complete weekly-generation algorithm using backtracking.

That belongs to a specific architecture or implementation workflow rather than
an always-on repository instruction.

---

# 2. Custom Agents

## Purpose

A Custom Agent represents a specialist role.

Repository custom agents live under:

.github/agents/

Examples used by this framework:

requirements-analyst.agent.md

sdlc-orchestrator.agent.md

user-story-documenter.agent.md

solution-architect.agent.md

design-reviewer.agent.md

implementation-planner.agent.md

implementation-engineer.agent.md

code-reviewer.agent.md

verification-engineer.agent.md

pr-preparer.agent.md

framework-docs-maintainer.agent.md

## External Integration Boundaries

This framework also distinguishes between repository-authoritative artifacts and
external documentation systems.

Examples:

- Atlassian MCP is used for Jira and Confluence retrieval
- Word intake must be supported through the requirements-analysis extraction workflow
- Confluence publication is separate from the approved SDLC requirements contract
- Framework documentation maintenance is a repository-only documentation role

Agents must not read credential-bearing MCP configuration or construct direct
REST calls to bypass an unavailable authorized tool. If the required source
tool is unavailable, the requirements stage reports `SOURCE ACCESS BLOCKED`.

The important rule is that external publishing does not redefine the
requirements source of truth.

## Agent Responsibilities

An agent should define:

- identity
- lifecycle stage
- responsibility
- scope
- entry gates
- authoritative artifacts
- allowed tools
- prohibited behavior
- output artifact
- stopping condition

## Example

Implementation Engineer:

WHO:

A senior implementation engineer.

Responsibility:

Implement one approved IMP task.

Boundary:

Must not redesign architecture.

Gate:

Implementation Plan must be approved.

Stopping rule:

Stop after task verification and wait for human acceptance.

---

# Agent Tool Restrictions

Custom agents can restrict the tools available to them.

This is useful for role separation.

For example:

A Design Reviewer may need:

- read
- search

but should not need to edit production code.

An Implementation Engineer may need:

- read
- search
- edit
- execute

Tool restriction is useful but does not replace behavioral instructions.

---

# 3. Agent Skills

## Purpose

Skills define reusable methodology that Copilot can load when relevant.

Project skills use:

.github/skills/<skill-name>/SKILL.md

Examples:

.github/skills/requirements-analysis/SKILL.md

.github/skills/architecture-design/SKILL.md

.github/skills/design-review/SKILL.md

.github/skills/implementation-planning/SKILL.md

.github/skills/task-implementation/SKILL.md

.github/skills/code-review/SKILL.md

.github/skills/final-verification/SKILL.md

.github/skills/pull-request-preparation/SKILL.md

.github/skills/user-story-documentation/SKILL.md

## Skill Structure

A skill contains YAML frontmatter and instructions.

At minimum:

---
name: skill-name
description: >
  Explanation of what the skill does and when it should be used.
---

# Skill Name

Reusable methodology goes here.

## Skill Design Rule

A Skill should explain HOW to perform a class of task.

It should normally avoid application-specific details.

For example:

Good skill responsibility:

Verify task dependencies before implementation.

Too application-specific:

Ensure Vegan breakfast recipe FR-004 uses the Meal Planner catalogue.

That belongs in the application artifact or task prompt.

---

# Skills Versus Instructions

Use Instructions for simple rules that matter to many interactions.

Use Skills for detailed methodology relevant only when a particular type of
task is being performed.

Examples:

Instruction:

Never infer human approval.

Skill:

Detailed methodology for performing an independent Design Review.

---

# 4. Prompt Files

## Purpose

Prompt files are reusable workflow starters.

Repository prompt files live under:

.github/prompts/

Examples:

sdlc-requirements.prompt.md

sdlc-architecture.prompt.md

sdlc-design-review.prompt.md

sdlc-implementation-plan.prompt.md

sdlc-implement-task.prompt.md

sdlc-code-review.prompt.md

sdlc-final-verification.prompt.md

sdlc-pr-preparation.prompt.md

sdlc-orchestrate.prompt.md

publish-story-documentation.prompt.md

## Prompt Responsibility

A prompt answers:

WHAT should happen now?

Example:

Current stage:

Implementation

Task:

IMP-006

Read:

requirements.md
architecture.md
impl-plan.md

Execute only IMP-006.

Stop after verification.

The implementation methodology remains in the Skill.

The implementation role remains in the Agent.

---

# Prompt Variables

Prompt files can support input-driven workflows.

However, this capstone found that explicit task identifiers in the submitted
chat request were more reliable for the implementation workflow than depending
on an unresolved placeholder.

The implementation workflow therefore used explicit input such as:

Task ID: IMP-006

This also makes task scope visible to the human operator.

---

# 5. Hooks

## Purpose

Hooks execute external commands at specific Copilot lifecycle events.

Repository hook configuration uses:

.github/hooks/*.json

Hooks are useful when a rule should be enforced deterministically rather than
only through natural-language agent instructions.

Examples:

- deny dangerous tool calls
- log agent actions
- run security checks
- run validation
- enforce policy

## Current Surface Support

Current GitHub documentation describes Copilot hooks for:

- Copilot CLI
- Copilot cloud agent

The repository contains hook configuration and scripts, but this capstone has
not claimed runtime verification through VS Code Copilot Chat. Verify hooks on
a supported Copilot CLI or cloud-agent surface before relying on them for
operational governance.

---

# Current Hook Configuration

The configured hooks and scripts are under `.github/hooks/`:

- `sessionStart` injects repository SDLC guardrails.
- `preToolUse` denies selected destructive or unsafe shell operations,
  including forced pushes, hard resets, forced cleanup, PR merges, and
  `npm audit fix --force`.
- `postToolUse` recognizes verification commands, reminds the agent to record
  actual evidence, and writes minimal tool metadata to
  `.git/copilot-hooks-audit.jsonl` when Git metadata is available.
- `errorOccurred` records minimal error-event metadata without storing full
  messages, arguments, stack traces, or credentials.

There is no generic `agentStop` evidence gate. The hook configuration exists,
but runtime behavior has not been claimed as verified through VS Code Copilot
Chat; verify it on a supported Copilot CLI or cloud-agent surface before
relying on it for operational governance. See `.github/hooks/README.md` for
detailed behavior and test guidance.

---

# Choosing the Correct Customization

Use this decision model.

## Does the rule apply to almost everything in the repository?

Use:

Custom Instructions

## Is this a specialized responsibility?

Use:

Custom Agent

## Is this reusable methodology?

Use:

Skill

## Is this a specific workflow invocation?

Use:

Prompt File

## Must it happen deterministically at an execution event?

Use:

Hook

---

# Avoiding Duplication

A common customization mistake is copying the same instructions into:

- copilot-instructions.md
- agent
- skill
- prompt

This increases inconsistency.

Instead use ownership.

Example:

Repository rule:

Never infer human approval.

Location:

copilot-instructions.md

Role behavior:

Implementation Engineer cannot approve its own task.

Location:

implementation-engineer.agent.md

Reusable methodology:

Verify dependencies before modifying code.

Location:

task-implementation/SKILL.md

Specific invocation:

Task ID: IMP-007

Location:

sdlc-implement-task.prompt.md or the submitted chat request

---

# Source-of-Truth Design

Agents should know which artifact owns each lifecycle decision.

Example:

Requirements Approval
→ requirements.md

Architecture Approval
→ architecture.md

Design Review Outcome
→ design-review.md

Implementation Plan Approval
→ impl-plan.md

Code Review Outcome
→ code-review.md

Final Verification Outcome
→ verification.md

This avoids accidentally interpreting historical metadata as current state.

---

# Human Approval Pattern

Use explicit text for important approvals.

Example:

I explicitly approve:

`<application-root>/docs/sdlc/architecture.md`

Then update the authoritative artifact.

Do not rely on statements such as:

looks okay

or:

continue

when the lifecycle requires explicit approval.

---

# Task Execution Pattern

Implementation tasks use the following model:

Task = READY

Agent verifies gates.

Agent verifies dependencies.

Agent implements one task.

Agent executes tests.

Agent records evidence.

Agent reports:

IMPLEMENTED — PENDING HUMAN ACCEPTANCE

Human reviews.

Task becomes:

DONE

This limits uncontrolled autonomous implementation.

---

# Independent Agent Pattern

Use separate agents for creation and review.

Creator:

solution-architect

Reviewer:

design-reviewer

Creator:

implementation-engineer

Reviewer:

code-reviewer

Final Product Verification:

verification-engineer

This reduces self-review bias and makes lifecycle responsibilities explicit.

---

# GitHub Copilot Plan and Surface Considerations

Copilot feature availability depends on:

- Copilot plan
- client
- feature
- organization policy
- usage limits

Copilot Free provides a limited Copilot experience and limited agent usage.

Do not assume that every GitHub Copilot feature available in documentation will
have identical availability in every Copilot plan or client.

When a workflow fails because of model capacity, quota, feature availability,
or client limitations:

1. record the limitation
2. do not fabricate completion
3. preserve the prepared artifact
4. complete the remote/action step later when the required environment is
   available

---

# Example Capability Bundle

A complete SDLC capability usually contains:

.github/
├── agents/
│   └── implementation-planner.agent.md
├── skills/
│   └── implementation-planning/
│       └── SKILL.md
└── prompts/
    └── sdlc-implementation-plan.prompt.md

Interpretation:

Agent:

WHO is responsible?

Skill:

HOW should planning be performed?

Prompt:

WHAT application should be planned now?

---

# Recommended Naming

Agents:

<role>.agent.md

Examples:

solution-architect.agent.md

code-reviewer.agent.md

Skills:

lowercase-hyphenated-name/SKILL.md

Examples:

architecture-design/SKILL.md

final-verification/SKILL.md

Prompts:

workflow-name.prompt.md

Examples:

sdlc-architecture.prompt.md

sdlc-final-verification.prompt.md

---

# Framework Customizations Present

## Instructions

.github/copilot-instructions.md

## Agents

requirements-analyst.agent.md

sdlc-orchestrator.agent.md

user-story-documenter.agent.md

solution-architect.agent.md

design-reviewer.agent.md

implementation-planner.agent.md

implementation-engineer.agent.md

code-reviewer.agent.md

verification-engineer.agent.md

pr-preparer.agent.md

framework-docs-maintainer.agent.md

## Skills

requirements-analysis

architecture-design

design-review

implementation-planning

task-implementation

code-review

final-verification

pull-request-preparation
user-story-documentation

## Prompts

sdlc-requirements.prompt.md

sdlc-architecture.prompt.md

sdlc-design-review.prompt.md

sdlc-implementation-plan.prompt.md

sdlc-implement-task.prompt.md

sdlc-code-review.prompt.md

sdlc-final-verification.prompt.md

sdlc-pr-preparation.prompt.md

sdlc-orchestrate.prompt.md
publish-story-documentation.prompt.md

## Hooks

.github/hooks/sdlc-guardrails.json

.github/hooks/scripts/session-start.mjs

.github/hooks/scripts/pre-tool-policy.mjs

.github/hooks/scripts/post-tool-evidence.mjs

.github/hooks/scripts/error-audit.mjs

---

# Official GitHub Documentation Basis

This guide is based on current GitHub documentation covering:

- Copilot customization options
- repository custom instructions
- prompt files
- custom agents
- custom-agent configuration
- agent skills
- Copilot hooks
- Copilot plans

GitHub Copilot evolves frequently.

Verify current official documentation before depending on a customization
feature for production governance.