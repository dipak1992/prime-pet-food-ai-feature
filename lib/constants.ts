// ============================================================
// MealEase AI — App-wide Constants
// 5 Pillars: Tonight Suggestions, Snap & Cook, Weekly Autopilot,
//            Leftovers AI, Budget Intelligence
// ============================================================

import type { PlanLimits } from '@/types/models'

// ============================================================
// INGREDIENT CATEGORIES
// ============================================================

export const INGREDIENT_CATEGORIES = [
  'produce',
  'protein',
  'dairy',
  'grains',
  'pantry',
  'frozen',
  'beverages',
  'spices',
  'condiments',
  'snacks',
  'baby',
  'other',
] as const

export type IngredientCategory = typeof INGREDIENT_CATEGORIES[number]

export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  produce:     'Produce',
  protein:     'Meat & Protein',
  dairy:       'Dairy & Eggs',
  grains:      'Grains & Bread',
  pantry:      'Pantry Staples',
  frozen:      'Frozen',
  beverages:   'Beverages',
  spices:      'Spices & Herbs',
  condiments:  'Condiments & Sauces',
  snacks:      'Snacks',
  baby:        'Baby & Kids',
  other:       'Other',
}

// ============================================================
// DIETARY OPTIONS
// ============================================================

export const DIETARY_OPTIONS = [
  { id: 'vegetarian',    label: 'Vegetarian',     emoji: '🥦' },
  { id: 'vegan',         label: 'Vegan',           emoji: '🌱' },
  { id: 'pescatarian',   label: 'Pescatarian',     emoji: '🐟' },
  { id: 'gluten_free',   label: 'Gluten-free',     emoji: '🌾' },
  { id: 'dairy_free',    label: 'Dairy-free',      emoji: '🥛' },
  { id: 'nut_free',      label: 'Nut-free',        emoji: '🥜' },
  { id: 'keto',          label: 'Keto',            emoji: '🥑' },
  { id: 'paleo',         label: 'Paleo',           emoji: '🍖' },
  { id: 'mediterranean', label: 'Mediterranean',   emoji: '🫒' },
  { id: 'high_protein',  label: 'High-protein',    emoji: '💪' },
  { id: 'low_sodium',    label: 'Low-sodium',      emoji: '🧂' },
  { id: 'low_carb',      label: 'Low-carb',        emoji: '🥗' },
  { id: 'halal',         label: 'Halal',           emoji: '☪️' },
  { id: 'kosher',        label: 'Kosher',          emoji: '✡️' },
  { id: 'kid_friendly',  label: 'Kid-friendly',    emoji: '🧒' },
] as const

// ============================================================
// CUISINE OPTIONS
// ============================================================

export const CUISINE_OPTIONS = [
  { id: 'american',    label: 'American',      emoji: '🍔' },
  { id: 'italian',     label: 'Italian',       emoji: '🍝' },
  { id: 'mexican',     label: 'Mexican',       emoji: '🌮' },
  { id: 'asian',       label: 'Asian',         emoji: '🍜' },
  { id: 'chinese',     label: 'Chinese',       emoji: '🥡' },
  { id: 'japanese',    label: 'Japanese',      emoji: '🍱' },
  { id: 'korean',      label: 'Korean',        emoji: '🍲' },
  { id: 'thai',        label: 'Thai',          emoji: '🍛' },
  { id: 'indian',      label: 'Indian',        emoji: '🫕' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
  { id: 'greek',       label: 'Greek',         emoji: '🥙' },
  { id: 'middle_eastern', label: 'Middle Eastern', emoji: '🧆' },
  { id: 'french',      label: 'French',        emoji: '🥐' },
  { id: 'spanish',     label: 'Spanish',       emoji: '🥘' },
  { id: 'latin',       label: 'Latin American', emoji: '🫔' },
  { id: 'african',     label: 'African',       emoji: '🍲' },
  { id: 'caribbean',   label: 'Caribbean',     emoji: '🌴' },
  { id: 'comfort',     label: 'Comfort Food',  emoji: '🍲' },
] as const

export type CuisineId = typeof CUISINE_OPTIONS[number]['id']

// ============================================================
// SKILL LEVELS
// ============================================================

export const SKILL_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    description: "I follow recipes step by step",
    emoji: '👶',
    max_cook_time: 30,
  },
  {
    id: 'comfortable',
    label: 'Comfortable',
    description: "I can improvise a bit",
    emoji: '🧑‍🍳',
    max_cook_time: 45,
  },
  {
    id: 'confident',
    label: 'Confident',
    description: "I cook without thinking twice",
    emoji: '👨‍🍳',
    max_cook_time: 90,
  },
] as const

export type SkillLevel = typeof SKILL_LEVELS[number]['id']

// ============================================================
// PLAN LIMITS — What each tier can do
// ============================================================

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    tier: 'free',
    max_household_members: 2,
    max_saved_recipes: 10,
    max_pantry_items: 20,
    weekly_autopilot: false,
    snap_and_cook: false,
    leftovers_ai: false,
    budget_intelligence: false,
    grocery_export: false,
    household_sharing: false,
    nutrition_info: false,
  },
  pro: {
    tier: 'pro',
    max_household_members: 6,
    max_saved_recipes: 200,
    max_pantry_items: 200,
    weekly_autopilot: true,
    snap_and_cook: true,
    leftovers_ai: true,
    budget_intelligence: true,
    grocery_export: true,
    household_sharing: false,
    nutrition_info: true,
  },
}

// ============================================================
// COOK TIME OPTIONS
// ============================================================

