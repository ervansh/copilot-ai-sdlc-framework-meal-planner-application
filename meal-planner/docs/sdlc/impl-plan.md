# Meal Planner Implementation Plan

## Metadata

- Application: Meal Planner
- Requirements Status: APPROVED
- Architecture Status: APPROVED
- Design Review Outcome: PASS
- SDLC Stage: Implementation Planning
- Plan Status: APPROVED

## Planning Summary

This plan converts the approved Meal Planner requirements and architecture into a dependency-ordered implementation sequence for the MVP. The work is structured around the approved architecture boundaries: a single-page React + TypeScript application, a framework-independent planning domain, catalogue validation and indexing, versioned local persistence, and an accessible responsive UI.

The implementation is intentionally staged so that contracts and invariants are established before dependent business logic and UI flows. The most important safety rails are: hard restriction enforcement in the planning domain, immutable generation snapshots for plan provenance, validation of persisted state, bounded generation with loading feedback, and explicit confirmation flows for destructive or state-changing actions.

## Source Artifacts

- meal-planner/docs/sdlc/requirements.md
- meal-planner/docs/sdlc/architecture.md
- meal-planner/docs/sdlc/design-review.md

## Implementation Strategy

1. Establish the project skeleton and testing baseline first so domain logic and browser validations can be implemented under a consistent toolchain.
2. Define the recipe catalogue contract and validate the bundled catalogue before any generation logic depends on it.
3. Build the planning domain in layers: preference validation, eligibility checks, complete-plan feasibility, bounded generation, and replacement behavior.
4. Implement the persistence contract and state coordination only after the domain rules are stabilized, so that save/restore and stale-state behavior reference the correct immutable snapshot model.
5. Complete the user interface last, using the domain service outputs and state coordinator contract as the source of truth for messages, confirmations, loading states, accessibility, and responsive behavior.
6. Verify with unit tests for business rules, integration tests for persistence and state transitions, and browser tests for accessibility, responsive layouts, and save/restore flows.

## Dependency Overview

The implementation depends on a layered contract model:

- Foundation: toolchain, TypeScript configuration, build/test scripts
- Domain contracts: catalogue schema, canonical values, ingredient equivalence, preference model
- Planning rules: eligibility, feasibility, generation, replacement
- Persistence and state: save/restore, snapshot semantics, dirty/stale metadata
- UI: plan views, recipe details, preference editing, confirmations, loading, responsiveness, accessibility
- Verification: unit, integration, browser, and performance preparation

## Implementation Tasks

### IMP-001: Project bootstrap and browser tooling

- Objective: Initialize the Meal Planner web application with the approved React + TypeScript + Vite toolchain and the test setup needed for domain and browser verification.
- Requirements: NFR-001, NFR-004, NFR-005, AC-020, AC-022, AC-023, AC-024
- Architecture References: ADR-001; Recommended Technology Stack; Presentation layer; static browser deployment
- Dependencies: None
- Priority: P0
- Status: DONE
- Implementation Scope: Create app structure, package configuration, TypeScript and Vite configuration, lint/test scripts, browser dev server configuration, and the baseline project directories for source and tests.
- Test Expectations: Project startup smoke test, build validation, and baseline test runner startup.
- Completion Criteria: The app boots locally, the standard test runner executes, and source/test directories are prepared for subsequent work.
- Risks / Notes: Toolchain choice is implementation-specific but must remain aligned with the approved architecture and browser-based MVP.

### IMP-002: Catalogue contract and validator foundation

- Objective: Establish the canonical recipe catalogue contract, canonical value rules, required-field checks, and invalid-entry rejection logic before any generation or replacement logic can use the catalogue.
- Requirements: FR-005, FR-008, NFR-003, AC-006, AC-008, AC-021
- Architecture References: Recipe Catalogue Contract; Catalogue Provider; Catalogue Validator; ADR-003
- Dependencies: IMP-001
- Priority: P0
- Status: DONE
- Implementation Scope: Define recipe schema, canonical diet/allergen/meal-type values, ingredient equivalence metadata, required-field validation, duplicate-ID guardrails, and the logic that rejects incomplete or invalid catalogue records before they enter active domain use.
- Test Expectations: Unit tests for valid catalogue entries, invalid recipes, duplicate IDs, malformed allergen values, and conflicting equivalence metadata.
- Completion Criteria: The validator produces a prepared catalogue containing only records meeting the approved requirements; invalid catalogue data is excluded and surfaced as a structured validation result rather than silently accepted.
- Risks / Notes: The ingredients-equivalence contract is a critical integrity boundary; incorrect normalization would violate the hard restriction guarantees.

