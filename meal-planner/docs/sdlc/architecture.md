# Meal Planner Architecture

## Metadata

- **Application:** Meal Planner
- **Source artifact:** `meal-planner/docs/sdlc/requirements.md`
- **Requirements status:** APPROVED
- **SDLC stage:** Architecture
- **Architecture status:** APPROVED
- **Scope:** Single-user Meal Planner MVP
- **Requirements questions:** None remain

## Architecture Executive Summary

The recommended architecture is a single-page web application with a local,
bundled recipe catalogue and browser-local persistence. The user interface
collects preferences and presents plans, while a framework-independent domain
layer owns recipe validation, restriction filtering, complete-plan generation,
meal replacement, stale-plan detection, and plan state transitions.

The design deliberately avoids a server, authentication, external recipe API,
database service, queues, and native mobile clients. These are not required by
the approved scope. Keeping the business rules in pure functions makes the
hard restrictions and 21-assignment constraint independently testable and
reduces the risk that UI behavior can bypass them.

## Architecture Drivers

| Driver | Requirements | Architectural implication |
|---|---|---|
| Fixed complete weekly plan | FR-006, FR-007, FR-009, AC-003, AC-004, AC-007 | Model seven days and three meal slots explicitly; generate only complete, distinct assignments. |
| Hard dietary restrictions | FR-001 through FR-005, FR-008, FR-009, NFR-003, AC-001, AC-002, AC-006, AC-008 | Centralize catalogue validation and eligibility before assignment. |
| Individual replacement | FR-015, FR-016, AC-014, AC-015 | Replacement service must preserve slot type, restrictions, uniqueness, and all unrelated assignments. |
| Local save and restore | FR-012 through FR-014, NFR-002, AC-011 through AC-013 | Persist one versioned active-plan envelope in browser storage. |
| Explicit state transitions | FR-013, FR-017 through FR-019, AC-012, AC-016 through AC-019 | Represent saved/displayed preferences, plan provenance, dirty state, and stale state explicitly. |
| Responsive accessible browser UI | NFR-001, NFR-005, AC-020, AC-023, AC-024 | Use semantic controls, keyboard interaction, clear messages, and responsive layouts. |
| Normal generation performance | NFR-004, AC-022 | Keep the catalogue local and generation in memory; provide loading feedback around the operation. |

## Constraints

- The application is single-user and local; authentication and multi-user
  support are out of scope.
- The recipe catalogue is predefined and managed by the application.
- The week is always Monday through Sunday with Breakfast, Lunch, and Dinner.
- Only one active plan is saved. Plan history, export, sharing, printing, and
  grocery lists are out of scope.
- No external recipe providers, user-created recipes, or native mobile
  application are required.
- Serving size is display data only; the architecture does not calculate
  quantities or totals.
- The source and test directories are currently empty, so technology choices
  are recommendations rather than preservation of an existing implementation.

## Architecture Options Considered

| Option | Fit | Tradeoffs | Decision |
|---|---|---|---|
| Single-page browser application with bundled catalogue and `localStorage` | Directly supports local reopen, no account, fast in-memory generation, and responsive browser use. Low operational complexity. | Data is device/browser scoped and can be cleared by the user; no cross-device access. | Recommended. |
| Client/server application with API and database | Could support future accounts, sharing, and cross-device plans. | Adds deployment, authentication, network failure, persistence, and security complexity that the MVP excludes. | Rejected for current scope. |
| Multi-page application with server-rendered plan operations | Can be simple for document-oriented pages. | More navigation/state coordination and server dependency for interactions such as replacement; no requirement benefit over a client application. | Rejected for current scope. |

## Recommended Technology Stack

| Concern | Recommendation | Requirement fit and reason | Tradeoff / alternative |
|---|---|---|---|
| UI | React with TypeScript | Supports a responsive, stateful browser UI while TypeScript makes plan and catalogue contracts explicit. | Adds a framework dependency; vanilla TypeScript is smaller but provides less structured UI composition. |
| Build and local development | Vite | Provides a small, fast browser build suitable for a static single-page application. | Introduces build tooling; a plain HTML/TypeScript setup is simpler but less maintainable for the required UI state. |
| Domain logic | Framework-independent TypeScript modules | Pure logic is independently testable and prevents UI components from owning restriction rules. | Requires deliberate state boundaries; placing logic in components would be quicker initially but harder to verify. |
| Persistence | Versioned `localStorage` record | Meets same-local-application reopen behavior without a backend and is available in supported browsers. | Storage is limited and user-clearable; IndexedDB is more capable but unnecessary for one small active plan. |
| Catalogue | Versioned static catalogue bundled with the application | Satisfies the predefined, no-external-provider constraint and keeps generation local and predictable. | Catalogue updates require an application release; an API would update independently but is explicitly out of scope. |
| Unit testing | Vitest | Fast tests for pure eligibility, generation, replacement, and persistence adapters in the TypeScript toolchain. | Adds a test dependency; browser-level tests remain separately needed. |
| UI and accessibility testing | Testing Library with a browser test runner such as Playwright | Exercises semantic user workflows, responsive layouts, keyboard use, and persistence behavior. | Browser tests cost more runtime; they are warranted for NFR-001 and NFR-005. |

