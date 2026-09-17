export const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'] as const
export type MealType = (typeof MEAL_TYPES)[number]

export const DIET_TYPES = ['OMNIVORE', 'VEGETARIAN', 'VEGAN'] as const
export type DietType = (typeof DIET_TYPES)[number]

export const ALLERGENS = ['NUTS', 'DAIRY', 'GLUTEN', 'EGGS', 'SOY', 'SHELLFISH'] as const
export type Allergen = (typeof ALLERGENS)[number]

export interface IngredientRecord {
  canonicalName: string
  displayName: string
  quantity?: string
  unit?: string
}

export interface RecipeRecord {
  id: string
  name: string
  mealType: MealType
  compatibleDiets: readonly DietType[]
  allergens: readonly Allergen[]
  ingredients: readonly IngredientRecord[]
  instructions: string
  preparationTimeMinutes: number
  servingSize: string
}

export interface RawCatalogue {
  version: string
  recipes: readonly RecipeRecord[]
  ingredientEquivalences: Readonly<Record<string, readonly string[]>>
}

export interface PreparedCatalogue {
  version: string
  recipes: readonly RecipeRecord[]
  aliasToCanonicalIngredient: Readonly<Record<string, string>>
}

export type CatalogueValidationErrorCode =
  | 'invalid-catalogue-version'
  | 'invalid-recipe'
  | 'duplicate-recipe-id'
  | 'invalid-equivalence'

export interface CatalogueValidationError {
  code: CatalogueValidationErrorCode
  message: string
  recipeId?: string
  field?: string
}

export interface CatalogueValidationResult {
  catalogue: PreparedCatalogue
  errors: readonly CatalogueValidationError[]
}

const normalise = (value: string): string => value.trim().replace(/\s+/g, ' ').toLowerCase()

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && normalise(value).length > 0

const isOneOf = <T extends string>(value: unknown, values: readonly T[]): value is T =>
  typeof value === 'string' && values.includes(value as T)

const addError = (
  errors: CatalogueValidationError[],
  error: CatalogueValidationError,
): void => {
  errors.push(error)
}

const validateEquivalences = (
  equivalences: Readonly<Record<string, readonly string[]>>,
  errors: CatalogueValidationError[],
): { aliases: Record<string, string>; invalidCanonicals: Set<string> } => {
  const aliases: Record<string, string> = {}
  const invalidCanonicals = new Set<string>()

  if (!equivalences || typeof equivalences !== 'object' || Array.isArray(equivalences)) {
    addError(errors, {
      code: 'invalid-equivalence',
      message: 'Ingredient equivalence metadata must be an object.',
    })
    return { aliases, invalidCanonicals }
  }

  for (const [rawCanonical, rawAliases] of Object.entries(equivalences)) {
    const canonical = normalise(rawCanonical)
    if (!canonical || !Array.isArray(rawAliases)) {
      addError(errors, {
        code: 'invalid-equivalence',
        field: rawCanonical,
        message: `Ingredient equivalence for "${rawCanonical}" is invalid.`,
      })
      if (canonical) invalidCanonicals.add(canonical)
      continue
    }

    const seenForCanonical = new Set<string>()
    for (const rawAlias of rawAliases) {
      if (!isNonEmptyString(rawAlias)) {
        addError(errors, {
          code: 'invalid-equivalence',
          field: canonical,
          message: `Ingredient equivalence for "${canonical}" contains an empty alias.`,
        })
        invalidCanonicals.add(canonical)
        continue
      }

      const alias = normalise(rawAlias)
      if (alias === canonical || seenForCanonical.has(alias)) {
        addError(errors, {
          code: 'invalid-equivalence',
          field: canonical,
          message: `Ingredient equivalence for "${canonical}" contains a duplicate alias.`,
        })
        invalidCanonicals.add(canonical)
        continue
      }
      seenForCanonical.add(alias)

      const existingCanonical = aliases[alias]
      if (existingCanonical && existingCanonical !== canonical) {
        addError(errors, {
          code: 'invalid-equivalence',
          field: alias,
          message: `Alias "${alias}" resolves to multiple canonical ingredients.`,
        })
        invalidCanonicals.add(existingCanonical)
        invalidCanonicals.add(canonical)
        continue
      }
      aliases[alias] = canonical
    }
  }

  return { aliases, invalidCanonicals }
}