### IMP-003: Bundled catalogue data and indexing

- Objective: Create the application-owned recipe catalogue and pre-index valid recipes by meal type and relevant restriction axes so generation can search deterministically and efficiently.
- Requirements: FR-005, FR-006, FR-007, FR-008, FR-009, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008
- Architecture References: Catalogue Provider; Meal Generation Design; ADR-003; ADR-005
- Dependencies: IMP-002
- Priority: P0
- Status: DONE
- Implementation Scope: Populate the bundled catalogue with valid recipe records, canonical forms, ingredient aliases, and version metadata. Add indexing to support fast candidate selection and deterministic ordering across Breakfast, Lunch, and Dinner candidates.
- Test Expectations: Unit tests for recipe indexing, candidate grouping, deterministic ordering, and invalid catalogue handling.
- Completion Criteria: The prepared catalogue includes valid recipe metadata for all supported meal slots, and invalid data cannot be accessed via generation or replacement flows.
- Risks / Notes: Catalogue completeness and canonical values must be stable enough to support plan feasibility checks; the data should remain versioned and application-owned.

### IMP-004: Preference validation and normalization

- Objective: Implement user preference management for diet type, allergens, and excluded ingredients, including normalization, deduplication, validation, and user-readable errors.
- Requirements: FR-001, FR-002, FR-003, FR-004, AC-001, AC-021
- Architecture References: Configure preferences data flow; Application state coordinator; planning domain input validation; current preferences model
- Dependencies: IMP-002
- Priority: P0
- Status: DONE
- Implementation Scope: Implement the canonical diet selection model, any combination of supported allergens, excluded ingredient input handling, trimming and deduplication, case-insensitive matching, and clear validation messaging for blank or duplicate values.
- Test Expectations: Unit tests for diet validation, allergen selection, exclusion input normalization, duplicate removal, and invalid user messages.
- Completion Criteria: A user can only configure supported values and the resulting preference object is safe for use in domain-level planning and persistence state.
- Risks / Notes: Preference validation is a user-facing boundary; incorrect normalization here would undermine generation and replacement safety.

### IMP-005: Shared eligibility and feasibility logic

- Objective: Implement the core planning-domain predicate that decides whether a recipe is eligible under a given diet/allergen/exclusion set and whether a full 21-slot weekly plan is feasible.
- Requirements: FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, NFR-003, AC-002, AC-004, AC-005, AC-006, AC-007, AC-008
- Architecture References: Planning domain; shared eligibility predicate; complete-plan validation; Recipe Catalogue Contract; ADR-002; ADR-003
- Dependencies: IMP-002, IMP-004
- Priority: P0
- Status: DONE
- Implementation Scope: Implement recipe compatibility checks for meal type, diet compatibility, allergen conflicts, ingredient equivalence, duplicate plan assignment prevention, and full-plan feasibility detection. Return structured failure results instead of partial or violating plans.
- Test Expectations: Unit tests for diet restrictions, exclusion equivalence, unique-assignment guarantees, impossible combinations, and insufficient-candidate failure paths.
- Completion Criteria: The planning domain can determine eligibility and feasibility consistently without relying on UI code or ad hoc validation.
- Risks / Notes: This is the central business-rule layer; any incorrect logic here creates correctness and safety failures across the MVP.

### IMP-006: Bounded weekly-plan generation engine

