import {
  ALLERGENS,
  DIET_TYPES,
  type Allergen,
  type DietType,
} from './catalogue'

export interface Preferences {
  dietType: DietType
  allergens: readonly Allergen[]
  excludedIngredients: readonly string[]
}

export interface PreferenceInput {
  dietType: unknown
  allergens?: readonly unknown[]
  excludedIngredients?: readonly unknown[]
}

export type PreferenceValidationErrorCode =
  | 'diet-required'
  | 'multiple-diets'
  | 'unsupported-diet'
  | 'unsupported-allergen'
  | 'empty-exclusion'
  | 'invalid-exclusion'

export interface PreferenceValidationError {
  code: PreferenceValidationErrorCode
  message: string
  field: 'dietType' | 'allergens' | 'excludedIngredients'
  value?: unknown
}

export interface PreferenceValidationResult {
  preferences?: Preferences
  errors: readonly PreferenceValidationError[]
}

const normalizeExclusion = (value: string): string =>
  value.trim().replace(/\s+/g, ' ').toLowerCase()

const isDietType = (value: unknown): value is DietType =>
  typeof value === 'string' && DIET_TYPES.includes(value as DietType)

const isAllergen = (value: unknown): value is Allergen =>
  typeof value === 'string' && ALLERGENS.includes(value as Allergen)

const addError = (
  errors: PreferenceValidationError[],
  error: PreferenceValidationError,
): void => {
  errors.push(error)
}

export function validatePreferences(input: PreferenceInput): PreferenceValidationResult {
  const errors: PreferenceValidationError[] = []
  const dietInput = input?.dietType
  let dietType: DietType | undefined

  if (Array.isArray(dietInput)) {
    addError(errors, {
      code: 'multiple-diets',
      field: 'dietType',
      value: dietInput,
      message: 'Select exactly one supported diet type.',
    })
  } else if (dietInput === undefined || dietInput === null || dietInput === '') {
    addError(errors, {
      code: 'diet-required',
      field: 'dietType',
      message: 'Select a diet type before continuing.',
    })
  } else if (!isDietType(dietInput)) {
    addError(errors, {
      code: 'unsupported-diet',
      field: 'dietType',
      value: dietInput,
      message: 'Select Omnivore, Vegetarian, or Vegan.',
    })
  } else {
    dietType = dietInput
  }

  const allergens: Allergen[] = []
  const selectedAllergens = Array.isArray(input?.allergens) ? input.allergens : []
  for (const allergen of selectedAllergens) {
    if (!isAllergen(allergen)) {
      addError(errors, {
        code: 'unsupported-allergen',
        field: 'allergens',
        value: allergen,
        message: 'Selected allergen is not supported.',
      })
      continue
    }
    if (!allergens.includes(allergen)) allergens.push(allergen)
  }

  const excludedIngredients: string[] = []
  const exclusions = Array.isArray(input?.excludedIngredients)
    ? input.excludedIngredients
    : []
  for (const exclusion of exclusions) {
    if (typeof exclusion !== 'string') {
      addError(errors, {
        code: 'invalid-exclusion',
        field: 'excludedIngredients',
        value: exclusion,
        message: 'Excluded ingredient must be text.',
      })
      continue
    }
    const normalizedExclusion = normalizeExclusion(exclusion)
    if (!normalizedExclusion) {
      addError(errors, {
        code: 'empty-exclusion',
        field: 'excludedIngredients',
        value: exclusion,
        message: 'Excluded ingredient cannot be blank.',
      })
      continue
    }
    if (!excludedIngredients.includes(normalizedExclusion)) {
      excludedIngredients.push(normalizedExclusion)
    }
  }

  if (errors.length > 0 || !dietType) return { errors }
  return {
    preferences: {
      dietType,
      allergens,
      excludedIngredients,
    },
    errors,
  }
}

export function addExcludedIngredient(
  preferences: Preferences,
  exclusion: unknown,
): PreferenceValidationResult {
  return validatePreferences({
    dietType: preferences.dietType,
    allergens: preferences.allergens,
    excludedIngredients: [...preferences.excludedIngredients, exclusion],
  })
}

export function removeExcludedIngredient(
  preferences: Preferences,
  exclusion: unknown,
): Preferences {
  if (typeof exclusion !== 'string') return preferences
  const normalizedExclusion = normalizeExclusion(exclusion)
  return {
    ...preferences,
    excludedIngredients: preferences.excludedIngredients.filter(
      (existingExclusion) => existingExclusion !== normalizedExclusion,
    ),
  }
}