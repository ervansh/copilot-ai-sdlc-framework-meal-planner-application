# GitHub Copilot Hooks

## Purpose

This directory contains deterministic guardrails for the Agentic SDLC
framework.

Natural-language instructions guide agent behavior.

Hooks provide an additional execution-time enforcement layer.

## Supported Runtime

Repository hooks are intended for:

- GitHub Copilot CLI
- Copilot cloud agent

They are stored under:

.github/hooks/*.json

The primary capstone workflow was performed through VS Code Copilot Chat.

Therefore these hooks are implemented in the repository but have not been
claimed as runtime-verified through the VS Code workflow.

Runtime hook verification should be performed later using Copilot CLI or
Copilot cloud agent.

## Hook Configuration

Primary configuration:

.github/hooks/sdlc-guardrails.json

## sessionStart

Script:

.github/hooks/scripts/session-start.mjs

Purpose:

Inject repository SDLC guardrails into the beginning of an agent session.

The context reminds the agent about:

- lifecycle artifact ownership
- explicit human approvals
- historical review metadata
- independent review boundaries
- evidence requirements
- environment limitations

## preToolUse

Script:

.github/hooks/scripts/pre-tool-policy.mjs

Purpose:

Deterministically deny selected destructive or unsafe shell operations.

Current blocked patterns include:

- git push --force
- git push --force-with-lease
- remote branch deletion
- git reset --hard
- forced git clean
- forced branch deletion
- broad working-tree restore
- gh pr merge
- gh repo delete
- npm audit fix --force
- selected broad recursive filesystem deletion

Allowed operations are not automatically approved.

The script returns an empty hook decision for operations that do not match a
blocking rule, leaving Copilot's normal permission flow intact.

## postToolUse

Script:

.github/hooks/scripts/post-tool-evidence.mjs

Purpose:

Detect important verification commands and remind the agent to record actual
execution evidence.

Recognized command families include:

- npm test
- browser tests
- lint
- TypeScript checks
- build
- npm audit

The hook also records minimal tool metadata in:

.git/copilot-hooks-audit.jsonl

when Git metadata exists.

Raw command arguments and tool results are intentionally not written to the
audit log.

## errorOccurred

Script:

.github/hooks/scripts/error-audit.mjs

Purpose:

Record minimal error-event metadata for debugging and audit purposes.

The hook intentionally does not store:

- stack traces
- full error messages
- command arguments
- credentials

## Why There Is No Mandatory agentStop Hook

The framework intentionally does not currently block every agent completion
with a generic agentStop rule.

Different SDLC roles have different required artifacts.

A generic stop hook could incorrectly block:

- requirements clarification
- architecture discussion
- documentation work
- independent review
- implementation
- PR preparation

Artifact-specific completion rules remain owned by the corresponding custom
agents.

A future iteration may introduce stage-aware stop hooks when the execution
runtime exposes sufficiently reliable stage information.

## Safety Philosophy

Hooks complement Agents, Skills, Prompts, and repository instructions.

They do not replace them.

Use:

Instructions for repository-wide behavior.

Agents for responsibility and role boundaries.

Skills for reusable methodology.

Prompts for specific workflow invocation.

Hooks for deterministic execution-time policy.

## Testing

When Copilot CLI or cloud agent is available, verify the hook behavior in a
test branch or disposable repository first.

Expected safety tests include:

git push --force
→ DENIED

git reset --hard HEAD
→ DENIED

npm audit fix --force
→ DENIED

gh pr merge <number>
→ DENIED

npm test
→ ALLOWED through the normal permission flow
→ post-tool evidence reminder after successful execution

Normal safe Git and test commands should remain usable.

Do not test destructive commands against valuable uncommitted work.

## Audit Data

When a .git directory exists, hook audit metadata is stored at:

.git/copilot-hooks-audit.jsonl

Because this file is inside .git, it is not committed as repository content.

Audit records intentionally contain minimal metadata only.