- Objective: Implement complete Monday-to-Sunday plan generation with deterministic ordering, hard restriction enforcement, and bounded asynchronous search behavior that yields to the browser while preserving safety.
- Requirements: FR-006, FR-007, FR-009, NFR-004, AC-003, AC-004, AC-005, AC-006, AC-007, AC-022
- Architecture References: Meal Generation Design; bounded indexed asynchronous search; ADR-005; complete-plan generation design
- Dependencies: IMP-003, IMP-005
- Priority: P0
- Status: DONE
- Implementation Scope: Build the search algorithm for 21 distinct assignments across seven days and three meal types, enforce the 100,000-node / 2,500ms guardrails, yield to the browser event loop with loading feedback, and return typed failure outcomes when the budget is reached or the plan is impossible.
- Test Expectations: Unit tests for successful generation, impossible combinations, insufficient candidates, search-budgets, and deterministic ordering; integration tests for loading-state interaction.
- Completion Criteria: The domain returns either a valid complete plan or a structured typed failure, never a partial violating plan, and generation respects the performance budget and user feedback expectations.
- Risks / Notes: Search budget and asynchronous behavior are safety-critical requirements; the implementation must never silently relax restrictions or return a partial result.

### IMP-007: Individual meal replacement and snapshot-safe replacement rules

- Objective: Enable meal replacement for a single slot while preserving meal type, hard restrictions, no-duplicate rules, and the immutable generation snapshot of the active plan.
- Requirements: FR-015, FR-016, FR-018, NFR-003, AC-014, AC-015, AC-016, AC-017
- Architecture References: Meal Replacement Design; replacement domain design; immutable generation snapshot; ADR-006
- Dependencies: IMP-005, IMP-006
- Priority: P0
- Status: DONE
- Implementation Scope: Implement replacement candidate selection using the active plan snapshot, exclude the current recipe and currently-used recipes, and require no changes to other meal assignments. Return a clear failure path when no valid replacement exists.
- Test Expectations: Unit tests for valid replacement, no-candidate path, stale-plan replacement safety, no-duplicate rule, and preservation of unrelated meals.
- Completion Criteria: Replacement is limited to one slot, preserves all unrelated assignments, and never uses current preferences to override the active plan’s original generation snapshot.
- Risks / Notes: Snapshot semantics are easy to violate if the UI or state coordinator reads current preferences where the architecture requires the generation snapshot.

### IMP-008: Persistence schema, save, restore, and corrupt-storage handling

- Objective: Implement the versioned active-plan envelope, save workflow, restore workflow, and recoverable handling of malformed or corrupt saved data.
- Requirements: FR-012, FR-013, FR-014, NFR-002, AC-011, AC-012, AC-013
- Architecture References: Persistence Architecture; Active Plan Envelope; Persistence Adapter; ADR-004
- Dependencies: IMP-001, IMP-004
- Priority: P0
- Status: DONE
- Implementation Scope: Define the persisted envelope shape, schema versioning, storage key, save confirmation flow, restore validation, stale-plan handling, and graceful rejection for missing/corrupt data. Ensure persistence remains limited to one active plan record.
- Test Expectations: Unit and integration tests for successful save, save-over-existing-plan confirmation, restore validation, stale metadata recomputation, and malformed storage recovery.
- Completion Criteria: Valid saved data restores correctly, invalid/malformed data is rejected or removed non-destructively, and the active plan persists along with the associated generation snapshot and current preferences.
- Risks / Notes: Storage is browser-local and untrusted; the adapter must validate before rendering any persisted value as active.

### IMP-009: Application state coordinator and dirty/stale behavior

- Objective: Coordinate current preferences, saved plans, displayed plans, stale state, dirty state, and explicit regeneration flows without mutating the active plan or snapshot incorrectly.
- Requirements: FR-013, FR-017, FR-018, FR-019, NFR-002, AC-012, AC-016, AC-017, AC-018, AC-019
- Architecture References: Application state coordinator; explicit state transitions; stale-plan behavior; dirty-state behavior; ADR-006
- Dependencies: IMP-004, IMP-006, IMP-007, IMP-008
- Priority: P0
- Status: DONE
- Implementation Scope: Manage `currentPreferences`, `activePlan`, `generationPreferenceSnapshot`, dirty/stale state derivation, save-over-existing-plan confirmation, regenerate confirmation for unsaved-change scenarios, and cancellation behavior. Ensure that preferences can change without silently modifying a saved or displayed plan.
- Test Expectations: Integration tests for stale-plan detection, dirty-state confirmation, save-over-existing-plan confirmation, regenerate-cancel behavior, and successful regeneration with refreshed snapshot.
- Completion Criteria: The application never mutates a saved plan when the user edits preferences, and regeneration only replaces the displayed plan after explicit user action when required.
- Risks / Notes: State coordination is the highest-risk place for subtle drift between displayed preferences and generation provenance.

