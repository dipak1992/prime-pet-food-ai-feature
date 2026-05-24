// ============================================================
// Weekly Planner — Grocery List Builder
// Deduplicates, categorises, and formats ingredient lists
// from a set of SmartMealResults.
// ============================================================

import type { SmartMealResult } from '@/lib/engine/types'
import type { GroceryLine, GroceryList, StoreFormat } from './types'
import { WALMART_AISLES, CATEGORY_ORDER } from './types'

// ── Unit normalisation helpers ────────────────────────────────

const UNIT_ALIASES: Record<string, string> = {
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  cup: 'cup', cups: 'cup',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  lb: 'lb', pound: 'lb', pounds: 'lb',
  g: 'g', gram: 'g', grams: 'g',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml',
  l: 'l', liter: 'l', liters: 'l',
  whole: 'whole', piece: 'whole', pieces: 'whole', item: 'whole', items: 'whole',
  clove: 'clove', cloves: 'clove',
  slice: 'slice', slices: 'slice',
  bunch: 'bunch', bunches: 'bunch',
  can: 'can', cans: 'can',
  bag: 'bag', bags: 'bag',
  box: 'box', boxes: 'box',
  jar: 'jar', jars: 'jar',
  bottle: 'bottle', bottles: 'bottle',
  sprig: 'sprig', sprigs: 'sprig',
  handful: 'handful',
  pinch: 'pinch',
}

function normaliseUnit(raw: string): string {
  const lower = raw.trim().toLowerCase()
  return UNIT_ALIASES[lower] ?? lower
}

function normaliseName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Parse a quantity string like "2", "1.5", "½", "3/4" → number */
function parseQty(raw: string): number {
  if (!raw) return 1
  const s = raw.trim()
  // Handle fractions like "3/4"
  if (s.includes('/')) {
    const [n, d] = s.split('/')
    const num = parseFloat(n)
    const den = parseFloat(d)
    if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den
  }
  const n = parseFloat(s)
  return isNaN(n) ? 1 : n
}

// ── Category normalisation ────────────────────────────────────

function normaliseCategory(raw: string): string {
  const map: Record<string, string> = {
    grain: 'grains', grain_staple: 'grains', pantry_staple: 'pantry',
    spice: 'spices', condiment: 'condiments', meat: 'protein',
    seafood: 'protein', poultry: 'protein', vegetable: 'produce', fruit: 'produce',
  }
  const lower = raw.trim().toLowerCase()
  return map[lower] ?? lower
}

// ── Costco bulk multipliers ───────────────────────────────────

const COSTCO_BULK_MIN: Record<string, number> = {
  grains: 5, pantry: 3, spices: 2, condiments: 2, frozen: 4,
  protein: 3, dairy: 2, produce: 2,
}

function costcoBulkNote(category: string, unit: string, qty: number): string | undefined {
  const min = COSTCO_BULK_MIN[category]
  if (!min) return undefined
  const bulkQty = Math.max(qty, min)
  return `Costco: ~${bulkQty} ${unit}+ (bulk pack)`
}

// ── Core builder ──────────────────────────────────────────────

/**
 * Build a deduplicated, categorised grocery list from an array of meals.
 * @param meals       Array of SmartMealResult for the week
 * @param pantryItems Ingredient names the user already has
 * @param storeFormat 'standard' | 'walmart' | 'costco'
 */
