# Changelog

## Unreleased

### Order Tracking MVP (ORD-3)

- Added a guest order lookup flow using required Order Number and Email Address fields.
- Added whitespace and case normalization, same-record catalogue matching, and generic privacy-preserving failure behavior.
- Added a minimal tracking result containing order number, current status, and last updated timestamp.
- Added accessible form validation, keyboard support, responsive presentation, and result clearing after failed attempts.
- Added synthetic bundled catalogue fixtures, unit/component coverage, and browser acceptance coverage for AC-001 through AC-007.
- Added application-owned TypeScript, Vite, Vitest, and Playwright configuration.
- Confirmed typecheck, production build, unit/component tests, browser tests, production dependency audit, and generated-file hygiene checks.

Known observations are recorded in `docs/sdlc/pull-request.md` and the canonical verification artifact.