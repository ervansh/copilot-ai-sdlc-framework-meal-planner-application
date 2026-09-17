import type { CatalogueIndex } from './catalogue-index'
import {
  evaluateRecipeEligibility,
  validateProposedWeeklyAssignments,
  type MealAssignment,
  type MealSlot,
} from './planning'
import type { WeeklyMealPlan } from './generation'
import type { Preferences } from './preferences'

export type ReplacementFailureCode = 'invalid-plan' | 'invalid-slot' | 'no-valid-replacement'

export interface ReplacementFailure {
  success: false
  code: ReplacementFailureCode
  message: string
}

export interface ReplacementSuccess {
  success: true
  plan: WeeklyMealPlan
}

export type MealReplacementResult = ReplacementSuccess | ReplacementFailure

const clonePreferences = (preferences: Preferences): Preferences => ({
  dietType: preferences.dietType,
  allergens: [...preferences.allergens],
  excludedIngredients: [...preferences.excludedIngredients],
})

const slotKey = (slot: MealSlot): string => `${slot.day}:${slot.mealType}`

const cloneAssignment = (assignment: MealAssignment): MealAssignment => ({
  slot: { ...assignment.slot },
  recipeId: assignment.recipeId,
})

export function replaceMeal(
  index: CatalogueIndex,
  activePlan: WeeklyMealPlan,
  selectedSlot: MealSlot,
): MealReplacementResult {
  const planValidation = validateProposedWeeklyAssignments(
    activePlan.assignments,
    index,
    activePlan.generationPreferenceSnapshot,
  )
  if (!planValidation.valid) {
    return {
      success: false,
      code: 'invalid-plan',
      message: 'The active plan is invalid and cannot be changed.',
    }
  }

  const selectedKey = slotKey(selectedSlot)
  const selectedAssignment = activePlan.assignments.find(
    (assignment) => slotKey(assignment.slot) === selectedKey,
  )
  if (!selectedAssignment) {
    return {
      success: false,
      code: 'invalid-slot',
      message: 'The selected meal slot is not part of the active weekly plan.',
    }
  }

  const usedRecipeIds = new Set(activePlan.assignments.map((assignment) => assignment.recipeId))
  const candidate = index.byMealType[selectedSlot.mealType].find((recipe) =>
    !usedRecipeIds.has(recipe.id) &&
    evaluateRecipeEligibility(
      recipe,
      selectedSlot.mealType,
      activePlan.generationPreferenceSnapshot,
      index.catalogue,
    ).eligible,
  )
  if (!candidate) {
    return {
      success: false,
      code: 'no-valid-replacement',
      message: 'No valid replacement is available for the selected meal.',
    }
  }

  const assignments = activePlan.assignments.map((assignment) =>
    slotKey(assignment.slot) === selectedKey
      ? { slot: { ...assignment.slot }, recipeId: candidate.id }
      : cloneAssignment(assignment),
  )
  return {
    success: true,
    plan: {
      assignments,
      generationPreferenceSnapshot: clonePreferences(activePlan.generationPreferenceSnapshot),
      catalogueVersion: activePlan.catalogueVersion,
    },
  }
}