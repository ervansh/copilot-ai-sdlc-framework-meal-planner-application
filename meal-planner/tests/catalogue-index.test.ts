import { describe, expect, it } from 'vitest'
import { BUNDLED_CATALOGUE } from '../src/catalogue/bundled-catalogue'
import { indexCatalogue } from '../src/domain/catalogue-index'
import type { RecipeRecord } from '../src/domain/catalogue'

describe('bundled catalogue indexing', () => {
  it('contains seven valid recipes for every supported meal type', () => {
    const result = indexCatalogue(BUNDLED_CATALOGUE)

    expect(result.errors).toEqual([])
    expect(result.index.catalogue.version).toBe('2026.09.1')
    expect(result.index.catalogue.recipes).toHaveLength(24)
    expect(result.index.byMealType.BREAKFAST).toHaveLength(8)
    expect(result.index.byMealType.LUNCH).toHaveLength(8)
    expect(result.index.byMealType.DINNER).toHaveLength(8)
    expect(result.index.byDiet.VEGAN).toHaveLength(24)
    expect(new Set(result.index.catalogue.recipes.map((recipe) => recipe.id)).size).toBe(24)
  })

  it('orders each index deterministically by stable recipe ID', () => {
    const reversed = { ...BUNDLED_CATALOGUE, recipes: [...BUNDLED_CATALOGUE.recipes].reverse() }
    const normal = indexCatalogue(BUNDLED_CATALOGUE)
    const reordered = indexCatalogue(reversed)

    expect(reordered.index.catalogue.recipes.map((recipe) => recipe.id)).toEqual(
      normal.index.catalogue.recipes.map((recipe) => recipe.id),
    )
    expect(reordered.index.byMealType.LUNCH.map((recipe) => recipe.id)).toEqual([
      'lunch-001', 'lunch-002', 'lunch-003', 'lunch-004', 'lunch-005', 'lunch-006', 'lunch-007', 'lunch-008',
    ])
  })

  it('indexes allergen dimensions without inventing ingredient matches', () => {
    const result = indexCatalogue(BUNDLED_CATALOGUE)

    expect(result.index.byAllergen.SOY.map((recipe) => recipe.id)).toEqual([
      'dinner-004', 'dinner-005', 'lunch-004', 'lunch-006', 'breakfast-005',
    ].sort())
    expect(result.index.byAllergen.NUTS.every((recipe) => recipe.allergens.includes('NUTS'))).toBe(true)
  })

  it('does not index invalid records', () => {
    const invalidRecipe = { ...BUNDLED_CATALOGUE.recipes[0], id: 'invalid-record', mealType: 'BRUNCH' as RecipeRecord['mealType'] }
    const result = indexCatalogue({
      ...BUNDLED_CATALOGUE,
      recipes: [...BUNDLED_CATALOGUE.recipes, invalidRecipe],
    })

    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid-recipe', recipeId: 'invalid-record', field: 'mealType' }),
    ]))
    expect(result.index.catalogue.recipes.some((recipe) => recipe.id === 'invalid-record')).toBe(false)
    expect(Object.values(result.index.byMealType).flat().some((recipe) => recipe.id === 'invalid-record')).toBe(false)
  })
})