export const COOK_TIME_OPTIONS = [
  { id: 'quick',    label: 'Under 20 min',  minutes: 20,  emoji: '⚡' },
  { id: 'moderate', label: '20–45 min',     minutes: 45,  emoji: '🕐' },
  { id: 'any',      label: 'Any length',    minutes: 120, emoji: '🍳' },
] as const

// ============================================================
// BUDGET LEVELS
// ============================================================

export const BUDGET_LEVELS = [
  { id: 'low',      label: 'Budget',    description: 'Under $10/meal',  emoji: '💚', max_cost_per_meal: 10 },
  { id: 'medium',   label: 'Moderate',  description: '$10–$20/meal',    emoji: '💛', max_cost_per_meal: 20 },
  { id: 'high',     label: 'Flexible',  description: 'No limit',        emoji: '💜', max_cost_per_meal: 999 },
] as const

// ============================================================
// LEFTOVER EXPIRY DEFAULTS (days)
// ============================================================

export const LEFTOVER_EXPIRY_DAYS = {
  default: 4,
  cooked_meat: 3,
  cooked_fish: 2,
  cooked_vegetables: 5,
  cooked_grains: 5,
  soups_stews: 4,
} as const

// ============================================================
// GROCERY EXPORT DESTINATIONS
// ============================================================

export const GROCERY_EXPORT_DESTINATIONS = [
  { id: 'instacart',    label: 'Instacart',      emoji: '🛒', available: true },
  { id: 'kroger',       label: 'Kroger',          emoji: '🏪', available: true },
  { id: 'amazon_fresh', label: 'Amazon Fresh',    emoji: '📦', available: false },
  { id: 'email',        label: 'Email to myself', emoji: '📧', available: true },
  { id: 'pdf',          label: 'Download PDF',    emoji: '📄', available: true },
  { id: 'clipboard',    label: 'Copy to clipboard', emoji: '📋', available: true },
] as const

// ============================================================
// SCAN MODES — Pillar 2: Snap & Cook
// ============================================================

export const SCAN_MODES = [
  { id: 'auto',    label: 'Auto-detect',  description: 'We figure it out',       emoji: '🔍' },
  { id: 'fridge',  label: 'My fridge',    description: 'What\'s inside',          emoji: '🧊' },
  { id: 'pantry',  label: 'My pantry',    description: 'Shelves & cabinets',      emoji: '🫙' },
  { id: 'receipt', label: 'Receipt',      description: 'What I just bought',      emoji: '🧾' },
] as const

// ============================================================
// DAYS OF WEEK
// ============================================================

export const DAYS_OF_WEEK = [
  { index: 0, short: 'Sun', full: 'Sunday' },
  { index: 1, short: 'Mon', full: 'Monday' },
  { index: 2, short: 'Tue', full: 'Tuesday' },
  { index: 3, short: 'Wed', full: 'Wednesday' },
  { index: 4, short: 'Thu', full: 'Thursday' },
  { index: 5, short: 'Fri', full: 'Friday' },
  { index: 6, short: 'Sat', full: 'Saturday' },
] as const

// ============================================================
// MEAL TYPES
// ============================================================

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lunch',     label: 'Lunch',     emoji: '🥗' },
  { id: 'dinner',    label: 'Dinner',    emoji: '🍽️' },
  { id: 'snack',     label: 'Snack',     emoji: '🍎' },
] as const

// ============================================================
// ALLERGY OPTIONS
// ============================================================

export const ALLERGY_OPTIONS = [
  { id: 'peanuts',    label: 'Peanuts',     emoji: '🥜' },
  { id: 'tree_nuts',  label: 'Tree nuts',   emoji: '🌰' },
  { id: 'milk',       label: 'Dairy/Milk',  emoji: '🥛' },
  { id: 'eggs',       label: 'Eggs',        emoji: '🥚' },
  { id: 'wheat',      label: 'Wheat/Gluten', emoji: '🌾' },
  { id: 'soy',        label: 'Soy',         emoji: '🫘' },
  { id: 'fish',       label: 'Fish',        emoji: '🐟' },
  { id: 'shellfish',  label: 'Shellfish',   emoji: '🦐' },
  { id: 'sesame',     label: 'Sesame',      emoji: '🫙' },
  { id: 'honey',      label: 'Honey',       emoji: '🍯' },
] as const

// ============================================================
// ROUTES — Centralised so refactoring is easy
// ============================================================

export const ROUTES = {
  // Core app
  home:          '/',
  dashboard:     '/dashboard',
  tonight:       '/dashboard',
  snapAndCook:   '/pantry',
  weeklyPlan:    '/planner',
  leftovers:     '/dashboard?mode=rescue',
  grocery:       '/grocery-list',
  settings:      '/settings',
  family:        '/family',
  // Auth
  login:         '/login',
  signup:        '/signup',
  onboarding:    '/onboarding',
  // Marketing
  pricing:       '/pricing',
  about:         '/about',
  blog:          '/blog',
} as const

// ============================================================
// API ROUTES
// ============================================================

export const API_ROUTES = {
  decide:        '/api/decide',
  decideSwap:    '/api/decide/swap',
  generatePlan:  '/api/generate-plan',
  weeklyPlan:    '/api/weekly-plan',
  pantryVision:  '/api/pantry/vision',
  pantryMatch:   '/api/pantry/match',
  pantryScan:    '/api/pantry/scan',
  settings:      '/api/settings',
  family:        '/api/family/household',
  members:       '/api/family/members',
  paywallStatus: '/api/paywall/status',
  startTrial:    '/api/paywall/start-trial',
  groceryList:   '/api/grocery-list',
} as const
