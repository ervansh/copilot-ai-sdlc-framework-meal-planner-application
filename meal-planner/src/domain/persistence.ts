import type { CatalogueIndex } from './catalogue-index'
import { validateProposedWeeklyAssignments, type MealAssignment } from './planning'
import type { WeeklyMealPlan } from './generation'
import { validatePreferences, type Preferences } from './preferences'

export const PERSISTENCE_SCHEMA_VERSION = 1
export const ACTIVE_PLAN_STORAGE_KEY = 'meal-planner.active-plan'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface PersistedActivePlan {
  generationPreferenceSnapshot: Preferences
  assignments: readonly MealAssignment[]
  catalogueVersion: string
}

export interface PersistenceEnvelope {
  schemaVersion: number
  currentPreferences: Preferences
  activePlan: PersistedActivePlan
}

export interface RestoredApplicationData {
  currentPreferences: Preferences
  activePlan: WeeklyMealPlan
  stale: boolean
}

export type SaveFailureCode =
  | 'invalid-input'
  | 'confirmation-required'
  | 'storage-read-failed'
  | 'storage-write-failed'

export interface SaveFailure {
  success: false
  code: SaveFailureCode
  message: string
}

export interface SaveSuccess {
  success: true
  replacedExisting: boolean
}

export type SaveResult = SaveSuccess | SaveFailure

export type RestoreFailureCode =
  | 'no-saved-plan'
  | 'storage-read-failed'
  | 'malformed-json'
  | 'unsupported-schema-version'
  | 'invalid-persisted-data'

export interface RestoreFailure {
  success: false
  code: RestoreFailureCode
  message: string
}

export interface RestoreSuccess {
  success: true
  data: RestoredApplicationData
}

export type RestoreResult = RestoreSuccess | RestoreFailure

const clonePreferences = (preferences: Preferences): Preferences => ({
  dietType: preferences.dietType,
  allergens: [...preferences.allergens],
  excludedIngredients: [...preferences.excludedIngredients],
})

const cloneAssignments = (assignments: readonly MealAssignment[]): MealAssignment[] =>
  assignments.map((assignment) => ({ slot: { ...assignment.slot }, recipeId: assignment.recipeId }))

const preferencesEqual = (left: Preferences, right: Preferences): boolean =>
  left.dietType === right.dietType &&
  left.allergens.length === right.allergens.length &&
  left.allergens.every((allergen, index) => allergen === right.allergens[index]) &&
  left.excludedIngredients.length === right.excludedIngredients.length &&
  left.excludedIngredients.every((ingredient, index) => ingredient === right.excludedIngredients[index])

export const isPlanStale = (
  currentPreferences: Preferences,
  activePlan: WeeklyMealPlan,
): boolean => !preferencesEqual(currentPreferences, activePlan.generationPreferenceSnapshot)

