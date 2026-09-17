import { describe, expect, it } from 'vitest'
import { BUNDLED_CATALOGUE_INDEX } from '../src/catalogue'
import { BUNDLED_CATALOGUE } from '../src/catalogue/bundled-catalogue'
import { indexCatalogue, type CatalogueIndex } from '../src/domain/catalogue-index'
import { generateWeeklyPlan, type WeeklyMealPlan } from '../src/domain/generation'
import {
  createCoordinatorState,
  editCurrentPreferences,
  regeneratePlan,
  replaceDisplayedMeal,
  restoreCoordinatorState,
  saveDisplayedPlan,
  type CoordinatorState,
} from '../src/domain/coordinator'
import { ACTIVE_PLAN_STORAGE_KEY, type StorageLike } from '../src/domain/persistence'
import { validatePreferences, type Preferences } from '../src/domain/preferences'

class FakeStorage implements StorageLike {
  private value: string | null = null
  getItem(): string | null { return this.value }
  setItem(_key: string, value: string): void { this.value = value }
  seed(value: unknown): void { this.value = JSON.stringify(value) }
}

const preferences = (overrides: Record<string, unknown> = {}): Preferences =>
  validatePreferences({ dietType: 'VEGAN', allergens: [], excludedIngredients: [], ...overrides }).preferences!

const expandedIndex = (): CatalogueIndex => {
  const extraRecipes = BUNDLED_CATALOGUE.recipes.flatMap((recipe) =>
    Array.from({ length: 3 }, (_, copy) => ({
      ...recipe,
      id: `${recipe.id}-coordinator-${copy + 1}`,
      name: `${recipe.name} Coordinator ${copy + 1}`,
    })),
  )
  return indexCatalogue({ ...BUNDLED_CATALOGUE, recipes: [...BUNDLED_CATALOGUE.recipes, ...extraRecipes] }).index
}

const planFor = async (index: CatalogueIndex, snapshot = preferences()): Promise<WeeklyMealPlan> => {
  const result = await generateWeeklyPlan(index, snapshot)
  if (!result.success) throw new Error(result.message)
  return result.plan
}

const stateFor = async (index: CatalogueIndex, snapshot = preferences()): Promise<CoordinatorState> =>
  createCoordinatorState(snapshot, await planFor(index, snapshot), await planFor(index, snapshot))

