import { describe, expect, it } from 'vitest'
import {
  addExcludedIngredient,
  removeExcludedIngredient,
  validatePreferences,
  type Preferences,
} from '../src/domain/preferences'

const validInput = {
  dietType: 'OMNIVORE',
  allergens: [],
  excludedIngredients: [],
}

const validPreferences: Preferences = {
  dietType: 'OMNIVORE',
  allergens: [],
  excludedIngredients: [],
}

describe('preference validation and normalization', () => {
  it.each(['OMNIVORE', 'VEGETARIAN', 'VEGAN'] as const)('accepts the %s diet', (dietType) => {
    const result = validatePreferences({ ...validInput, dietType })

    expect(result.errors).toEqual([])
    expect(result.preferences?.dietType).toBe(dietType)
  })

  it('rejects a missing diet type with a structured message', () => {
    const result = validatePreferences({ ...validInput, dietType: undefined })

    expect(result.preferences).toBeUndefined()
    expect(result.errors).toEqual([
      expect.objectContaining({ code: 'diet-required', field: 'dietType' }),
    ])
  })

  it('rejects unsupported and multiple diet values', () => {
    const unsupported = validatePreferences({ ...validInput, dietType: 'PESCATARIAN' })
    const multiple = validatePreferences({ ...validInput, dietType: ['OMNIVORE', 'VEGAN'] })

    expect(unsupported.errors[0]).toEqual(expect.objectContaining({ code: 'unsupported-diet' }))
    expect(multiple.errors[0]).toEqual(expect.objectContaining({ code: 'multiple-diets' }))
  })

  it('accepts zero or more supported allergens', () => {
    const result = validatePreferences({
      ...validInput,
      allergens: ['NUTS', 'DAIRY', 'GLUTEN'],
    })

    expect(result.errors).toEqual([])
    expect(result.preferences?.allergens).toEqual(['NUTS', 'DAIRY', 'GLUTEN'])
    expect(validatePreferences(validInput).preferences?.allergens).toEqual([])
  })

  it('rejects unsupported allergens', () => {
    const result = validatePreferences({ ...validInput, allergens: ['NUTS', 'PEANUTS'] })

    expect(result.preferences).toBeUndefined()
    expect(result.errors).toEqual([
      expect.objectContaining({ code: 'unsupported-allergen', value: 'PEANUTS' }),
    ])
  })

  it('trims exclusions, normalizes case, and silently removes duplicates', () => {
    const result = validatePreferences({
      ...validInput,
      excludedIngredients: ['  Bell   Pepper ', 'bell pepper', 'TOMATO'],
    })

    expect(result.errors).toEqual([])
    expect(result.preferences?.excludedIngredients).toEqual(['bell pepper', 'tomato'])
  })

  it('rejects blank exclusions after trimming', () => {
    const result = validatePreferences({ ...validInput, excludedIngredients: ['  '] })

    expect(result.preferences).toBeUndefined()
    expect(result.errors).toEqual([
      expect.objectContaining({ code: 'empty-exclusion', field: 'excludedIngredients' }),
    ])
  })

  it('adds and removes structured exclusions without mutating the input', () => {
    const added = addExcludedIngredient(validPreferences, '  Tomato ')
    const removed = removeExcludedIngredient(added.preferences!, 'TOMATO')

    expect(added.preferences?.excludedIngredients).toEqual(['tomato'])
    expect(removed).toEqual(validPreferences)
    expect(validPreferences.excludedIngredients).toEqual([])
  })

  it('returns the normalized preference object for later domain use', () => {
    const result = validatePreferences({
      dietType: 'VEGAN',
      allergens: ['SOY', 'EGGS', 'SOY'],
      excludedIngredients: ['  Peanuts ', 'PEANUTS'],
    })

    expect(result).toEqual({
      preferences: {
        dietType: 'VEGAN',
        allergens: ['SOY', 'EGGS'],
        excludedIngredients: ['peanuts'],
      },
      errors: [],
    })
  })
})