export function buildGroceryList(
  meals: SmartMealResult[],
  pantryItems: string[],
  storeFormat: StoreFormat,
  weekStart: string,
): GroceryList {
  // Normalised pantry set for O(1) lookup
  const pantrySet = new Set(pantryItems.map(normaliseName))

  // Accumulator: normalisedName+unit → GroceryLine
  const acc = new Map<string, GroceryLine>()

  for (const meal of meals) {
    // Use shoppingList (non-pantry items) when available, fallback to ingredients
    const items = meal.shoppingList?.length
      ? meal.shoppingList.map((s) => ({
          name: s.name,
          quantity: s.quantity,
          unit: s.unit,
          category: s.category,
          estimatedCost: s.estimatedCost,
          fromPantry: false,
        }))
      : meal.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          category: i.category,
          estimatedCost: 0,
          fromPantry: i.fromPantry,
        }))

    for (const item of items) {
      const normName = normaliseName(item.name)
      const normUnit = normaliseUnit(item.unit)
      const qty = parseQty(item.quantity)
      const key = `${normName}::${normUnit}`
      const cat = normaliseCategory(item.category)

      if (acc.has(key)) {
        const existing = acc.get(key)!
        existing.quantity = Math.round((existing.quantity + qty) * 100) / 100
        existing.estimatedCost += item.estimatedCost
        if (!existing.fromMeals.includes(meal.title)) {
          existing.fromMeals.push(meal.title)
        }
      } else {
        acc.set(key, {
          id: key,
          name: item.name, // keep original capitalisation
          quantity: qty,
          unit: normUnit,
          category: cat,
          estimatedCost: item.estimatedCost,
          fromMeals: [meal.title],
          isInPantry: pantrySet.has(normName) || item.fromPantry,
          isChecked: false,
        })
      }
    }
  }

  // Convert map → array, sort by category order
  const items: GroceryLine[] = Array.from(acc.values()).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category)
    const bi = CATEGORY_ORDER.indexOf(b.category)
    const aIdx = ai === -1 ? 999 : ai
    const bIdx = bi === -1 ? 999 : bi
    if (aIdx !== bIdx) return aIdx - bIdx
    return a.name.localeCompare(b.name)
  })

  // Apply store-format metadata
  if (storeFormat === 'walmart') {
    for (const item of items) {
      item.walmartAisle = WALMART_AISLES[item.category] ?? WALMART_AISLES['other']
    }
  } else if (storeFormat === 'costco') {
    for (const item of items) {
      item.costcoBulkNote = costcoBulkNote(item.category, item.unit, item.quantity)
    }
  }

  const totalEstimatedCost = Math.round(
    items.reduce((sum, i) => sum + (i.isInPantry ? 0 : i.estimatedCost), 0) * 100
  ) / 100

  return {
    weekStart,
    items,
    totalEstimatedCost,
    generatedAt: new Date().toISOString(),
    storeFormat,
  }
}

/** Re-apply store format to an existing list (without re-fetching meals) */
export function reformatGroceryList(list: GroceryList, newFormat: StoreFormat): GroceryList {
  const items = list.items.map((item) => {
    const cleaned = { ...item, walmartAisle: undefined as string | undefined, costcoBulkNote: undefined as string | undefined }
    if (newFormat === 'walmart') {
      cleaned.walmartAisle = WALMART_AISLES[item.category] ?? WALMART_AISLES['other']
    } else if (newFormat === 'costco') {
      cleaned.costcoBulkNote = costcoBulkNote(item.category, item.unit, item.quantity)
    }
    return cleaned
  })
  return { ...list, storeFormat: newFormat, items }
}

function groceryKey(item: GroceryLine) {
  return `${normaliseName(item.name)}::${normaliseUnit(item.unit)}`
}

function recalculateTotal(items: GroceryLine[]) {
  return Math.round(
    items.reduce((sum, item) => sum + (item.isInPantry || item.userRemoved ? 0 : item.estimatedCost), 0) * 100,
  ) / 100
}

export function mergeGroceryListsPreservingEdits(
  previous: GroceryList | null,
  generated: GroceryList,
): GroceryList {
  if (!previous) return generated

  const previousByKey = new Map(previous.items.map((item) => [groceryKey(item), item]))
  const removedKeys = new Set(previous.removedItemKeys ?? [])
  const generatedKeys = new Set<string>()

  const mergedGenerated = generated.items.map((item) => {
    const key = groceryKey(item)
    generatedKeys.add(key)
    if (removedKeys.has(key)) return { ...item, userRemoved: true }
    const edited = previousByKey.get(key)
    if (!edited) return item

    return {
      ...item,
      isChecked: edited.isChecked,
      isInPantry: edited.isInPantry,
      isCustom: edited.isCustom,
      userRemoved: edited.userRemoved,
      note: edited.note,
    }
  }).filter((item) => !item.userRemoved)

  const customItems = previous.items.filter((item) => item.isCustom && !generatedKeys.has(groceryKey(item)))
  const items = [...mergedGenerated, ...customItems]

  return {
    ...generated,
    items,
    removedItemKeys: previous.removedItemKeys,
    totalEstimatedCost: recalculateTotal(items),
  }
}
