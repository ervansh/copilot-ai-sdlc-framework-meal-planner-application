# Order Tracking Code Review

Current Stage: Code Review
Application: Order Tracking
Application Root: order-tracking
Target Artifact: order-tracking/docs/sdlc/code-review.md
Code Review Outcome: REWORK REQUIRED
Final Verification: BLOCKED
Review Date: 2026-10-23

## Review Basis

- `order-tracking/docs/sdlc/requirements.md` — Requirements Status: APPROVED; Source Reference: ORD-4.
- `order-tracking/docs/sdlc/architecture.md` — Architecture Status: APPROVED.
- `order-tracking/docs/sdlc/design-review.md` — Review Outcome: PASS.
- `order-tracking/docs/sdlc/impl-plan.md` — Implementation Plan Status: APPROVED; IMP-001 through IMP-004 are DONE.
- `order-tracking/docs/sdlc/implementation-log.md` — explicit human acceptance and task evidence for IMP-001 through IMP-004.
- Current Order Tracking source and test diff, inspected directly for this review. The prior code-review and verification outcomes were not used as evidence.

## Findings

### CR-001 — MAJOR — Summary presents invented and mislabeled order data

`buildSummaryFromResult` maps `lastUpdated` into the displayed Order date, hardcodes the item summary and quantity, infers fulfillment and shipment state from order status, and calculates estimated delivery as five days after the update timestamp ([App.tsx](../../src/App.tsx#L20), [App.tsx](../../src/App.tsx#L22), [App.tsx](../../src/App.tsx#L26)). The current `TrackingResult` contains only order number, status, and last-updated timestamp ([catalogue.ts](../../src/domain/catalogue.ts#L8)); it has no order date, item, quantity, shipment, fulfillment, or delivery estimate source. The component test asserts these generated values as if they were order facts ([app.test.tsx](../../tests/app.test.tsx#L102), [app.test.tsx](../../tests/app.test.tsx#L107)).

This violates FR-003, FR-005 through FR-008, AC-003, and the approved architecture's requirement to omit unavailable optional values rather than invent them. In particular, “Order items” does not let a customer identify the items, and a derived estimated date or shipment state can mislead a customer about the real order.

**Required resolution:** Populate these fields only from authoritative order data available to the summary; otherwise omit them or show an unavailable state. Do not label `lastUpdated` as the order date or derive shipment/delivery facts from order status.

### CR-002 — MINOR — Unrecognized status values pass through as raw codes

The adapter returns the input unchanged when it is not in the status label map ([order-summary.ts](../../src/domain/order-summary.ts#L73)). For example, an unrecognized value such as `AWAITING_PAYMENT` would be displayed verbatim. This does not meet FR-013 or the architecture's direction to avoid exposing internal codes. Current tests cover mapped values only.

**Recommended resolution:** Distinguish supported customer-readable values from unknown codes and use a safe customer-facing fallback for unknown internal values; add a regression for an unmapped code.

### CR-003 — OBSERVATION — Responsive acceptance is not directly tested

The implementation plan calls for checks at narrow and wide sizes, but the browser configuration uses only Desktop Chrome ([playwright.config.ts](../../playwright.config.ts#L11)) and the current browser suite has no viewport-overflow or narrow-layout assertion. The stylesheet includes a narrow-screen rule, so this is a coverage gap rather than a confirmed layout defect.

## Review Assessment

- **Correctness and requirements:** The page provides a single summary with a prominent order status and separate shipment/delivery sections, but the displayed order date, items, quantity, fulfillment, shipment, and estimated delivery are not supported by the lookup data. The item-identification acceptance criterion is therefore not met.
- **Architecture compliance:** The presentation boundary is in place, but synthesizing missing order facts conflicts with the approved minimal view-model contract and graceful omission behavior.
- **Validation and error handling:** Missing adapter fields have a rendering fallback. Unknown status values can still expose raw codes; the timestamp-derived estimate also assumes a valid timestamp.
- **Security and privacy:** The reviewed summary does not render the matched email address or other customer profile data. No new dependency or external data integration is present in the current application diff.
- **Test quality:** The adapter tests cover mapped labels and absent optionals. Component assertions currently lock in synthetic summary data instead of validating source-backed order details. Browser tests pass but do not exercise the ORD-4 item-identification or responsive acceptance criteria.
- **Scope:** The current code changes remain within the summary presentation and its regression tests; no new lookup, authentication, persistence, or backend workflow was added.

## Checks Actually Run

- `npm --prefix order-tracking test` — passed; 4 test files, 17 tests.
- `npm --prefix order-tracking run typecheck` — passed with no diagnostics.
- `npm --prefix order-tracking run build` — passed.
- `npm --prefix order-tracking run test:browser` — passed; 5 tests.
- `git diff --check -- order-tracking` — passed with no output.
- `git status --short --untracked-files=all -- order-tracking` — before this review artifact was updated, the worktree listed the two implementation records, summary source/styles, and related tests; no generated build output was listed. This review updated only this review artifact.

## Outcome

Code Review Outcome: REWORK REQUIRED

The implementation entry gate is satisfied: IMP-001 through IMP-004 are DONE and explicitly accepted. CR-001 is a major customer-facing correctness issue, so Final Verification is BLOCKED until the summary stops presenting unsupported order facts. CR-002 and CR-003 are additional follow-up items. This review does not perform Final Verification or modify production code, tests, or implementation artifacts.
