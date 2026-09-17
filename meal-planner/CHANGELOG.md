# Changelog

## Unreleased

### Added

- Dietary preference configuration for omnivore, vegetarian, and vegan diets.
- Allergen restrictions and normalized excluded-ingredient handling.
- Bundled, validated recipe catalogue with catalogue-defined ingredient equivalence.
- Complete 7-day by 3-meal weekly plan generation with hard restrictions and no duplicate recipes.
- Individual meal replacement that preserves meal type, restrictions, uniqueness, and unrelated assignments.
- Versioned local persistence, save/restore, stale-plan detection, and explicit regeneration behavior.
- Weekly, daily, and recipe-detail views with responsive and accessibility behavior.
- Unit, integration, browser, and performance verification coverage.

### Verification

- Final Verification outcome: `PASS WITH OBSERVATIONS`.
- 19 functional requirements, 5 non-functional requirements, and 24 acceptance criteria passed.
- Vitest suite: 14 test files and 94 tests passed; 0 failed.
- Browser suite: 21 tests passed across desktop, tablet, and mobile Chrome projects.
- ESLint, TypeScript, and Vite production build passed.

### Known Limitations

- Two moderate `@vitest/mocker` advisories remain in the development-only Vitest toolchain. No production runtime vulnerability was identified, and no forced breaking upgrade was applied.
- Browser execution used installed Google Chrome only. Firefox, Edge, and Safari were not executed.
- Browser loading behavior was not independently observable on the fast production catalogue path; deterministic domain loading and yield states were verified instead.