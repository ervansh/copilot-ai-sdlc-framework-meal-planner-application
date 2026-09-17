import { describe, expect, it } from 'vitest'
import { BUNDLED_CATALOGUE_INDEX } from '../src/catalogue'
import { BUNDLED_CATALOGUE } from '../src/catalogue/bundled-catalogue'
import { indexCatalogue } from '../src/domain/catalogue-index'
import { assessWeeklyFeasibility, evaluateRecipeEligibility, validateProposedWeeklyAssignments, type MealAssignment } from '../src/domain/planning'
import { validatePreferences } from '../src/domain/preferences'
import type { RecipeRecord } from '../src/domain/catalogue'

const preferences = (overrides: Record<string, unknown> = {}) =>
  validatePreferences({ dietType: 'VEGAN', allergens: [], excludedIngredients: [], ...overrides }).preferences!

const recipe = (overrides: Partial<RecipeRecord> = {}): RecipeRecord => ({
  id: 'test-recipe',
  name: 'Test Recipe',
  mealType: 'BREAKFAST',
  compatibleDiets: ['VEGAN'],
  allergens: [],
  ingredients: [{ canonicalName: 'tomato', displayName: 'Tomato' }],
  instructions: 'Prepare and serve.',
  preparationTimeMinutes: 10,
  servingSize: '1 serving',
  ...overrides,
})

describe('shared planning eligibility and feasibility', () => {
  it('accepts a recipe compatible with slot, diet, allergens, and exclusions', () => {
    expect(evaluateRecipeEligibility(recipe(), 'BREAKFAST', preferences(), BUNDLED_CATALOGUE_INDEX.catalogue).eligible).toBe(true)
  })

  it.each([
    ['meal type', { mealType: 'LUNCH' as const }, 'BREAKFAST', 'meal-type-mismatch'],
    ['diet', { compatibleDiets: ['VEGETARIAN'] as const }, 'BREAKFAST', 'diet-mismatch'],
    ['allergen', { allergens: ['SOY'] as const }, 'BREAKFAST', 'allergen-conflict'],
  ] as const)('rejects an incompatible %s', (_label, override, slot, code) => {
    const result = evaluateRecipeEligibility(recipe(override), slot, preferences({ allergens: ['SOY'] }), BUNDLED_CATALOGUE_INDEX.catalogue)
    expect(result.eligible).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ code })]))
  })

  it('rejects direct, equivalent, and case-insensitive exclusions without substring false positives', () => {
    const direct = evaluateRecipeEligibility(recipe(), 'BREAKFAST', preferences({ excludedIngredients: [' TOMATO '] }), BUNDLED_CATALOGUE_INDEX.catalogue)
    const equivalent = evaluateRecipeEligibility(recipe({ ingredients: [{ canonicalName: 'tomato', displayName: 'Cherry Tomatoes' }] }), 'BREAKFAST', preferences({ excludedIngredients: ['cherry tomatoes'] }), BUNDLED_CATALOGUE_INDEX.catalogue)
    const caseInsensitive = evaluateRecipeEligibility(recipe(), 'BREAKFAST', preferences({ excludedIngredients: ['ToMaTo'] }), BUNDLED_CATALOGUE_INDEX.catalogue)
    const substring = evaluateRecipeEligibility(recipe({ ingredients: [{ canonicalName: 'nutmeg', displayName: 'Nutmeg' }] }), 'BREAKFAST', preferences({ excludedIngredients: ['nut'] }), BUNDLED_CATALOGUE_INDEX.catalogue)

    expect(direct.eligible).toBe(false)
    expect(equivalent.eligible).toBe(false)
    expect(caseInsensitive.eligible).toBe(false)
    expect(substring.eligible).toBe(true)
  })

  it('reports insufficient breakfast, lunch, and dinner candidates as structured failures', () => {
    const result = assessWeeklyFeasibility(BUNDLED_CATALOGUE_INDEX, preferences({ excludedIngredients: ['tomato', 'chickpeas', 'rice', 'tofu', 'oats', 'lentils', 'black beans', 'potato', 'quinoa', 'mushrooms', 'eggplant', 'zucchini', 'kale', 'cabbage', 'broccoli', 'bell peppers', 'sweet potato', 'avocado', 'spinach', 'coconut', 'peanut', 'sesame', 'pasta', 'white beans'] }))

    expect(result.feasible).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'insufficient-breakfast-recipes' }),
      expect.objectContaining({ code: 'insufficient-lunch-recipes' }),
      expect.objectContaining({ code: 'insufficient-dinner-recipes' }),
    ]))
  })

  it('requires seven eligible distinct recipes for every meal type and never returns a partial plan', () => {
    const result = assessWeeklyFeasibility(BUNDLED_CATALOGUE_INDEX, preferences())

    expect(result.feasible).toBe(true)
    expect(result.eligibleCandidates.BREAKFAST).toHaveLength(8)
    expect(result.eligibleCandidates.LUNCH).toHaveLength(8)
    expect(result.eligibleCandidates.DINNER).toHaveLength(8)
    expect('assignments' in result).toBe(false)
  })

  it('rejects duplicate recipes in a proposed weekly assignment', () => {
    const duplicateAssignments: MealAssignment[] = [
      { slot: { day: 'MONDAY', mealType: 'BREAKFAST' }, recipeId: 'breakfast-001' },
      { slot: { day: 'TUESDAY', mealType: 'BREAKFAST' }, recipeId: 'breakfast-001' },
    ]
    const result = validateProposedWeeklyAssignments(duplicateAssignments, BUNDLED_CATALOGUE_INDEX, preferences())

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'duplicate-recipe-assignment' }),
    ]))
  })

  it('produces an impossible outcome when one meal type has fewer than seven candidates', () => {
    const restricted = assessWeeklyFeasibility(BUNDLED_CATALOGUE_INDEX, preferences({ excludedIngredients: ['oat', 'chia seed', 'tomato', 'peanut', 'tofu', 'quinoa', 'chickpea'] }))

    expect(restricted.feasible).toBe(false)
    expect(restricted.eligibleCandidates.BREAKFAST.length).toBeLessThan(7)
    expect(restricted.errors[0]).toEqual(expect.objectContaining({ code: 'insufficient-breakfast-recipes' }))
  })

  it('filters only validated catalogue records', () => {
    const invalid = { ...BUNDLED_CATALOGUE.recipes[0], id: 'invalid', mealType: 'BRUNCH' as RecipeRecord['mealType'] }
    const indexed = indexCatalogue({ ...BUNDLED_CATALOGUE, recipes: [...BUNDLED_CATALOGUE.recipes, invalid] })

    expect(indexed.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid-recipe', recipeId: 'invalid', field: 'mealType' }),
    ]))
    expect(indexed.index.catalogue.recipes.some((candidate) => candidate.id === 'invalid')).toBe(false)
  })
})