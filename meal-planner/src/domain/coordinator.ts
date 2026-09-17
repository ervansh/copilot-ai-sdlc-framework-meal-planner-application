import type { CatalogueIndex } from './catalogue-index'
import {
  generateWeeklyPlan,
  type GenerationExecutionState,
  type GenerationOptions,
  type WeeklyMealPlan,
} from './generation'
import {
  isPlanStale,
  restoreActivePlan,
  saveActivePlan,
  type RestoreResult,
  type SaveResult,
  type StorageLike,
} from './persistence'
import { replaceMeal, type MealReplacementResult } from './replacement'
import { validatePreferences, type PreferenceInput, type Preferences } from './preferences'
import type { MealSlot } from './planning'

export type GenerationStatus = 'idle' | 'generating' | 'succeeded' | 'failed'

export interface CoordinatorState {
  currentPreferences: Preferences
  displayedPlan?: WeeklyMealPlan
  savedPlan?: WeeklyMealPlan
  stale: boolean
  dirty: boolean
  generationStatus: GenerationStatus
  error?: CoordinatorError
}

export interface CoordinatorError {
  code: string
  message: string
}

export interface CoordinatorSuccess {
  success: true
  state: CoordinatorState
}

export interface CoordinatorFailure {
  success: false
  state: CoordinatorState
  code: string
  message: string
}

export type CoordinatorResult = CoordinatorSuccess | CoordinatorFailure

export interface CoordinatorRegenerationOptions extends GenerationOptions {
  confirmDiscard?: boolean
}

const clonePreferences = (preferences: Preferences): Preferences => ({
  dietType: preferences.dietType,
  allergens: [...preferences.allergens],
  excludedIngredients: [...preferences.excludedIngredients],
})

const clonePlan = (plan: WeeklyMealPlan | undefined): WeeklyMealPlan | undefined => {
  if (!plan) return undefined
  return {
    assignments: plan.assignments.map((assignment) => ({ slot: { ...assignment.slot }, recipeId: assignment.recipeId })),
    generationPreferenceSnapshot: clonePreferences(plan.generationPreferenceSnapshot),
    catalogueVersion: plan.catalogueVersion,
  }
}

const plansEqual = (left: WeeklyMealPlan | undefined, right: WeeklyMealPlan | undefined): boolean => {
  if (!left || !right) return left === right
  return left.catalogueVersion === right.catalogueVersion &&
    left.assignments.length === right.assignments.length &&
    left.assignments.every((assignment, index) => {
      const other = right.assignments[index]
      return other?.recipeId === assignment.recipeId &&
        other.slot.day === assignment.slot.day &&
        other.slot.mealType === assignment.slot.mealType
    })
}

const deriveState = (
  currentPreferences: Preferences,
  displayedPlan: WeeklyMealPlan | undefined,
  savedPlan: WeeklyMealPlan | undefined,
  generationStatus: GenerationStatus = 'idle',
  error?: CoordinatorError,
): CoordinatorState => ({
  currentPreferences: clonePreferences(currentPreferences),
  displayedPlan: clonePlan(displayedPlan),
  savedPlan: clonePlan(savedPlan),
  stale: displayedPlan ? isPlanStale(currentPreferences, displayedPlan) : false,
  dirty: !plansEqual(displayedPlan, savedPlan),
  generationStatus,
  ...(error ? { error } : {}),
})

const success = (state: CoordinatorState): CoordinatorSuccess => ({ success: true, state })

const failure = (
  state: CoordinatorState,
  code: string,
  message: string,
  generationStatus = state.generationStatus,
): CoordinatorFailure => ({
  success: false,
  state: { ...state, generationStatus, error: { code, message } },
  code,
  message,
})

export function createCoordinatorState(
  currentPreferences: Preferences,
  displayedPlan?: WeeklyMealPlan,
  savedPlan?: WeeklyMealPlan,
): CoordinatorState {
  return deriveState(currentPreferences, displayedPlan, savedPlan)
}

export function editCurrentPreferences(
  state: CoordinatorState,
  input: PreferenceInput,
): CoordinatorResult {
  const validation = validatePreferences(input)
  if (!validation.preferences || validation.errors.length > 0) {
    return failure(state, validation.errors[0]?.code ?? 'invalid-preferences', validation.errors[0]?.message ?? 'Preferences are invalid.')
  }
  return success(deriveState(validation.preferences, state.displayedPlan, state.savedPlan))
}

export async function regeneratePlan(
  state: CoordinatorState,
  index: CatalogueIndex,
  options: CoordinatorRegenerationOptions = {},
): Promise<CoordinatorResult> {
  if (state.dirty && options.confirmDiscard !== true) {
    return failure(state, 'confirmation-required', 'Confirm discarding unsaved plan changes before regenerating.')
  }

  const generationOptions: GenerationOptions = {
    ...options,
    onStateChange: (executionState: GenerationExecutionState) => {
      options.onStateChange?.(executionState)
    },
  }
  const result = await generateWeeklyPlan(index, state.currentPreferences, generationOptions)
  if (!result.success) return failure(state, result.code, result.message, 'failed')
  return success(deriveState(state.currentPreferences, result.plan, state.savedPlan, 'succeeded'))
}

export function replaceDisplayedMeal(
  state: CoordinatorState,
  index: CatalogueIndex,
  selectedSlot: MealSlot,
): CoordinatorResult {
  if (!state.displayedPlan) return failure(state, 'no-active-plan', 'There is no active plan to update.')
  const result: MealReplacementResult = replaceMeal(index, state.displayedPlan, selectedSlot)
  if (!result.success) return failure(state, result.code, result.message)
  return success(deriveState(state.currentPreferences, result.plan, state.savedPlan))
}

export function saveDisplayedPlan(
  state: CoordinatorState,
  storage: StorageLike,
  index: CatalogueIndex,
  options: { confirmReplacement?: boolean } = {},
): CoordinatorResult {
  if (!state.displayedPlan) return failure(state, 'no-active-plan', 'There is no active plan to save.')
  const result: SaveResult = saveActivePlan(storage, index, state.currentPreferences, state.displayedPlan, options)
  if (!result.success) return failure(state, result.code, result.message)
  return success(deriveState(state.currentPreferences, state.displayedPlan, state.displayedPlan))
}

export function restoreCoordinatorState(
  state: CoordinatorState,
  storage: StorageLike,
  index: CatalogueIndex,
): CoordinatorResult {
  const result: RestoreResult = restoreActivePlan(storage, index)
  if (!result.success) return failure(state, result.code, result.message)
  return success(deriveState(result.data.currentPreferences, result.data.activePlan, result.data.activePlan))
}