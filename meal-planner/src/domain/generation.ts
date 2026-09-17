import type { CatalogueIndex } from './catalogue-index'
import {
  assessWeeklyFeasibility,
  evaluateRecipeEligibility,
  WEEKLY_MEAL_SLOTS,
  type MealAssignment,
} from './planning'
import { validatePreferences, type Preferences } from './preferences'

export interface WeeklyMealPlan {
  assignments: readonly MealAssignment[]
  generationPreferenceSnapshot: Preferences
  catalogueVersion: string
}

export type GenerationFailureCode =
  | 'invalid-input'
  | 'insufficient-candidates'
  | 'impossible-complete-plan'
  | 'search-budget-exhausted'

export interface GenerationFailure {
  success: false
  code: GenerationFailureCode
  message: string
  details?: readonly string[]
}

export interface GenerationSuccess {
  success: true
  plan: WeeklyMealPlan
}

export type WeeklyGenerationResult = GenerationSuccess | GenerationFailure

export type GenerationState = 'searching' | 'yielding' | 'succeeded' | 'failed'

export interface GenerationExecutionState {
  state: GenerationState
  exploredNodes: number
}

export interface GenerationOptions {
  maxNodes?: number
  maxActiveMilliseconds?: number
  yieldEveryNodes?: number
  now?: () => number
  yieldControl?: () => Promise<void>
  onStateChange?: (state: GenerationExecutionState) => void
}

const DEFAULT_MAX_NODES = 100_000
const DEFAULT_MAX_ACTIVE_MILLISECONDS = 2_500
const DEFAULT_YIELD_EVERY_NODES = 256

const clonePreferences = (preferences: Preferences): Preferences => ({
  dietType: preferences.dietType,
  allergens: [...preferences.allergens],
  excludedIngredients: [...preferences.excludedIngredients],
})

const defaultYieldControl = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0))

const invalidInput = (message: string): GenerationFailure => ({
  success: false,
  code: 'invalid-input',
  message,
})

export async function generateWeeklyPlan(
  index: CatalogueIndex,
  input: Preferences,
  options: GenerationOptions = {},
): Promise<WeeklyGenerationResult> {
  if (!index || !index.catalogue || !index.byMealType) {
    return invalidInput('A prepared catalogue index is required to generate a plan.')
  }
  const validatedPreferences = validatePreferences(input)
  if (!validatedPreferences.preferences || validatedPreferences.errors.length > 0) {
    return invalidInput('Preferences are invalid and cannot be used to generate a plan.')
  }

  const preferences = validatedPreferences.preferences
  const feasibility = assessWeeklyFeasibility(index, preferences)
  if (!feasibility.feasible) {
    return {
      success: false,
      code: 'insufficient-candidates',
      message: 'A complete weekly plan cannot be generated with these restrictions.',
      details: feasibility.errors.map((error) => error.message),
    }
  }

  const maxNodes = options.maxNodes ?? DEFAULT_MAX_NODES
  const maxActiveMilliseconds = options.maxActiveMilliseconds ?? DEFAULT_MAX_ACTIVE_MILLISECONDS
  const yieldEveryNodes = options.yieldEveryNodes ?? DEFAULT_YIELD_EVERY_NODES
  if (!Number.isInteger(maxNodes) || maxNodes < 0 || maxActiveMilliseconds < 0 || !Number.isInteger(yieldEveryNodes) || yieldEveryNodes < 1) {
    return invalidInput('Search limits must be non-negative and yield frequency must be positive.')
  }

  const now = options.now ?? (() => performance.now())
  const yieldControl = options.yieldControl ?? defaultYieldControl
  const candidatesByMealType = feasibility.eligibleCandidates
  const slots = WEEKLY_MEAL_SLOTS.map((slot, order) => ({
    slot,
    order,
    candidates: candidatesByMealType[slot.mealType],
  })).sort((left, right) => left.candidates.length - right.candidates.length || left.order - right.order)
  const assignments = new Map<number, MealAssignment>()
  const usedRecipeIds = new Set<string>()
  const startedAt = now()
  let exploredNodes = 0

  const report = (state: GenerationState): void => {
    options.onStateChange?.({ state, exploredNodes })
  }
  const budgetFailure = (): GenerationFailure => ({
    success: false,
    code: 'search-budget-exhausted',
    message: 'The plan search reached its safety budget before finding a complete assignment.',
  })

  const search = async (position: number): Promise<'found' | 'impossible' | 'budget'> => {
    if (position === slots.length) return 'found'
    if (exploredNodes >= maxNodes || now() - startedAt >= maxActiveMilliseconds) return 'budget'

    const current = slots[position]
    for (const recipe of current.candidates) {
      if (usedRecipeIds.has(recipe.id)) continue
      exploredNodes += 1
      if (exploredNodes > maxNodes || now() - startedAt > maxActiveMilliseconds) return 'budget'
      if (!evaluateRecipeEligibility(recipe, current.slot.mealType, preferences, index.catalogue).eligible) continue

      usedRecipeIds.add(recipe.id)
      assignments.set(current.order, { slot: current.slot, recipeId: recipe.id })
      if (exploredNodes % yieldEveryNodes === 0) {
        report('yielding')
        await yieldControl()
        report('searching')
        if (now() - startedAt >= maxActiveMilliseconds) return 'budget'
      }
      const result = await search(position + 1)
      if (result === 'found') return result
      assignments.delete(current.order)
      usedRecipeIds.delete(recipe.id)
      if (result === 'budget') return result
    }
    return 'impossible'
  }

  report('searching')
  const searchResult = await search(0)
  if (searchResult === 'budget') {
    report('failed')
    return budgetFailure()
  }
  if (searchResult === 'impossible') {
    report('failed')
    return {
      success: false,
      code: 'impossible-complete-plan',
      message: 'No complete weekly plan satisfies all restrictions and uniqueness rules.',
    }
  }

  const orderedAssignments = WEEKLY_MEAL_SLOTS.map((_, order) => assignments.get(order)!)
  const plan: WeeklyMealPlan = {
    assignments: orderedAssignments,
    generationPreferenceSnapshot: clonePreferences(preferences),
    catalogueVersion: index.catalogue.version,
  }
  report('succeeded')
  return { success: true, plan }
}