# Order Tracking Architecture

Application: Order Tracking  
Application Root: order-tracking  
Run Mode: START  
Source Type: JIRA  
Source Reference: ORD-3  
Architecture Status: APPROVED

## 1. Architecture Context

This architecture implements the approved requirements for the ORD-3 guest order lookup story. The local bundled mock order catalogue is the authoritative data source for this MVP. No authentication, server, external order-management integration, or backend security control is introduced by this design.

The architecture deliberately keeps the lookup boundary small: a customer submits two identifiers, a pure lookup service normalizes and matches them against one catalogue record, and the UI renders either the approved tracking fields or one generic failure outcome.

## 2. Architecture Drivers and Constraints

- Required entry point: Order Number and Email Address are both required.
- Lookup is unauthenticated guest access.
- The catalogue is bundled locally and is authoritative for this MVP.
- Both normalized identifiers must match the same catalogue record.
- Failed lookups must be indistinguishable externally and must not expose order details.
- Successful output is limited to order number, current status, and last updated timestamp.
- Full customer name, full email address, phone number, postal address, and payment information must never be rendered.
- Required-field validation must prevent lookup and associate understandable messages with the relevant fields.
- Keyboard operation and standard accessible form semantics are required.
- A normal local lookup must complete in under 1 second.
- CAPTCHA, account lockout, alerting, audit logging, server-side rate limiting, authentication, persistence, and external outage handling are outside this story.

## 3. Options and Tradeoffs

### Option A: Frontend-only bundled catalogue (selected)

Use a TypeScript browser application with a versioned catalogue module, a pure normalization/matching service, and a form/result UI. This is the simplest adequate implementation for the approved backendless MVP, has predictable local performance, and avoids introducing an unapproved data authority or authentication flow.

Tradeoff: catalogue contents are shipped to the browser and are not suitable for real-world confidential order data. The MVP privacy contract is therefore enforced by the lookup response and rendering boundary, while production-grade confidentiality remains outside this story.

### Option B: Backend lookup service (not selected)

A backend could keep catalogue data away from the browser and provide stronger operational controls. It would add deployment, network, authentication/security, failure, and integration behavior that the approved requirements explicitly exclude.

### Option C: Persistent client storage (not selected)

Browser storage would add mutable state and a second data authority without a requirement for customer-created or updated orders. It would also complicate deterministic matching and privacy behavior.

## 4. Technology Stack

- TypeScript for domain types and application code.
- React for the guest lookup form and tracking result view.
- Vite for local development and a static production bundle.
- Vitest and Testing Library for unit and component tests.
- Playwright for keyboard and browser acceptance coverage.
- Native HTML form controls and accessibility attributes; no third-party identity, network, or order-management dependency.

The stack is an implementation choice and does not alter the approved customer behavior.

## 5. Component Boundaries and Responsibilities

### Catalogue module

Owns the bundled mock order records and their public domain shape. The module may expose records to the lookup service, but UI components must not read raw catalogue records directly.

### Lookup domain service

Exposes a function equivalent to `lookupOrder(orderNumber, emailAddress)`. It:

1. Normalizes the two inputs using the approved rules.
2. Searches for one record where both normalized values match the same record.
3. Returns a minimal public tracking result on success.
4. Returns the same failure outcome for no match, partial match, or any other unsuccessful lookup.

The service must not return match diagnostics such as which field matched, whether an order number exists, or whether an email exists.

### Validation layer

Runs before the domain lookup. It checks that both submitted values contain non-whitespace content, returns field-keyed messages, and prevents the domain service from running when either value is missing. It does not replace the approved normalization behavior: surrounding whitespace is tolerated for a non-empty value and removed before matching.

### Guest lookup view

Owns the labeled form, submit interaction, validation feedback, generic failure message, and successful result rendering. It consumes only the minimal public result from the lookup service and never renders raw customer or catalogue fields.

### Application shell

Provides the page structure, document title, responsive layout, and status/result region. It has no data access or matching logic.

## 6. Data Model

The internal catalogue record contains only fields needed to implement the approved flow and test fixture data:

```ts
type OrderRecord = {
  orderNumber: string;
  emailAddress: string;
  status: string;
  lastUpdated: string; // ISO 8601 timestamp
};
```

The lookup service returns a separate public view model:

```ts
type TrackingResult = {
  orderNumber: string;
  status: string;
  lastUpdated: string;
};
```

