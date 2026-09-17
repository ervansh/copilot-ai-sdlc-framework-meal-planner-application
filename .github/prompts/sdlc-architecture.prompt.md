# SDLC Architecture — Meal Planner

Application:

`meal-planner/`

Current SDLC stage:

`Architecture`

Use the `solution-architect` custom agent.

Apply the project's architecture-design methodology when relevant.

## Source

Read:

`meal-planner/docs/sdlc/requirements.md`

Before proceeding, verify:

- Document status = APPROVED
- Approval status = APPROVED
- No blocking requirements questions remain

If the Requirements Gate has not passed:

1. do not create architecture
2. explain why the Architecture stage is blocked
3. stop

## Target

Create:

`meal-planner/docs/sdlc/architecture.md`

## Task

Design the simplest architecture that completely satisfies the approved Meal
Planner requirements.

The architecture must cover:

1. Architecture drivers
2. Constraints
3. Meaningful architecture options
4. Recommended technology stack
5. System context
6. Logical components
7. Component responsibilities
8. Conceptual data model
9. Key data flows
10. Meal-plan generation design
11. Meal replacement design
12. Persistence
13. Validation and error handling
14. Security and privacy
15. Performance
16. Accessibility and responsive design
17. Reliability and data integrity
18. Testability
19. Deployment model
20. Significant architecture decisions
21. Requirement traceability
22. Risks and tradeoffs

## Scope Rules

Do not change approved requirements.

Do not introduce capabilities that are explicitly out of scope.

Do not add unnecessary:

- microservices
- external recipe APIs
- authentication
- cloud databases
- queues
- native mobile applications

unless approved requirements justify them.

## Technology

Technology selection is allowed in Architecture.

Every significant technology recommendation must include:

- reason
- requirement fit
- meaningful tradeoff

Do not choose technology only because it is popular.

## Document Structure

The generated document must contain:

# Meal Planner Architecture

## Metadata
## Architecture Executive Summary
## Architecture Drivers
## Constraints
## Architecture Options Considered
## Recommended Technology Stack
## System Context
## Component Architecture
## Component Responsibilities
## Data Model
## Key Data Flows
## Meal Generation Design
## Meal Replacement Design
## Persistence Architecture
## Validation and Error Handling Architecture
## Security and Privacy
## Performance Architecture
## Accessibility and Responsive Design
## Reliability and Data Integrity
## Testability
## Deployment Model
## Architecture Decisions
## Requirement Traceability
## Risks and Tradeoffs
## Open Architecture Questions
## Design Review Handoff
## Approval

## Status

Set:

`Architecture Status: DRAFT — PENDING DESIGN REVIEW`

Do not approve the architecture.

Do not perform Design Review.

Do not create implementation tasks.

Do not write application source code.

Do not create tests.

After writing the document, summarize:

- architecture style
- technology stack
- major components
- ADRs
- risks
- open questions
- traceability status

Then stop.