import type { IngredientCategory, PricePoint } from '../types'
import type { PriceProvider } from './index'

// ─── USDA Average Retail Prices (2024 estimates) ──────────────────────────────
// Source: USDA Economic Research Service average retail food prices
// Prices are in USD per 100g unless noted
// These serve as the MVP fallback when no cached/live price is available.

type UsdaEntry = {
  pricePerGram: number // USD per gram
  confidence: 'high' | 'medium' | 'low'
}

const USDA_PRICES: Record<string, UsdaEntry> = {
  // ── Produce ──────────────────────────────────────────────────────────────
  apple: { pricePerGram: 0.0022, confidence: 'high' },
  banana: { pricePerGram: 0.0011, confidence: 'high' },
  orange: { pricePerGram: 0.0018, confidence: 'high' },
  lemon: { pricePerGram: 0.0025, confidence: 'medium' },
  lime: { pricePerGram: 0.0028, confidence: 'medium' },
  strawberry: { pricePerGram: 0.0055, confidence: 'high' },
  blueberry: { pricePerGram: 0.0088, confidence: 'high' },
  tomato: { pricePerGram: 0.0033, confidence: 'high' },
  potato: { pricePerGram: 0.0013, confidence: 'high' },
  onion: { pricePerGram: 0.0015, confidence: 'high' },
  garlic: { pricePerGram: 0.0044, confidence: 'high' },
  ginger: { pricePerGram: 0.0055, confidence: 'medium' },
  carrot: { pricePerGram: 0.0016, confidence: 'high' },
  celery: { pricePerGram: 0.0022, confidence: 'high' },
  broccoli: { pricePerGram: 0.0033, confidence: 'high' },
  cauliflower: { pricePerGram: 0.0033, confidence: 'high' },
  spinach: { pricePerGram: 0.0055, confidence: 'high' },
  lettuce: { pricePerGram: 0.0022, confidence: 'high' },
  kale: { pricePerGram: 0.0044, confidence: 'high' },
  cabbage: { pricePerGram: 0.0013, confidence: 'high' },
  cucumber: { pricePerGram: 0.0022, confidence: 'high' },
  zucchini: { pricePerGram: 0.0022, confidence: 'high' },
  pepper: { pricePerGram: 0.0044, confidence: 'high' },
  mushroom: { pricePerGram: 0.0055, confidence: 'high' },
  corn: { pricePerGram: 0.0018, confidence: 'high' },
  avocado: { pricePerGram: 0.0066, confidence: 'high' },
  sweet_potato: { pricePerGram: 0.0018, confidence: 'high' },
  asparagus: { pricePerGram: 0.0066, confidence: 'medium' },
  // ── Meat ─────────────────────────────────────────────────────────────────
  chicken_breast: { pricePerGram: 0.0088, confidence: 'high' },
  chicken_thigh: { pricePerGram: 0.0066, confidence: 'high' },
  chicken: { pricePerGram: 0.0077, confidence: 'high' },
  ground_beef: { pricePerGram: 0.0132, confidence: 'high' },
  beef: { pricePerGram: 0.0154, confidence: 'high' },
  steak: { pricePerGram: 0.0220, confidence: 'medium' },
  pork: { pricePerGram: 0.0099, confidence: 'high' },
  pork_chop: { pricePerGram: 0.0110, confidence: 'high' },
  bacon: { pricePerGram: 0.0176, confidence: 'high' },
  sausage: { pricePerGram: 0.0110, confidence: 'high' },
  turkey: { pricePerGram: 0.0088, confidence: 'high' },
  lamb: { pricePerGram: 0.0220, confidence: 'medium' },
  ham: { pricePerGram: 0.0110, confidence: 'high' },
  // ── Seafood ───────────────────────────────────────────────────────────────
  salmon: { pricePerGram: 0.0220, confidence: 'high' },
  tuna: { pricePerGram: 0.0154, confidence: 'high' },
  shrimp: { pricePerGram: 0.0198, confidence: 'high' },
  cod: { pricePerGram: 0.0176, confidence: 'high' },
  tilapia: { pricePerGram: 0.0132, confidence: 'high' },
  crab: { pricePerGram: 0.0330, confidence: 'medium' },
  scallop: { pricePerGram: 0.0330, confidence: 'medium' },
  // ── Dairy ─────────────────────────────────────────────────────────────────
  milk: { pricePerGram: 0.0011, confidence: 'high' },
  butter: { pricePerGram: 0.0110, confidence: 'high' },
  cheese: { pricePerGram: 0.0176, confidence: 'high' },
  cheddar: { pricePerGram: 0.0176, confidence: 'high' },
  mozzarella: { pricePerGram: 0.0154, confidence: 'high' },
  parmesan: { pricePerGram: 0.0264, confidence: 'high' },
  cream_cheese: { pricePerGram: 0.0132, confidence: 'high' },
  sour_cream: { pricePerGram: 0.0088, confidence: 'high' },
  yogurt: { pricePerGram: 0.0066, confidence: 'high' },
  heavy_cream: { pricePerGram: 0.0110, confidence: 'high' },
  egg: { pricePerGram: 0.0044, confidence: 'high' },
  // ── Grains ────────────────────────────────────────────────────────────────
  rice: { pricePerGram: 0.0022, confidence: 'high' },
  pasta: { pricePerGram: 0.0033, confidence: 'high' },
  bread: { pricePerGram: 0.0044, confidence: 'high' },
  flour: { pricePerGram: 0.0013, confidence: 'high' },
  oat: { pricePerGram: 0.0022, confidence: 'high' },
  quinoa: { pricePerGram: 0.0066, confidence: 'high' },
  tortilla: { pricePerGram: 0.0044, confidence: 'high' },
  // ── Pantry ────────────────────────────────────────────────────────────────
  olive_oil: { pricePerGram: 0.0110, confidence: 'high' },
  oil: { pricePerGram: 0.0055, confidence: 'high' },
  sugar: { pricePerGram: 0.0011, confidence: 'high' },
  salt: { pricePerGram: 0.0004, confidence: 'high' },
  pepper_spice: { pricePerGram: 0.0220, confidence: 'medium' },
  honey: { pricePerGram: 0.0088, confidence: 'high' },
  soy_sauce: { pricePerGram: 0.0044, confidence: 'high' },
  tomato_sauce: { pricePerGram: 0.0022, confidence: 'high' },
  tomato_paste: { pricePerGram: 0.0033, confidence: 'high' },
  chicken_broth: { pricePerGram: 0.0011, confidence: 'high' },
  coconut_milk: { pricePerGram: 0.0044, confidence: 'high' },
  lentil: { pricePerGram: 0.0033, confidence: 'high' },
  chickpea: { pricePerGram: 0.0033, confidence: 'high' },
  black_bean: { pricePerGram: 0.0022, confidence: 'high' },
  almond: { pricePerGram: 0.0176, confidence: 'high' },
  walnut: { pricePerGram: 0.0198, confidence: 'high' },
  peanut_butter: { pricePerGram: 0.0066, confidence: 'high' },
}