## System Context

The user interacts with the Meal Planner web application in a desktop,
tablet-sized, or mobile browser. The application loads its bundled recipe
catalogue and reads or writes one versioned active-plan record to the browser's
local storage. There are no remote actors or external runtime integrations in
the approved MVP.

```text
User
  |
  v
Meal Planner Web UI
  |-- Preferences and plan state --> Planning Domain Services
  |                                  |-- bundled Recipe Catalogue
  |                                  |-- browser Storage Adapter
  |<-- plans, details, validation --|
```

## Component Architecture

The deployment unit is one static web application. Logical components are
separated by responsibility and do not imply separate services.

1. **Presentation layer:** accessible preference controls, plan views, recipe
   details, replacement actions, confirmation dialogs, and progress/error
   states.
2. **Application state coordinator:** holds current preferences, displayed
   plan, saved snapshot, dirty state, and stale-plan state; coordinates user
   commands without reimplementing domain rules.
3. **Planning domain:** validates inputs and catalogue records, computes
   eligibility, generates complete plans, finds replacements, and reports
   structured domain outcomes.
4. **Catalogue provider:** supplies the immutable predefined catalogue and
   catalogue-defined ingredient equivalence data.
5. **Catalogue validator:** validates required fields, canonical values,
   duplicate identifiers, and equivalence consistency before recipes enter the
   prepared catalogue.
6. **Persistence adapter:** serializes, validates, versions, saves, restores,
   and removes the active-plan envelope through `localStorage`.

## Component Responsibilities

| Component | Inputs | Outputs | Dependencies | Requirements served |
|---|---|---|---|---|
| Presentation layer | User actions and domain results | Accessible rendered views and confirmation/loading/error interactions | Application state coordinator | FR-010, FR-011, FR-013, FR-016 through FR-019, NFR-001, NFR-005 |
| Application state coordinator | Preferences, plan commands, persistence results | State transitions and view model | Planning domain, persistence adapter | FR-012 through FR-019, NFR-002 |
| Planning domain | Preferences, catalogue, plan, target slot | Validated plan or structured failure; replacement candidate or no-candidate result | Catalogue provider only | FR-001 through FR-009, FR-015, NFR-003, NFR-004 |
| Catalogue provider | None at runtime | Raw recipe records, canonical vocabulary, equivalence metadata, and catalogue version | Bundled catalogue data | FR-005, FR-008, NFR-003 |
| Catalogue validator | Raw bundled catalogue and canonical vocabulary | Prepared valid catalogue or structured catalogue-invalidity results | Catalogue provider | FR-005, FR-008, NFR-003 |
| Persistence adapter | Active-plan envelope or storage key | Restored validated envelope or recoverable error | Browser `localStorage` | FR-012 through FR-014, NFR-002, NFR-003 |

The planning domain is the single owner of recipe eligibility, hard
restriction enforcement, uniqueness, meal-type compatibility, complete-plan
feasibility, and replacement candidate selection. The UI may display domain
messages but must not make independent eligibility decisions.

## Data Model

These are conceptual entities, not source-code class definitions.

| Entity | Important data | Relationships and persistence |
|---|---|---|
| Current User Preferences | Exactly one diet type; zero or more supported allergens; normalized unique excluded ingredients currently configured by the user | Independent application state persisted as `currentPreferences`; may differ from the active plan's generation snapshot. |
| Recipe | Stable identifier, name, compatible meal type, dietary compatibility, allergens, structured ingredients, ingredient equivalence names, instructions, preparation time, serving size | Supplied by the immutable catalogue; not user-created or persisted as the source of truth. |
| Meal Slot | Day in Monday-Sunday and meal type Breakfast/Lunch/Dinner | Identifies one assignment position in a weekly plan. |
| Meal Assignment | Meal slot and recipe identifier | Exactly one per slot; recipe identifiers are unique within a plan. |
| Weekly Meal Plan | 21 assignments, immutable generation preference snapshot, and generation/catalogue metadata | The active plan; its snapshot records the preferences actually used to create these assignments. |
| Active Plan Envelope | Schema version, `currentPreferences`, `activePlan` with generation snapshot, assignments, and generation/catalogue metadata | The sole persisted application state; supports restore validation and migration/rejection. |
| Plan State Metadata | Saved plan, displayed plan, dirty flag, and stale flag derived by comparing `currentPreferences` with `activePlan.generationPreferenceSnapshot` | Runtime state; stale and dirty indicators are derived and are not silently destructive. |

## Recipe Catalogue Contract

