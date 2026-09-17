import {
  MEAL_TYPES,
  type MealType,
  type PreparedCatalogue,
  type RecipeRecord,
} from './catalogue'
import type { CatalogueIndex } from './catalogue-index'
import type { Preferences } from './preferences'

export const WEEK_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const
export type WeekDay = (typeof WEEK_DAYS)[number]

export interface MealSlot {
  day: WeekDay
  mealType: MealType
}

export interface MealAssignment {
  slot: MealSlot
  recipeId: string
}

export const WEEKLY_MEAL_SLOTS: readonly MealSlot[] = WEEK_DAYS.flatMap((day) =>
  MEAL_TYPES.map((mealType) => ({ day, mealType })),
)

export type EligibilityFailureCode =
  | 'meal-type-mismatch'
  | 'diet-mismatch'
  | 'allergen-conflict'
  | 'excluded-ingredient'

export interface EligibilityFailure {
  code: EligibilityFailureCode
  message: string
  recipeId: string
}

export interface EligibilityResult {
  eligible: boolean
  errors: readonly EligibilityFailure[]
}

export type FeasibilityFailureCode =
  | 'insufficient-breakfast-recipes'
  | 'insufficient-lunch-recipes'
  | 'insufficient-dinner-recipes'
  | 'duplicate-recipe-assignment'
  | 'invalid-assignment'

export interface FeasibilityError {
  code: FeasibilityFailureCode
  message: string
  mealType?: MealType
  recipeId?: string
}

export interface WeeklyFeasibilityResult {
  feasible: boolean
  eligibleCandidates: Readonly<Record<MealType, readonly RecipeRecord[]>>
  errors: readonly FeasibilityError[]
}

const normalizeIngredient = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLowerCase()

const canonicalIngredient = (
  value: string,
  catalogue: PreparedCatalogue,
): string => {
  const normalized = normalizeIngredient(value)
  return catalogue.aliasToCanonicalIngredient[normalized] ?? normalized
}

const unique = <Value>(values: readonly Value[]): Value[] => [...new Set(values)]

export function evaluateRecipeEligibility(
  recipe: RecipeRecord,
  mealType: MealType,
  preferences: Preferences,
  catalogue: PreparedCatalogue,
): EligibilityResult {
  const errors: EligibilityFailure[] = []
  if (recipe.mealType !== mealType) {
    errors.push({
      code: 'meal-type-mismatch',
      recipeId: recipe.id,
      message: `Recipe is not compatible with ${mealType.toLowerCase()}.`,
    })
  }
  if (!recipe.compatibleDiets.includes(preferences.dietType)) {
    errors.push({
      code: 'diet-mismatch',
      recipeId: recipe.id,
      message: 'Recipe is not compatible with the selected diet.',
    })
  }
  if (preferences.allergens.some((allergen) => recipe.allergens.includes(allergen))) {
    errors.push({
      code: 'allergen-conflict',
      recipeId: recipe.id,
      message: 'Recipe conflicts with a selected allergen restriction.',
    })
  }

  const recipeIngredients = recipe.ingredients.map((ingredient) =>
    canonicalIngredient(ingredient.canonicalName, catalogue),
  )
  const excludedIngredients = preferences.excludedIngredients.map((ingredient) =>
    canonicalIngredient(ingredient, catalogue),
  )
  if (excludedIngredients.some((excluded) => recipeIngredients.includes(excluded))) {
    errors.push({
      code: 'excluded-ingredient',
      recipeId: recipe.id,
      message: 'Recipe contains an excluded ingredient.',
    })
  }

  return { eligible: errors.length === 0, errors }
}

export function eligibleRecipesForSlot(
  index: CatalogueIndex,
  mealType: MealType,
  preferences: Preferences,
): readonly RecipeRecord[] {
  return index.byMealType[mealType].filter((recipe) =>
    evaluateRecipeEligibility(recipe, mealType, preferences, index.catalogue).eligible,
  )
}

export function assessWeeklyFeasibility(
  index: CatalogueIndex,
  preferences: Preferences,
): WeeklyFeasibilityResult {
  const eligibleCandidates = {
    BREAKFAST: eligibleRecipesForSlot(index, 'BREAKFAST', preferences),
    LUNCH: eligibleRecipesForSlot(index, 'LUNCH', preferences),
    DINNER: eligibleRecipesForSlot(index, 'DINNER', preferences),
  } as const
  const errors: FeasibilityError[] = []

  for (const mealType of MEAL_TYPES) {
    if (eligibleCandidates[mealType].length < WEEK_DAYS.length) {
      errors.push({
        code: `insufficient-${mealType.toLowerCase()}-recipes` as FeasibilityFailureCode,
        mealType,
        message: `Fewer than seven eligible ${mealType.toLowerCase()} recipes are available.`,
      })
    }
  }

  return { feasible: errors.length === 0, eligibleCandidates, errors }
}

export function validateProposedWeeklyAssignments(
  assignments: readonly MealAssignment[],
  index: CatalogueIndex,
  preferences: Preferences,
): { valid: boolean; errors: readonly FeasibilityError[] } {
  const errors: FeasibilityError[] = []
  const seenRecipeIds = new Set<string>()
  const seenSlots = new Set<string>()
  const recipesById = new Map(index.catalogue.recipes.map((recipe) => [recipe.id, recipe]))

  for (const assignment of assignments) {
    const slotKey = `${assignment.slot.day}:${assignment.slot.mealType}`
    const recipe = recipesById.get(assignment.recipeId)
    if (seenRecipeIds.has(assignment.recipeId)) {
      errors.push({
        code: 'duplicate-recipe-assignment',
        recipeId: assignment.recipeId,
        message: 'A recipe cannot be assigned more than once in a weekly plan.',
      })
    }
    if (seenSlots.has(slotKey) || !WEEKLY_MEAL_SLOTS.some((slot) => `${slot.day}:${slot.mealType}` === slotKey) || !recipe) {
      errors.push({
        code: 'invalid-assignment',
        recipeId: assignment.recipeId,
        message: 'The proposed assignment does not identify a valid weekly meal slot and recipe.',
      })
    } else if (!evaluateRecipeEligibility(recipe, assignment.slot.mealType, preferences, index.catalogue).eligible) {
      errors.push({
        code: 'invalid-assignment',
        recipeId: assignment.recipeId,
        message: 'The proposed assignment violates recipe eligibility restrictions.',
      })
    }
    seenRecipeIds.add(assignment.recipeId)
    seenSlots.add(slotKey)
  }

  if (assignments.length !== WEEKLY_MEAL_SLOTS.length || unique(assignments.map((assignment) => `${assignment.slot.day}:${assignment.slot.mealType}`)).length !== WEEKLY_MEAL_SLOTS.length) {
    errors.push({
      code: 'invalid-assignment',
      message: 'A weekly plan must contain exactly 21 distinct meal slots.',
    })
  }
  return { valid: errors.length === 0, errors }
}