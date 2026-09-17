---
name: architecture-design
description: >
  Reusable methodology for designing software architecture from approved
  requirements. Use when identifying architecture drivers, evaluating options,
  defining components and data flows, choosing technologies, designing
  persistence, documenting architecture decisions, assessing risks, and
  creating requirements traceability.
---

# Architecture Design Skill

## Purpose

Provide a repeatable architecture-design method.

This skill defines HOW architecture analysis should be performed.

It does not define the Solution Architect persona.

It does not contain Meal Planner-specific business requirements.

## Architecture Method

### Step 1 — Verify Preconditions

Before designing:

- confirm the requirements artifact exists
- confirm requirements are approved
- confirm no blocking requirements questions remain

If the requirements gate has not passed, stop.

### Step 2 — Identify Architecture Drivers

Review approved:

- Functional Requirements
- Non-Functional Requirements
- Acceptance Criteria
- scope constraints
- assumptions

Identify requirements that materially influence architecture.

Typical drivers include:

- application platform
- persistence
- performance
- security
- accessibility
- responsive design
- external integrations
- data integrity

Reference requirement IDs.

### Step 3 — Identify Constraints

Record relevant constraints such as:

- application scope
- explicit out-of-scope decisions
- capstone/MVP simplicity
- browser requirements
- persistence expectations
- external-integration restrictions

Do not invent constraints.

### Step 4 — Consider Meaningful Alternatives

When a real architectural choice exists, compare reasonable options.

Evaluate:

- requirement fit
- complexity
- maintainability
- testability
- performance
- security
- operational burden

Do not invent alternatives merely to make the document larger.

### Step 5 — Select the Simplest Sufficient Architecture

Prefer the least complex design that fully satisfies the requirements.

Avoid unnecessary distributed-system infrastructure.

### Step 6 — Define Logical Components

For every component identify:

- responsibility
- inputs
- outputs
- dependencies
- requirements served

Business-rule ownership should be explicit.

### Step 7 — Define Conceptual Data

Identify the minimum important domain concepts.

For each concept describe:

- purpose
- important data
- relationships
- persistence needs

Stay at architecture level.

Do not generate source-code classes.

### Step 8 — Describe Key Data Flows

For every important workflow identify:

1. user/system input
2. receiving component
3. business-rule processing
4. persistence interaction
5. result
6. failure path

### Step 9 — Design Persistence

Define:

- persisted data
- storage approach
- save behavior
- restore behavior
- replacement behavior
- invalid-data behavior

Use the simplest storage mechanism that satisfies the requirements.

### Step 10 — Address Validation and Errors

Determine which component owns each major validation or failure scenario.

Avoid duplicated business validation.

### Step 11 — Address Security

Review:

- user input
- rendering
- persisted information
- credentials
- external connections
- dependency risk

Match security analysis to actual scope.

### Step 12 — Address Non-Functional Requirements

For every architecture-relevant NFR:

- reference the NFR ID
- describe how architecture supports it
- describe how it can later be verified

Do not claim the NFR has already passed.

### Step 13 — Design for Testability

Identify separable test boundaries for:

- business rules
- persistence
- integrations
- user interface
- non-functional verification

Do not write tests during Architecture.

### Step 14 — Record Architecture Decisions

Use:

`ADR-###`

for significant choices.

Document:

- Context
- Decision
- Rationale
- Alternatives
- Consequences

### Step 15 — Maintain Traceability

Every architecture-relevant FR/NFR must map to:

- a component
- an architecture decision
- or both

Missing mappings must remain visible.

### Step 16 — Record Risks

For every significant architecture risk capture:

- risk
- impact
- mitigation
- remaining concern

## Completion Checklist

Architecture is ready for Design Review when:

- requirements approval is verified
- architecture drivers are documented
- constraints are documented
- meaningful alternatives were considered
- architecture style is justified
- technology choices are justified
- components have clear responsibilities
- data concepts are defined
- important data flows are defined
- persistence is defined
- validation ownership is defined
- security is addressed
- NFRs are addressed
- testability is addressed
- deployment is described
- important ADRs exist
- requirement traceability exists
- risks are documented
- no production code was created

Architecture completion does not mean Architecture approval.