describe('application state coordinator', () => {
  it('edits current preferences without changing the plan snapshot and marks it stale', async () => {
    const index = expandedIndex()
    const plan = await planFor(index)
    const state = createCoordinatorState(preferences(), plan)
    const result = editCurrentPreferences(state, preferences({ excludedIngredients: ['oat'] }))

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.stale).toBe(true)
    expect(result.state.displayedPlan).toEqual(plan)
    expect(result.state.displayedPlan?.generationPreferenceSnapshot).toEqual(plan.generationPreferenceSnapshot)
  })

  it('replaces a stale plan using its snapshot and marks the displayed state dirty', async () => {
    const index = expandedIndex()
    const plan = await planFor(index)
    const initial = createCoordinatorState(preferences(), plan)
    const edited = editCurrentPreferences(initial, preferences({ excludedIngredients: ['oat'] }))
    if (!edited.success) throw new Error(edited.message)
    const result = replaceDisplayedMeal(edited.state, index, plan.assignments[0].slot)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.stale).toBe(true)
    expect(result.state.dirty).toBe(true)
    expect(result.state.displayedPlan?.generationPreferenceSnapshot).toEqual(plan.generationPreferenceSnapshot)
    expect(result.state.displayedPlan?.assignments.slice(1)).toEqual(plan.assignments.slice(1))
  })

  it('preserves state when replacement fails', async () => {
    const state = await stateFor(BUNDLED_CATALOGUE_INDEX, preferences({ allergens: ['NUTS'] }))
    const before = structuredClone(state)
    const result = replaceDisplayedMeal(state, BUNDLED_CATALOGUE_INDEX, state.displayedPlan!.assignments[0].slot)

    expect(result).toMatchObject({ success: false, code: 'no-valid-replacement' })
    expect(result.state.displayedPlan).toEqual(before.displayedPlan)
    expect(result.state.savedPlan).toEqual(before.savedPlan)
  })

  it('regenerates from current preferences and creates a new snapshot', async () => {
    const index = expandedIndex()
    const original = await planFor(index)
    const state = createCoordinatorState(preferences(), original, original)
    const edited = editCurrentPreferences(state, preferences({ excludedIngredients: ['oat'] }))
    if (!edited.success) throw new Error(edited.message)
    const result = await regeneratePlan(edited.state, index)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.state.stale).toBe(false)
    expect(result.state.displayedPlan?.generationPreferenceSnapshot).toEqual(edited.state.currentPreferences)
    expect(result.state.displayedPlan?.generationPreferenceSnapshot).not.toBe(original.generationPreferenceSnapshot)
  })

  it('preserves the valid plan and snapshot when regeneration fails', async () => {
    const state = await stateFor(BUNDLED_CATALOGUE_INDEX)
    const edited = editCurrentPreferences(state, preferences({ excludedIngredients: ['oat'] }))
    if (!edited.success) throw new Error(edited.message)
    const before = structuredClone(edited.state)
    const result = await regeneratePlan(edited.state, BUNDLED_CATALOGUE_INDEX)

    expect(result).toMatchObject({ success: false, code: 'insufficient-candidates' })
    expect(result.state.displayedPlan).toEqual(before.displayedPlan)
    expect(result.state.displayedPlan?.generationPreferenceSnapshot).toEqual(before.displayedPlan?.generationPreferenceSnapshot)
  })

  it('requires confirmation only when regeneration would discard dirty plan changes', async () => {
    const index = expandedIndex()
    const state = await stateFor(index)
    const replaced = replaceDisplayedMeal(state, index, state.displayedPlan!.assignments[0].slot)
    if (!replaced.success) throw new Error(replaced.message)
    const required = await regeneratePlan(replaced.state, index)
    const clean = await regeneratePlan(state, index)

    expect(required).toMatchObject({ success: false, code: 'confirmation-required' })
    expect(clean.success).toBe(true)
  })

  it('cancelling regeneration confirmation leaves state unchanged', async () => {
    const index = expandedIndex()
    const state = await stateFor(index)
    const replaced = replaceDisplayedMeal(state, index, state.displayedPlan!.assignments[0].slot)
    if (!replaced.success) throw new Error(replaced.message)
    const before = structuredClone(replaced.state)
    const result = await regeneratePlan(replaced.state, index, { confirmDiscard: false })

    expect(result).toMatchObject({ success: false, code: 'confirmation-required' })
    expect(result.state.displayedPlan).toEqual(before.displayedPlan)
    expect(result.state.dirty).toBe(true)
  })

  it('saves stale plans without rewriting their snapshot and restores stale state', async () => {
    const index = expandedIndex()
    const storage = new FakeStorage()
    const plan = await planFor(index)
    const state = createCoordinatorState(preferences(), plan)
    const edited = editCurrentPreferences(state, preferences({ excludedIngredients: ['oat'] }))
    if (!edited.success) throw new Error(edited.message)
    const saved = saveDisplayedPlan(edited.state, storage, index)
    expect(saved.success).toBe(true)
    if (!saved.success) return
    expect(saved.state.stale).toBe(true)
    expect(saved.state.dirty).toBe(false)
    expect(saved.state.displayedPlan?.generationPreferenceSnapshot).toEqual(plan.generationPreferenceSnapshot)

    const restored = restoreCoordinatorState(createCoordinatorState(preferences()), storage, index)
    expect(restored.success).toBe(true)
    if (restored.success) {
      expect(restored.state.stale).toBe(true)
      expect(restored.state.currentPreferences).toEqual(edited.state.currentPreferences)
      expect(restored.state.displayedPlan?.generationPreferenceSnapshot).toEqual(plan.generationPreferenceSnapshot)
    }
  })

  it('preserves a valid state when restore fails', async () => {
    const index = expandedIndex()
    const storage = new FakeStorage()
    storage.seed({ schemaVersion: 99 })
    const state = await stateFor(index)
    const before = structuredClone(state)
    const result = restoreCoordinatorState(state, storage, index)

    expect(result).toMatchObject({ success: false, code: 'unsupported-schema-version' })
    expect(result.state.displayedPlan).toEqual(before.displayedPlan)
    expect(result.state.currentPreferences).toEqual(before.currentPreferences)
  })

  it('keeps saved and displayed plans independent after replacement', async () => {
    const index = expandedIndex()
    const storage = new FakeStorage()
    const state = await stateFor(index)
    const saved = saveDisplayedPlan(state, storage, index)
    if (!saved.success) throw new Error(saved.message)
    const replaced = replaceDisplayedMeal(saved.state, index, state.displayedPlan!.assignments[0].slot)

    expect(replaced.success).toBe(true)
    if (replaced.success) {
      expect(replaced.state.dirty).toBe(true)
      expect(replaced.state.savedPlan?.assignments).toEqual(state.displayedPlan?.assignments)
      expect(replaced.state.displayedPlan?.assignments).not.toEqual(replaced.state.savedPlan?.assignments)
    }
    expect(ACTIVE_PLAN_STORAGE_KEY).toBe('meal-planner.active-plan')
  })
})