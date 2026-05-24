// ============================================================
// NutriNest AI — Core TypeScript Types
// ============================================================

export type LifeStage = 'adult' | 'baby' | 'toddler' | 'kid';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type BudgetLevel = 'low' | 'medium' | 'high';
export type CookingTime = 'quick' | 'moderate' | 'any';
export type SubscriptionTier = 'free' | 'pro';

export type Allergy =
  | 'peanuts'
  | 'tree_nuts'
  | 'milk'
  | 'eggs'
  | 'wheat'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame'
  | 'honey';

export type MedicalCondition =
  | 'diabetes'
  | 'prediabetes'
  | 'hypertension'
  | 'pcos'
  | 'ibs'
  | 'gerd'
  | 'celiac'
  | 'lactose_intolerance'
  | 'vegetarian'
  | 'vegan'
  | 'postpartum'
  | 'iron_deficiency'
  | 'high_cholesterol'
  | 'kidney_disease';

export type FeedbackRating = 'loved' | 'okay' | 'rejected';

// ============================================================
// Database Models
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  owner_id: string;
  name: string;
  adults_count: number;
  babies_count: number;
  toddlers_count: number;
  kids_count: number;
  budget_level: BudgetLevel;
  cooking_time_preference: CookingTime;
  cuisine_preferences: string[];
  low_energy_mode: boolean;
  one_pot_preference: boolean;
  leftovers_preference: boolean;
  pantry_staples: string[];
  preferred_proteins: string[];
  meals_per_day: number;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  name: string;
  age: number | null;
  stage: LifeStage;
  picky_eater: boolean;
  school_lunch_needed: boolean;
  calorie_goal: number | null;
  protein_goal: 'normal' | 'high' | null;
  weight_goal: 'maintain' | 'lose' | 'gain' | null;
  texture_needs: 'normal' | 'soft' | 'pureed' | 'finger_foods' | null;
  cuisine_preference: string[];
  disliked_foods: string[];
  color: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  allergies?: MemberAllergy[];
  conditions?: MemberCondition[];
}

export interface MemberAllergy {
  id: string;
  member_id: string;
  allergy: Allergy;
  severity: 'avoid' | 'severe' | 'mild';
  created_at: string;
}

export interface MemberCondition {
  id: string;
  member_id: string;
  condition: MedicalCondition;
  notes: string | null;
  created_at: string;
}

// ============================================================
// Meal Planning
// ============================================================

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  category?: string;
}

export interface MealVariation {
  id: string;
  meal_id: string;
  member_id: string;
  member_name: string;
  member_stage: LifeStage;
  title: string;
  description: string;
  modifications: string[];
  ingredients_add: Ingredient[];
  ingredients_remove: string[];
  instructions: string[];
  texture_notes: string | null;
  safety_notes: string[];
  serving_size: string | null;
  lunchbox_adaptation: string | null;
  created_at: string;
}

export interface Meal {
  id: string;
  plan_day_id: string;
  meal_type: MealType;
  title: string;
  description: string;
  base_ingredients: Ingredient[];
  base_instructions: string[];
  prep_time: number;
  cook_time: number;
  estimated_cost: number;
  tags: string[];
  allergy_notes: Record<string, string>;
  safety_notes: string[];
  leftover_notes: string | null;
  lunchbox_notes: string | null;
  image_url: string | null;
  family_friendly_score: number;
  created_at: string;
  updated_at: string;
  // Joined
  variations?: MealVariation[];
}

export interface PlanDay {
  id: string;
  plan_id: string;
  day_of_week: number;
  date: string;
  meals: Meal[];
}

export interface Plan {
  id: string;
  household_id: string;
  week_start: string;
  week_end: string;
  status: 'draft' | 'active' | 'completed';
  generated_at: string;
  generation_params: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Joined
  days?: PlanDay[];
}

// ============================================================
// Grocery
// ============================================================

export interface GroceryItem {
  id: string;
  grocery_list_id: string;
  name: string;
  quantity: string;
  unit: string;
  category: GroceryCategory;
  estimated_cost: number;
  checked: boolean;
  owned_in_pantry: boolean;
  meal_usage: string[];
  substitution_options: string[];
  created_at: string;
}

export type GroceryCategory =
  | 'produce'
  | 'protein'
  | 'dairy'
  | 'grains'
  | 'pantry'
  | 'frozen'
  | 'beverages'
  | 'spices'
  | 'condiments'
  | 'snacks'
  | 'baby'
  | 'other';

