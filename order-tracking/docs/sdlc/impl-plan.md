# Order Tracking Implementation Plan

Application: Order Tracking  
Application Root: order-tracking  
Run Mode: START  
Source Type: JIRA  
Source Reference: ORD-3  

## Plan Status

**Implementation Plan Status: APPROVED**

**Approval Evidence:** Human approval recorded on 2026-09-23: "approved".

This plan is based on:

- `order-tracking/docs/sdlc/requirements.md` — Requirements Status: APPROVED
- `order-tracking/docs/sdlc/architecture.md` — Architecture Status: APPROVED
- `order-tracking/docs/sdlc/design-review.md` — Review Outcome: PASS; Architecture Approval Gate: ALLOWED

The historical draft wording quoted in the design review does not override the later authoritative Architecture Status: APPROVED in `architecture.md`.

## Implementation Constraints

- Implement only the approved guest lookup MVP for the local bundled mock catalogue.
- Use synthetic, non-sensitive catalogue fixtures only.
- Keep raw catalogue records inside the catalogue/domain boundary and expose only the approved tracking result.
- Do not add authentication, persistence, external order-management integration, network calls, backend controls, logging of identifiers, URL/storage state, or prohibited customer fields.
- Implement each task only after its dependencies are `DONE` and human acceptance has been recorded.
- Code Review and Final Verification remain independent lifecycle stages and are not implementation tasks.

## Dependency Order

```text
IMP-001 -> IMP-002 -> IMP-003 -> IMP-004 -> IMP-005
```

Only `IMP-001` is `READY` at plan creation. All other tasks are `BLOCKED` until their dependencies are `DONE`.

## Tasks

### IMP-001 — Establish bundled catalogue and privacy-preserving domain contracts

- **Objective:** Create the immutable local mock catalogue and the typed internal/public data contracts that enforce the approved data boundary.
- **Priority:** P0
- **Status:** DONE
- **Dependencies:** None
- **Requirement traceability:** Q-002, Q-005; FR-004, FR-005, FR-006; NFR-002, NFR-004; AC-002, AC-003, AC-005, AC-007
- **Architecture references:** Sections 5 (catalogue module), 6 (data model), 10 (privacy boundary), 15 (ADR-001 and ADR-002)
- **Implementation scope:**
  - Define the internal `OrderRecord` shape and minimal public `TrackingResult` shape.
  - Add clearly synthetic bundled records containing only order number, email address, status, and ISO 8601 last-updated timestamp.
  - Keep the catalogue immutable at runtime and expose it through the catalogue boundary rather than directly to UI components.
  - Add build-time/type-level fixture checks where practical; do not add persistence or external data access.
- **Focused tests/checks:** Validate fixture shape, timestamp format, immutability expectations, and absence of customer name, phone, postal address, payment, or other prohibited fields from the public result contract.
- **Completion criteria:** Catalogue and contracts compile; fixtures are deterministic and non-sensitive; public type cannot require or expose prohibited fields; focused catalogue checks pass.
- **Acceptance evidence:** Changed catalogue/domain files, focused test output, and type-check output demonstrating the internal/public boundary.
- **Risks/notes:** Bundled data is browser-visible and is acceptable only as synthetic MVP data. Replacing fixtures with real customer data is out of scope and requires new requirements and architecture approval.

### IMP-002 — Implement validation, normalization, and same-record lookup

- **Objective:** Implement the pure validation and lookup domain behavior for required fields and privacy-preserving matching.
- **Priority:** P0
- **Status:** DONE - HUMAN ACCEPTED
- **Dependencies:** IMP-001
- **Requirement traceability:** Q-001, Q-004, Q-006, Q-007; FR-002, FR-003, FR-004, FR-007; NFR-001; AC-001, AC-002, AC-003, AC-004, AC-007
- **Architecture references:** Sections 5 (lookup domain and validation layers), 7 (normalization/matching), 8 (request flow), 9 (generic failure behavior), 11 (performance), 15 (ADR-003)
- **Implementation scope:**
  - Validate both inputs as non-whitespace required values before invoking catalogue lookup.
  - Trim order number and compare it case-insensitively; trim and lowercase email before comparison.
  - Require both normalized identifiers to match the same catalogue record.
  - Return a typed success result containing only order number, status, and last updated timestamp.
  - Return one indistinguishable generic failure outcome for no match, partial match, and mismatched-record cases, with no match diagnostics.
  - Keep the lookup synchronous, deterministic, side-effect free, and free of logging or URL/storage writes.
