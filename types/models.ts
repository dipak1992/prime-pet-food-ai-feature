import type { GroceryCategory, SubscriptionTier } from './index'

// ============================================================
// MealEase AI — Complete Domain Model
// 5 Pillars: Tonight Suggestions, Snap & Cook, Weekly Autopilot,
//            Leftovers AI, Budget Intelligence
//
// Convention: snake_case to match Supabase/Postgres column names.
// Re-exports shared types from ./index.ts where they already exist.
// ============================================================

export type {
  LifeStage,
  MealType,
  BudgetLevel,
  CookingTime,
  SubscriptionTier,
  Allergy,
  MedicalCondition,
  FeedbackRating,
  GroceryCategory,
  KidsAgeGroup,
  SmartChipId,
  SmartChip,
  MealBadgeId,
  MealBadge,
  UserGoal,
  // Core DB models already defined in index.ts
  Profile,
  Household,
  HouseholdMember,
  MemberAllergy,
  MemberCondition,
  Ingredient,
  Meal,
  MealVariation,
  PlanDay,
  Plan,
  GroceryItem,
  GroceryList,
  PantryItem,
  PantryUpload,
  MealFeedback,
  WeeklyFeedback,
  WeeklyInsights,
  SubscriptionTierConfig,
  UserSubscription,
  AIGeneratedPlan,
  AIGeneratedMeal,
  AIGeneratedMealVariation,
  AIGeneratedDay,
  AIGenerationRequest,
  RegenerateModifier,
  ShareableCard,
} from './index'

// ============================================================
// PILLAR 1 — TONIGHT SUGGESTIONS
// "What's for dinner tonight?"
// ============================================================

/** A single AI-generated meal suggestion returned by /api/decide */
export interface TonightSuggestion {
  id: string
  household_id: string
  user_id: string
  /** The recipe or AI meal that was suggested */
  recipe_id: string | null
  /** Raw AI-generated meal data when no recipe_id exists */
  meal_data: TonightMealData | null
  /** How the suggestion was triggered */
  mode: 'tired' | 'smart' | 'ingredients' | 'rescue'
  /** User input that triggered the suggestion (e.g. ingredient list) */
  input_text: string | null
  /** Chips applied when generating (e.g. 'too_expensive', 'faster') */
  applied_chips: string[]
  /** User action taken on this suggestion */
  outcome: 'cooked' | 'swapped' | 'saved' | 'ignored' | null
  outcome_at: string | null
  created_at: string
}

export interface TonightMealData {
  title: string
  description: string
  prep_time: number
  cook_time: number
  estimated_cost: number | null
  tags: string[]
  ingredients: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string | null
  image_url: string | null
}

// ============================================================
// PILLAR 2 — SNAP & COOK
// "What can I make with what's in my fridge?"
// ============================================================

export interface Scan {
  id: string
  user_id: string
  household_id: string
  image_url: string
  /** What the user intended when scanning */
  mode: 'auto' | 'fridge' | 'pantry' | 'receipt'
  /** What the AI detected the image actually contains */
  detected_type: 'fridge' | 'pantry' | 'receipt' | 'unknown' | null
  /** Ingredient or item names extracted from the image */
  detected_items: string[]
  /** Confidence score 0–1 for each detected item */
  detection_confidence: Record<string, number>
  /** Recipe IDs suggested based on detected items */
  result_recipe_ids: string[]
  /** Raw AI-generated meal suggestions (when no recipe match) */
  result_meals: TonightMealData[]
  processing_time_ms: number
  error: string | null
  created_at: string
}

// ============================================================
// PILLAR 3 — WEEKLY AUTOPILOT
// "Plan my whole week automatically"
// Already covered by Plan / PlanDay / Meal in index.ts.
// Extended here with autopilot-specific metadata.
// ============================================================