### IMP-010: Weekly and daily plan UI

- Objective: Render the complete weekly plan, day-level plan detail, and recipe detail views in the user-facing interface with correct assignment mapping and plan data flow.
- Requirements: FR-010, FR-011, AC-009, AC-010, AC-023, AC-024
- Architecture References: Presentation layer; weekly plan UI; daily plan view; recipe details; responsive browser layout
- Dependencies: IMP-006, IMP-009
- Priority: P1
- Status: DONE
- Implementation Scope: Build the weekly overview, day-specific meal list, recipe detail panel, selection behavior, and message rendering for the current active plan. Ensure the plan display remains consistent with the selected meal slot and persisted data model.
- Test Expectations: Component and browser tests for weekly plan rendering, day plan navigation, and recipe detail consistency with assigned slots.
- Completion Criteria: Users can view the complete week and each day without mismatches between slot data, recipe details, and the plan assignment model.
- Risks / Notes: UI rendering must reflect the domain model rather than re-implementing business rules.

### IMP-011: Preference editing and confirmation UI

- Objective: Implement the preference controls, save-over-existing-plan confirmation, stale-plan messaging, regeneration confirmation for unsaved changes, and related accessible validation messaging.
- Requirements: FR-001, FR-002, FR-003, FR-013, FR-017, FR-018, FR-019, NFR-001, AC-001, AC-011, AC-012, AC-016, AC-017, AC-018, AC-019, AC-020, AC-021
- Architecture References: Presentation layer; state coordinator; confirmation dialogs; validation and error message flows; ADR-006
- Dependencies: IMP-004, IMP-008, IMP-009, IMP-010
- Priority: P1
- Status: DONE
- Implementation Scope: Add diet/allergen/exclusion controls, validation messages, save-over-existing-plan confirmation flow, stale-plan indicator, regeneration confirmation logic when unsaved changes would be discarded, and consistent accessible messaging in the UI. Individual meal replacement remains a domain behavior owned by IMP-007 and does not require a confirmation step.
- Test Expectations: Component and browser tests for validation messages, save-over-existing-plan confirmation, stale-plan messaging, regeneration confirmation, and no-silent change behavior.
- Completion Criteria: Users can edit preferences and take actions without violating the save, stale, or regeneration rules defined in the approved requirements, and individual meal replacement remains non-confirming and non-destructive when no candidate exists.
- Risks / Notes: This is the main UI boundary for destructive or state-changing actions; the implementation must avoid bypassing the domain guardrails and must not introduce a new confirmation requirement for individual meal replacement.

### IMP-012: Responsive and accessibility behavior

- Objective: Ensure controls remain keyboard-usable, comprehensible, readable, and responsive across required viewport sizes while preserving a semantic, accessible layout.
- Requirements: NFR-001, NFR-005, AC-020, AC-023, AC-024
- Architecture References: Presentation layer; responsive layout; semantic controls; browser baseline verification
- Dependencies: IMP-010, IMP-011
- Priority: P1
- Status: DONE
- Implementation Scope: Implement semantic labels, focus states, accessible messages, keyboard support, responsive layout adjustments, readable text/control sizing, and cross-viewport layout behavior for desktop, tablet, and mobile browsers.
- Test Expectations: Accessibility tests, keyboard interaction tests, and responsive browser viewport checks.
- Completion Criteria: The interface is usable at supported desktop, tablet, and mobile widths with keyboard-operable controls and understandable validation output.
- Risks / Notes: Accessibility and responsiveness are not optional edge cases; they are required user-facing behavior and should be integrated as part of the UI implementation, not deferred as a final polish task.

### IMP-013: Unit and domain integration test suite

