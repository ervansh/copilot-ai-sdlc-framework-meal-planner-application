import { describe, expect, it } from 'vitest'
import { BUNDLED_CATALOGUE_INDEX } from '../src/catalogue'
import { BUNDLED_CATALOGUE } from '../src/catalogue/bundled-catalogue'
import { indexCatalogue, type CatalogueIndex } from '../src/domain/catalogue-index'
import { evaluateRecipeEligibility, type MealAssignment } from '../src/domain/planning'
import { generateWeeklyPlan } from '../src/domain/generation'
import { validatePreferences, type Preferences } from '../src/domain/preferences'

const preferences = (overrides: Record<string, unknown> = {}): Preferences =>
  validatePreferences({ dietType: 'VEGAN', allergens: [], excludedIngredients: [], ...overrides }).preferences!

const expandedIndex = (): CatalogueIndex => {
  const extraRecipes = BUNDLED_CATALOGUE.recipes.flatMap((recipe) =>
    Array.from({ length: 7 }, (_, copy) => ({
      ...recipe,
      id: `${recipe.mealType.toLowerCase()}-safe-${copy + 1}`,
      name: `${recipe.name} Safe ${copy + 1}`,
      allergens: [],
      ingredients: [{ canonicalName: 'safe ingredient', displayName: 'Safe ingredient' }],
    })),
  )
  return indexCatalogue({
    ...BUNDLED_CATALOGUE,
    recipes: [...BUNDLED_CATALOGUE.recipes, ...extraRecipes],
  }).index
}

describe('bounded weekly plan generation', () => {
  it('generates a complete Monday-to-Sunday plan with one meal of each type per day', async () => {
    const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences())

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.plan.assignments).toHaveLength(21)
    expect(result.plan.assignments.map((assignment) => assignment.slot.day)).toEqual([
      'MONDAY', 'MONDAY', 'MONDAY', 'TUESDAY', 'TUESDAY', 'TUESDAY',
      'WEDNESDAY', 'WEDNESDAY', 'WEDNESDAY', 'THURSDAY', 'THURSDAY', 'THURSDAY',
      'FRIDAY', 'FRIDAY', 'FRIDAY', 'SATURDAY', 'SATURDAY', 'SATURDAY',
      'SUNDAY', 'SUNDAY', 'SUNDAY',
    ])
    expect(result.plan.assignments.filter(({ slot }) => slot.mealType === 'BREAKFAST')).toHaveLength(7)
    expect(result.plan.assignments.filter(({ slot }) => slot.mealType === 'LUNCH')).toHaveLength(7)
    expect(result.plan.assignments.filter(({ slot }) => slot.mealType === 'DINNER')).toHaveLength(7)
    expect(new Set(result.plan.assignments.map((assignment) => assignment.recipeId)).size).toBe(21)
  })

  it('preserves diet, allergen, and excluded-ingredient restrictions', async () => {
    const index = expandedIndex()
    const requested = preferences({ allergens: ['NUTS', 'SOY', 'GLUTEN'], excludedIngredients: [' TOMATO '] })
    const result = await generateWeeklyPlan(index, requested)

    expect(result.success).toBe(true)
    if (!result.success) return
    for (const assignment of result.plan.assignments) {
      const recipe = index.catalogue.recipes.find((candidate) => candidate.id === assignment.recipeId)!
      expect(evaluateRecipeEligibility(recipe, assignment.slot.mealType, requested, index.catalogue).eligible).toBe(true)
    }
  })

  it('is deterministic for identical catalogue and preference inputs', async () => {
    const first = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences())
    const second = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences())

    expect(first).toEqual(second)
  })

  it('returns an insufficient-candidate failure without a partial plan', async () => {
    const result = await generateWeeklyPlan(
      BUNDLED_CATALOGUE_INDEX,
      preferences({ excludedIngredients: ['oat', 'chia seed', 'tomato', 'peanut', 'tofu', 'quinoa', 'chickpea'] }),
    )

    expect(result).toMatchObject({ success: false, code: 'insufficient-candidates' })
    expect('plan' in result).toBe(false)
  })

  it('distinguishes confirmed impossible assignment from insufficient candidates', async () => {
    const base = BUNDLED_CATALOGUE_INDEX
    const impossibleIndex: CatalogueIndex = {
      ...base,
      byMealType: {
        ...base.byMealType,
        BREAKFAST: Array(7).fill(base.byMealType.BREAKFAST[0]),
      },
    }
    const result = await generateWeeklyPlan(impossibleIndex, preferences())

    expect(result).toMatchObject({ success: false, code: 'impossible-complete-plan' })
  })

  it('returns a typed search-budget failure and never a partial plan', async () => {
    const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences(), { maxNodes: 1 })

    expect(result).toMatchObject({ success: false, code: 'search-budget-exhausted' })
    expect('plan' in result).toBe(false)
  })

  it('reports deterministic browser-yield and execution states', async () => {
    let yields = 0
    const states: string[] = []
    const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences(), {
      yieldEveryNodes: 1,
      yieldControl: async () => { yields += 1 },
      onStateChange: ({ state }) => { states.push(state) },
    })

    expect(result.success).toBe(true)
    expect(yields).toBeGreaterThan(0)
    expect(states).toEqual(expect.arrayContaining(['searching', 'yielding', 'succeeded']))
  })

  it('does not mutate preferences, catalogue, or indexed inputs', async () => {
    const input = preferences()
    const inputSnapshot = structuredClone(input)
    const catalogueSnapshot = structuredClone(BUNDLED_CATALOGUE_INDEX.catalogue)
    const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, input)

    expect(result.success).toBe(true)
    expect(input).toEqual(inputSnapshot)
    expect(BUNDLED_CATALOGUE_INDEX.catalogue).toEqual(catalogueSnapshot)
    if (result.success) {
      expect(result.plan.generationPreferenceSnapshot).not.toBe(input)
      expect(result.plan.assignments).not.toBe((input as unknown as { assignments?: readonly MealAssignment[] }).assignments)
    }
  })
})