export interface AutopilotRun {
  id: string
  household_id: string
  plan_id: string
  /** Parameters used to generate this plan */
  generation_params: AutopilotParams
  /** How long the AI took to generate */
  generation_time_ms: number
  /** Number of regeneration attempts before acceptance */
  regeneration_count: number
  accepted_at: string | null
  created_at: string
}

export interface AutopilotParams {
  week_start: string
  budget_weekly_usd: number | null
  max_cook_time_minutes: number | null
  cuisine_preferences: string[]
  avoid_repeated_proteins: boolean
  use_pantry_items: boolean
  pantry_items: string[]
  dietary_restrictions: string[]
  low_energy_days: number[] // 0=Sun … 6=Sat
}

// ============================================================
// PILLAR 4 — LEFTOVERS AI
// "What do I do with what's left over?"
// ============================================================

export interface Leftover {
  id: string
  household_id: string
  /** The meal that produced these leftovers */
  source_meal_id: string | null
  source_recipe_id: string | null
  /** Human-readable name (e.g. "Roast chicken from Monday") */
  display_name: string
  cooked_at: string
  estimated_servings_remaining: number
  /** Key ingredients available as leftovers */
  main_ingredients: string[]
  status: 'active' | 'used' | 'expired' | 'discarded'
  /** Typically 3–4 days after cooked_at */
  expires_at: string
  /** Recipe the leftovers were transformed into */
  used_in_recipe_id: string | null
  used_in_meal_id: string | null
  used_at: string | null
  created_at: string
  updated_at: string
}

export interface LeftoverSuggestion {
  id: string
  leftover_id: string
  household_id: string
  /** AI-generated transformation idea */
  suggestion_title: string
  suggestion_description: string
  estimated_additional_ingredients: string[]
  estimated_cook_time_minutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  accepted: boolean
  accepted_at: string | null
  created_at: string
}

// ============================================================
// PILLAR 5 — BUDGET INTELLIGENCE
// "What will this cost me? Keep me on budget."
// ============================================================

export interface BudgetSettings {
  id: string
  household_id: string
  weekly_budget_usd: number | null
  /** Reject AI plans that exceed the budget */
  is_strict_mode: boolean
  zip_code: string | null
  preferred_store: 'instacart' | 'kroger' | 'walmart' | 'whole_foods' | 'generic' | null
  /** Price tier used for cost estimates */
  price_tier: 'budget' | 'mid' | 'premium'
  updated_at: string
}

export interface WeeklySpend {
  id: string
  household_id: string
  week_start_date: string
  /** AI-estimated cost at plan generation time */
  estimated_total_usd: number
  /** Actual spend entered by user (optional) */
  actual_total_usd: number | null
  meals_count: number
  cost_per_meal_usd: number
  /** Whether the week came in under budget */
  under_budget: boolean | null
  created_at: string
  updated_at: string
}

export interface IngredientPrice {
  id: string
  ingredient_name: string
  normalized_name: string
  zip_code: string
  store: string
  price_usd: number
  unit: string
  quantity: number
  price_per_unit_usd: number
  fetched_at: string
  source: 'instacart_api' | 'kroger_api' | 'manual' | 'estimate'
}

// ============================================================
// RECIPES — Shared across all pillars
// ============================================================

export interface Recipe {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  prep_time_minutes: number
  cook_time_minutes: number
  total_time_minutes: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string | null
  tags: string[]
  dietary_tags: string[]
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  nutrition_per_serving: NutritionInfo | null
  estimated_cost_usd: number | null
  /** How this recipe entered the system */
  source: 'ai_generated' | 'curated' | 'user_saved'
  is_public: boolean
  created_at: string
  created_by: string | null
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  name: string
  normalized_name: string
  quantity: number
  unit: string
  category: GroceryCategory
  is_optional: boolean
  estimated_cost_usd: number | null
  substitutes: string[]
}

export interface RecipeStep {
  step_number: number
  instruction: string
  duration_minutes: number | null
  tip: string | null
  image_url: string | null
}

