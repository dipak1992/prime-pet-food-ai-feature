// ─── Unit Conversion to Grams ─────────────────────────────────────────────────
// Used to normalize ingredient quantities for price-per-gram calculations.

type UnitMap = Record<string, number>

const WEIGHT_TO_GRAMS: UnitMap = {
  // metric
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  // imperial
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
}

const VOLUME_TO_ML: UnitMap = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  tsp: 4.92892,
  teaspoon: 4.92892,
  teaspoons: 4.92892,
  tbsp: 14.7868,
  tablespoon: 14.7868,
  tablespoons: 14.7868,
  'fl oz': 29.5735,
  'fluid ounce': 29.5735,
  'fluid ounces': 29.5735,
  cup: 236.588,
  cups: 236.588,
  pint: 473.176,
  pints: 473.176,
  quart: 946.353,
  quarts: 946.353,
  gallon: 3785.41,
  gallons: 3785.41,
}

// Approximate density (g/ml) for common ingredient types
// Used to convert volume → weight
const DENSITY_BY_CATEGORY: Record<string, number> = {
  produce: 0.85,
  meat: 1.05,
  seafood: 1.05,
  dairy: 1.03,
  grains: 0.75,
  pantry: 0.9,
  frozen: 0.9,
  beverages: 1.0,
  other: 0.9,
}

/**
 * Convert a quantity + unit to grams.
 * Returns null if conversion is not possible (e.g. "1 can", "2 cloves").
 */
export function toGrams(
  quantity: number,
  unit: string,
  category = 'other',
): number | null {
  const u = unit.toLowerCase().trim()

  // Direct weight conversion
  if (WEIGHT_TO_GRAMS[u] !== undefined) {
    return quantity * WEIGHT_TO_GRAMS[u]
  }

  // Volume → weight via density
  if (VOLUME_TO_ML[u] !== undefined) {
    const ml = quantity * VOLUME_TO_ML[u]
    const density = DENSITY_BY_CATEGORY[category] ?? 0.9
    return ml * density
  }

  // Whole items — rough estimates
  if (u === 'whole' || u === 'each' || u === '' || u === 'piece' || u === 'pieces') {
    return quantity * 150 // ~150g per whole item default
  }

  if (u === 'clove' || u === 'cloves') {
    return quantity * 5 // ~5g per garlic clove
  }

  if (u === 'slice' || u === 'slices') {
    return quantity * 30
  }

  if (u === 'can' || u === 'cans') {
    return quantity * 400 // ~400g standard can
  }

  if (u === 'bunch' || u === 'bunches') {
    return quantity * 100
  }

  if (u === 'head' || u === 'heads') {
    return quantity * 500
  }

  if (u === 'stalk' || u === 'stalks') {
    return quantity * 80
  }

  return null
}

/**
 * Normalize a unit string to a canonical form.
 */
export function normalizeUnit(unit: string): string {
  const u = unit.toLowerCase().trim()
  const aliases: Record<string, string> = {
    tsp: 'tsp',
    teaspoon: 'tsp',
    teaspoons: 'tsp',
    tbsp: 'tbsp',
    tablespoon: 'tbsp',
    tablespoons: 'tbsp',
    cup: 'cup',
    cups: 'cup',
    oz: 'oz',
    ounce: 'oz',
    ounces: 'oz',
    lb: 'lb',
    lbs: 'lb',
    pound: 'lb',
    pounds: 'lb',
    g: 'g',
    gram: 'g',
    grams: 'g',
    kg: 'kg',
    kilogram: 'kg',
    kilograms: 'kg',
    ml: 'ml',
    milliliter: 'ml',
    milliliters: 'ml',
    l: 'l',
    liter: 'l',
    liters: 'l',
  }
  return aliases[u] ?? u
}