The bundled catalogue is a versioned, application-owned data set. The
following conceptual contract is technology-independent and is the boundary
between catalogue data and the Catalogue Validator. The exact serialized data
format is selected during implementation; the meanings and validation rules
are fixed here.

### Recipe identity

Every recipe has a stable, non-empty recipe identifier. It is unique within
the catalogue, stable across application restarts, and is the identifier stored
in meal assignments and persisted plans. Recipe identifiers are application
data identifiers, not user-visible recipe names. Duplicate identifiers make
the affected catalogue entries invalid.

### Canonical meal types

The only supported meal-type values are `BREAKFAST`, `LUNCH`, and `DINNER`.
Each recipe has exactly one compatible meal type. Missing or unknown meal types
make the recipe invalid.

### Canonical diet values

The supported diet values are `OMNIVORE`, `VEGETARIAN`, and `VEGAN`.
Catalogue dietary compatibility is represented as structured canonical values,
with enough compatibility information for the Planning Domain to determine
whether a recipe is valid for the selected diet. Compatibility is never
inferred from a recipe name or cooking instructions.

### Canonical allergen values

The supported allergen vocabulary is `NUTS`, `DAIRY`, `GLUTEN`, `EGGS`, `SOY`,
and `SHELLFISH`. A recipe may declare zero or more allergens. Unknown allergen
values make the affected catalogue metadata invalid. A recipe conflicting with
any selected allergen is ineligible.

### Structured ingredients and normalization

Recipe ingredients are structured ingredient records, not text extracted from
cooking instructions. Each record provides a canonical ingredient identifier
or canonical normalized name and a display name. Optional quantity and unit
information is display-only; eligibility does not depend on parsing arbitrary
quantity text. For example, canonical `peanut` may display as `Peanuts`, and
canonical `tomato` may display as `Cherry tomatoes`.

Canonical ingredient matching is case-insensitive, whitespace-normalized, and
deterministic. User-entered exclusions are normalized before comparison.
Ingredient identity is never determined by unrestricted substring matching;
for example, `nut` does not automatically match every ingredient containing
those characters.

### Ingredient equivalence

Equivalence is catalogue-owned metadata mapping one canonical ingredient to
zero or more aliases or equivalent names. For example, canonical `peanut` may
have the alias `peanuts`, and canonical `bell pepper` may have `capsicum` and
`sweet pepper` as aliases. Every alias resolves to exactly one canonical
ingredient identity before eligibility comparison.

An alias must resolve deterministically and cannot resolve to multiple
unrelated canonical ingredients. Conflicting equivalence metadata invalidates
the affected entry. Unknown aliases are not guessed, and arbitrary substring
matching is not a fallback. If an ingredient cannot be normalized safely, the
validator uses its explicit normalized catalogue identity rather than guessing
an equivalence.

### Required recipe fields and invalid data

Every eligible recipe contains a stable recipe ID, non-empty recipe name, meal
type, structured dietary compatibility, allergen information, structured
ingredient list, non-empty cooking instructions, valid non-negative
preparation duration, and meaningful serving-size display information. A
recipe missing a required field or violating a canonical-value or equivalence
rule is invalid.

Catalogue validation completes before generation or replacement uses a recipe.
Invalid recipes are excluded from generation, replacement, and valid user
choices. Invalid metadata never causes a hard restriction to be ignored. If
catalogue invalidity contributes to inability to create a full plan, the
Planning Domain returns an appropriate structured failure.

### Catalogue version and ownership

The bundled catalogue has a version identifier. Persisted active-plan metadata
retains enough catalogue/version information to detect obsolete or invalid
recipe references during restore. A catalogue version change must not silently
reinterpret an existing recipe identifier as a different recipe.

The Catalogue Provider owns raw bundled data, canonical vocabulary, ingredient
equivalence metadata, and catalogue version. The Catalogue Validator owns
required-field validation, canonical-value validation, duplicate-ID detection,
and equivalence-consistency validation. The Planning Domain owns dietary,
allergen, excluded-ingredient, and meal-type eligibility plus generation and
replacement decisions. The Presentation layer never independently infers
recipe eligibility.

## Key Data Flows

### Configure preferences

1. The user selects one diet, allergens, or an excluded ingredient.
2. The presentation layer sends the change to the application state
   coordinator.
3. The coordinator normalizes and validates the preference value through the
   domain validation boundary.
4. A valid change updates displayed preferences but does not modify a saved
   plan. A blank or duplicate exclusion follows the approved validation rules.
5. The UI presents an understandable validation message for invalid input.

### Generate weekly meal plan

1. The user requests generation; the UI prevents the request when diet type is
   missing and shows validation feedback.
2. The coordinator passes preferences and the catalogue to the planning domain.
3. The domain discards incomplete or incompatible recipes, filters all hard
   restrictions, and solves the 21-slot distinct-assignment problem.
4. A complete plan is returned with an immutable copy of the preferences used
   for generation and becomes the displayed active plan. An incomplete result
   is never returned as a closest match; a structured explanation is shown
   instead.