const invalidSave = (message: string): SaveFailure => ({
  success: false,
  code: 'invalid-input',
  message,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parsePreferences = (value: unknown): Preferences | undefined => {
  if (!isRecord(value)) return undefined
  const result = validatePreferences({
    dietType: value.dietType,
    allergens: Array.isArray(value.allergens) ? value.allergens : [],
    excludedIngredients: Array.isArray(value.excludedIngredients) ? value.excludedIngredients : [],
  })
  if (result.errors.length > 0 || !result.preferences) return undefined
  return result.preferences
}

const parseAssignments = (value: unknown): MealAssignment[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const assignments: MealAssignment[] = []
  for (const item of value) {
    if (!isRecord(item) || !isRecord(item.slot)) return undefined
    if (typeof item.slot.day !== 'string' || typeof item.slot.mealType !== 'string' || typeof item.recipeId !== 'string') return undefined
    assignments.push({
      slot: { day: item.slot.day as MealAssignment['slot']['day'], mealType: item.slot.mealType as MealAssignment['slot']['mealType'] },
      recipeId: item.recipeId,
    })
  }
  return assignments
}

const parseEnvelope = (value: unknown): PersistenceEnvelope | undefined => {
  if (!isRecord(value) || value.schemaVersion !== PERSISTENCE_SCHEMA_VERSION) return undefined
  if (!('currentPreferences' in value) || !isRecord(value.activePlan)) return undefined
  const currentPreferences = parsePreferences(value.currentPreferences)
  const generationPreferenceSnapshot = parsePreferences(value.activePlan.generationPreferenceSnapshot)
  const assignments = parseAssignments(value.activePlan.assignments)
  const catalogueVersion = value.activePlan.catalogueVersion
  if (!currentPreferences || !generationPreferenceSnapshot || !assignments || typeof catalogueVersion !== 'string' || !catalogueVersion) return undefined
  return {
    schemaVersion: PERSISTENCE_SCHEMA_VERSION,
    currentPreferences,
    activePlan: { generationPreferenceSnapshot, assignments, catalogueVersion },
  }
}

export function saveActivePlan(
  storage: StorageLike,
  index: CatalogueIndex,
  currentPreferences: Preferences,
  activePlan: WeeklyMealPlan,
  options: { confirmReplacement?: boolean } = {},
): SaveResult {
  const currentValidation = validatePreferences(currentPreferences)
  if (!currentValidation.preferences || currentValidation.errors.length > 0) return invalidSave('Current preferences are invalid.')
  if (activePlan.catalogueVersion !== index.catalogue.version) return invalidSave('The active plan uses an obsolete catalogue version.')
  const planValidation = validateProposedWeeklyAssignments(activePlan.assignments, index, activePlan.generationPreferenceSnapshot)
  if (!planValidation.valid) return invalidSave('The active plan is incomplete or invalid.')

  let existing: string | null
  try {
    existing = storage.getItem(ACTIVE_PLAN_STORAGE_KEY)
  } catch {
    return { success: false, code: 'storage-read-failed', message: 'The saved plan could not be read.' }
  }
  if (existing !== null && options.confirmReplacement !== true) {
    return { success: false, code: 'confirmation-required', message: 'Confirm replacing the existing saved plan.' }
  }

  const envelope: PersistenceEnvelope = {
    schemaVersion: PERSISTENCE_SCHEMA_VERSION,
    currentPreferences: clonePreferences(currentValidation.preferences),
    activePlan: {
      generationPreferenceSnapshot: clonePreferences(activePlan.generationPreferenceSnapshot),
      assignments: cloneAssignments(activePlan.assignments),
      catalogueVersion: activePlan.catalogueVersion,
    },
  }
  try {
    storage.setItem(ACTIVE_PLAN_STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    return { success: false, code: 'storage-write-failed', message: 'The plan could not be saved to browser storage.' }
  }
  return { success: true, replacedExisting: existing !== null }
}

export function restoreActivePlan(
  storage: StorageLike,
  index: CatalogueIndex,
): RestoreResult {
  let serialized: string | null
  try {
    serialized = storage.getItem(ACTIVE_PLAN_STORAGE_KEY)
  } catch {
    return { success: false, code: 'storage-read-failed', message: 'The saved plan could not be read.' }
  }
  if (serialized === null) return { success: false, code: 'no-saved-plan', message: 'No saved meal plan was found.' }

  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    return { success: false, code: 'malformed-json', message: 'The saved meal plan is not valid JSON.' }
  }
  if (isRecord(parsed) && parsed.schemaVersion !== PERSISTENCE_SCHEMA_VERSION) {
    return { success: false, code: 'unsupported-schema-version', message: 'The saved meal plan uses an unsupported schema version.' }
  }
  const envelope = parseEnvelope(parsed)
  if (!envelope || envelope.activePlan.catalogueVersion !== index.catalogue.version) {
    return { success: false, code: 'invalid-persisted-data', message: 'The saved meal plan failed persistence validation.' }
  }

  const plan: WeeklyMealPlan = {
    assignments: cloneAssignments(envelope.activePlan.assignments),
    generationPreferenceSnapshot: clonePreferences(envelope.activePlan.generationPreferenceSnapshot),
    catalogueVersion: envelope.activePlan.catalogueVersion,
  }
  const planValidation = validateProposedWeeklyAssignments(plan.assignments, index, plan.generationPreferenceSnapshot)
  if (!planValidation.valid) {
    return { success: false, code: 'invalid-persisted-data', message: 'The saved meal plan violates catalogue or assignment rules.' }
  }
  const currentPreferences = clonePreferences(envelope.currentPreferences)
  return {
    success: true,
    data: { currentPreferences, activePlan: plan, stale: isPlanStale(currentPreferences, plan) },
  }
}