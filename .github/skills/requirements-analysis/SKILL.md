---
name: requirements-analysis
description: >
  Perform structured software requirements analysis. Use this skill when
  analysing a user story, identifying ambiguity, asking clarification
  questions, defining functional and non-functional requirements, creating
  acceptance criteria, managing scope, or building requirements traceability.
---

# Requirements Analysis Skill

## Purpose

Provide a reusable requirements-analysis methodology for any application
developed through the Agentic SDLC framework.

The skill defines HOW requirements analysis should be performed.

Application-specific requirements must remain in the application's SDLC
artifacts.

## Analysis Method

### 1. Establish the source

Identify the source requirement and record its provenance.

Do not manufacture unavailable source information.

### 2. Extract the core user intent

Identify:

- actor
- requested capability
- desired outcome
- business/user value

### 3. Analyse requirement completeness

Review the requirement across these areas when applicable:

#### User workflow

- starting condition
- primary workflow
- alternative workflows
- completion condition

#### Data

- required inputs
- generated outputs
- persistence
- updates
- deletion
- invalid data

#### Business rules

- restrictions
- permitted values
- prohibited values
- conflict resolution

#### Error behaviour

- missing input
- invalid input
- unavailable result
- empty result
- failed operation
- impossible combination

#### Security and privacy

- authentication
- authorization
- sensitive information
- user-controlled input

Only include categories relevant to the feature.

#### Usability

- expected interaction
- first-time experience
- responsiveness
- accessibility

#### Scope

Identify:

- explicitly required capability
- explicitly excluded capability
- potential future capability

Do not convert future ideas into current requirements.

### 4. Identify ambiguity

Create clarification questions only where an answer changes:

- observable behaviour
- acceptance criteria
- scope
- security
- data
- interfaces
- downstream architecture

### 5. Ask incrementally

Prefer 5–10 related questions per interaction.

Each question contains:

- identifier
- question
- why it matters
- options where useful
- blocking/non-blocking status when relevant

Stop after each batch.

### 6. Convert answers into requirements

Use:

- `FR-###` for functional requirements
- `NFR-###` for non-functional requirements
- `AC-###` for acceptance criteria
- `Q-###` for unresolved questions

Keep identifiers stable after they are created.

### 7. Validate quality

Every functional requirement should be:

- clear
- atomic enough to verify
- implementation-independent where practical
- consistent with other requirements

Every acceptance criterion should:

- describe observable behaviour
- map to one or more requirements
- be objectively verifiable

### 8. Validate completeness

Before declaring requirements ready for review, verify:

- user story recorded
- objective recorded
- in-scope features identified
- out-of-scope features identified
- functional requirements defined
- relevant NFRs defined
- error behaviour defined
- assumptions recorded
- blocking questions resolved
- acceptance criteria present
- traceability present

### 9. Human approval boundary

Requirements readiness is not requirements approval.

Only explicit human confirmation may change the approval state from:

`PENDING`

to:

`APPROVED`

Never infer approval.

## Output Location

For the current application, write finalized requirements to:

`meal-planner/docs/sdlc/requirements.md`

Do not write application requirements into framework directories.