5. The operation exposes loading feedback before asynchronous generation starts
   and while generation yields control back to the browser.

### Replace an individual meal

1. The user selects a meal slot and requests replacement.
2. The coordinator supplies the slot, current active plan, the plan's
   immutable `generationPreferenceSnapshot`, and the catalogue to the domain.
3. The domain excludes the current recipe and every recipe already used in the
   week, then applies meal type plus diet, allergens, and excluded ingredients
   from the generation snapshot. It never uses `currentPreferences` for an
   existing plan replacement, including when the plan is stale.
4. A candidate replaces only the selected assignment. If none exists, the
   current plan remains unchanged and the UI shows a clear message.

### Save active plan

1. The coordinator validates that the displayed plan is complete and retains
   its immutable `generationPreferenceSnapshot`; it never replaces that
   snapshot with current preferences that were not used to generate the plan.
2. If an active record exists, the UI requests explicit replacement
   confirmation.
3. After confirmation, the persistence adapter writes one complete versioned
   envelope containing both the current preferences and the active plan. A
   stale active plan may remain viewable and saved; the UI clearly indicates
   that it was generated using older preferences. Cancellation leaves the
   stored record unchanged.

### Restore saved plan

1. On application startup, the persistence adapter reads the active storage
   key.
2. The adapter validates the schema, `currentPreferences`, active-plan shape,
   immutable generation snapshot, recipe identifiers, and preference values
   against the current catalogue and domain rules.
3. Valid data restores both current preferences and the active plan. Stale
   status is recalculated by comparing those two values; missing, malformed, or
   incompatible data is ignored or removed with a recoverable message and must
   not be rendered as a valid plan.

### Edit preferences

1. The user changes preferences while a plan remains displayed.
2. The coordinator updates `currentPreferences` only. It does not modify the
   active plan or its immutable generation snapshot.
3. The displayed plan remains unchanged and is marked stale when the effective
   current preferences differ from the generation snapshot. The stale plan
   remains viewable and may remain saved.

### Regenerate plan

1. The user explicitly requests regeneration using current preferences.
2. If the displayed plan has unsaved changes, the UI requests confirmation.
3. Cancellation leaves the displayed plan unchanged. Confirmation, or a
   request with no dirty changes, invokes the normal complete-plan generation
   flow.
4. A successful result replaces the displayed plan, assigns a new immutable
   generation snapshot copied from `currentPreferences`, and clears
   stale/dirty status. A failed result leaves the previous valid active plan
   and its generation snapshot intact.

## Meal Generation Design

The catalogue provider validates and normalizes the catalogue once at load
time, rejecting incomplete records and normalizing stable identifiers, meal
types, dietary values, allergens, structured ingredients, and catalogue-defined
ingredient equivalences. It then pre-indexes valid recipes by meal type and,
where useful, diet/allergen dimensions. Generation reuses this prepared
catalogue instead of repeatedly scanning irrelevant raw records.

For each request, the domain applies the current preferences to the prepared
indexes and builds candidate sets for Breakfast, Lunch, and Dinner before
assignment. It fails fast if any meal type has fewer than seven eligible
distinct recipes. It creates the 21 fixed slots from those sets and processes
the most constrained slots or candidate groups first, while retaining the
fixed Monday-to-Sunday result shape. Candidate ordering is stable by catalogue
version and recipe identifier so tests and failure diagnosis are repeatable.

The MVP operational envelope intentionally remains bounded: the bundled
catalogue is limited to at most 500 total records and at most 200 eligible
candidates per meal type for a request. This is an implementation constraint
for predictable browser execution, not a new user-facing product limit. A
backtracking or equivalent constraint-search strategy must produce either all
21 eligible, distinct assignments or a typed failure; it never returns a
partial plan and never relaxes a hard restriction.

The search uses a defensive safeguard of both a maximum of 100,000 explored
nodes and a 2,500 millisecond active-search budget, whichever is reached
first. The search yields to the browser event loop after bounded batches (for
example, through an asynchronous continuation scheduled with `setTimeout(0)`)
so the presentation layer can render loading state and process input. If the
safeguard is reached, the domain returns a structured `generation-budget`
failure. The coordinator keeps the previous valid plan unchanged; it does not
return a partial result or loosen restrictions.

The domain returns either a complete plan with the exact generation preference
snapshot used for the request or a typed failure such as missing preference,
invalid catalogue data, insufficient recipes, or search budget exceeded.

## Meal Replacement Design

Replacement operates on one selected slot. The domain constructs candidates
with the same meal type, removes the assigned recipe and all recipe identifiers
used in other slots, then reapplies the complete eligibility predicate using
the active plan's immutable `generationPreferenceSnapshot`. That snapshot is
authoritative for diet type, allergens, and excluded ingredients, even when
`currentPreferences` has changed and the plan is stale. Editing
`currentPreferences` therefore does not affect replacement eligibility for the
existing plan. It returns a replacement candidate without mutating the input
plan. The coordinator commits the new plan only after a candidate is available,
so a no-candidate result cannot corrupt or partially change the current plan.

