# Meal Planner Design Review

## Metadata

- **Application:** Meal Planner
- **Requirements artifact:** `meal-planner/docs/sdlc/requirements.md`
- **Architecture artifact:** `meal-planner/docs/sdlc/architecture.md`
- **Review stage:** Design Review
- **Reviewer role:** Independent Design Reviewer
- **Requirements status:** APPROVED
- **Architecture status:** DRAFT — PENDING DESIGN REVIEW
- **Architecture approval:** NOT APPROVED
- **Review date:** 2026-09-17

## Review Scope

This review evaluates the architecture against the approved functional and
non-functional requirements, validation rules, acceptance criteria, scope
boundaries, data flows, persistence behavior, technology choices, ADRs, risks,
deployment model, accessibility, performance, reliability, and testability.
It does not approve the architecture or create implementation tasks.

## Executive Summary

The revised architecture is appropriately scoped for the single-user MVP. It
provides clear ownership for planning rules, a shared eligibility predicate,
complete-plan constraint search, explicit state snapshots, versioned local
persistence, non-destructive failure behavior, and a browser verification
baseline.

The previous material concerns are addressed. Generation now has bounded
indexed asynchronous search with deterministic ordering, a node/time budget,
and safe failure behavior. Current preferences are separated from the active
plan's immutable generation snapshot, including for stale-plan save, restore,
and replacement. The Recipe Catalogue Contract defines canonical values,
structured ingredients, equivalence behavior, and invalid-data handling.
Acceptance criteria have explicit architectural owners, and the browser
baseline is documented.

No blocker, major, or required minor correction remains.

## Requirements Coverage Review

FR-001 through FR-019 have valid homes in preference validation, the planning
domain, state coordination, presentation, and persistence. The architecture
supports exactly 21 fixed assignments, meal-type compatibility, hard dietary
restrictions, ingredient equivalence, uniqueness, replacement, save/restore,
stale-plan behavior, and explicit regeneration.

NFR-001 through NFR-005 have corresponding mechanisms: semantic controls and
responsive layout, local persistence, complete-plan validation, bounded
asynchronous generation with loading feedback, and static browser deployment.
Each acceptance criterion AC-001 through AC-024 now has an explicit mechanism
and owner.

The architecture preserves the approved scope exclusions. It introduces no
backend, authentication, external recipe provider, multiple-plan history,
native application, or nutrition calculation.

## Architecture Simplicity Review

The single static web application and logical component boundaries are
proportionate. No unnecessary services, queues, remote infrastructure, or
database are proposed. The domain layer is justified because generation,
replacement, validation, persistence checks, and tests must share safety rules.

## Technology Review

React with TypeScript and Vite fit the interactive browser scope. Framework-
independent TypeScript domain modules support deterministic unit testing.
Vitest and a browser runner such as Playwright are appropriate for the stated
domain, accessibility, responsive, persistence, and workflow tests.

Versioned `localStorage` is sufficient for one small active plan surviving
closure on the same local application. Its browser/device scope, user
clearability, and lack of backup guarantees are correctly acknowledged.

## Component Review

Responsibilities are clear. The planning domain owns catalogue validity,
eligibility, hard restrictions, uniqueness, complete feasibility, and
replacement. The state coordinator owns snapshots, dirty/stale state, and
transitions. The presentation layer owns interaction, confirmations, loading,
errors, and accessible rendering. The persistence adapter owns serialization,
versioning, restore validation, and storage failures.

The UI is explicitly prevented from implementing an independent eligibility
rule, avoiding duplicated business logic.

## Data Model Review

The model supports current preferences, immutable generation preferences,
recipes, meal slots, 21 assignments, catalogue metadata, persistence, stale
state, and dirty state. Separating `currentPreferences` from
`activePlan.generationPreferenceSnapshot` correctly represents preference edits
without silently changing an existing plan.

Stable recipe identifiers and catalogue/version metadata provide a sound basis
for restore validation and obsolete-reference handling.

## Data Flow Review

Preference configuration, generation, replacement, save, restore, preference
editing, and regeneration each have valid and failure paths. Failed generation
and replacement preserve the previous plan. Cancelled confirmations preserve
the relevant saved or displayed state.

The save flow explicitly persists both current preferences and the original
generation snapshot. Restore recalculates stale state. Replacement uses the
active plan snapshot even when current preferences have changed, while only
successful explicit regeneration adopts current preferences for meal selection.

## Generation Design Review

The architecture can enforce seven days, Breakfast/Lunch/Dinner slots, 21
assignments, meal-type compatibility, hard restrictions, ingredient
equivalence, and no exact recipe duplicates. It fails fast when a meal type
has fewer than seven eligible distinct candidates and uses backtracking or an
equivalent search to detect global assignment impossibility.

The bounded catalogue, pre-indexing, most-constrained-first ordering,
deterministic candidate order, 100,000-node limit, 2,500-millisecond active
search budget, and event-loop yielding provide a reasonable strategy for the
three-second requirement. Budget exhaustion returns a typed failure, never a
partial or restriction-violating plan, and leaves the prior valid plan intact.

The architecture correctly distinguishes a search-budget failure from a
complete-plan result; verification must confirm the user-facing explanation
does not falsely claim that no valid plan exists when search was bounded.

## Replacement Design Review

