# Meal Planner Requirements

## Metadata

- **Application:** Meal Planner
- **Requirement source:** Supplied user story and confirmed clarification decisions Q-001 through Q-024
- **SDLC stage:** Requirements Review
- **Document status:** APPROVED

## Project Overview

Meal Planner is a single-user application that creates and manages one active weekly meal plan from a predefined recipe catalogue. The plan must respect the user's selected diet type, allergen restrictions, and excluded ingredients.

## User Story

As a user, I want to create a weekly meal plan based on my dietary preferences, so that I can plan my meals more easily.

## Business Objective

Enable a user to create, review, save, reopen, and maintain a complete seven-day meal plan without receiving recipes that violate the user's dietary restrictions, allergen restrictions, or excluded ingredients.

## In Scope

- Selecting exactly one diet type: Omnivore, Vegetarian, or Vegan.
- Selecting zero or more supported allergen restrictions: Nuts, Dairy, Gluten, Eggs, Soy, and Shellfish.
- Maintaining a structured list of excluded ingredients.
- Generating a fixed Monday-to-Sunday plan with breakfast, lunch, and dinner for each day.
- Assigning 21 distinct valid recipes, with each recipe compatible with its meal type.
- Viewing the complete plan, an individual day's meals, and assigned recipe details.
- Saving one active weekly plan and reopening it after the local application is closed and reopened.
- Replacing an individual meal with another valid recipe.
- Editing preferences and explicitly regenerating the plan.
- Handling invalid input, impossible combinations, unavailable recipes, and invalid catalogue data.
- Basic accessibility support for labels, keyboard use, understandable messages, semantic controls, and readable content.
- A web application usable from desktop browsers with a responsive layout suitable for tablet-sized and mobile browser screens.

## Out of Scope

- Nutrition-oriented diets such as low-carbohydrate, high-protein, and calorie-controlled diets.
- Halal, kosher, and pescatarian diet types.
- Snacks.
- Custom date ranges or user-selected plan start dates.
- Household-size configuration, quantity calculation, and weekly serving totals.
- External recipe providers or recipe APIs.
- User-created recipes.
- Multiple saved plans, plan history, export, sharing, printing, full-day regeneration, and grocery-list generation.
- Authentication, login, registration, passwords, account management, and multi-user or household support.
- Formal WCAG certification.
- Native mobile applications.

## Functional Requirements

- **FR-001:** The system shall require the user to select exactly one diet type from Omnivore, Vegetarian, and Vegan before generating a meal plan.
- **FR-002:** The system shall allow the user to select multiple allergen restrictions from Nuts, Dairy, Gluten, Eggs, Soy, and Shellfish.
- **FR-003:** The system shall allow the user to add excluded ingredients one at a time to a structured list, trim surrounding whitespace, match exclusions case-insensitively, remove exclusions, and retain only one entry for duplicates.
- **FR-004:** The system shall treat selected diet type, selected allergens, and excluded ingredients as hard restrictions for meal-plan generation and individual meal replacement.
- **FR-005:** The system shall consider a recipe eligible only when it contains all required catalogue information: recipe name, compatible meal type, dietary compatibility, allergen information, ingredients, cooking instructions, preparation time, and serving size.
- **FR-006:** The system shall generate a fixed Monday-to-Sunday meal plan containing exactly one Breakfast, one Lunch, and one Dinner for each of the seven days.
- **FR-007:** The system shall assign recipes only to compatible meal types and shall not assign the same recipe more than once within a weekly plan.
- **FR-008:** The system shall reject an excluded ingredient when the recipe contains that ingredient, using case-insensitive matching and catalogue-defined common naming equivalence without relying solely on unsafe arbitrary substring matching.
- **FR-009:** The system shall prevent generation when no complete valid plan of 21 distinct meal assignments can satisfy all applicable restrictions and shall explain the relevant restriction, conflict, or catalogue limitation where practical.
- **FR-010:** The system shall allow the user to view the complete weekly plan and the meals for an individual day.
- **FR-011:** The system shall allow the user to view the assigned recipe's name, meal type, ingredients, cooking instructions, preparation time, and serving size, consistently with the selected meal slot.
- **FR-012:** The system shall allow the user to save one active weekly meal plan together with the selected diet type, selected allergens, and excluded ingredients.
- **FR-013:** When saving a new plan while another active plan exists, the system shall explain that the existing plan will be replaced and shall replace it only after explicit user confirmation.
- **FR-014:** The system shall make the saved plan and its persisted preferences available when the same local application is closed and reopened.
- **FR-015:** The system shall allow the user to replace an individual meal with another valid recipe while preserving the meal type, all restrictions, and the no-duplicate rule, leaving every other meal unchanged.
- **FR-016:** If no valid replacement exists, the system shall show a clear message and leave the current meal unchanged.
- **FR-017:** The system shall allow the user to edit dietary preferences after a plan has been saved without silently modifying the saved plan.
- **FR-018:** After preference changes, the system shall clearly indicate that the saved plan was generated using older preferences and shall apply the updated preferences only after the user explicitly regenerates the plan.
- **FR-019:** The system shall request confirmation before regeneration when regeneration would discard unsaved changes to the currently displayed plan, retain the current plan when cancelled, and proceed without additional confirmation when there are no unsaved changes.