Only explicit regeneration applies updated `currentPreferences` to meal
selection. Successful regeneration creates a new active plan with a new
immutable generation snapshot, and future replacements use that new snapshot.
Failed regeneration leaves the old active plan and its old snapshot
authoritative for replacement.

## Persistence Architecture

The persistence adapter stores one versioned active-plan envelope under a
dedicated application key. Conceptually, the envelope contains:

```text
{
   schemaVersion,
   currentPreferences,
   activePlan: {
      generationPreferenceSnapshot,
      assignments,
      generationMetadata,
      catalogueMetadata
   }
}
```

`currentPreferences` and `activePlan.generationPreferenceSnapshot` are
different authoritative values. The latter is immutable for the life of that
active plan and records the preferences actually used to generate it.

- **Save:** validate completeness and serialize both current preferences and
   the active plan's original generation snapshot; replacement is gated by
   explicit UI confirmation. Saving a stale plan does not rewrite its snapshot
   or force regeneration.
- **Restore:** parse safely, validate both preference concepts, shape, and
   domain invariants, then expose only valid data to the application state
   coordinator. Recalculate stale status after both values are restored.
- **Replace:** write the new envelope only after generation and confirmation
  succeed; a failed generation or cancelled confirmation does not write.
- **Stale status:** compare `currentPreferences` with
   `activePlan.generationPreferenceSnapshot`; editing current preferences never
   mutates the active plan or its snapshot.
- **Corrupt or obsolete data:** treat parse, schema, catalogue-reference, or
  invariant failures as recoverable restore errors. Keep the in-memory session
  usable, avoid presenting invalid data, and provide a clear recovery message.

`localStorage` is suitable because the requirements call for one small plan
surviving closure on the same local application. It is not a backup, security
boundary, or cross-device store.

## Validation and Error Handling Architecture

Validation is divided between input normalization, catalogue validation, and
domain operations. The domain returns structured outcomes; the presentation
layer maps them to understandable messages and focus targets.

| Scenario | Owner | Required behavior |
|---|---|---|
| Missing or multiple diet types | Preference/domain validation | Reject before generation; require exactly one supported diet. |
| Unsupported allergen | Preference/domain validation | Reject as invalid input; accepted allergens are the six catalogue-supported values. |
| Empty exclusion | Preference normalization | Trim, reject empty value, and retain the prior list. |
| Duplicate exclusion | Preference normalization | Normalize for case-insensitive comparison and retain one structured entry. |
| Conflicting restrictions | Planning domain | Return no-plan failure explaining the conflict; never ignore a restriction. |
| Incomplete catalogue recipe | Catalogue validator | Exclude from generation and replacement; surface a catalogue limitation where practical. |
| Ingredient equivalence | Catalogue provider plus eligibility predicate | Use catalogue-defined normalized names/equivalences, not unsafe arbitrary substring matching alone. |
| Insufficient distinct recipes | Planning domain | Return no plan and explain the relevant meal type, restriction, or catalogue limitation. |
| Unavailable replacement | Replacement domain operation | Return no candidate and leave the current meal unchanged. |
| Existing active plan on save | Application state/UI boundary | Require explicit confirmation; cancellation preserves the stored plan. |
| Unsaved changes on regeneration | Application state/UI boundary | Require confirmation only when dirty; cancellation preserves the displayed plan. |
| Invalid persisted data | Persistence adapter | Reject the record as invalid, avoid rendering it, and retain a usable empty/current session. |

Unexpected storage or runtime failures are non-destructive: the coordinator
keeps the last valid in-memory plan and reports that the requested operation
could not be completed. No failure path silently relaxes restrictions or
overwrites a valid saved plan.

## Security and Privacy

The approved application has no accounts, credentials, remote API, or
multi-user data. The realistic threat surface is local user input, browser
storage, and third-party dependencies.

- Render recipe and ingredient data as text, not unsanitized HTML.
- Validate and normalize all user-entered exclusions before they reach domain
  logic or storage.
- Treat `localStorage` as user-controlled and untrusted on restore; validate
  schema and domain invariants before use.
- Keep dependencies minimal and review production dependencies during
  implementation.
- Do not add authentication, authorization, or secret configuration because
  they are outside the approved scope.

These measures reduce foreseeable risks but do not constitute a security
certification or protect data from another party with access to the user's
browser profile.

## Performance Architecture

The bundled catalogue avoids network latency. Catalogue validation,
normalization, and indexing happen once when the catalogue is loaded. Each
generation request builds the three meal-type candidate sets from those
indexes, fails fast on a meal type with fewer than seven candidates, and uses
most-constrained-first deterministic search within the bounded MVP envelope
defined in Meal Generation Design.