- **Focused tests/checks:** Unit-test missing-field validation, permitted whitespace/case differences, exact same-record matching, no-match/partial-match/mismatched-record equivalence, minimal success output, result clearing contract, and normal local lookup timing.
- **Completion criteria:** Domain behavior passes all focused unit checks; no invalid submission reaches catalogue lookup; all unsuccessful matches have the same externally consumable failure shape; normal lookup remains below the one-second target in the defined measurement.
- **Acceptance evidence:** Domain source and unit tests, including identical failure assertions and a documented submit-to-result timing interval.
- **Risks/notes:** Do not add product rules beyond the approved trim/lowercase behavior, such as punctuation removal, aliasing, Unicode folding, or order-number rewriting.

### IMP-003 — Build the accessible guest lookup view and application shell

- **Objective:** Provide the customer-facing form, feedback states, minimal tracking result, and responsive application shell using the domain contracts.
- **Priority:** P0
- **Status:** DONE - HUMAN ACCEPTED
- **Dependencies:** IMP-002
- **Requirement traceability:** Q-003, Q-005, Q-007; FR-001, FR-002, FR-005, FR-006, FR-007, FR-008; NFR-002; AC-001, AC-003, AC-005, AC-006
- **Architecture references:** Sections 5 (guest lookup view and application shell), 8 (request/response flow), 9 (failure state), 10 (presentation privacy), 12 (accessibility/responsive behavior)
- **Implementation scope:**
  - Add a native form with visible labels for Order Number and Email Address, native controls, and a meaningful submit control.
  - Render field-associated required errors using `aria-describedby` and `aria-invalid` only when applicable; preserve logical keyboard order and usable focus behavior.
  - Render a polite status/result region for success and generic failure updates.
  - Render only order number, current status, and formatted last updated timestamp on success.
  - Clear a prior successful result before displaying a failed lookup and keep submitted values available for correction.
  - Ensure narrow and wide layouts have no horizontal scrolling or overlapping content and communicate state without color alone.
  - Keep raw catalogue records and submitted identifiers out of UI logs, URLs, browser storage, telemetry, and error text.
- **Focused tests/checks:** Component-test labels, keyboard submit, required-field association, success-only fields, generic failure privacy, failed-submission result clearing, and responsive/accessibility semantics.
- **Completion criteria:** Guest flow is wired to the domain service; all approved success/failure states render correctly; keyboard and accessible semantics checks pass; prohibited fields are absent from rendered output.
- **Acceptance evidence:** Component test output, accessibility assertions, and a local UI smoke check showing the form, success result, and generic failure state.
- **Risks/notes:** Do not expose raw records through component props or add authentication or unapproved customer-visible fields.

### IMP-004 — Add browser acceptance coverage for ORD-3

- **Objective:** Verify the end-to-end guest lookup behavior in a real browser against synthetic bundled fixtures.
- **Priority:** P0
- **Status:** DONE - HUMAN ACCEPTED
- **Dependencies:** IMP-003
- **Requirement traceability:** FR-001 through FR-008; NFR-001, NFR-002, NFR-004; AC-001 through AC-007
- **Architecture references:** Sections 8 (flow), 9 (failure behavior), 12 (accessibility), 13 (testing strategy), 14 (static deployment constraints)
- **Implementation scope:**
  - Cover missing Order Number and Email Address with prevented submission and associated feedback.
  - Cover whitespace/case normalization and successful display of only the approved three tracking fields.
  - Cover no-match, one-field match, and mismatched-record attempts with the same generic message and no order details.
  - Cover keyboard-only reach, fill, submit, and feedback receipt.
  - Measure a normal local lookup from submit to rendered result using a deterministic fixture and assert under one second without including broad browser startup time.
