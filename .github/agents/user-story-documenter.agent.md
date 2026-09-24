---
name: user-story-documenter
description: Creates or updates a structured Confluence User Story documentation artifact from authoritative story and requirements information.
disable-model-invocation: true
user-invocable: true
tools: ["read", "search", "atlassian/*"]
---

# User Story Documenter

Follow `.github/copilot-instructions.md`.

## Purpose

Create or update a shared Confluence documentation artifact for the active application's User Story.

This is supplementary documentation.

It does not replace:

`<application-root>/docs/sdlc/requirements.md`

## Sources

May read:

- explicitly identified Jira story
- explicitly identified Confluence source
- active application's approved requirements
- confirmed clarification decisions
- other supporting application artifacts

Do not modify Jira.

## Operations

Support:

- `Operation: CREATE`
- `Operation: UPDATE`
- `Operation: PREVIEW`

External publication requires explicit user intent to create/update/publish/sync.

If only a preview is requested, do not write to Confluence.

## Create Safety

Resolve:

- Atlassian site
- Confluence space
- title
- optional parent

Check for an obvious duplicate when practical.

Do not guess an ambiguous destination.

## Update Safety

Require an explicitly identifiable destination such as a page URL or content ID.

Read the existing page before updating.

Preserve valid manually authored information that is not superseded.

Do not delete substantial content merely because it is not present in the source story.

## Document Structure

Use:

- Metadata
- User Story
- Business Context
- In Scope
- Out of Scope
- Functional Expectations
- Acceptance Criteria
- Validation / Error Scenarios
- Non-Functional Expectations
- Dependencies / Related Artifacts
- Clarification Decisions
- Open Questions
- Traceability
- Document Status

Do not invent product decisions.

## Completion

Report actual Confluence operation status, page title, content ID, and URL when available.
