import { describe, expect, it } from 'vitest'
import { BUNDLED_CATALOGUE_INDEX } from '../src/catalogue'
import { BUNDLED_CATALOGUE } from '../src/catalogue/bundled-catalogue'
import { indexCatalogue, type CatalogueIndex } from '../src/domain/catalogue-index'
import { generateWeeklyPlan, type WeeklyMealPlan } from '../src/domain/generation'
import { replaceMeal } from '../src/domain/replacement'
import { validatePreferences, type Preferences } from '../src/domain/preferences'

const preferences = (overrides: Record<string, unknown> = {}): Preferences =>
  validatePreferences({ dietType: 'VEGAN', allergens: [], excludedIngredients: [], ...overrides }).preferences!

const expandedIndex = (): CatalogueIndex => {
  const extraRecipes = BUNDLED_CATALOGUE.recipes.flatMap((recipe) =>
    Array.from({ length: 3 }, (_, copy) => ({
      ...recipe,
      id: `${recipe.id}-replacement-${copy + 1}`,
      name: `${recipe.name} Replacement ${copy + 1}`,
    })),
  )
  return indexCatalogue({ ...BUNDLED_CATALOGUE, recipes: [...BUNDLED_CATALOGUE.recipes, ...extraRecipes] }).index
}

const completePlan = async (index: CatalogueIndex, snapshot: Preferences): Promise<WeeklyMealPlan> => {
  const result = await generateWeeklyPlan(index, snapshot)
  if (!result.success) throw new Error(result.message)
  return result.plan
}

describe('individual meal replacement', () => {
  it('replaces one meal with the same type and preserves unrelated assignments', async () => {
    const index = expandedIndex()
    const plan = await completePlan(index, preferences())
    const selectedSlot = plan.assignments[0].slot
    const originalAssignments = structuredClone(plan.assignments)
    const result = replaceMeal(index, plan, selectedSlot)

    expect(result.success).toBe(true)
    if (!result.success) return
    const replaced = result.plan.assignments.find(({ slot }) => slotKey(slot) === slotKey(selectedSlot))!
    expect(replaced.slot.mealType).toBe(selectedSlot.mealType)
    expect(replaced.recipeId).not.toBe(plan.assignments[0].recipeId)
    expect(result.plan.assignments).toHaveLength(21)
    expect(result.plan.assignments.filter(({ recipeId }) => recipeId === replaced.recipeId)).toHaveLength(1)
    expect(result.plan.assignments.slice(1)).toEqual(originalAssignments.slice(1))
  })

  it('uses the active generation snapshot rather than changed current preferences', async () => {
    const index = expandedIndex()
    const snapshot = preferences()
    const plan = await completePlan(index, snapshot)
    const selectedSlot = plan.assignments[0].slot
    const currentPreferences = preferences({ excludedIngredients: ['oat'] })
    const result = replaceMeal(index, plan, selectedSlot)

    expect(currentPreferences).not.toEqual(plan.generationPreferenceSnapshot)
    expect(result.success).toBe(true)
    if (!result.success) return
    const replacement = result.plan.assignments[0].recipeId
    const replacementRecipe = index.catalogue.recipes.find((recipe) => recipe.id === replacement)!
    expect(replacementRecipe.ingredients.some((ingredient) => ingredient.canonicalName === 'oat')).toBe(true)
    expect(result.plan.generationPreferenceSnapshot).toEqual(snapshot)
  })

  it('preserves diet, allergen, and excluded-ingredient restrictions from the snapshot', async () => {
    const index = expandedIndex()
    const snapshot = preferences({ allergens: ['NUTS', 'SOY'], excludedIngredients: ['tomato'] })
    const plan = await completePlan(index, snapshot)
    const result = replaceMeal(index, plan, plan.assignments[0].slot)

    expect(result.success).toBe(true)
    if (!result.success) return
    const replacement = index.catalogue.recipes.find((recipe) => recipe.id === result.plan.assignments[0].recipeId)!
    expect(replacement.compatibleDiets).toContain(snapshot.dietType)
    expect(replacement.allergens).not.toEqual(expect.arrayContaining(snapshot.allergens))
    expect(replacement.ingredients.map((ingredient) => ingredient.canonicalName)).not.toContain('tomato')
  })

  it('returns a structured failure and leaves the plan unchanged when no candidate exists', async () => {
    const restricted = preferences({ allergens: ['NUTS'] })
    const plan = await completePlan(BUNDLED_CATALOGUE_INDEX, restricted)
    const before = structuredClone(plan)
    const result = replaceMeal(BUNDLED_CATALOGUE_INDEX, plan, plan.assignments[0].slot)

    expect(result).toMatchObject({ success: false, code: 'no-valid-replacement' })
    expect(plan).toEqual(before)
  })

  it('does not mutate the input plan or its snapshot on success', async () => {
    const index = expandedIndex()
    const plan = await completePlan(index, preferences())
    const before = structuredClone(plan)
    const result = replaceMeal(index, plan, plan.assignments[0].slot)

    expect(result.success).toBe(true)
    expect(plan).toEqual(before)
    if (result.success) {
      expect(result.plan).not.toBe(plan)
      expect(result.plan.assignments).not.toBe(plan.assignments)
      expect(result.plan.generationPreferenceSnapshot).not.toBe(plan.generationPreferenceSnapshot)
    }
  })
})

const slotKey = (slot: { day: string; mealType: string }): string => `${slot.day}:${slot.mealType}`