export interface NutritionInfo {
  calories: number
  protein_grams: number
  carbs_grams: number
  fat_grams: number
  fiber_grams: number
  sugar_grams: number
  sodium_mg: number
}

// ============================================================
// GROCERY — Extended from index.ts
// ============================================================

export interface GroceryExport {
  id: string
  grocery_list_id: string
  household_id: string
  destination: 'instacart' | 'amazon_fresh' | 'kroger' | 'email' | 'pdf' | 'clipboard'
  status: 'pending' | 'sent' | 'failed'
  external_cart_url: string | null
  item_count: number
  estimated_total_usd: number
  exported_at: string
  created_at: string
}

// ============================================================
// NUDGES & CONTEXTUAL PROMPTS
// Shown in dashboard, settings, post-meal flows
// ============================================================

export type NudgeType =
  | 'upgrade'
  | 'onboarding'
  | 'feature_education'
  | 'household_invite'
  | 'budget_alert'
  | 'leftover_reminder'
  | 'pantry_expiry'
  | 'plan_missing'
  | 'streak_encouragement'

export interface ContextualNudge {
  id: string
  user_id: string
  type: NudgeType
  /** Higher = shown first */
  priority: number
  title: string
  description: string
  cta_label: string
  /** Route or action identifier */
  cta_action: string
  dismissible: boolean
  shown_at: string | null
  dismissed_at: string | null
  clicked_at: string | null
  expires_at: string | null
  created_at: string
}

// ============================================================
// DIETARY PREFERENCES — Extended
// ============================================================

export type DietaryPreference =
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'high_protein'
  | 'low_sodium'
  | 'low_carb'
  | 'halal'
  | 'kosher'
  | 'kid_friendly'

// ============================================================
// PLAN LIMITS — Per subscription tier
// ============================================================

export interface PlanLimits {
  tier: SubscriptionTier
  /** Max household members that can be added */
  max_household_members: number
  /** Max saved recipes */
  max_saved_recipes: number
  /** Max pantry items */
  max_pantry_items: number
  /** Can generate weekly autopilot plans */
  weekly_autopilot: boolean
  /** Can use Snap & Cook (image scanning) */
  snap_and_cook: boolean
  /** Can use Leftovers AI */
  leftovers_ai: boolean
  /** Can see budget estimates */
  budget_intelligence: boolean
  /** Can export grocery lists */
  grocery_export: boolean
  /** Can share household with other users */
  household_sharing: boolean
  /** Can access nutrition info */
  nutrition_info: boolean
}


// ============================================================
// DOMAIN INTERFACES (camelCase)
// Used for application logic, API responses, and UI state.
// The snake_case types above map directly to Supabase DB rows.
// These camelCase interfaces are the "app layer" representation.
// ============================================================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string | null
  timezone: string
  createdAt: Date
  /** 'free' | 'pro' | 'family' */
  plan: SubscriptionTier
  trialEndsAt: Date | null
  onboardingCompleted: boolean
  hasSeenDashboardTour: boolean
  /** For grocery pricing estimates */
  zipCode: string | null
}

export interface HouseholdDomain {
  id: string
  name: string
  ownerId: string
  inviteCode: string | null
  createdAt: Date
  dietaryPreferences: DietaryPreference[]
  cuisinePreferences: string[]
  budgetWeekly: number | null
  cookingSkillLevel: 'beginner' | 'comfortable' | 'confident'
}

export interface HouseholdMemberDomain {
  id: string
  householdId: string
  /** null for non-user members (e.g. kids) */
  userId: string | null
  displayName: string
  role: 'owner' | 'adult' | 'teen' | 'kid'
  age: number | null
  allergies: string[]
  dislikes: string[]
  joinedAt: Date
}