No customer name, phone, postal address, payment information, or full email address belongs in the public result model. A typed result union should distinguish `success`, `validation-error`, and `not-found-or-not-validated` without exposing match reason details.

The catalogue is immutable at runtime, bundled with the application, and has no persistence lifecycle. Timestamp display should preserve the catalogue value and format it for readability without changing the underlying instant.

## 7. Normalization and Matching

Normalization is deterministic and centralized in the lookup domain service:

- Order Number: trim leading and trailing whitespace, then compare case-insensitively.
- Email Address: trim leading and trailing whitespace, then lowercase before comparison.

The implementation should compare canonical normalized strings and must not apply additional product rules such as punctuation removal, email aliasing, Unicode folding, or order-number rewriting. A successful match requires both normalized values to match the same `OrderRecord`; two separate partial matches cannot produce success.

## 8. Request and Response Flow

1. The customer focuses the Order Number and Email Address fields.
2. Submit invokes native form handling and prevents navigation.
3. The validation layer checks required values. If either is missing, no catalogue lookup occurs; field-associated errors are rendered and focus is moved or retained in a predictable accessible manner.
4. For valid input, the lookup service normalizes both values and scans the bundled catalogue.
5. On an exact same-record match, the service returns `TrackingResult`; the view renders order number, status, and last updated timestamp.
6. On every unsuccessful match, the service returns one generic failure outcome; the view clears any previous result and renders no order details.
7. A subsequent attempt replaces the prior outcome so a failed attempt cannot leave an earlier successful order visible.

The UI must not log submitted identifiers or raw records to the console, analytics, URL, or browser storage.

## 9. Validation and Generic Failure Behavior

Required-field validation is separate from failed lookup behavior. Missing values produce understandable messages associated with the exact missing field and prevent lookup. Once both fields contain non-whitespace content, all catalogue misses use the same customer-visible message, for example: `We could not validate those order details.` The final wording must remain generic and must not indicate which identifier was present or absent.

On any failed lookup:

- Do not render order number, status, timestamp, or any raw catalogue data.
- Do not reveal whether either identifier exists.
- Clear a previous successful result before displaying the generic failure state.
- Keep the submitted field values available for correction unless a later approved requirement says otherwise.

The service and component tests must assert identical failure results for nonexistent identifiers, one-field matches, and two-field mismatches.

## 10. Privacy and Security Boundaries

- Guest access is limited to the two required identifiers and the minimal approved tracking response.
- The public result type and UI component boundary enforce data minimization by construction.
- Raw catalogue records remain inside the catalogue/domain boundary and are not passed to presentation components.
- No identifiers are placed in query parameters, local storage, session storage, logs, telemetry, or error text.
- The application does not claim to provide server-side rate limiting, CAPTCHA, account lockout, alerting, or audit logging; these are explicitly out of scope for this backendless MVP.
- Because the catalogue is bundled, fixture data must be non-sensitive mock data. Real customer data must not be substituted without a new requirements and architecture decision.

## 11. Performance and Reliability

The catalogue is loaded with the static application bundle, so lookup has no network round trip or external outage path. A linear scan is adequate for the MVP catalogue and should complete well below the one-second target for normal local lookup. The implementation should avoid asynchronous work in the lookup path unless required by the chosen bundling setup.

The service is deterministic and side-effect free. An empty or malformed catalogue is an implementation/configuration failure, not a customer-visible match distinction; the UI should still fail generically rather than expose internal details. Build-time type checking and catalogue fixture validation should detect malformed records where practical.

## 12. Accessibility and Responsive Behavior

- Use a native `<form>` with visible `<label>` elements associated to both inputs.
- Use native input and submit controls with meaningful accessible names.
- Associate each required-field message with its input through `aria-describedby` and expose invalid state with `aria-invalid` only when invalid.
- Provide a polite status/result region for success and generic failure updates without making the page unusable for screen readers.
- Preserve logical keyboard order: Order Number, Email Address, submit, then result content.
- Ensure focus indicators remain visible and error focus behavior does not trap the keyboard.
- Keep the form and result readable on narrow and wide viewports without horizontal scrolling or overlapping content.
- Do not rely on color alone for errors, status, or success.

## 13. Testing Strategy

### Domain unit tests

- Required values are represented by the validation layer and missing values prevent lookup.
- Order number trimming and case-insensitive comparison work.
- Email trimming and lowercasing work.
- Both identifiers must match one record.
- Successful output contains only the three approved tracking fields.
- No-match, partial-match, and mismatched-record cases return the same generic failure shape.