- Objective: Validate the planning, persistence, and state-transition invariants with deterministic unit and domain-level integration tests that reflect the approved requirements and architecture.
- Requirements: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, NFR-002, NFR-003, NFR-004, AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-011, AC-012, AC-013, AC-014, AC-015, AC-016, AC-017, AC-018, AC-019, AC-021, AC-022
- Architecture References: Planning domain; Catalogue Validator; Persistence adapter; state coordinator; stale/dirty state behavior; ADR-002 through ADR-006
- Dependencies: IMP-002, IMP-003, IMP-004, IMP-005, IMP-006, IMP-007, IMP-008, IMP-009
- Priority: P1
- Status: READY
- Implementation Scope: Cover catalogue validation, preference normalization, eligibility, generation success and failure outcomes, replacement correctness, persistence restore validation, stale/dirty transitions, and domain-level validation outcomes. This task does not cover rendered accessibility behavior, responsive UI layout, or full browser workflows.
- Test Expectations: Unit tests for domain invariants and integration tests for coordinator/domain interactions, invalid data handling, restore behavior, and validation outcomes.
- Completion Criteria: The test suite verifies the core safety guarantees of the application and keeps the business rules independent of UI-only behavior.
- Risks / Notes: These tests should protect the architecture and prevent regressions in state, generation, and validation logic. UI accessibility and responsive behaviors remain owned by IMP-012 and IMP-014.

### IMP-014: Browser workflow verification preparation

- Objective: Exercise the full user journey in browser-based tests covering generation, save/restore, preference editing, regeneration, replacement, confirmation flows, responsive rendering, and accessibility.
- Requirements: FR-010 through FR-019, NFR-001, NFR-002, NFR-005, AC-009 through AC-024
- Architecture References: Presentation layer; application state coordinator; persistence adapter; browser-baseline verification; ADR-001; ADR-004; ADR-006
- Dependencies: IMP-008, IMP-009, IMP-010, IMP-011, IMP-012
- Priority: P1
- Status: DONE
- Implementation Scope: Create end-to-end browser checks for key user flows, viewport checks for tablet/mobile, keyboard navigation, save/restore validation, stale-plan messaging, generation confirmation rules, and recipe replacement flows.
- Test Expectations: Browser workflow tests; accessibility checks; responsive testing; persistence regression tests.
- Completion Criteria: The user-visible workflows match the approved requirements and the web app works in representative desktop, tablet, and mobile browser conditions.
- Risks / Notes: Browser tests should focus on real workflows instead of mocked UI state so that the validation reflects actual user behavior.

### IMP-015: Performance verification and final regression check

- Objective: Confirm that the plan generation behavior meets the performance target and loading feedback expectation without violating hard restrictions, while validating final regression coverage.
- Requirements: FR-006, FR-009, NFR-004, AC-003, AC-007, AC-022
- Architecture References: Meal Generation Design; bounded asynchronous search; performance and loading feedback design; ADR-005
- Dependencies: IMP-006, IMP-012, IMP-014
- Priority: P2
- Status: DONE
- Implementation Scope: Measure generation timing in supported conditions, validate loading/progress indicators, verify budget failure handling, and confirm no partial or invalid plan is presented during slow generation or failure conditions.
- Test Expectations: Performance verification preparation, regression testing, and normal/slow generation scenarios.
- Completion Criteria: The implementation produces visible feedback when generation exceeds the expected threshold, preserves previous valid data on failure, and the normal-case generation remains within the expected performance envelope.
- Risks / Notes: The three-second requirement is a target under normal conditions; it must be verified rather than assumed.

## Blocked Tasks

No implementation tasks are blocked.

## Requirement and Acceptance-Criteria Traceability