- **Focused tests/checks:** Playwright browser tests mapped to AC-001 through AC-007, including visible-text privacy assertions and the defined performance interval.
- **Completion criteria:** Browser acceptance suite passes for all seven acceptance criteria with synthetic data; failure variants are externally equivalent; no network or external catalogue dependency is introduced.
- **Acceptance evidence:** Playwright command/output, test-to-AC mapping, and recorded performance measurement definition/result.
- **Risks/notes:** Keep timing assertions resistant to environment noise while still detecting accidental asynchronous or network work. Do not use real personal data in browser fixtures.

### IMP-005 — Run implementation regression and readiness checks

- **Objective:** Confirm the complete ORD-3 implementation is buildable, type-safe, lint-clean, and ready for independent review and final verification.
- **Priority:** P1
- **Status:** DONE - HUMAN ACCEPTED
- **Dependencies:** IMP-004
- **Requirement traceability:** FR-001 through FR-008; NFR-001 through NFR-004; AC-001 through AC-007
- **Architecture references:** Sections 4 (technology stack), 11 (performance/reliability), 13 (testing strategy), 14 (static deployment)
- **Implementation scope:**
  - Run the application’s focused unit, component, and browser checks.
  - Run TypeScript checking, linting, and production build checks using the repository’s configured commands.
  - Confirm the built application contains only bundled synthetic catalogue data and no added runtime integration, persistence, authentication, or prohibited controls.
  - Record implementation evidence and known limitations for handoff; do not create Code Review, Final Verification, or Pull Request artifacts.
- **Focused tests/checks:** Full ORD-3 test suite, type check, lint, and production build; inspect changed-file scope for compliance with the approved architecture.
- **Completion criteria:** All applicable checks pass, the static bundle builds, and implementation evidence is sufficient for human task acceptance and independent Code Review.
- **Acceptance evidence:** Command names and successful outputs, changed-file summary, and explicit confirmation of any unavailable checks.
- **Risks/notes:** A passing implementation check does not constitute Code Review or Final Verification. Those remain separate lifecycle gates owned by their respective agents.

## Acceptance and Handoff Rules

- A task may move from `READY` or `BLOCKED` to `IMPLEMENTED — PENDING HUMAN ACCEPTANCE` only after its implementation and task-level evidence are complete.
- A task may move to `DONE` only after explicit human acceptance; silence or casual continuation does not count as approval.
- Dependent tasks become `READY` only when every dependency is `DONE`.
- This plan does not approve implementation, architecture changes, Code Review, Final Verification, deployment, or pull request creation.

## Validation Evidence

- Requirements gate checked: `order-tracking/docs/sdlc/requirements.md` reports `Requirements Status: APPROVED` with human approval evidence dated 2026-09-23.
- Architecture gate checked: `order-tracking/docs/sdlc/architecture.md` reports `Architecture Status: APPROVED` with human approval evidence dated 2026-09-23.
- Design review gate checked: `order-tracking/docs/sdlc/design-review.md` reports `Review Outcome: PASS` and `Architecture Approval Gate: ALLOWED`.
- Implementation plan approval recorded: human decision "approved" dated 2026-09-23.
- IMP-005 acceptance evidence verified: unit tests, typecheck, production build, browser tests, `git diff --check`, and generated-file ignore/status checks passed; lint was unavailable because the application has no lint script or configuration.
- Human acceptance recorded on 2026-09-23: "accept IMP-005".
- All approved implementation tasks are `DONE` or `DONE - HUMAN ACCEPTED`; Code Review is eligible. Final Verification and Pull Request Preparation remain pending independent lifecycle stages.