### Component tests

- The form exposes visible labels and submits via keyboard.
- Missing-field messages are visible and associated with the relevant fields.
- Successful lookup renders only order number, status, and timestamp.
- Failed lookup renders the generic message and no order details.
- A failed subsequent attempt clears a previous successful result.

### Browser acceptance tests

Cover AC-001 through AC-007 in a real browser, including keyboard-only completion, whitespace/case normalization, privacy assertions against visible text, and timing of a normal local lookup. Use mock catalogue values that are clearly non-sensitive.

### Performance check

Measure from submit to rendered success/failure state for a normal bundled lookup. Keep the assertion under the approved one-second threshold with enough tolerance to avoid environment noise while still detecting accidental network or blocking work.

## 14. Deployment and Operations

Build a static asset bundle and serve it from the approved hosting mechanism for the application. No runtime service, database, secret, external integration, migration, or environment-specific order endpoint is required for ORD-3. Deployment must include the bundled catalogue and must not include real customer data.

Operational controls named as out of scope by NFR-003 must not be represented as implemented capabilities. Future introduction of a backend or authoritative external source requires a requirements update and architecture review.

## 15. Architecture Decisions and Risks

### ADR-001: Use a bundled local catalogue

Decision: The catalogue module is the sole authority for MVP lookup.  
Reason: This directly implements Q-002 and avoids unapproved external integration and outage behavior.  
Consequence: Data is static and browser-delivered; only mock data is appropriate.

### ADR-002: Separate internal records from public tracking results

Decision: The domain service maps an internal `OrderRecord` to a minimal `TrackingResult`.  
Reason: This makes FR-006 and FR-007 enforceable at the type and component boundaries.  
Consequence: Any future customer-visible field requires an explicit requirements decision.

### ADR-003: Return one failure outcome for all unsuccessful matches

Decision: No-match, partial-match, and mismatched-record cases share one externally visible failure behavior.  
Reason: This implements Q-006 and prevents account/order enumeration.  
Consequence: Diagnostic detail is available only in developer tests, not in the customer response.

Primary risk: A frontend-only catalogue is not a production confidentiality boundary. This is accepted only for the approved local bundled mock MVP and is mitigated by non-sensitive fixtures and strict public-result mapping.

## 16. Requirements Traceability

| Requirement | Architectural response |
|---|---|
| FR-001 | Guest lookup view with required Order Number and Email Address fields; no authentication boundary. |
| FR-002 | Separate required-field validation layer prevents domain lookup and renders field-associated errors. |
| FR-003 | Centralized deterministic normalization rules in the lookup domain service. |
| FR-004 | Same-record matching against the immutable bundled catalogue, the sole MVP authority. |
| FR-005 | `TrackingResult` exposes and the result view renders order number, status, and last updated timestamp. |
| FR-006 | Internal/public model separation and presentation boundary exclude prohibited personal and payment data. |
| FR-007 | One generic failure union/message, no match diagnostics, and result clearing on failed attempts. |
| FR-008 | Native form semantics, labels, descriptions, invalid state, keyboard order, focus, and status region. |
| NFR-001 | Synchronous in-memory local lookup with browser performance coverage under one second. |
| NFR-002 | Static frontend and bundled catalogue; no auth or external order-management integration. |
| NFR-003 | No backend security controls are claimed or added; privacy behavior is limited to the approved MVP response contract. |
| NFR-004 | No external dependency exists in the lookup flow, so source outage behavior is not applicable. |
| AC-001 | Component and browser tests verify prevention and associated required-field feedback. |
| AC-002 | Domain and browser tests verify permitted whitespace and case normalization plus successful minimal output. |
| AC-003 | Failure tests verify generic message and absence of order details. |
| AC-004 | Failure equivalence tests cover existence and partial-match variants. |
| AC-005 | Public result and rendered-text assertions exclude all prohibited fields. |
| AC-006 | Keyboard-only browser coverage verifies reach, fill, submit, and associated feedback. |
| AC-007 | Normal local lookup performance test verifies the under-one-second target. |

## 17. Approval State

Architecture Status: APPROVED

Approval Evidence:

- Human decision: "approved"
- Approval date: 2026-09-23
- Independent Design Review outcome: PASS; Architecture Approval Gate: ALLOWED.