export interface GroceryList {
  id: string;
  plan_id: string;
  household_id: string;
  generated_at: string;
  estimated_total: number;
  items: GroceryItem[];
  created_at: string;
  updated_at: string;
}

// ============================================================
// Pantry
// ============================================================

export interface PantryItem {
  id: string;
  household_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  category: GroceryCategory;
  expiry_date: string | null;
  added_via: 'manual' | 'photo_scan';
  created_at: string;
  updated_at: string;
}

export interface PantryUpload {
  id: string;
  household_id: string;
  storage_path: string;
  upload_type: 'pantry' | 'fridge';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_items: Partial<PantryItem>[];
  created_at: string;
}

// ============================================================
// Feedback
// ============================================================

export interface MealFeedback {
  id: string;
  meal_id: string;
  member_id: string | null;
  household_id: string;
  rating: FeedbackRating;
  effort_rating: 'easy' | 'moderate' | 'hard' | null;
  cost_rating: 'affordable' | 'pricey' | null;
  notes: string | null;
  child_refused: boolean;
  texture_issue: boolean;
  symptom_noticed: boolean;
  symptom_notes: string | null;
  created_at: string;
}

export interface WeeklyFeedback {
  id: string;
  plan_id: string;
  household_id: string;
  overall_rating: number;
  saved_time: boolean;
  reduced_stress: boolean;
  healthier_eating: boolean;
  notes: string | null;
  created_at: string;
}

// ============================================================
// Weekly Insights
// ============================================================

export interface WeeklyInsights {
  shared_meals_count: number;
  school_lunches_ready: number;
  ingredient_overlap_wins: string[];
  estimated_grocery_savings: number;
  picky_eater_adaptations: number;
  high_protein_meals: number;
  low_sodium_meals: number;
  allergy_safe_count: number;
  leftover_conversions: number;
  avg_prep_time: number;
}

// ============================================================
// Subscription
// ============================================================

