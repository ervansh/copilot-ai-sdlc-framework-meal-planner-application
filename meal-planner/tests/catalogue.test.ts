import { describe, expect, it } from 'vitest'
import { validateCatalogue, type RawCatalogue, type RecipeRecord } from '../src/domain/catalogue'

const validRecipe: RecipeRecord = {
  id: 'breakfast-001',
  name: 'Tomato Toast',
  mealType: 'BREAKFAST',
  compatibleDiets: ['OMNIVORE', 'VEGETARIAN', 'VEGAN'],
  allergens: [],
  ingredients: [{ canonicalName: 'tomato', displayName: 'Cherry tomatoes' }],
  instructions: 'Toast the bread and add tomatoes.',
  preparationTimeMinutes: 10,
  servingSize: '1 serving',
}

const catalogueWith = (...recipes: RecipeRecord[]): RawCatalogue => ({
  version: '2026.09',
  recipes,
  ingredientEquivalences: { tomato: ['cherry tomatoes'] },
})

describe('validateCatalogue', () => {
  it('prepares a complete recipe and normalizes equivalence aliases', () => {
    const result = validateCatalogue(catalogueWith(validRecipe))

    expect(result.errors).toEqual([])
    expect(result.catalogue.recipes).toEqual([validRecipe])
    expect(result.catalogue.aliasToCanonicalIngredient['cherry tomatoes']).toBe('tomato')
  })

  it('excludes incomplete recipes from the prepared catalogue', () => {
    const incomplete = { ...validRecipe, instructions: '' }
    const result = validateCatalogue(catalogueWith(incomplete))

    expect(result.catalogue.recipes).toEqual([])
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid-recipe', field: 'instructions' }),
    ]))
  })

  it('rejects duplicate recipe identifiers and keeps only the first record', () => {
    const duplicate = { ...validRecipe, name: 'Another Tomato Toast' }
    const result = validateCatalogue(catalogueWith(validRecipe, duplicate))

    expect(result.catalogue.recipes).toEqual([validRecipe])
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'duplicate-recipe-id', recipeId: duplicate.id }),
    ]))
  })

  it('rejects malformed allergen values', () => {
    const malformed = { ...validRecipe, allergens: ['PEANUTS' as never] }
    const result = validateCatalogue(catalogueWith(malformed))

    expect(result.catalogue.recipes).toEqual([])
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid-recipe', field: 'allergens' }),
    ]))
  })

  it('excludes recipes affected by conflicting equivalence metadata', () => {
    const result = validateCatalogue({
      ...catalogueWith(validRecipe),
      ingredientEquivalences: {
        tomato: ['red produce'],
        pepper: ['red produce'],
      },
    })

    expect(result.catalogue.recipes).toEqual([])
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid-equivalence' }),
    ]))
  })
})