// ─── Category fallback prices (USD per gram) ──────────────────────────────────

const CATEGORY_FALLBACK: Record<IngredientCategory, { pricePerGram: number; confidence: 'low' }> = {
  produce: { pricePerGram: 0.0033, confidence: 'low' },
  meat: { pricePerGram: 0.0132, confidence: 'low' },
  seafood: { pricePerGram: 0.0198, confidence: 'low' },
  dairy: { pricePerGram: 0.0088, confidence: 'low' },
  grains: { pricePerGram: 0.0033, confidence: 'low' },
  pantry: { pricePerGram: 0.0055, confidence: 'low' },
  frozen: { pricePerGram: 0.0066, confidence: 'low' },
  beverages: { pricePerGram: 0.0011, confidence: 'low' },
  other: { pricePerGram: 0.0055, confidence: 'low' },
}

// ─── USDA Provider ────────────────────────────────────────────────────────────

export const usdaProvider: PriceProvider = {
  name: 'usda',

  async getPrice(
    ingredientKey: string,
    category: IngredientCategory,
    zipRegion: string,
  ): Promise<PricePoint | null> {
    // Try exact match first
    const entry = USDA_PRICES[ingredientKey]

    if (entry) {
      return buildPricePoint(ingredientKey, zipRegion, entry.pricePerGram, entry.confidence)
    }

    // Try partial match (ingredient key may contain extra words)
    const partialMatch = Object.entries(USDA_PRICES).find(([key]) =>
      ingredientKey.includes(key) || key.includes(ingredientKey),
    )

    if (partialMatch) {
      const [, matchEntry] = partialMatch
      return buildPricePoint(ingredientKey, zipRegion, matchEntry.pricePerGram, matchEntry.confidence)
    }

    // Category fallback
    const fallback = CATEGORY_FALLBACK[category]
    return buildPricePoint(ingredientKey, zipRegion, fallback.pricePerGram, fallback.confidence)
  },
}

function buildPricePoint(
  ingredientKey: string,
  zipRegion: string,
  pricePerGram: number,
  confidence: 'high' | 'medium' | 'low',
): PricePoint {
  const now = new Date()
  const expires = new Date(now)
  expires.setDate(expires.getDate() + 7) // USDA data valid for 7 days

  return {
    ingredientKey,
    zipRegion,
    pricePerUnit: pricePerGram,
    unit: 'g',
    source: 'usda',
    confidence,
    cachedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  }
}