const validateRecipe = (
  recipe: RecipeRecord,
  invalidCanonicals: ReadonlySet<string>,
  seenIds: ReadonlySet<string>,
  errors: CatalogueValidationError[],
): boolean => {
  const recipeId = typeof recipe?.id === 'string' ? recipe.id : undefined
  const id = recipeId ? normalise(recipeId) : ''
  let valid = true

  if (!isNonEmptyString(recipe?.id)) {
    addError(errors, { code: 'invalid-recipe', recipeId, field: 'id', message: 'Recipe ID is required.' })
    valid = false
  } else if (seenIds.has(id)) {
    addError(errors, { code: 'duplicate-recipe-id', recipeId, field: 'id', message: `Recipe ID "${recipe.id}" is duplicated.` })
    valid = false
  }

  const requiredStrings: Array<[keyof RecipeRecord, unknown]> = [
    ['name', recipe?.name],
    ['instructions', recipe?.instructions],
    ['servingSize', recipe?.servingSize],
  ]
  for (const [field, value] of requiredStrings) {
    if (!isNonEmptyString(value)) {
      addError(errors, { code: 'invalid-recipe', recipeId, field, message: `Recipe ${String(field)} is required.` })
      valid = false
    }
  }

  if (!isOneOf(recipe?.mealType, MEAL_TYPES)) {
    addError(errors, { code: 'invalid-recipe', recipeId, field: 'mealType', message: 'Recipe meal type is unsupported.' })
    valid = false
  }

  if (!Array.isArray(recipe?.compatibleDiets) || recipe.compatibleDiets.length === 0 || recipe.compatibleDiets.some((diet) => !isOneOf(diet, DIET_TYPES))) {
    addError(errors, { code: 'invalid-recipe', recipeId, field: 'compatibleDiets', message: 'Recipe dietary compatibility is invalid.' })
    valid = false
  }

  if (!Array.isArray(recipe?.allergens) || recipe.allergens.some((allergen) => !isOneOf(allergen, ALLERGENS))) {
    addError(errors, { code: 'invalid-recipe', recipeId, field: 'allergens', message: 'Recipe contains an unsupported allergen.' })
    valid = false
  }

  if (!Array.isArray(recipe?.ingredients) || recipe.ingredients.length === 0) {
    addError(errors, { code: 'invalid-recipe', recipeId, field: 'ingredients', message: 'Recipe ingredients are required.' })
    valid = false
  } else {
    for (const ingredient of recipe.ingredients) {
      const canonical = isNonEmptyString(ingredient?.canonicalName)
        ? normalise(ingredient.canonicalName)
        : ''
      if (!canonical || !isNonEmptyString(ingredient?.displayName)) {
        addError(errors, { code: 'invalid-recipe', recipeId, field: 'ingredients', message: 'Recipe ingredients must have canonical and display names.' })
        valid = false
      }
      if (invalidCanonicals.has(canonical)) valid = false
    }
  }

  if (typeof recipe?.preparationTimeMinutes !== 'number' || !Number.isFinite(recipe.preparationTimeMinutes) || recipe.preparationTimeMinutes < 0) {
    addError(errors, { code: 'invalid-recipe', recipeId, field: 'preparationTimeMinutes', message: 'Recipe preparation time must be a non-negative number.' })
    valid = false
  }

  return valid
}

export function validateCatalogue(rawCatalogue: RawCatalogue): CatalogueValidationResult {
  const errors: CatalogueValidationError[] = []
  const version = typeof rawCatalogue?.version === 'string' ? rawCatalogue.version.trim() : ''
  if (!version) {
    addError(errors, { code: 'invalid-catalogue-version', field: 'version', message: 'Catalogue version is required.' })
  }

  const { aliases, invalidCanonicals } = validateEquivalences(rawCatalogue?.ingredientEquivalences, errors)
  const recipes = Array.isArray(rawCatalogue?.recipes) ? rawCatalogue.recipes : []
  const validRecipes: RecipeRecord[] = []
  const seenIds = new Set<string>()

  for (const recipe of recipes) {
    const id = typeof recipe?.id === 'string' ? normalise(recipe.id) : ''
    const valid = validateRecipe(recipe, invalidCanonicals, seenIds, errors)
    if (id) seenIds.add(id)
    if (valid) validRecipes.push(recipe)
  }

  return {
    catalogue: {
      version,
      recipes: validRecipes,
      aliasToCanonicalIngredient: aliases,
    },
    errors,
  }
}