Generation is asynchronous at the application boundary. The coordinator sets
an operation state before invoking the domain, and the domain yields after
bounded search batches so React can render loading/progress feedback and the
browser event loop is not monopolized. The node-count and active-time
safeguards return a structured failure and preserve the previous valid plan if
search cannot safely complete.

NFR-004's three-second value remains a verification target, not an architecture
claim and has not been verified here. Verification must measure a normal
catalogue, highly restrictive preferences, an insufficient catalogue, an
adversarial/high-branching catalogue, and loading-feedback behavior when work
is deliberately slowed or exceeds the normal expectation.

## Accessibility and Responsive Design

The presentation layer uses native semantic form controls, associated labels,
headings, buttons for actions, keyboard-operable dialogs, visible focus, and
inline messages linked to the relevant control. Errors describe what to fix
without relying only on color. Recipe and plan content remains readable when
text wraps.

The layout uses responsive regions rather than a fixed desktop canvas. The
weekly plan may reflow from a wide grid into day-oriented sections at narrower
widths while preserving access to all 21 assignments. Verification should cover
desktop, tablet, and mobile viewport sizes plus keyboard-only workflows.

The MVP browser verification baseline is current modern supported releases of
Google Chrome, Microsoft Edge, Mozilla Firefox, and Apple Safari. It includes
representative mobile-sized, tablet-sized, and desktop-sized viewports without
turning arbitrary viewport dimensions into product requirements. Browser
verification covers `localStorage` availability and failure handling, keyboard
interaction, semantic UI behavior, responsive layout, plan viewing, recipe
viewing, and the save/restore workflow.

## Reliability and Data Integrity

- The eligibility predicate is shared by generation and replacement.
- Individual replacement uses the active plan's immutable generation snapshot
   for diet, allergens, and excluded ingredients; current preference edits do
   not change eligibility for that existing plan.
- Complete-plan validation enforces seven days, three meal types per day, valid
  recipe references, compatible meal types, restrictions, and uniqueness.
- Domain operations are pure with respect to their inputs and return new plan
  values; failed operations do not partially mutate a valid plan.
- Save occurs only after a complete plan passes validation and replacement
  confirmation.
- The persisted envelope keeps `currentPreferences` separate from the active
   plan's immutable `generationPreferenceSnapshot`; stale status is derived from
   their comparison.
- Restore validates persisted data before state adoption.
- Preference edits update only current preferences and mark stale state without
   changing the plan or its generation snapshot silently.
- Failed regeneration, including search-budget failure, leaves the previous
   valid active plan intact.
- Catalogue records are invalid by default when required fields are absent.

## Testability

The architecture creates the following test boundaries without prescribing
implementation tasks:

- Preference normalization: required diet, supported allergens, trimming,
  case-insensitive de-duplication, and removal.
- Catalogue validation and eligibility: stable and duplicate recipe IDs,
  missing required fields, canonical meal types, unsupported diet values,
  unsupported allergen values, structured ingredients, case-normalized
  ingredients, ingredient exclusion matching, alias-to-canonical resolution,
  conflicting alias mappings, unknown aliases, prevention of arbitrary
  substring matching, and meal type.
- Generation: 21 slots, complete assignment, uniqueness, impossible results,
  deterministic outcomes, and hard-restriction preservation.
- Replacement: same slot type, no duplicate, unchanged unrelated assignments,
   all restrictions from the plan generation snapshot, stale-plan replacement,
   failed-regeneration preservation, and no-candidate preservation.
- State transitions: stale and dirty indicators, save replacement confirmation,
  and regeneration confirmation/cancellation.
- Persistence adapter: round trip, schema validation, corrupt data, obsolete
   recipe references, catalogue-version restore validation, and
   non-destructive failure.
- Presentation: semantic labels, keyboard actions, messages, recipe details,
  plan views, and responsive layout behavior.
- Performance: normal generation timing and visible feedback for slow runs.
- Browser baseline: current modern Chrome, Edge, Firefox, and Safari releases;
   representative mobile, tablet, and desktop viewports; storage failure,
   keyboard, semantic UI, responsive, plan, recipe, and save/restore workflows.

## Deployment Model

The application should build to static assets served by any static web server
or local development server. Runtime behavior requires only a compatible
browser with `localStorage`; there is no application backend or database
service. Deployment configuration, hosting provider, and production URL are
implementation concerns and are intentionally not selected here.

## Architecture Decisions

### ADR-001: Use a single-page browser application

**Context:** The MVP is a local single-user web application with interactive
generation, replacement, and stale-plan state.

**Decision:** Use one React/TypeScript browser application with separated UI,
state, domain, catalogue, and persistence modules.

**Rationale:** It satisfies browser and responsive requirements while keeping
interactive state local and the deployment model small.

**Alternatives considered:** Client/server API and multi-page server-rendered
application.

**Consequences:** Simple deployment and no network failure path, but no
cross-device synchronization or server-managed data.

