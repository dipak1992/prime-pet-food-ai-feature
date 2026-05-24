import type { IngredientCategory, PricePoint } from '../types'

// ─── Provider Interface ───────────────────────────────────────────────────────

export interface PriceProvider {
  name: string
  getPrice(
    ingredientKey: string,
    category: IngredientCategory,
    zipRegion: string,
  ): Promise<PricePoint | null>
}

// ─── Provider Chain ───────────────────────────────────────────────────────────

/**
 * Try each provider in order, returning the first successful result.
 */
export async function resolvePrice(
  providers: PriceProvider[],
  ingredientKey: string,
  category: IngredientCategory,
  zipRegion: string,
): Promise<PricePoint | null> {
  for (const provider of providers) {
    try {
      const result = await provider.getPrice(ingredientKey, category, zipRegion)
      if (result) return result
    } catch (err) {
      console.warn(`[price-provider:${provider.name}] failed for ${ingredientKey}:`, err)
    }
  }
  return null
}

// ─── Zip Region Normalizer ────────────────────────────────────────────────────

/**
 * Normalize a zip code to a broad region for cache bucketing.
 * Uses first 3 digits (sectional center facility).
 */
export function normalizeZipRegion(zip: string | null): string {
  if (!zip) return 'us_avg'
  const digits = zip.replace(/\D/g, '')
  if (digits.length < 3) return 'us_avg'
  return `us_${digits.slice(0, 3)}`
}
