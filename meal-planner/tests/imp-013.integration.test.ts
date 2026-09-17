import { describe, expect, it } from 'vitest'
import { BUNDLED_CATALOGUE } from '../src/catalogue/bundled-catalogue'
import { indexCatalogue } from '../src/domain/catalogue-index'
import { validateCatalogue, type RecipeRecord } from '../src/domain/catalogue'
import { createCoordinatorState, editCurrentPreferences, restoreCoordinatorState } from '../src/domain/coordinator'
import { generateWeeklyPlan } from '../src/domain/generation'
import { evaluateRecipeEligibility } from '../src/domain/planning'
import { ACTIVE_PLAN_STORAGE_KEY, saveActivePlan, type StorageLike } from '../src/domain/persistence'
import { replaceMeal } from '../src/domain/replacement'
import { validatePreferences, type Preferences } from '../src/domain/preferences'

class FakeStorage implements StorageLike {
  private value: string | null = null
  getItem(): string | null { return this.value }
  setItem(_key: string, value: string): void { this.value = value }
  seed(value: unknown): void { this.value = JSON.stringify(value) }
}

const preferences = (overrides: Record<string, unknown> = {}): Preferences =>
  validatePreferences({ dietType: 'VEGAN', allergens: [], excludedIngredients: [], ...overrides }).preferences!

const recipe = (overrides: Partial<RecipeRecord> = {}): RecipeRecord => ({
  id: 'integration-recipe',
  name: 'Integration Recipe',
  mealType: 'BREAKFAST',
  compatibleDiets: ['OMNIVORE', 'VEGETARIAN', 'VEGAN'],
  allergens: [],
  ingredients: [{ canonicalName: 'tomato', displayName: 'Tomato' }],
  instructions: 'Prepare and serve.',
  preparationTimeMinutes: 10,
  servingSize: '1 serving',
  ...overrides,
})

const expandedIndex = () => indexCatalogue({
  ...BUNDLED_CATALOGUE,
  recipes: [...BUNDLED_CATALOGUE.recipes, ...BUNDLED_CATALOGUE.recipes.flatMap((item) =>
    Array.from({ length: 3 }, (_, copy) => ({ ...item, id: `${item.id}-integration-${copy}` })),
  )],
}).index

describe('IMP-013 domain integration coverage', () => {
  it('rejects unsupported meal and diet metadata and excludes invalid records', () => {
    const result = validateCatalogue({
      ...BUNDLED_CATALOGUE,
      recipes: [
        recipe({ id: 'bad-meal', mealType: 'SNACK' as RecipeRecord['mealType'] }),
        recipe({ id: 'bad-diet', compatibleDiets: ['PALEO' as never] }),
      ],
    })

    expect(result.catalogue.recipes).toEqual([])
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ recipeId: 'bad-meal', field: 'mealType' }),
      expect.objectContaining({ recipeId: 'bad-diet', field: 'compatibleDiets' }),
    ]))
  })

  it('preserves catalogue version and does not guess unknown ingredient aliases', () => {
    const indexed = indexCatalogue(BUNDLED_CATALOGUE)
    const recipeWithUnknownAlias = recipe({ ingredients: [{ canonicalName: 'tomato', displayName: 'Tomato' }] })

    expect(indexed.index.catalogue.version).toBe(BUNDLED_CATALOGUE.version)
    expect(evaluateRecipeEligibility(
      recipeWithUnknownAlias,
      'BREAKFAST',
      preferences({ excludedIngredients: ['unknown tomato alias'] }),
      indexed.index.catalogue,
    ).eligible).toBe(true)
  })

  it('carries normalized preference restrictions through generation to every assignment', async () => {
    const index = expandedIndex()
    const requested = preferences({ allergens: ['NUTS', 'SOY'], excludedIngredients: ['  TOMATO  '] })
    const result = await generateWeeklyPlan(index, requested)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.plan.assignments).toHaveLength(21)
    for (const assignment of result.plan.assignments) {
      const candidate = index.catalogue.recipes.find((item) => item.id === assignment.recipeId)!
      expect(candidate.mealType).toBe(assignment.slot.mealType)
      expect(evaluateRecipeEligibility(candidate, assignment.slot.mealType, requested, index.catalogue).eligible).toBe(true)
    }
  })

  it('preserves replacement uniqueness across the complete plan', async () => {
    const index = expandedIndex()
    const result = await generateWeeklyPlan(index, preferences())
    if (!result.success) throw new Error(result.message)
    const replacement = replaceMeal(index, result.plan, result.plan.assignments[0].slot)

    expect(replacement.success).toBe(true)
    if (!replacement.success) return
    const ids = replacement.plan.assignments.map((assignment) => assignment.recipeId)
    expect(new Set(ids).size).toBe(ids.length)
    expect(replacement.plan.assignments.slice(1)).toEqual(result.plan.assignments.slice(1))
  })

  it('does not trust corrupted persistence when coordinating restore', async () => {
    const index = expandedIndex()
    const generated = await generateWeeklyPlan(index, preferences())
    if (!generated.success) throw new Error(generated.message)
    const storage = new FakeStorage()
    expect(saveActivePlan(storage, index, preferences(), generated.plan)).toMatchObject({ success: true })
    storage.seed({ schemaVersion: 1, activePlan: { assignments: [{ recipeId: 'forged' }] } })
    const validState = createCoordinatorState(preferences(), generated.plan, generated.plan)
    const restored = restoreCoordinatorState(validState, storage, index)

    expect(restored).toMatchObject({ success: false, code: 'invalid-persisted-data' })
    expect(restored.state.displayedPlan).toEqual(validState.displayedPlan)
    expect(storage.getItem(ACTIVE_PLAN_STORAGE_KEY)).toContain('forged')
  })

  it('keeps current preferences separate from the generation snapshot across a stale lifecycle', async () => {
    const index = expandedIndex()
    const generated = await generateWeeklyPlan(index, preferences())
    if (!generated.success) throw new Error(generated.message)
    const state = createCoordinatorState(preferences(), generated.plan, generated.plan)
    const edited = editCurrentPreferences(state, preferences({ excludedIngredients: ['oat'] }))

    expect(edited.success).toBe(true)
    if (!edited.success) return
    expect(edited.state.currentPreferences.excludedIngredients).toEqual(['oat'])
    expect(edited.state.displayedPlan?.generationPreferenceSnapshot.excludedIngredients).toEqual([])
    expect(edited.state.displayedPlan?.assignments).toEqual(generated.plan.assignments)
    expect(edited.state.stale).toBe(true)
  })
})