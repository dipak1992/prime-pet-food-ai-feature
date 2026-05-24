import type { MainIngredient, IngredientCategory } from './types'

type RecipeLike = {
  name?: string
  ingredients?: string[] | Array<{ name: string }>
  tags?: string[]
}

// Regex rules for category detection (order matters — most specific first)
const CATEGORY_RULES: Array<{ pattern: RegExp; category: IngredientCategory }> = [
  { pattern: /\b(salmon|tuna|shrimp|cod|tilapia|halibut|crab|lobster|clam|mussel|scallop|fish|seafood)\b/i, category: 'seafood' },
  { pattern: /\b(chicken|turkey|duck|hen|poultry)\b/i, category: 'poultry' },
  { pattern: /\b(beef|pork|lamb|veal|steak|ground meat|bison|venison|sausage|bacon|ham|prosciutto)\b/i, category: 'meat' },
  { pattern: /\b(milk|cheese|cream|butter|yogurt|cheddar|mozzarella|parmesan|ricotta|dairy)\b/i, category: 'dairy' },
  { pattern: /\b(egg|eggs)\b/i, category: 'egg' },
  { pattern: /\b(rice|pasta|noodle|bread|flour|wheat|oat|quinoa|barley|grain|tortilla|couscous)\b/i, category: 'grain' },
  { pattern: /\b(bean|lentil|chickpea|tofu|tempeh|edamame|legume|pea|soy)\b/i, category: 'legume' },
  { pattern: /\b(apple|banana|mango|berry|berries|orange|grape|peach|pear|plum|fruit)\b/i, category: 'fruit' },
  { pattern: /\b(carrot|broccoli|spinach|kale|lettuce|tomato|onion|garlic|pepper|zucchini|potato|celery|mushroom|vegetable|veggie|cabbage|cauliflower|asparagus|eggplant|squash)\b/i, category: 'vegetable' },
]

function detectCategory(name: string): IngredientCategory {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(name)) return rule.category
  }
  return 'other'
}

function normalizeIngredientName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\d+(\.\d+)?\s*(g|kg|oz|lb|lbs|cup|cups|tbsp|tsp|ml|l|piece|pieces|slice|slices)?\s*/gi, '')
    .replace(/\(.*?\)/g, '')
    .trim()
}

/**
 * Parse a recipe-like object into a list of MainIngredients.
 * Deduplicates by name and limits to 6 most significant ingredients.
 */
export function parseMainIngredients(recipe: RecipeLike): MainIngredient[] {
  const rawIngredients: string[] = []

  if (recipe.ingredients) {
    for (const ing of recipe.ingredients) {
      if (typeof ing === 'string') {
        rawIngredients.push(ing)
      } else if (typeof ing === 'object' && 'name' in ing) {
        rawIngredients.push(ing.name)
      }
    }
  }

  // Fallback: parse from recipe name
  if (rawIngredients.length === 0 && recipe.name) {
    rawIngredients.push(recipe.name)
  }

  const seen = new Set<string>()
  const result: MainIngredient[] = []

  for (const raw of rawIngredients) {
    const name = normalizeIngredientName(raw)
    if (!name || seen.has(name)) continue
    seen.add(name)
    result.push({ name, category: detectCategory(name) })
    if (result.length >= 6) break
  }

  return result
}

/**
 * Parse a plain string list of ingredients (e.g. from scan results).
 */
export function parseIngredientStrings(names: string[]): MainIngredient[] {
  const seen = new Set<string>()
  const result: MainIngredient[] = []

  for (const raw of names) {
    const name = normalizeIngredientName(raw)
    if (!name || seen.has(name)) continue
    seen.add(name)
    result.push({ name, category: detectCategory(name) })
    if (result.length >= 6) break
  }

  return result
}
