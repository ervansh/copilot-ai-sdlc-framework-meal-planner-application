# Order Tracking Requirements

Application: Order Tracking  
Application Root: order-tracking  
Run Mode: START  
Source Type: JIRA  
Source Reference: ORD-3  
Requirements Status: APPROVED

## Approval Evidence

- Human decision: "I explicitly approve the requirement."
- Approval date: 2026-09-23

## Provenance

- Source: Jira issue [ORD-3](https://ervanshsingh.atlassian.net/browse/ORD-3)
- Issue type: Story
- Summary: Allow a customer to locate and track an existing order.
- Project: Order Tracking (`ORD`)
- Retrieved through the authorized Jira/MCP issue retrieval capability on 2026-09-23.
- Confluence publication: Not requested (`NO`).

## Explicit Source Facts

1. A customer needs an entry point to identify an existing order.
2. Valid tracking information takes the customer to the Order Tracking view for that order.
3. The application must not expose order information when supplied tracking information cannot be validated.
4. The identifying information must balance ease of use with protection of customer order data.
5. A successful lookup displays tracking information for the existing order.
6. A lookup with no matching order displays no order details and shows a clear not-found-or-not-validated message.
7. A lookup with missing required information is prevented and the missing information is identified.
8. Harmless formatting differences in valid identifying information should be handled without requiring re-entry.
9. An unsuccessful attempt must not reveal private information about another customer's order.
10. Account registration and password recovery are out of scope.
11. Whether authentication is required for other Order Tracking capabilities is explicitly undecided by this story.
12. Jira lists no dependencies for this story and identifies it as the primary entry story for the Order Tracking experience.

## Clarification Decision Log

### Q-001 — Required lookup information

Decision: Use Order Number and Email Address. Both fields are required.

### Q-002 — Order data authority and lookup scope

Decision: Use a local bundled mock order catalogue for the MVP. The catalogue is authoritative. No external order-management integration is required for this story.

### Q-003 — Authentication for this lookup entry point

Decision: No authentication is required. This is a guest order lookup flow.

### Q-004 — Matching and normalization rules

Decision: Trim leading and trailing whitespace from the order number and compare it case-insensitively. Trim whitespace from the email address and lowercase it before comparison. Both normalized fields must match the same order.

### Q-005 — Minimum successful response

Decision: Display the order number, current order status, and last updated timestamp. Do not display the full customer name, full email address, phone number, postal address, or payment information.

### Q-006 — Failed-attempt privacy behavior

Decision: A failed lookup always returns the same generic message, regardless of whether the order number or email address exists. CAPTCHA, account lockout, alerting, audit logging, and server-side rate limiting are out of scope for this MVP because there is no backend.

### Q-007 — Validation and error presentation

Decision: Show required-field errors before lookup. Fields have visible labels. Validation messages must be understandable and associated with the relevant field. The flow supports keyboard use and standard accessible form semantics.

### Q-008 — Operational requirements

Decision: The local lookup target is under 1 second for a normal lookup. External source outage behavior is not applicable because data is bundled locally.

## Functional Requirements

- FR-001: Provide a guest lookup entry point with required Order Number and Email Address fields. (SOURCE: 1, 2, 7; Q-001, Q-003)
- FR-002: Prevent lookup until both required fields are supplied and show understandable, field-associated required-field errors. (SOURCE: 7; Q-001, Q-007)
- FR-003: Normalize the order number by trimming leading and trailing whitespace and comparing case-insensitively. Normalize the email address by trimming whitespace and lowercasing before comparison. (SOURCE: 8; Q-004)
- FR-004: Match the normalized order number and email address against the same record in the local bundled mock order catalogue, which is authoritative for this MVP. (SOURCE: 2, 3; Q-002, Q-004)
- FR-005: On a successful match, display the order number, current order status, and last updated timestamp. (SOURCE: 5; Q-005)
- FR-006: Do not display the full customer name, full email address, phone number, postal address, or payment information. (SOURCE: 3, 9; Q-005)
- FR-007: On any failed lookup, display the same generic failure message and no order details, regardless of whether either supplied identifier exists. (SOURCE: 3, 6, 9; Q-006)
- FR-008: Support keyboard use, visible field labels, and standard accessible form semantics, including association between validation messages and their relevant fields. (Q-007)

## Non-Functional Requirements

- NFR-001: A normal local lookup completes in under 1 second. (Q-008)
- NFR-002: No authentication or external order-management integration is required for this story. (Q-002, Q-003)
- NFR-003: CAPTCHA, account lockout, alerting, audit logging, and server-side rate limiting are out of scope for this backendless MVP. (Q-006)
- NFR-004: External source outage behavior is not applicable because the authoritative catalogue is bundled locally. (Q-008)

## Acceptance Criteria

- AC-001: Given the lookup form, when either Order Number or Email Address is missing, then lookup is prevented and an understandable error is shown and associated with the missing field.
- AC-002: Given valid identifiers with leading or trailing whitespace and case differences permitted by the normalization rules, when both normalized values match the same catalogue order, then the customer sees that order's order number, current status, and last updated timestamp.
- AC-003: Given identifiers that do not match the same catalogue order, when the customer submits the form, then the customer sees one generic failure message and no order details.
- AC-004: Given a failed lookup, when only one identifier exists or either identifier does not exist, then the externally visible failure behavior remains the same.
- AC-005: Given the successful result, then the customer cannot see the full customer name, full email address, phone number, postal address, or payment information.
- AC-006: Given keyboard-only use of the flow, then the customer can reach, fill, submit, and receive associated validation feedback for the form using standard accessible semantics.
- AC-007: Given a normal lookup against the bundled catalogue, then the lookup completes in under 1 second.

## Scope Boundary

In scope is the customer-facing guest entry point, required-field validation, normalization, local catalogue matching, privacy-preserving failure behavior, and display of the specified tracking fields for an existing order. Account registration, password recovery, authentication, external order-management integration, and backend security controls listed in NFR-003 are out of scope for this story. Authentication requirements for other Order Tracking capabilities remain outside this story.

## Open Questions

None. All material clarification questions for this story have authoritative
human decisions recorded above.

Requirements Status: APPROVED.