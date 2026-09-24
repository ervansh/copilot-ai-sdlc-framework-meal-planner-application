# Order Tracking Design Review

Application: Order Tracking  
Application Root: order-tracking  
Run Mode: START  
Source Type: JIRA  
Source Reference: ORD-3  
Reviewed artifacts:

- `order-tracking/docs/sdlc/requirements.md` (`Requirements Status: APPROVED`)
- `order-tracking/docs/sdlc/architecture.md` (`Architecture Status: DRAFT - PENDING HUMAN APPROVAL`)

Review type: Independent Design Review  
Review date: 2026-09-23

## Outcome

**Review Outcome: PASS**

**Architecture Approval Gate: ALLOWED**

This review does not grant Architecture Approval.
Human Architecture Approval remains required.

## Findings

### DR-001 — OBSERVATION — Frontend catalogue is not a production confidentiality boundary

**Evidence:** Architecture sections 3, 10, and 15 explicitly state that the bundled catalogue is shipped to the browser, must contain only non-sensitive mock data, and is not suitable for real-world confidential order data. This matches Q-002, Q-006, NFR-002, NFR-003, and the scope boundary, which define a backendless local mock MVP and exclude server-side controls.

**Assessment:** This is an accepted MVP constraint, not a requirements defect. The architecture correctly prevents raw catalogue records from reaching presentation components and maps successful matches to the minimal `TrackingResult`. Implementation must preserve the synthetic-data constraint; real customer data or a production confidentiality claim would require new requirements and architecture review.

### DR-002 — OBSERVATION — Performance assertion needs an implementation-defined measurement method

**Evidence:** Architecture sections 11 and 13 commit to an under-one-second normal lookup and browser performance coverage, while also noting that test tolerance must account for environment noise.

**Assessment:** The target is traceable to NFR-001 and AC-007 and is testable in principle. During implementation, the performance test should define the measured interval and a deterministic normal-lookup fixture so the assertion detects accidental asynchronous/network work without becoming dependent on broad browser startup time.

### DR-003 — OBSERVATION — Hosting mechanism remains intentionally unspecified

**Evidence:** Architecture section 14 says to serve a static bundle from the approved hosting mechanism but does not name one.

**Assessment:** ORD-3 does not specify a hosting platform, runtime service, or deployment target, so this is not a material architecture gap for the story. The eventual deployment decision must preserve the static, backendless, synthetic-catalogue constraints and must not introduce an unreviewed external order authority.

## Review Coverage

### Requirements coverage and consistency

- FR-001 and FR-002: The guest lookup view, native form, required-field validation, and field-associated messages are defined in sections 5, 8, and 9.
- FR-003 and FR-004: Centralized normalization and same-record matching against the authoritative bundled catalogue are defined in sections 6, 7, and 16.
- FR-005 and FR-006: The separate minimal `TrackingResult` and presentation boundary expose only order number, status, and timestamp; prohibited personal and payment fields are excluded.
- FR-007: The service returns one generic failure outcome, omits diagnostics, and clears a prior successful result on failed attempts.
- FR-008: Native semantics, visible labels, keyboard order, `aria-describedby`, `aria-invalid`, status regions, focus behavior, and responsive constraints are specified.
- NFR-001 through NFR-004: Local synchronous lookup, no authentication or external integration, explicitly excluded backend controls, and no external outage path are addressed in sections 2, 11, and 14.
- AC-001 through AC-007: Section 13 maps domain, component, browser, privacy, keyboard, normalization, and performance coverage to the acceptance criteria.

No architecture decision invents an unresolved product requirement. Required identifiers, guest access, matching rules, response fields, failure behavior, data authority, and out-of-scope controls all match the confirmed clarification decisions in the approved requirements.

### Architecture quality review

- **Boundaries and data flow:** Catalogue, lookup service, validation, view, and shell responsibilities are separated and the request/response flow is explicit.
- **Privacy and security:** The design avoids match diagnostics, sensitive output, URLs, storage, logs, and telemetry. The frontend exposure risk is explicitly limited to synthetic fixtures.
- **Accessibility:** The design uses standard form semantics, visible labels, associated errors, invalid state, keyboard order, focus guidance, status announcements, and non-color-only feedback.
- **Performance and reliability:** The synchronous in-memory path has no network dependency or outage mode, and the linear scan is proportionate to the MVP catalogue.
- **Testability:** Pure normalization/matching logic, component behavior, browser acceptance flows, privacy assertions, and performance coverage are identified.
- **Maintainability and complexity:** The selected design is small, typed, deterministic, and avoids persistence, external integrations, and unnecessary abstractions. The internal/public model split is an appropriate boundary for the privacy contract.
- **Scope discipline:** Authentication, persistence, external order management, and backend security controls are not introduced. Future expansion is correctly conditioned on requirements and architecture review.
- **Deployment:** Static deployment and synthetic data constraints are stated; the unspecified hosting platform is non-material to this story.

## Traceability Summary

| Review area | Evidence in architecture | Requirement authority |
|---|---|---|
| Guest lookup and required fields | Sections 2, 5, 8, 9, 16 | FR-001, FR-002, Q-001, Q-003, Q-007 |
| Normalization and same-record match | Sections 6, 7, 8, 16 | FR-003, FR-004, Q-002, Q-004 |
| Minimal success response | Sections 6, 8, 10, 16 | FR-005, FR-006, Q-005 |
| Generic failed response and privacy | Sections 8, 9, 10, 15, 16 | FR-007, Q-006, AC-003, AC-004, AC-005 |
| Accessibility and responsive behavior | Section 12 and testing strategy | FR-008, AC-001, AC-006 |
| Performance and operational scope | Sections 2, 11, 13, 14 | NFR-001 through NFR-004, AC-007 |

## Gate Boundary

This review records the independent design-review result only. Human Architecture Approval remains required before implementation planning. No requirements, architecture, implementation plan, source code, tests, or later-stage artifacts were modified.
