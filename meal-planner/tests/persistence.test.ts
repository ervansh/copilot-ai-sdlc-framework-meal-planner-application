import { describe, expect, it } from 'vitest'
import { BUNDLED_CATALOGUE_INDEX } from '../src/catalogue'
import { generateWeeklyPlan } from '../src/domain/generation'
import {
  ACTIVE_PLAN_STORAGE_KEY,
  isPlanStale,
  restoreActivePlan,
  saveActivePlan,
  type StorageLike,
} from '../src/domain/persistence'
import { validatePreferences, type Preferences } from '../src/domain/preferences'

class FakeStorage implements StorageLike {
  private values = new Map<string, string>()
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
  seed(value: unknown): void { this.values.set(ACTIVE_PLAN_STORAGE_KEY, JSON.stringify(value)) }
  raw(): string | null { return this.values.get(ACTIVE_PLAN_STORAGE_KEY) ?? null }
}

class FailingStorage implements StorageLike {
  constructor(private readonly operation: 'read' | 'write') {}
  getItem(): string | null { if (this.operation === 'read') throw new Error('read failed'); return null }
  setItem(): void { throw new Error('write failed') }
}

const preferences = (overrides: Record<string, unknown> = {}): Preferences =>
  validatePreferences({ dietType: 'VEGAN', allergens: [], excludedIngredients: [], ...overrides }).preferences!

const generatedPlan = async (snapshot = preferences()) => {
  const result = await generateWeeklyPlan(BUNDLED_CATALOGUE_INDEX, snapshot)
  if (!result.success) throw new Error(result.message)
  return result.plan
}

describe('versioned active-plan persistence', () => {
  it('saves and restores a complete active plan with separate preferences', async () => {
    const storage = new FakeStorage()
    const plan = await generatedPlan()
    const current = preferences({ excludedIngredients: ['oat'] })
    expect(saveActivePlan(storage, BUNDLED_CATALOGUE_INDEX, current, plan)).toEqual({ success: true, replacedExisting: false })

    const restored = restoreActivePlan(storage, BUNDLED_CATALOGUE_INDEX)
    expect(restored.success).toBe(true)
    if (!restored.success) return
    expect(restored.data.currentPreferences).toEqual(current)
    expect(restored.data.activePlan.generationPreferenceSnapshot).toEqual(plan.generationPreferenceSnapshot)
    expect(restored.data.activePlan.assignments).toEqual(plan.assignments)
    expect(restored.data.stale).toBe(true)
  })

  it('preserves the original generation snapshot when saving a stale plan', async () => {
    const storage = new FakeStorage()
    const plan = await generatedPlan()
    const current = preferences({ allergens: ['SOY'] })
    saveActivePlan(storage, BUNDLED_CATALOGUE_INDEX, current, plan)
    const saved = JSON.parse(storage.raw()!)

    expect(saved.currentPreferences).toEqual(current)
    expect(saved.activePlan.generationPreferenceSnapshot).toEqual(plan.generationPreferenceSnapshot)
  })

  it('requires confirmation before replacing an existing saved record', async () => {
    const storage = new FakeStorage()
    const firstPlan = await generatedPlan()
    const secondPlan = await generatedPlan()
    saveActivePlan(storage, BUNDLED_CATALOGUE_INDEX, preferences(), firstPlan)

    expect(saveActivePlan(storage, BUNDLED_CATALOGUE_INDEX, preferences(), secondPlan)).toMatchObject({
      success: false,
      code: 'confirmation-required',
    })
    expect(saveActivePlan(storage, BUNDLED_CATALOGUE_INDEX, preferences(), secondPlan, { confirmReplacement: true })).toEqual({ success: true, replacedExisting: true })
  })

  it('derives stale state from current preferences and the generation snapshot', async () => {
    const plan = await generatedPlan()
    expect(isPlanStale(plan.generationPreferenceSnapshot, plan)).toBe(false)
    expect(isPlanStale(preferences({ excludedIngredients: ['oat'] }), plan)).toBe(true)
  })

  it.each([
    ['malformed JSON', '{', 'malformed-json'],
    ['missing required fields', JSON.stringify({ schemaVersion: 1 }), 'invalid-persisted-data'],
    ['unsupported schema', JSON.stringify({ schemaVersion: 99 }), 'unsupported-schema-version'],
  ])('rejects %s safely', (_label, value, code) => {
    const storage = new FakeStorage()
    storage['values'] = new Map([[ACTIVE_PLAN_STORAGE_KEY, value]])
    expect(restoreActivePlan(storage, BUNDLED_CATALOGUE_INDEX)).toMatchObject({ success: false, code })
  })

  it('rejects invalid recipe references and corrupted assignment invariants', async () => {
    const storage = new FakeStorage()
    const plan = await generatedPlan()
    const envelope = {
      schemaVersion: 1,
      currentPreferences: plan.generationPreferenceSnapshot,
      activePlan: {
        generationPreferenceSnapshot: plan.generationPreferenceSnapshot,
        assignments: plan.assignments.map((assignment, index) => index === 0 ? { ...assignment, recipeId: 'obsolete-recipe' } : assignment),
        catalogueVersion: BUNDLED_CATALOGUE_INDEX.catalogue.version,
      },
    }
    storage.seed(envelope)
    expect(restoreActivePlan(storage, BUNDLED_CATALOGUE_INDEX)).toMatchObject({ success: false, code: 'invalid-persisted-data' })

    storage.seed({ ...envelope, activePlan: { ...envelope.activePlan, assignments: plan.assignments.slice(1) } })
    expect(restoreActivePlan(storage, BUNDLED_CATALOGUE_INDEX)).toMatchObject({ success: false, code: 'invalid-persisted-data' })
  })

  it('returns structured storage read and write failures', async () => {
    const plan = await generatedPlan()
    expect(restoreActivePlan(new FailingStorage('read'), BUNDLED_CATALOGUE_INDEX)).toMatchObject({ success: false, code: 'storage-read-failed' })
    expect(saveActivePlan(new FailingStorage('read'), BUNDLED_CATALOGUE_INDEX, preferences(), plan)).toMatchObject({ success: false, code: 'storage-read-failed' })
    expect(saveActivePlan(new FailingStorage('write'), BUNDLED_CATALOGUE_INDEX, preferences(), plan)).toMatchObject({ success: false, code: 'storage-write-failed' })
  })

  it('does not mutate valid inputs during a round trip', async () => {
    const storage = new FakeStorage()
    const plan = await generatedPlan()
    const current = preferences({ excludedIngredients: ['oat'] })
    const planBefore = structuredClone(plan)
    const currentBefore = structuredClone(current)
    saveActivePlan(storage, BUNDLED_CATALOGUE_INDEX, current, plan)
    restoreActivePlan(storage, BUNDLED_CATALOGUE_INDEX)

    expect(plan).toEqual(planBefore)
    expect(current).toEqual(currentBefore)
  })
})