### ADR-002: Keep planning rules in a framework-independent domain layer

**Context:** Restrictions, recipe validity, uniqueness, and complete-plan
feasibility are safety-critical business rules.

**Decision:** Centralize them in pure TypeScript domain services shared by
generation and replacement.

**Rationale:** One owner prevents UI rule drift and supports fast deterministic
unit tests.

**Alternatives considered:** Implement eligibility in React components or use a
general-purpose constraint library.

**Consequences:** Clear testability and integrity guarantees, with a need to
maintain explicit domain contracts at the UI boundary.

### ADR-003: Use a bundled catalogue with catalogue-defined equivalence

**Context:** External recipe providers and user-created recipes are out of
scope, while ingredient matching must handle approved common-name variation.

**Decision:** Bundle a validated catalogue containing structured ingredients
and explicit ingredient-equivalence metadata. Each recipe uses a stable
identifier and canonical structured meal, diet, allergen, and ingredient
values. Catalogue validation completes before planning.

**Rationale:** It is deterministic, available offline, auditable, and avoids
unsafe substring-only matching. Stable identifiers protect persisted plan
references, while canonical values and validation give the Planning Domain a
reliable eligibility input.

**Alternatives considered:** External recipe API or free-form substring
matching.

**Consequences:** Catalogue updates require a release, but recipe eligibility
is predictable and auditable.

### ADR-004: Persist one versioned active plan in local storage

**Context:** The user must reopen one saved plan on the same local application,
without accounts or a backend.

**Decision:** Store one versioned, validated application-state envelope in
`localStorage` containing independent `currentPreferences` and `activePlan`.
The active plan retains its immutable `generationPreferenceSnapshot`.

**Rationale:** It is the smallest mechanism satisfying NFR-002 and the single-
user constraint.

**Alternatives considered:** IndexedDB, remote database, or no persistence.

**Consequences:** Low operational cost and straightforward restore, with
correct stale-plan semantics, but storage is browser/device scoped,
user-clearable, and not a backup.

### ADR-005: Use bounded indexed asynchronous constraint search

**Context:** A complete 21-slot plan must be found without relaxing hard
restrictions, while browser generation must remain observable and defensively
bounded.

**Decision:** Validate and index the bounded catalogue once, build meal-type
candidate sets per request, fail fast below seven candidates, search the most
constrained slots first with deterministic ordering, yield between bounded
batches, and stop at 100,000 nodes or 2,500 milliseconds of active search.

**Rationale:** This keeps the MVP predictable, preserves the complete-plan
guarantee, and gives the UI an opportunity to render loading feedback even for
slow or adversarial inputs.

**Alternatives considered:** Unbounded synchronous backtracking, which could
freeze the browser, or returning the best partial plan, which violates hard
requirements.

**Consequences:** Some valid but operationally expensive searches fail with a
structured result and require the user to adjust restrictions or catalogue
data. The bounds must be measured and reviewed as part of verification.

### ADR-006: Separate current preferences from plan-generation authority

**Context:** Users may edit preferences without silently changing an existing
plan, and a stale plan must remain viewable and persistable.

**Decision:** Persist `currentPreferences` independently from
`activePlan.generationPreferenceSnapshot`; derive stale status by comparing
them. Regeneration uses current preferences and creates a new immutable
snapshot. Individual replacement always uses the active plan's immutable
generation snapshot, including for stale plans. Failed regeneration preserves
the prior active plan and its snapshot as authoritative for future
replacement.

**Rationale:** The two values have different meanings and separating them
prevents a saved plan from being falsely associated with preferences that did
not generate it.

**Alternatives considered:** Overwriting the plan snapshot on preference edit
or forcing regeneration before a stale plan can be saved.

**Consequences:** The UI must explain stale status and state transitions, but
the model preserves the approved ability to edit, view, and save a stale plan
without silently modifying it. Updated preferences affect meal selection only
after successful explicit regeneration.

## Requirement Traceability

| Requirement | Architecture component / decision |
|---|---|
| FR-001 | Preference validation; Planning Domain; ADR-002 |
| FR-002 | Preference validation; Planning Domain |
| FR-003 | Preference normalization; Application State Coordinator |
| FR-004 | Shared eligibility predicate; ADR-002 |
| FR-005 | Recipe Catalogue Contract; Catalogue Provider; Catalogue Validator; ADR-003 |
| FR-006 | Weekly Meal Plan model; Generation service |
| FR-007 | Generation and Replacement services; Reliability rules |
| FR-008 | Recipe Catalogue Contract; Catalogue Provider; shared eligibility predicate; ADR-003 |
| FR-009 | Constraint-search generation and typed failures |
| FR-010 | Presentation layer plan views |
| FR-011 | Recipe model and recipe-detail view |
| FR-012 | Persistence Adapter; ADR-004 |
| FR-013 | Save flow confirmation; Application State Coordinator |
| FR-014 | Versioned local storage restore; ADR-004 |
| FR-015 | Replacement service uses `activePlan.generationPreferenceSnapshot`; ADR-002 and ADR-006 |
| FR-016 | Replacement no-candidate outcome using the active plan's snapshot |
| FR-017 | Separate displayed preferences and plan snapshot |
| FR-018 | Stale-plan metadata and state coordinator |
| FR-019 | Dirty-state tracking and regeneration confirmation |
| NFR-001 | Semantic responsive Presentation layer |
| NFR-002 | Persistence Adapter; ADR-004 |
| NFR-003 | Recipe Catalogue Contract; Catalogue Validator; shared eligibility predicate; complete-plan validation; ADR-003 |
| NFR-004 | Local in-memory generation and loading state |
| NFR-005 | Static web deployment, responsive Presentation layer, and browser baseline verification; ADR-001 |