## Non-Functional Requirements

- **NFR-001:** Form controls shall have clear labels, interactive controls shall be keyboard usable, validation and error messages shall be understandable, semantic controls shall be used where appropriate, and text and controls shall remain readable at supported screen sizes.
- **NFR-002:** The system shall preserve the active plan, selected diet type, selected allergens, and excluded ingredients across closure and reopening of the same local application.
- **NFR-003:** The system shall maintain data integrity by never presenting an incomplete catalogue recipe as a valid meal option and never violating a confirmed hard restriction to complete or diversify a plan.
- **NFR-004:** Under normal operating conditions, weekly meal-plan generation should normally complete within 3 seconds. If generation takes longer, the application shall provide visible progress or loading feedback so that it does not appear frozen.
- **NFR-005:** The Meal Planner shall be a web application usable from desktop browsers and shall provide a responsive layout suitable for tablet-sized and mobile browser screens.

## Validation and Error Handling Requirements

- Diet type is required. Generation shall be prevented when no diet type is selected, with a clear request to select one.
- Only one diet type may be selected. Multiple diet-type selections are not supported.
- Allergen restrictions may be selected together, and a recipe conflicting with any selected allergen shall be rejected.
- Excluded ingredient input shall reject empty values after trimming, normalize case for matching, de-duplicate existing values silently, and support later removal.
- Excluded ingredients shall be evaluated using catalogue-defined ingredient equivalence; arbitrary substring matching alone shall not determine eligibility where it could produce an incorrect result.
- A conflicting or impossible combination of preferences, allergens, or exclusions shall prevent generation and provide a clear explanation without silently ignoring a restriction.
- If there are insufficient valid, distinct recipes for the required meal types, the system shall explain that a complete valid plan cannot be generated and shall not return a closest match that violates a hard restriction.
- Invalid catalogue entries missing any required recipe information shall not be eligible for generation or replacement and shall not produce an invalid plan.
- A replacement with no valid candidate shall leave the assigned meal unchanged and show a clear message.
- Replacing a saved plan shall require confirmation; cancelling shall preserve the existing plan.
- Cancelling regeneration after a warning about unsaved changes shall preserve the currently displayed plan.
- If weekly generation exceeds the normal 3-second completion expectation, visible progress or loading feedback shall be provided.

## Acceptance Criteria