export interface SubscriptionTierConfig {
  id: string;
  name: SubscriptionTier;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: {
    family_members: number;
    weekly_plans: number;
    medical_aware: boolean;
    pantry_scan: boolean;
    adaptive_learning: boolean;
    lunchbox_mode: boolean;
    export: boolean;
    advanced_conditions: boolean;
    caregiver_sharing: boolean;
  };
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  started_at: string;
  expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Onboarding State
// ============================================================

export interface OnboardingState {
  step: number;
  household: {
    name: string;
    adults_count: number;
    babies_count: number;
    toddlers_count: number;
    kids_count: number;
  };
  members: Partial<HouseholdMember & { allergies: Allergy[]; conditions: MedicalCondition[] }>[];
  preferences: {
    budget_level: BudgetLevel;
    cooking_time: CookingTime;
    meals_per_day: number;
    cuisine_preferences: string[];
    pantry_staples: string[];
    preferred_proteins: string[];
    low_energy_mode: boolean;
    one_pot_preference: boolean;
    leftovers_preference: boolean;
  };
  goals: string[];
}

// ============================================================
// AI Generation Types
// ============================================================

export interface AIGenerationRequest {
  household: Household;
  members: HouseholdMember[];
  week_start: string;
  regenerate_params?: {
    modifier: string;
    meal_ids?: string[];
    day_ids?: string[];
    /** Full current meal context for targeted regeneration */
    current_meal_context?: Record<string, unknown>;
  };
  pantry_items?: string[];
  feedback_history?: MealFeedback[];
}

export interface AIGeneratedMealVariation {
  member_id: string;
  member_name: string;
  member_stage: LifeStage;
  title: string;
  description: string;
  modifications: string[];
  texture_notes: string | null;
  safety_notes: string[];
  serving_description: string;
  lunchbox_adaptation: string | null;
}

export interface AIGeneratedMeal {
  meal_type: MealType;
  title: string;
  description: string;
  base_ingredients: Ingredient[];
  base_instructions: string[];
  prep_time: number;
  cook_time: number;
  estimated_cost: number;
  tags: string[];
  allergy_notes: Record<string, string>;
  safety_notes: string[];
  leftover_notes: string | null;
  lunchbox_notes: string | null;
  member_variations: AIGeneratedMealVariation[];
}

export interface AIGeneratedDay {
  day_of_week: number;
  date: string;
  meals: AIGeneratedMeal[];
}

export interface AIGeneratedPlan {
  week_start: string;
  week_end: string;
  days: AIGeneratedDay[];
  grocery_list: {
    items: Omit<GroceryItem, 'id' | 'grocery_list_id' | 'created_at' | 'checked' | 'owned_in_pantry'>[];
    estimated_total: number;
  };
  insights: WeeklyInsights;
}

// ============================================================
// UI State
// ============================================================

export interface RegenerateModifier {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: 'speed' | 'diet' | 'family' | 'budget' | 'method';
}

// ============================================================
// Goals & Smart Features
// ============================================================

export type UserGoal =
  | 'weight_loss'
  | 'muscle_gain'
  | 'budget'
  | 'family'
  | 'lazy';

export const USER_GOAL_META: Record<UserGoal, { label: string; emoji: string; hint: string }> = {
  weight_loss:  { label: 'Weight loss',  emoji: '🏃', hint: 'Lower calorie, balanced meals' },
  muscle_gain:  { label: 'Muscle gain',  emoji: '💪', hint: 'High protein, nutrient-dense' },
  budget:       { label: 'Budget',       emoji: '💰', hint: 'Max flavor, minimum spend' },
  family:       { label: 'Family',       emoji: '👨‍👩‍👧‍👦', hint: 'Everyone eats the same base meal' },
  lazy:         { label: 'Lazy mode',    emoji: '🛋️', hint: '5-ingredient, one-pot, zero effort' },
};

export type SmartChipId =
  | 'too_expensive'
  | 'too_much_cooking'
  | 'more_protein'
  | 'kid_friendly'
  | 'less_spicy'
  | 'easier_texture'
  | 'picky_safe'
  | 'faster';

export interface SmartChip {
  id: SmartChipId;
  label: string;
  emoji: string;
  /** Only show when household has kids */
  familyOnly?: boolean;
}

export const SMART_CHIPS: SmartChip[] = [
  { id: 'too_expensive',     label: 'Too expensive',     emoji: '💸' },
  { id: 'too_much_cooking',  label: 'Too much cooking',  emoji: '😩' },
  { id: 'more_protein',      label: 'More protein',      emoji: '🥩' },
  { id: 'kid_friendly',      label: 'Kid-friendly',      emoji: '🧒' },
  { id: 'less_spicy',        label: 'Less spicy',        emoji: '🌶️', familyOnly: true },
  { id: 'easier_texture',    label: 'Easier to eat',     emoji: '🥄', familyOnly: true },
  { id: 'picky_safe',        label: 'Picky-eater safe',  emoji: '🛡️', familyOnly: true },
  { id: 'faster',            label: 'Faster',            emoji: '⏱️' },
];

// ============================================================
// Meal Badges — auto-computed from meal + household context
// ============================================================

export type MealBadgeId =
  | 'kid_friendly'
  | 'mild'
  | 'easy_to_eat'
  | 'family_tested'
  | 'picky_approved'
  | 'quick_win';

export interface MealBadge {
  id: MealBadgeId;
  label: string;
  emoji: string;
}

export type KidsAgeGroup = 'baby' | 'toddler' | 'mixed' | 'school_age';

export interface ShareableCard {
  title: string;
  subtitle: string;
  mealTitle: string;
  cuisineEmoji: string;
  totalTime: number;
  difficulty: string;
  servings: number;
  gradient: string;
}

// ============================================================
// Dietary Preferences — 5-pillar aligned
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
  | 'kid_friendly';

// ============================================================
// Scan mode — Pillar 2: Snap & Cook
// ============================================================

export type ScanMode = 'auto' | 'fridge' | 'pantry' | 'receipt';
export type ScanDetectedType = 'fridge' | 'pantry' | 'receipt' | 'unknown';

// ============================================================
// Leftover status — Pillar 4: Leftovers AI
// ============================================================

export type LeftoverStatus = 'active' | 'used' | 'expired' | 'discarded';

// ============================================================
// Budget price tier — Pillar 5: Budget Intelligence
// ============================================================

export type PriceTier = 'budget' | 'mid' | 'premium';
export type PreferredStore = 'instacart' | 'kroger' | 'walmart' | 'whole_foods' | 'generic';

// ============================================================
// Nudge types — cross-pillar contextual prompts
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
  | 'streak_encouragement';