| Acceptance Criterion | Architecture Mechanism / Owner |
|---|---|
| AC-001 | Preference validation plus Presentation validation feedback |
| AC-002 | Shared eligibility predicate in Planning Domain |
| AC-003 | Weekly Plan model plus Generation Service |
| AC-004 | Generation uniqueness invariant and complete-plan validation |
| AC-005 | Meal Slot compatibility validation in Planning Domain |
| AC-006 | Recipe Catalogue Contract; Catalogue Provider equivalence metadata; shared eligibility predicate; ADR-003 |
| AC-007 | Candidate-set feasibility check and complete-plan failure outcome |
| AC-008 | Recipe Catalogue Contract required fields; Catalogue Validator; ADR-003 |
| AC-009 | Presentation plan and day views |
| AC-010 | Recipe model and recipe-detail Presentation component |
| AC-011 | Persistence Adapter saving one validated active-plan envelope |
| AC-012 | Save confirmation owned by Presentation and Application State Coordinator |
| AC-013 | Persistence Adapter restore flow with schema and domain validation |
| AC-014 | Replacement Service using the active plan's generation snapshot while preserving slot type, restrictions, uniqueness, and unrelated assignments |
| AC-015 | Replacement Service no-candidate outcome using the active plan's snapshot with non-mutating coordinator behavior |
| AC-016 | Separate current preferences, generation snapshot, and derived stale state |
| AC-017 | Explicit regeneration flow using currentPreferences and a new immutable snapshot |
| AC-018 | Dirty-state tracking and regeneration confirmation/cancellation |
| AC-019 | Application State Coordinator bypassing unsaved-change confirmation when not dirty |
| AC-020 | Semantic controls, keyboard interaction, readable layout, and understandable Presentation messages |
| AC-021 | Preference normalization for trimming, rejection, de-duplication, addition, and removal |
| AC-022 | Bounded indexed asynchronous generation, search safeguards, and performance verification boundary |
| AC-023 | Desktop browser baseline verification for Chrome, Edge, Firefox, and Safari |
| AC-024 | Responsive Presentation layout verification at representative mobile and tablet sizes |

## Risks and Tradeoffs

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-001 | `localStorage` can be cleared, blocked, or edited by the user. | Saved plan may be unavailable or invalid on reopen. | Version and validate the envelope; fail non-destructively and explain recovery. |
| R-002 | Catalogue lacks enough distinct eligible recipes under restrictive preferences. | Generation or replacement may be unavailable. | Detect feasibility before commit, explain the limiting condition, and never relax restrictions. |
| R-003 | Constraint search cost grows with catalogue size or branching factor. | Generation could exceed the normal performance expectation or monopolize the browser. | Bound the MVP catalogue, pre-index candidates, use constrained deterministic search, yield between batches, enforce node/time safeguards, and show loading feedback. |
| R-004 | Ingredient equivalence metadata is incomplete or inconsistent. | A valid recipe could be incorrectly accepted or rejected. | Make equivalence catalogue-owned, validate catalogue records, and test representative naming variations. |
| R-005 | Browser differences affect storage or responsive behavior. | Restore or usability may vary across supported browsers. | Use a small browser compatibility target and verify storage failure, keyboard use, and required viewports. |
| R-006 | UI and domain state snapshots drift. | Preferences could appear applied without regenerating the plan, or a saved plan could be associated with the wrong preferences. | Persist current preferences separately, keep the generation snapshot immutable, derive stale state by comparison, and test restore/regeneration transitions. |

## Open Architecture Questions

No blocking architecture questions are required to describe the MVP. Design
Review should still confirm the exact catalogue schema/equivalence vocabulary,
the selected operational search bounds, and whether deterministic candidate
ordering is sufficient for the intended user experience.

## Design Review Handoff

The independent Design Review is complete with a PASS outcome. Architecture
approval has been explicitly granted, so the architecture is complete and
ready for Implementation Planning.

## Approval

- **Architecture status:** APPROVED
- **Architecture approval:** APPROVED
- **Design review:** PASS
- **Approval authority:** Human reviewer
