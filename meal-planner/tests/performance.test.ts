import { describe, expect, it } from 'vitest'
import { BUNDLED_CATALOGUE_INDEX } from '../src/catalogue'
import { generateWeeklyPlan } from '../src/domain/generation'
import { createCoordinatorState, regeneratePlan } from '../src/domain/coordinator'
import { validatePreferences, type Preferences } from '../src/domain/preferences'

const preferences = (overrides: Record<string, unknown> = {}): Preferences =>
  validatePreferences({ dietType: 'VEGAN', allergens: [], excludedIngredients: [], ...overrides }).preferences!

const measuredGeneration = async (input: Preferences) => {
  const startedAt = performance.now()
  const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, input)
  return { result, elapsedMilliseconds: performance.now() - startedAt }
}

describe('IMP-015 generation performance and safeguards', () => {
  it.each([
    ['omnivore', preferences({ dietType: 'OMNIVORE' })],
    ['vegetarian', preferences({ dietType: 'VEGETARIAN' })],
    ['vegan', preferences()],
    ['allergen-restricted', preferences({ allergens: ['SHELLFISH'] })],
    ['ingredient-restricted', preferences({ excludedIngredients: ['  avocado  '] })],
  ])('generates a complete plan within the approved normal target for %s', async (_label, input) => {
    const { result, elapsedMilliseconds } = await measuredGeneration(input)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.plan.assignments).toHaveLength(21)
    expect(new Set(result.plan.assignments.map((assignment) => assignment.recipeId)).size).toBe(21)
    expect(elapsedMilliseconds).toBeLessThan(3_000)
  })

  it('terminates on the active-time budget with a typed non-partial failure', async () => {
    let clock = 0
    const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences(), {
      now: () => {
        clock += 2_501
        return clock
      },
    })

    expect(result).toMatchObject({ success: false, code: 'search-budget-exhausted' })
    expect('plan' in result).toBe(false)
  })

  it('distinguishes active-time budget exhaustion from confirmed infeasibility', async () => {
    let clock = 0
    const budget = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences(), {
      now: () => { clock += 2_501; return clock },
    })
    const impossible = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences({ excludedIngredients: ['oat', 'chia seed', 'tomato', 'peanut', 'tofu', 'quinoa', 'chickpea'] }))

    expect(budget).toMatchObject({ success: false, code: 'search-budget-exhausted' })
    expect(impossible).toMatchObject({ success: false, code: 'insufficient-candidates' })
  })

  it('emits observable yielding/loading states with deterministic delayed continuation', async () => {
    const states: string[] = []
    let continuations = 0
    const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferences(), {
      yieldEveryNodes: 1,
      yieldControl: async () => { continuations += 1 },
      onStateChange: ({ state }) => states.push(state),
    })

    expect(result.success).toBe(true)
    expect(continuations).toBeGreaterThan(0)
    expect(states).toEqual(expect.arrayContaining(['searching', 'yielding', 'succeeded']))
  })

  it('preserves the previous valid coordinator plan after failed regeneration', async () => {
    const preferencesSnapshot = preferences()
    const generated = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, preferencesSnapshot)
    if (!generated.success) throw new Error(generated.message)
    const state = createCoordinatorState(preferencesSnapshot, generated.plan, generated.plan)
    const failed = await regeneratePlan({
      ...state,
      currentPreferences: preferences({ excludedIngredients: ['oat', 'chia seed', 'tomato', 'peanut', 'tofu', 'quinoa', 'chickpea'] }),
      stale: true,
    }, BUNDLED_CATALOGUE_INDEX)

    expect(failed).toMatchObject({ success: false, code: 'insufficient-candidates' })
    expect(failed.state.displayedPlan).toEqual(state.displayedPlan)
    expect(failed.state.displayedPlan?.generationPreferenceSnapshot).toEqual(state.displayedPlan?.generationPreferenceSnapshot)
  })
})