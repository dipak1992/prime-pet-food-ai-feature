// ============================================================
// Weekly Planner & Grocery — Types
// ============================================================

import type { SmartMealResult } from '@/lib/engine/types'

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

export type StoreFormat = 'standard' | 'walmart' | 'costco'

// ── Day in the weekly plan ────────────────────────────────────

export interface WeekDay {
  dayIndex: number // 0 = Mon … 6 = Sun
  date: string     // ISO YYYY-MM-DD
  meal: SmartMealResult | null
}

// ── Full weekly plan ─────────────────────────────────────────

export interface WeeklyPlan {
  id: string
  weekStart: string // ISO
  days: WeekDay[]
  generatedAt: string
}

// ── Grocery ──────────────────────────────────────────────────

export interface GroceryLine {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  estimatedCost: number
  fromMeals: string[]   // meal titles that need this ingredient
  isInPantry: boolean   // user owns this already
  isChecked: boolean    // has been picked up
  isCustom?: boolean    // manually added by user
  userRemoved?: boolean // preserved when generated items are intentionally removed
  note?: string         // optional user note (e.g. "buy organic")
  // Store-specific metadata
  walmartAisle?: string
  costcoBulkNote?: string
}

export interface GroceryList {
  weekStart: string
  items: GroceryLine[]
  removedItemKeys?: string[]
  totalEstimatedCost: number
  generatedAt: string
  storeFormat: StoreFormat
}

// ── Walmart aisle map ─────────────────────────────────────────

export const WALMART_AISLES: Record<string, string> = {
  produce: 'A1 — Fresh Produce',
  protein: 'A3 — Meat & Seafood',
  dairy: 'A4 — Dairy & Eggs',
  grains: 'A5 — Bread & Grains',
  pantry: 'A6 — Dry Goods & Pantry',
  spices: 'A7 — Spices & Seasonings',
  condiments: 'A8 — Condiments & Sauces',
  frozen: 'A9 — Frozen Foods',
  beverages: 'A10 — Beverages',
  snacks: 'A11 — Snacks',
  baby: 'A12 — Baby & Kids',
  other: 'A13 — Other',
}

// Canonical sort order for store aisles
export const CATEGORY_ORDER: string[] = [
  'produce',
  'protein',
  'dairy',
  'grains',
  'pantry',
  'spices',
  'condiments',
  'frozen',
  'beverages',
  'snacks',
  'baby',
  'other',
]

// ── Category icons ────────────────────────────────────────────

export const GROCERY_ICONS: Record<string, string> = {
  produce: '🥦',
  protein: '🥩',
  dairy: '🥛',
  grains: '🌾',
  pantry: '🫙',
  spices: '🧂',
  condiments: '🍶',
  frozen: '🧊',
  beverages: '🧃',
  snacks: '🍿',
  baby: '🍼',
  other: '🛒',
}