Replacement excludes the current recipe and all recipes already used in the
week, preserves the selected meal type, applies the shared eligibility
predicate using the active plan's immutable generation snapshot, and returns a
new plan without mutating the input. A missing candidate leaves the current
assignment unchanged. Updated preferences affect replacement only after
successful explicit regeneration, which is consistent with the stale-plan
requirements.

## Persistence Review

The versioned single-record envelope is proportionate. It persists current
preferences separately from the active plan and its generation snapshot,
validates schema, shape, catalogue references, and domain invariants, and
handles corruption, obsolete data, storage failure, and quota failure
non-destructively.

Saving a stale plan is now explicitly supported without rewriting its
generation snapshot, while the UI can explain that current preferences differ.
This satisfies the approved stale-plan behavior and preserves data integrity.

## Validation and Error Handling Review

Validation ownership is clear for diet selection, allergens, exclusions,
catalogue records, ingredient equivalence, feasibility, replacement, storage,
and confirmation boundaries. Structured outcomes allow the presentation layer
to provide understandable messages without duplicating domain rules.

The architecture correctly rejects incomplete catalogue records and avoids
unsafe arbitrary substring-only ingredient matching.

## Security and Privacy Review

The controls match the actual threat surface: local user input, browser
storage, and dependencies. Rendering catalogue values as text, normalizing
exclusions, treating `localStorage` as untrusted, validating restored state,
and minimizing dependencies are appropriate. Authentication and server
security controls are correctly excluded from this local MVP.

## Performance Review

Bundled data removes network latency. One-time catalogue validation/indexing,
candidate pre-indexing, constrained deterministic search, yielding, and
defensive node/time bounds provide a credible architecture for NFR-004.

The three-second target remains appropriately marked as unverified. The
specified verification set includes normal, restrictive, insufficient, and
adversarial catalogues plus delayed/loading behavior. That is sufficient for
implementation planning, subject to execution during verification.

## Accessibility and Responsive Design Review

The presentation architecture specifies native semantic controls, associated
labels, headings, keyboard-operable dialogs, visible focus, inline messages,
non-color-only errors, readable wrapping, and responsive reflow from weekly
grid to day-oriented sections.

The baseline of current supported Chrome, Edge, Firefox, and Safari releases,
with representative mobile, tablet, and desktop viewports, gives the
implementation and browser tests a usable target without introducing formal
WCAG certification scope.

## Reliability and Data Integrity Review

The shared eligibility predicate, complete-plan validation, immutable inputs,
non-mutating domain operations, validated restore, explicit generation
snapshots, and non-destructive failure paths protect the active plan from
restriction violations, duplicate assignments, partial replacement, invalid
restore, and failed regeneration.

The search budget is handled safely: it can fail without being treated as a
partial success or causing a valid plan to be overwritten.

## Testability Review

The boundaries support independent tests for normalization, catalogue
validation, eligibility, generation, replacement, state transitions,
persistence, presentation, accessibility, responsive layouts, performance,
and the browser baseline. Domain tests and browser workflow tests have clear
responsibilities.

The architecture specifically includes stale-plan replacement, failed
regeneration preservation, storage failure, adversarial search, keyboard
interaction, responsive viewports, and save/restore workflows.

## Deployment Review

Static assets served by a static or local development server match the
single-page browser architecture. Runtime needs are limited to a compatible
browser and local storage; no backend or remote service is required.

## ADR Review

ADR-001 through ADR-006 describe real decisions, meaningful alternatives, and
consequences. ADR-005 justifies bounded asynchronous search, and ADR-006
justifies independent current and generation preference authority. The ADRs
are consistent with the approved scope and revised architecture.

## Traceability Review

FR and NFR mappings identify components or decisions. The revised table also
maps every AC-001 through AC-024 to an explicit mechanism and owner, including
confirmation, stale state, corruption handling, accessibility, responsive
behavior, and slow generation. Traceability is sufficient for implementation
planning.

## Risk Review

R-001 through R-006 are realistic and connected to the architecture. Their
mitigations cover local storage failure, insufficient candidates, search cost,
ingredient equivalence quality, browser differences, and state snapshot drift.
The revised R-003 and R-006 mitigations align with ADR-005 and ADR-006.

## Findings

### DR-001 — Open-question wording should be synchronized with the catalogue contract

**Severity:** OBSERVATION

**Area:** Architecture document consistency

**Evidence:** The Recipe Catalogue Contract defines canonical meal, diet,
allergen, and ingredient values, deterministic alias resolution, required
fields, invalid-data behavior, and ownership. The Open Architecture Questions
section still asks Design Review to confirm the exact catalogue schema and
equivalence vocabulary.

**Issue:** The open-question wording is stale relative to the detailed contract
already present in the architecture.

**Impact:** A later reader may believe the catalogue contract is still an
unresolved architecture decision, even though the implementation boundary is
defined.

**Recommendation:** Remove or reword that open question during the next
architecture-document cleanup, and retain only genuinely unresolved
implementation choices such as serialized data format.

## Review Outcome

**PASS**

No required corrections remain. The architecture is ready for human
Architecture Approval; this review does not grant that approval.

## Required Actions

No required architecture changes.

## Human Approval Gate

Architecture Approval: PENDING HUMAN APPROVAL

Human Architecture Approval is currently allowed. This review does not grant
approval.
