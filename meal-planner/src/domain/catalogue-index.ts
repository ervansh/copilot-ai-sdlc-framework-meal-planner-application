import {
  ALLERGENS,
  DIET_TYPES,
  MEAL_TYPES,
  validateCatalogue,
  type Allergen,
  type CatalogueValidationError,
  type DietType,
  type MealType,
  type PreparedCatalogue,
  type RawCatalogue,
  type RecipeRecord,
} from './catalogue'

export interface CatalogueIndex {
  catalogue: PreparedCatalogue
  byMealType: Readonly<Record<MealType, readonly RecipeRecord[]>>
  byDiet: Readonly<Record<DietType, readonly RecipeRecord[]>>
  byAllergen: Readonly<Record<Allergen, readonly RecipeRecord[]>>
}

export interface CatalogueIndexResult {
  index: CatalogueIndex
  errors: readonly CatalogueValidationError[]
}

const sortRecipes = (recipes: readonly RecipeRecord[]): RecipeRecord[] =>
  [...recipes].sort((left, right) => left.id.localeCompare(right.id, 'en'))

const buildIndex = <Key extends string>(
  keys: readonly Key[],
  recipes: readonly RecipeRecord[],
  matches: (recipe: RecipeRecord, key: Key) => boolean,
): Record<Key, readonly RecipeRecord[]> => {
  const index = {} as Record<Key, readonly RecipeRecord[]>
  for (const key of keys) index[key] = recipes.filter((recipe) => matches(recipe, key))
  return index
}

export function indexCatalogue(rawCatalogue: RawCatalogue): CatalogueIndexResult {
  const validation = validateCatalogue(rawCatalogue)
  const recipes = sortRecipes(validation.catalogue.recipes)
  const byMealType = buildIndex(MEAL_TYPES, recipes, (recipe, mealType) => recipe.mealType === mealType)
  const byDiet = buildIndex(DIET_TYPES, recipes, (recipe, diet) => recipe.compatibleDiets.includes(diet))
  const byAllergen = buildIndex(ALLERGENS, recipes, (recipe, allergen) => recipe.allergens.includes(allergen))

  return {
    index: {
      catalogue: {
        ...validation.catalogue,
        recipes,
      },
      byMealType,
      byDiet,
      byAllergen,
    },
    errors: validation.errors,
  }
}