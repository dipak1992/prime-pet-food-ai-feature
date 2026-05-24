/**
 * Pantry Mode Type Definitions
 * 
 * Two-stage system for strict ingredient-based recipe generation
 */

// ── Confidence Tiers ────────────────────────────────────────

export type ConfidenceLevel = 'confirmed' | 'probable' | 'uncertain'

export interface PantryIngredient {
  name: string
  confidence: ConfidenceLevel
  quantity?: string
  unit?: string
  expiresAt?: string
  detectedVia: 'vision' | 'manual' | 'ocr'
}

export interface VisionScanResult {
  confirmed_items: string[]      // High confidence
  probable_items: string[]       // Medium confidence
  uncertain_items: string[]      // Low confidence - user should verify
  raw_response: string           // For debugging
  timestamp: string
}

// ── Pantry State ────────────────────────────────────────────

export interface PantryState {
  confirmed: string[]            // User approved as definitely available
  probable: string[]             // Reasonable confidence but needs verification
  uncertain: string[]            // Low confidence, user should check
  manuallyAdded: string[]        // User explicitly added
  lastUpdated: string
}

// ── Recipe Output Types ─────────────────────────────────────

export type PantryRecipeType = 'make_now' | 'almost_ready' | 'shopping_upgrade'

export interface PantryRecipeSuggestion {
  type: PantryRecipeType
  confidence: number             // 0-100: % of ingredients available
  mealId: string
  title: string
  description: string
  availableIngredients: string[]
  missingIngredients: string[]   // Empty for 'make_now'
  missingCount: number
  reasons: string[]
  estimatedCost: number
  totalTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  kidFriendlyScore: number
  badge: '✅ Everything Available' | '🟡 Missing 1 Item' | '🛒 Needs Few Extras'
}

// ── Constraint Engine ───────────────────────────────────────

export interface PantryConstraints {
  availableItems: string[]       // Confirmed + some probable
  blockedIngredients: string[]   // Never suggest
  maxMissingItems: number        // Max 0 for 'make_now', 1 for 'almost_ready'
  allowBasicStaples: boolean     // salt, pepper, oil, water, spices
  basicStaples: string[]
  respectDietary: boolean
  respectAllergies: boolean
}

// ── Response Types ──────────────────────────────────────────

export interface PantryMatchResponse {
  statusCode: 200 | 207 | 400 | 401 | 413 | 422 | 429 | 500
  
  // On success (200/207)
  scannedIngredients?: PantryState
  suggestions?: {
    make_now: PantryRecipeSuggestion[]
    almost_ready: PantryRecipeSuggestion[]
    shopping_upgrade: PantryRecipeSuggestion[]
  }
  trustScore?: number            // 0-100: how confident is this set of suggestions
  editIngredientsSuggested?: boolean
  
  // On error or partial success
  error?: string
  message?: string
  deduplicationNotes?: string[]  // e.g., "Detected both 'tomato' and 'canned tomatoes'"
}