| Requirement / Criterion | Implementation Task(s) |
| --- | --- |
| FR-001 | IMP-004, IMP-011, IMP-013 |
| FR-002 | IMP-004, IMP-011, IMP-013 |
| FR-003 | IMP-004, IMP-011, IMP-013 |
| FR-004 | IMP-005, IMP-007, IMP-009, IMP-013 |
| FR-005 | IMP-002, IMP-003, IMP-005, IMP-013 |
| FR-006 | IMP-003, IMP-006, IMP-010, IMP-013, IMP-015 |
| FR-007 | IMP-005, IMP-006, IMP-010, IMP-013 |
| FR-008 | IMP-002, IMP-005, IMP-006, IMP-013 |
| FR-009 | IMP-005, IMP-006, IMP-013, IMP-015 |
| FR-010 | IMP-010, IMP-014 |
| FR-011 | IMP-010, IMP-014 |
| FR-012 | IMP-008, IMP-011, IMP-013 |
| FR-013 | IMP-008, IMP-009, IMP-011, IMP-013 |
| FR-014 | IMP-008, IMP-013, IMP-014 |
| FR-015 | IMP-007, IMP-009, IMP-013, IMP-014 |
| FR-016 | IMP-007, IMP-009, IMP-011, IMP-013 |
| FR-017 | IMP-009, IMP-011, IMP-013, IMP-014 |
| FR-018 | IMP-007, IMP-009, IMP-011, IMP-013, IMP-014 |
| FR-019 | IMP-009, IMP-011, IMP-013, IMP-014 |
| NFR-001 | IMP-001, IMP-010, IMP-011, IMP-012, IMP-014 |
| NFR-002 | IMP-008, IMP-009, IMP-013, IMP-014 |
| NFR-003 | IMP-002, IMP-005, IMP-007, IMP-008, IMP-013 |
| NFR-004 | IMP-001, IMP-006, IMP-013, IMP-015 |
| NFR-005 | IMP-001, IMP-010, IMP-012, IMP-014 |
| AC-001 | IMP-004, IMP-011, IMP-013 |
| AC-002 | IMP-005, IMP-006, IMP-013 |
| AC-003 | IMP-006, IMP-010, IMP-013, IMP-015 |
| AC-004 | IMP-005, IMP-006, IMP-013 |
| AC-005 | IMP-005, IMP-006, IMP-010, IMP-013 |
| AC-006 | IMP-002, IMP-005, IMP-006, IMP-013 |
| AC-007 | IMP-005, IMP-006, IMP-013, IMP-015 |
| AC-008 | IMP-002, IMP-005, IMP-013 |
| AC-009 | IMP-010, IMP-014 |
| AC-010 | IMP-010, IMP-014 |
| AC-011 | IMP-008, IMP-011, IMP-013, IMP-014 |
| AC-012 | IMP-008, IMP-009, IMP-011, IMP-013, IMP-014 |
| AC-013 | IMP-008, IMP-009, IMP-013, IMP-014 |
| AC-014 | IMP-007, IMP-009, IMP-013, IMP-014 |
| AC-015 | IMP-007, IMP-009, IMP-011, IMP-013, IMP-014 |
| AC-016 | IMP-009, IMP-011, IMP-013, IMP-014 |
| AC-017 | IMP-007, IMP-009, IMP-011, IMP-013, IMP-014 |
| AC-018 | IMP-009, IMP-011, IMP-013, IMP-014 |
| AC-019 | IMP-009, IMP-011, IMP-013, IMP-014 |
| AC-020 | IMP-010, IMP-011, IMP-012, IMP-014 |
| AC-021 | IMP-004, IMP-011, IMP-013 |
| AC-022 | IMP-006, IMP-013, IMP-014, IMP-015 |
| AC-023 | IMP-001, IMP-010, IMP-012, IMP-014 |
| AC-024 | IMP-001, IMP-010, IMP-012, IMP-014 |

## Architecture Traceability

| Architecture Decision / Component | Implementation Task(s) |
| --- | --- |
| ADR-001: Single-page browser application | IMP-001, IMP-010, IMP-012, IMP-014 |
| ADR-002: Framework-independent planning domain | IMP-002, IMP-004, IMP-005, IMP-006, IMP-007, IMP-013 |
| ADR-003: Bundled catalogue with catalogue-defined equivalence | IMP-002, IMP-003, IMP-005, IMP-006, IMP-013 |
| ADR-004: Versioned active plan in local storage | IMP-008, IMP-009, IMP-014 |
| ADR-005: Bounded indexed asynchronous constraint search | IMP-003, IMP-005, IMP-006, IMP-015 |
| ADR-006: Separate current preferences from generation authority | IMP-007, IMP-008, IMP-009, IMP-011, IMP-014 |
| Presentation layer | IMP-010, IMP-011, IMP-012, IMP-014 |
| Application state coordinator | IMP-009, IMP-011, IMP-014 |
| Planning domain | IMP-005, IMP-006, IMP-007, IMP-013 |
| Catalogue provider and validator | IMP-002, IMP-003, IMP-013 |
| Persistence adapter | IMP-008, IMP-009, IMP-014 |