export interface RecipeDomain {
  id: string
  slug: string
  name: string
  description: string
  image: string | null
  prepTimeMinutes: number
  cookTimeMinutes: number
  totalTimeMinutes: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisine: string | null
  tags: string[]
  dietaryTags: DietaryPreference[]
  ingredients: IngredientDomain[]
  steps: RecipeStepDomain[]
  nutritionPerServing: NutritionInfoDomain | null
  estimatedCostUSD: number | null
  source: 'ai_generated' | 'curated' | 'user_saved'
  isPublic: boolean
  createdAt: Date
  createdBy: string | null
}

export interface IngredientDomain {
  id: string
  name: string
  normalizedName: string
  quantity: number
  unit: string
  category: 'produce' | 'protein' | 'dairy' | 'pantry' | 'frozen' | 'spices' | 'other'
  isOptional: boolean
  estimatedCostUSD: number | null
}

export interface RecipeStepDomain {
  stepNumber: number
  instruction: string
  durationMinutes: number | null
  tip: string | null
  imageUrl: string | null
}

export interface NutritionInfoDomain {
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  fiberGrams: number
  sugarGrams: number
  sodiumMg: number
}

export interface WeekPlan {
  id: string
  householdId: string
  /** Always a Monday */
  weekStartDate: Date
  days: DayPlanDomain[]
  isAutopilotGenerated: boolean
  totalEstimatedCostUSD: number | null
  createdAt: Date
  updatedAt: Date
}

export interface DayPlanDomain {
  id: string
  weekPlanId: string
  date: Date
  dayOfWeek: string
  recipeId: string | null
  status: 'planned' | 'cooked' | 'skipped' | 'empty'
  cookedAt: Date | null
  notes: string | null
}

export interface PantryItemDomain {
  id: string
  householdId: string
  ingredientName: string
  normalizedName: string
  quantity: number
  unit: string
  category: string
  addedAt: Date
  expiresAt: Date | null
  source: 'manual' | 'scan' | 'grocery_sync'
}

export interface ScanDomain {
  id: string
  userId: string
  householdId: string
  imageUrl: string
  mode: 'auto' | 'fridge' | 'menu' | 'food'
  detectedType: 'fridge' | 'menu' | 'food' | null
  detectedItems: string[]
  resultRecipeIds: string[]
  processingTimeMs: number
  createdAt: Date
}

export interface LeftoverDomain {
  id: string
  householdId: string
  sourceRecipeId: string | null
  cookedAt: Date
  estimatedServingsRemaining: number
  mainIngredients: string[]
  status: 'active' | 'used' | 'expired' | 'discarded'
  /** Typically 3–4 days after cookedAt */
  expiresAt: Date
  usedInRecipeId: string | null
  usedAt: Date | null
}

export interface BudgetSettingsDomain {
  id: string
  householdId: string
  weeklyBudgetUSD: number | null
  /** Reject AI plans that exceed the budget */
  isStrictMode: boolean
  zipCode: string
  preferredStore: 'instacart' | 'kroger' | 'walmart' | 'generic' | null
  updatedAt: Date
}

export interface WeeklySpendDomain {
  id: string
  householdId: string
  weekStartDate: Date
  estimatedTotalUSD: number
  actualTotalUSD: number | null
  mealsCount: number
  costPerMealUSD: number
}

export interface GroceryListDomain {
  id: string
  weekPlanId: string | null
  items: GroceryItemDomain[]
  generatedAt: Date
  exportedAt: Date | null
  exportDestination: 'instacart' | 'amazon_fresh' | 'email' | 'pdf' | null
}

export interface GroceryItemDomain {
  id: string
  ingredientName: string
  quantity: number
  unit: string
  category: string
  estimatedCostUSD: number
  isChecked: boolean
  /** Already have it in pantry */
  isInPantry: boolean
  addedManually: boolean
}

export interface ContextualNudgeDomain {
  id: string
  userId: string
  type: NudgeType
  priority: number
  title: string
  description: string
  ctaLabel: string
  ctaAction: string
  dismissible: boolean
  shownAt: Date | null
  dismissedAt: Date | null
  clickedAt: Date | null
  expiresAt: Date | null
}
