import type { RawCatalogue, RecipeRecord } from '../domain/catalogue'

const ingredient = (canonicalName: string, displayName: string) => ({ canonicalName, displayName })

const recipe = (
  id: string,
  name: string,
  mealType: RecipeRecord['mealType'],
  ingredients: RecipeRecord['ingredients'],
  allergens: RecipeRecord['allergens'] = [],
): RecipeRecord => ({
  id,
  name,
  mealType,
  compatibleDiets: ['OMNIVORE', 'VEGETARIAN', 'VEGAN'],
  allergens,
  ingredients,
  instructions: `Prepare the ingredients and serve the ${name.toLowerCase()}.`,
  preparationTimeMinutes: 20,
  servingSize: '1 serving',
})

export const BUNDLED_CATALOGUE: RawCatalogue = {
  version: '2026.09.1',
  ingredientEquivalences: {
    'bell pepper': ['capsicum', 'sweet pepper'],
    chickpea: ['chickpeas', 'garbanzo bean'],
    oat: ['oats'],
    peanut: ['peanuts'],
    tomato: ['cherry tomatoes'],
  },
  recipes: [
    recipe('breakfast-001', 'Apple Cinnamon Oats', 'BREAKFAST', [ingredient('oat', 'Rolled oats'), ingredient('apple', 'Apple'), ingredient('cinnamon', 'Cinnamon')]),
    recipe('breakfast-002', 'Berry Chia Pudding', 'BREAKFAST', [ingredient('chia seed', 'Chia seeds'), ingredient('berry', 'Mixed berries'), ingredient('oat', 'Oat milk')]),
    recipe('breakfast-003', 'Tomato Avocado Toast', 'BREAKFAST', [ingredient('tomato', 'Tomato'), ingredient('avocado', 'Avocado'), ingredient('bread', 'Whole-grain bread')], ['GLUTEN']),
    recipe('breakfast-004', 'Peanut Banana Oat Bowl', 'BREAKFAST', [ingredient('peanut', 'Peanut butter'), ingredient('banana', 'Banana'), ingredient('oat', 'Rolled oats')], ['NUTS']),
    recipe('breakfast-005', 'Tofu Scramble', 'BREAKFAST', [ingredient('tofu', 'Tofu'), ingredient('bell pepper', 'Bell pepper'), ingredient('spinach', 'Spinach')], ['SOY']),
    recipe('breakfast-006', 'Mango Coconut Quinoa', 'BREAKFAST', [ingredient('quinoa', 'Quinoa'), ingredient('mango', 'Mango'), ingredient('coconut', 'Coconut')]),
    recipe('breakfast-007', 'Savory Chickpea Hash', 'BREAKFAST', [ingredient('chickpea', 'Chickpeas'), ingredient('potato', 'Potato'), ingredient('onion', 'Onion')]),
    recipe('breakfast-008', 'Herbed Bean Breakfast Bowl', 'BREAKFAST', [ingredient('white bean', 'White beans'), ingredient('spinach', 'Spinach'), ingredient('herb', 'Fresh herbs')]),

    recipe('lunch-001', 'Lentil Tomato Soup', 'LUNCH', [ingredient('lentil', 'Lentils'), ingredient('tomato', 'Tomatoes'), ingredient('carrot', 'Carrots')]),
    recipe('lunch-002', 'Chickpea Quinoa Salad', 'LUNCH', [ingredient('chickpea', 'Chickpeas'), ingredient('quinoa', 'Quinoa'), ingredient('cucumber', 'Cucumber')]),
    recipe('lunch-003', 'Black Bean Tacos', 'LUNCH', [ingredient('black bean', 'Black beans'), ingredient('corn', 'Corn'), ingredient('avocado', 'Avocado')]),
    recipe('lunch-004', 'Tofu Rice Bowl', 'LUNCH', [ingredient('tofu', 'Tofu'), ingredient('rice', 'Brown rice'), ingredient('broccoli', 'Broccoli')], ['SOY']),
    recipe('lunch-005', 'Roasted Pepper Hummus Wrap', 'LUNCH', [ingredient('bell pepper', 'Roasted peppers'), ingredient('chickpea', 'Hummus'), ingredient('flatbread', 'Flatbread')], ['GLUTEN']),
    recipe('lunch-006', 'Peanut Soba Salad', 'LUNCH', [ingredient('peanut', 'Peanuts'), ingredient('buckwheat noodle', 'Soba noodles'), ingredient('cabbage', 'Cabbage')], ['NUTS', 'SOY']),
    recipe('lunch-007', 'Sweet Potato Kale Bowl', 'LUNCH', [ingredient('sweet potato', 'Sweet potato'), ingredient('kale', 'Kale'), ingredient('pumpkin seed', 'Pumpkin seeds')]),
    recipe('lunch-008', 'Herbed White Bean Salad', 'LUNCH', [ingredient('white bean', 'White beans'), ingredient('cucumber', 'Cucumber'), ingredient('herb', 'Fresh herbs')]),

    recipe('dinner-001', 'Mushroom Lentil Stew', 'DINNER', [ingredient('mushroom', 'Mushrooms'), ingredient('lentil', 'Green lentils'), ingredient('carrot', 'Carrots')]),
    recipe('dinner-002', 'Coconut Chickpea Curry', 'DINNER', [ingredient('chickpea', 'Chickpeas'), ingredient('coconut', 'Coconut milk'), ingredient('tomato', 'Tomatoes')]),
    recipe('dinner-003', 'Stuffed Bell Peppers', 'DINNER', [ingredient('bell pepper', 'Bell peppers'), ingredient('rice', 'Rice'), ingredient('black bean', 'Black beans')]),
    recipe('dinner-004', 'Sesame Tofu Noodles', 'DINNER', [ingredient('tofu', 'Tofu'), ingredient('sesame', 'Sesame'), ingredient('rice noodle', 'Rice noodles')], ['SOY']),
    recipe('dinner-005', 'Peanut Tempeh Stir Fry', 'DINNER', [ingredient('peanut', 'Peanut sauce'), ingredient('tempeh', 'Tempeh'), ingredient('broccoli', 'Broccoli')], ['NUTS', 'SOY']),
    recipe('dinner-006', 'Eggplant Tomato Pasta', 'DINNER', [ingredient('eggplant', 'Eggplant'), ingredient('tomato', 'Tomatoes'), ingredient('pasta', 'Pasta')], ['GLUTEN']),
    recipe('dinner-007', 'White Bean Vegetable Skillet', 'DINNER', [ingredient('white bean', 'White beans'), ingredient('zucchini', 'Zucchini'), ingredient('spinach', 'Spinach')]),
    recipe('dinner-008', 'Herbed Bean Vegetable Stew', 'DINNER', [ingredient('white bean', 'White beans'), ingredient('carrot', 'Carrots'), ingredient('herb', 'Fresh herbs')]),
  ],
}