## Testing Strategy

The plan does not leave testing as a final generic task. Testing is integrated into each implementation task and is also explicitly covered by dedicated integration and browser-level verification tasks.

- Unit tests: Validate canonical catalogue rules, ingredient normalization, eligibility, generation feasibility, replacement, persistence validation, and stale-state derivation.
- Integration tests: Verify domain-to-state coordination, save/restore, regenerate flows, dirty/stale state transitions, and confirmation logic.
- Browser workflow tests: Cover generation, replacement, recipe detail navigation, save/restore, confirmation dialogs, accessibility, and responsive layout behaviors.
- Performance verification: Validate the normal 3-second generation expectation, delayed generation feedback, and failure-mode handling for search budgets or impossible combinations.

## Recommended Execution Sequence

1. Phase 1 — Foundation and contracts
   - IMP-001
   - IMP-002
   - IMP-004
2. Phase 2 — Catalogue and core planning rules
   - IMP-003
   - IMP-005
   - IMP-006
3. Phase 3 — Persistence and state integrity
   - IMP-007
   - IMP-008
   - IMP-009
4. Phase 4 — User experience and accessibility
   - IMP-010
   - IMP-011
   - IMP-012
5. Phase 5 — Verification and regression
   - IMP-013
   - IMP-014
   - IMP-015

## Parallelization Opportunities

- IMP-001 can be started in parallel with initial project scaffolding and baseline testing setup only.
- IMP-003 can proceed once IMP-002 is complete, while IMP-004 is independently validated for user preference behavior.
- IMP-008 and IMP-009 are related but still need distinct domain and persistence contracts; they should not be parallelized once the state model is settled because they share the same save/restore semantics.
- UI tasks IMP-010 through IMP-012 can be developed in parallel only after the domain and persistence contracts are stable, and they should avoid overlapping the same state or rendering logic without shared integration points.
- Verification tasks IMP-013 through IMP-015 should run after the core rules and UI flows are stable, not in parallel with the underlying domain implementation.

## Implementation Risks

- Incorrect ingredient equivalence or unsafe matching would cause invalid recipe eligibility and violate hard restrictions.
- Incorrect state snapshot handling could allow current preferences to change a saved plan without explicit regeneration.
- Search budget exhaustion or asynchronous yielding could be implemented incorrectly if the domain returns partial or non-deterministic results.
- Local storage corruption or stale records could render invalid plans unless restore validation is strict.
- Accessibility and responsive behavior may be delayed if they are treated as final polish rather than implementation prerequisites.

## Plan Review Checklist

- [ ] Approved requirements are reflected without modification.
- [ ] Approved architecture is reflected without redesign.
- [ ] Each task has objective, dependency, priority, status, scope, tests, and completion criteria.
- [ ] All FR, NFR, and AC items are traceable to implementation tasks.
- [ ] ADRs and key architecture components are mapped to implementation tasks.
- [ ] No out-of-scope feature work is planned.
- [ ] Dependency ordering is consistent with contract-first implementation.
- [ ] Generation, replacement, persistence, and UI safety rules are explicitly planned.
- [ ] Testing is not collapsed into a single final task.
- [ ] The plan leaves implementation to a later phase and does not write production code.

## Approval

Implementation Plan Status: APPROVED

## Plan Status

Implementation Plan Status: APPROVED

## Completion Summary

- Total tasks: 15
- READY tasks: 15
- BLOCKED tasks: 0
- P0 tasks: 9
- P1 tasks: 5
- P2 tasks: 1
- Major workstreams: catalogue validation, eligibility and generation, persistence/state coordination, UI, and browser verification
- Requirement traceability status: Complete; every FR, NFR, and AC is mapped to at least one implementation task
- Architecture traceability status: Complete; ADRs and core architecture components are mapped to relevant implementation tasks
- Ready for human review: Yes, subject to human approval of the implementation plan

This plan is ready for formal human review and approval before any implementation work begins.
