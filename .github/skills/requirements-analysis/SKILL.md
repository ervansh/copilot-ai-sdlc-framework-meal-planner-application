---
name: requirements-analysis
description: Source-driven methodology that resolves material product ambiguity before requirements approval.
---

# Requirements Analysis Skill

Target: `<application-root>/docs/sdlc/requirements.md`

## Method

1. Retrieve complete source through authorized source tooling.
2. Capture provenance.
3. Extract explicit source facts.
4. Classify gaps.
5. Ask stable `Q-###` clarification questions for every material ambiguity.
6. Record explicit human answers.
7. Repeat until blocking questions = 0.
8. Generate traceable FR/NFR/AC.
9. Validate that Open Questions contains no material product decision.
10. Set PENDING APPROVAL.
11. After explicit human approval, set APPROVED.

## Materiality Test

A question is blocking if different answers could change user-visible behavior, acceptance criteria, identity/authentication, privacy/security, required inputs/outputs, integration/data authority, persistence, validation/error behavior, or scope.

Such decisions cannot be deferred to Architecture or Implementation.