- **AC-001:** Given no selected diet type, when the user requests generation, then generation is prevented and a clear diet-selection validation message is shown.
- **AC-002:** Given one selected diet type and any combination of supported allergens and exclusions, when a plan is generated, then every assigned recipe satisfies all selected hard restrictions.
- **AC-003:** Given a weekly plan, then it contains seven days, with exactly one Breakfast, one Lunch, and one Dinner per day, for 21 meal slots total.
- **AC-004:** Given a generated weekly plan, then no exact recipe is assigned to more than one meal slot.
- **AC-005:** Given a recipe assigned to a meal slot, then its meal type matches that slot.
- **AC-006:** Given an exclusion matching a recipe ingredient by case or catalogue-defined common naming variation, when generation or replacement is attempted, then that recipe is rejected.
- **AC-007:** Given no complete valid set of 21 distinct recipes, when generation is attempted, then no violating plan is returned and the user receives an explanation of the relevant limitation where practical.
- **AC-008:** Given an incomplete catalogue recipe, when generation or replacement is attempted, then the recipe is not offered or assigned as a valid meal.
- **AC-009:** Given a generated plan, when the user views the plan, then the complete week and each individual day's meals are available.
- **AC-010:** Given an assigned meal, when the user opens its recipe details, then the required recipe fields are displayed consistently with that meal assignment.
- **AC-011:** Given a generated plan and preferences, when the user saves it, then one active saved plan and its preferences are persisted.
- **AC-012:** Given an existing active saved plan, when the user saves another plan, then replacement is explained and occurs only after confirmation; cancelling preserves the existing plan.
- **AC-013:** Given persisted saved data, when the same local application is closed and reopened, then the saved plan and its preferences remain available.
- **AC-014:** Given a current weekly plan, when the user replaces one meal, then the replacement has the same meal type, satisfies all restrictions, is not already used elsewhere in the week, and all other meals remain unchanged.
- **AC-015:** Given no valid replacement, when the user requests replacement, then a clear message is shown and the current meal remains unchanged.
- **AC-016:** Given a saved plan, when the user edits preferences, then the plan remains viewable, is marked as based on older preferences, and is not silently modified.
- **AC-017:** Given changed preferences, when the user explicitly regenerates, then the new plan uses the updated preferences.
- **AC-018:** Given unsaved changes to the displayed plan, when the user regenerates, then confirmation is requested; cancelling leaves the displayed plan unchanged.
- **AC-019:** Given no unsaved changes, when the user regenerates, then no additional unsaved-change confirmation is required.
- **AC-020:** Given the application interface, then controls are clearly labelled, keyboard usable, semantically appropriate where applicable, and readable at supported screen sizes, with understandable validation and error messages.
- **AC-021:** Given an excluded ingredient input, when it is blank after trimming or duplicates an existing exclusion, then the blank value is rejected and the duplicate produces only one structured-list entry; given a valid new value, then it is added and can later be removed.
- **AC-022:** Given normal operating conditions, when the user generates a weekly meal plan, then generation normally completes within 3 seconds; if it takes longer, then visible progress or loading feedback is displayed.
- **AC-023:** Given a desktop browser, when the user opens the Meal Planner, then the web application is usable and its core interface is available.
- **AC-024:** Given a tablet-sized or mobile browser screen, when the user opens the Meal Planner, then the interface uses a responsive layout and remains usable without requiring a native mobile application.

## Assumptions

- The application is used by one local user and does not require authentication.
- The recipe catalogue is managed by the Meal Planner application and is the only recipe source for the MVP.
- A recipe's catalogue metadata identifies its compatible meal type, dietary compatibility, allergen information, and equivalent ingredient names sufficiently for eligibility decisions.
- The fixed weekly plan always represents Monday through Sunday.
- Serving-size information is displayed but is not used to calculate quantities or totals.

## Open Questions

No open requirements questions remain.

## Traceability

| Requirement | Acceptance Criteria |
|---|---|---|
| FR-001 | AC-001 |
| FR-002 | AC-002 |
| FR-003 | AC-021 |
| FR-004 | AC-002, AC-006, AC-014 |
| FR-005 | AC-008 |
| FR-006 | AC-003 |
| FR-007 | AC-004, AC-005 |
| FR-008 | AC-006 |
| FR-009 | AC-007 |
| FR-010 | AC-009 |
| FR-011 | AC-010 |
| FR-012 | AC-011 |
| FR-013 | AC-012 |
| FR-014 | AC-013 |
| FR-015 | AC-014 |
| FR-016 | AC-015 |
| FR-017 | AC-016 |
| FR-018 | AC-016, AC-017 |
| FR-019 | AC-018, AC-019 |
| NFR-001 | AC-020 |
| NFR-002 | AC-013 |
| NFR-003 | AC-002, AC-007, AC-008 |
| NFR-004 | AC-022 |
| NFR-005 | AC-023, AC-024 |

## Approval

**Approval Status:** APPROVED
