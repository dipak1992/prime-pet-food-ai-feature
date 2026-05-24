-- ============================================================
-- MealEase AI — Full Database Schema
-- 5 Pillars: Tonight Suggestions, Snap & Cook, Weekly Autopilot,
--            Leftovers AI, Budget Intelligence
--
-- Convention:
--   • All tables use snake_case
--   • All PKs are UUID (gen_random_uuid())
--   • All timestamps are timestamptz
--   • Soft-delete via deleted_at where noted
--   • RLS policies defined per table
--   • Indexes on all FK columns + frequently queried fields
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for fuzzy ingredient name search

-- ============================================================
-- ENUMS
-- ============================================================

create type subscription_tier as enum ('free', 'pro');
create type life_stage as enum ('adult', 'teen', 'kid', 'toddler', 'baby');
create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type budget_level as enum ('low', 'medium', 'high');
create type cooking_time as enum ('quick', 'moderate', 'any');
create type feedback_rating as enum ('loved', 'okay', 'rejected');
create type plan_status as enum ('draft', 'active', 'completed');
create type grocery_category as enum (
  'produce', 'protein', 'dairy', 'grains', 'pantry',
  'frozen', 'beverages', 'spices', 'condiments', 'snacks', 'baby', 'other'
);
create type scan_mode as enum ('auto', 'fridge', 'pantry', 'receipt');
create type scan_detected_type as enum ('fridge', 'pantry', 'receipt', 'unknown');
create type leftover_status as enum ('active', 'used', 'expired', 'discarded');
create type price_tier as enum ('budget', 'mid', 'premium');
create type preferred_store as enum ('instacart', 'kroger', 'walmart', 'whole_foods', 'generic');
create type nudge_type as enum (
  'upgrade', 'onboarding', 'feature_education', 'household_invite',
  'budget_alert', 'leftover_reminder', 'pantry_expiry', 'plan_missing', 'streak_encouragement'
);
create type recipe_source as enum ('ai_generated', 'curated', 'user_saved');
create type tonight_mode as enum ('tired', 'smart', 'ingredients', 'rescue');
create type tonight_outcome as enum ('cooked', 'swapped', 'saved', 'ignored');
create type grocery_export_dest as enum ('instacart', 'amazon_fresh', 'kroger', 'email', 'pdf', 'clipboard');
create type export_status as enum ('pending', 'sent', 'failed');
create type price_source as enum ('instacart_api', 'kroger_api', 'manual', 'estimate');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

create table if not exists profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  full_name             text,
  avatar_url            text,
  subscription_tier     subscription_tier not null default 'free',
  trial_ends_at         timestamptz,
  onboarding_completed  boolean not null default false,
  has_seen_dashboard_tour boolean not null default false,
  zip_code              text,
  timezone              text not null default 'America/Chicago',
  last_active_at        timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists profiles_subscription_tier_idx on profiles(subscription_tier);
create index if not exists profiles_last_active_at_idx on profiles(last_active_at);

-- ============================================================
-- HOUSEHOLDS
-- ============================================================

create table if not exists households (
  id                        uuid primary key default gen_random_uuid(),
  owner_id                  uuid not null references profiles(id) on delete cascade,
  name                      text not null default 'My Household',
  invite_code               text unique,
  adults_count              int not null default 1,
  babies_count              int not null default 0,
  toddlers_count            int not null default 0,
  kids_count                int not null default 0,
  budget_level              budget_level not null default 'medium',
  cooking_time_preference   cooking_time not null default 'moderate',
  cuisine_preferences       text[] not null default '{}',
  low_energy_mode           boolean not null default false,
  one_pot_preference        boolean not null default false,
  leftovers_preference      boolean not null default true,
  pantry_staples            text[] not null default '{}',
  preferred_proteins        text[] not null default '{}',
  meals_per_day             int not null default 1,
  -- Budget Intelligence
  weekly_budget_usd         numeric(8,2),
  budget_strict_mode        boolean not null default false,
  price_tier                price_tier not null default 'mid',
  preferred_store           preferred_store,
  -- Metadata
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  deleted_at                timestamptz
);

create index if not exists households_owner_id_idx on households(owner_id);
create index if not exists households_invite_code_idx on households(invite_code) where invite_code is not null;

-- ============================================================
-- HOUSEHOLD MEMBERS
-- ============================================================

create table if not exists household_members (
  id                    uuid primary key default gen_random_uuid(),
  household_id          uuid not null references households(id) on delete cascade,
  user_id               uuid references profiles(id) on delete set null, -- null for kids/non-users
  display_name          text not null,
  stage                 life_stage not null default 'adult',
  age                   int,
  picky_eater           boolean not null default false,
  school_lunch_needed   boolean not null default false,
  calorie_goal          int,
  protein_goal          text check (protein_goal in ('normal', 'high')),
  weight_goal           text check (weight_goal in ('maintain', 'lose', 'gain')),
  texture_needs         text check (texture_needs in ('normal', 'soft', 'pureed', 'finger_foods')),
  cuisine_preference    text[] not null default '{}',
  disliked_foods        text[] not null default '{}',
  color                 text not null default '#6366f1',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists household_members_household_id_idx on household_members(household_id);
create index if not exists household_members_user_id_idx on household_members(user_id) where user_id is not null;

-- ============================================================
-- MEMBER ALLERGIES
-- ============================================================

create table if not exists member_allergies (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references household_members(id) on delete cascade,
  allergy     text not null,
  severity    text not null default 'avoid' check (severity in ('avoid', 'severe', 'mild')),
  created_at  timestamptz not null default now()
);

create index if not exists member_allergies_member_id_idx on member_allergies(member_id);

-- ============================================================
-- MEMBER CONDITIONS
-- ============================================================

create table if not exists member_conditions (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references household_members(id) on delete cascade,
  condition   text not null,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists member_conditions_member_id_idx on member_conditions(member_id);

-- ============================================================
-- RECIPES (shared across all pillars)
-- ============================================================

create table if not exists recipes (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  name                  text not null,
  description           text not null default '',
  image_url             text,
  prep_time_minutes     int not null default 0,
  cook_time_minutes     int not null default 0,
  total_time_minutes    int generated always as (prep_time_minutes + cook_time_minutes) stored,
  servings              int not null default 4,
  difficulty            text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  cuisine               text,
  tags                  text[] not null default '{}',
  dietary_tags          text[] not null default '{}',
  -- Stored as JSONB for flexibility
  ingredients           jsonb not null default '[]',
  steps                 jsonb not null default '[]',
  nutrition_per_serving jsonb,
  estimated_cost_usd    numeric(8,2),
  source                recipe_source not null default 'ai_generated',
  is_public             boolean not null default false,
  created_by            uuid references profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);

create index if not exists recipes_slug_idx on recipes(slug);
create index if not exists recipes_is_public_idx on recipes(is_public) where is_public = true;
create index if not exists recipes_dietary_tags_idx on recipes using gin(dietary_tags);
create index if not exists recipes_tags_idx on recipes using gin(tags);
create index if not exists recipes_created_by_idx on recipes(created_by) where created_by is not null;
-- Full-text search on recipe name
create index if not exists recipes_name_trgm_idx on recipes using gin(name gin_trgm_ops);

-- ============================================================
-- PLANS (Weekly Autopilot — Pillar 3)
-- ============================================================

create table if not exists plans (
  id                      uuid primary key default gen_random_uuid(),
  household_id            uuid not null references households(id) on delete cascade,
  week_start              date not null,
  week_end                date not null,
  status                  plan_status not null default 'draft',
  is_autopilot_generated  boolean not null default false,
  generation_params       jsonb,
  generation_time_ms      int,
  regeneration_count      int not null default 0,
  total_estimated_cost_usd numeric(8,2),
  accepted_at             timestamptz,
  generated_at            timestamptz not null default now(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists plans_household_id_idx on plans(household_id);
create index if not exists plans_week_start_idx on plans(week_start);
create index if not exists plans_household_week_idx on plans(household_id, week_start);
create index if not exists plans_status_idx on plans(status);

-- ============================================================
-- PLAN DAYS
-- ============================================================

create table if not exists plan_days (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references plans(id) on delete cascade,
  date        date not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists plan_days_plan_id_idx on plan_days(plan_id);
create index if not exists plan_days_date_idx on plan_days(date);

-- ============================================================
-- MEALS
-- ============================================================

create table if not exists meals (
  id                    uuid primary key default gen_random_uuid(),
  plan_day_id           uuid references plan_days(id) on delete set null,
  household_id          uuid not null references households(id) on delete cascade,
  recipe_id             uuid references recipes(id) on delete set null,
  meal_type             meal_type not null default 'dinner',
  title                 text not null,
  description           text not null default '',
  base_ingredients      jsonb not null default '[]',
  base_instructions     jsonb not null default '[]',
  prep_time             int not null default 0,
  cook_time             int not null default 0,
  estimated_cost        numeric(8,2),
  tags                  text[] not null default '{}',
  allergy_notes         jsonb not null default '{}',
  safety_notes          text[] not null default '{}',
  leftover_notes        text,
  lunchbox_notes        text,
  image_url             text,
  family_friendly_score int check (family_friendly_score between 0 and 100),
  -- Tracking
  cooked_at             timestamptz,
  status                text not null default 'planned' check (status in ('planned', 'cooked', 'skipped')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists meals_plan_day_id_idx on meals(plan_day_id) where plan_day_id is not null;
create index if not exists meals_household_id_idx on meals(household_id);
create index if not exists meals_recipe_id_idx on meals(recipe_id) where recipe_id is not null;
create index if not exists meals_cooked_at_idx on meals(cooked_at) where cooked_at is not null;

-- ============================================================
-- MEAL VARIATIONS (per-member adaptations)
-- ============================================================

create table if not exists meal_variations (
  id                    uuid primary key default gen_random_uuid(),
  meal_id               uuid not null references meals(id) on delete cascade,
  member_id             uuid not null references household_members(id) on delete cascade,
  title                 text not null,
  description           text not null default '',
  modifications         text[] not null default '{}',
  ingredients_add       jsonb not null default '[]',
  ingredients_remove    text[] not null default '{}',
  instructions          text[] not null default '{}',
  texture_notes         text,
  safety_notes          text[] not null default '{}',
  serving_size          text,
  lunchbox_adaptation   text,
  created_at            timestamptz not null default now()
);

create index if not exists meal_variations_meal_id_idx on meal_variations(meal_id);
create index if not exists meal_variations_member_id_idx on meal_variations(member_id);

-- ============================================================
-- PANTRY ITEMS
-- ============================================================

create table if not exists pantry_items (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references households(id) on delete cascade,
  name            text not null,
  normalized_name text not null,
  quantity        text,
  unit            text,
  category        grocery_category not null default 'other',
  expiry_date     date,
  added_via       text not null default 'manual' check (added_via in ('manual', 'photo_scan', 'grocery_sync')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists pantry_items_household_id_idx on pantry_items(household_id);
create index if not exists pantry_items_normalized_name_idx on pantry_items(normalized_name);
create index if not exists pantry_items_expiry_date_idx on pantry_items(expiry_date) where expiry_date is not null;
create index if not exists pantry_items_name_trgm_idx on pantry_items using gin(normalized_name gin_trgm_ops);

-- ============================================================
-- SCANS (Pillar 2: Snap & Cook)
-- ============================================================

create table if not exists scans (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references profiles(id) on delete cascade,
  household_id            uuid not null references households(id) on delete cascade,
  image_url               text not null,
  mode                    scan_mode not null default 'auto',
  detected_type           scan_detected_type,
  detected_items          text[] not null default '{}',
  detection_confidence    jsonb not null default '{}',
  result_recipe_ids       uuid[] not null default '{}',
  result_meals            jsonb not null default '[]',
  processing_time_ms      int,
  error                   text,
  created_at              timestamptz not null default now()
);

create index if not exists scans_user_id_idx on scans(user_id);
create index if not exists scans_household_id_idx on scans(household_id);
create index if not exists scans_created_at_idx on scans(created_at);

-- ============================================================
-- TONIGHT SUGGESTIONS (Pillar 1: Tonight Suggestions)
-- ============================================================

create table if not exists tonight_suggestions (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references households(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  recipe_id       uuid references recipes(id) on delete set null,
  meal_data       jsonb,
  mode            tonight_mode not null default 'smart',
  input_text      text,
  applied_chips   text[] not null default '{}',
  outcome         tonight_outcome,
  outcome_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists tonight_suggestions_household_id_idx on tonight_suggestions(household_id);
create index if not exists tonight_suggestions_user_id_idx on tonight_suggestions(user_id);
create index if not exists tonight_suggestions_created_at_idx on tonight_suggestions(created_at);
create index if not exists tonight_suggestions_outcome_idx on tonight_suggestions(outcome) where outcome is not null;

-- ============================================================
-- SAVED MEALS (all 5 pillars)
-- ============================================================

create table if not exists saved_meals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  slug            text not null,
  title           text not null,
  description     text,
  cuisine_type    text,
  meal_data       jsonb not null default '{}',
  pillar_source   text not null default 'tonight'
    check (pillar_source in ('tonight', 'snap', 'weekly', 'leftovers', 'budget', 'saved')),
  tags            text[] not null default '{}',
  image_url       text,
  cost_estimate   numeric(8,2),
  grocery_data    jsonb not null default '[]',
  is_public       boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists saved_meals_user_id_idx on saved_meals(user_id);
create index if not exists saved_meals_pillar_source_idx on saved_meals(user_id, pillar_source);
create index if not exists saved_meals_created_at_idx on saved_meals(user_id, created_at desc);
create index if not exists saved_meals_title_trgm_idx on saved_meals using gin(title gin_trgm_ops);

-- ============================================================
-- LEFTOVERS (Pillar 4: Leftovers AI)
-- ============================================================

create table if not exists leftovers (
  id                          uuid primary key default gen_random_uuid(),
  household_id                uuid not null references households(id) on delete cascade,
  source_meal_id              uuid references meals(id) on delete set null,
  source_recipe_id            uuid references recipes(id) on delete set null,
  display_name                text not null,
  cooked_at                   timestamptz not null,
  estimated_servings_remaining int not null default 2,
  main_ingredients            text[] not null default '{}',
  status                      leftover_status not null default 'active',
  expires_at                  timestamptz not null,
  used_in_recipe_id           uuid references recipes(id) on delete set null,
  used_in_meal_id             uuid references meals(id) on delete set null,
  used_at                     timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists leftovers_household_id_idx on leftovers(household_id);
create index if not exists leftovers_status_idx on leftovers(status);
create index if not exists leftovers_expires_at_idx on leftovers(expires_at);
create index if not exists leftovers_household_status_idx on leftovers(household_id, status);

-- ============================================================
-- LEFTOVER SUGGESTIONS
-- ============================================================

create table if not exists leftover_suggestions (
  id                                  uuid primary key default gen_random_uuid(),
  leftover_id                         uuid not null references leftovers(id) on delete cascade,
  household_id                        uuid not null references households(id) on delete cascade,
  suggestion_title                    text not null,
  suggestion_description              text not null default '',
  estimated_additional_ingredients    text[] not null default '{}',
  estimated_cook_time_minutes         int,
  difficulty                          text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  accepted                            boolean not null default false,
  accepted_at                         timestamptz,
  created_at                          timestamptz not null default now()
);

create index if not exists leftover_suggestions_leftover_id_idx on leftover_suggestions(leftover_id);
create index if not exists leftover_suggestions_household_id_idx on leftover_suggestions(household_id);

-- ============================================================
-- BUDGET SETTINGS (Pillar 5: Budget Intelligence)
-- ============================================================

create table if not exists budget_settings (
  id                  uuid primary key default gen_random_uuid(),
  household_id        uuid not null unique references households(id) on delete cascade,
  weekly_budget_usd   numeric(8,2),
  is_strict_mode      boolean not null default false,
  zip_code            text,
  preferred_store     preferred_store,
  price_tier          price_tier not null default 'mid',
  updated_at          timestamptz not null default now()
);

create index if not exists budget_settings_household_id_idx on budget_settings(household_id);

-- ============================================================
-- WEEKLY SPEND
-- ============================================================

create table if not exists weekly_spend (
  id                    uuid primary key default gen_random_uuid(),
  household_id          uuid not null references households(id) on delete cascade,
  week_start_date       date not null,
  estimated_total_usd   numeric(8,2) not null default 0,
  actual_total_usd      numeric(8,2),
  meals_count           int not null default 0,
  cost_per_meal_usd     numeric(8,2) not null default 0,
  under_budget          boolean,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (household_id, week_start_date)
);

create index if not exists weekly_spend_household_id_idx on weekly_spend(household_id);
create index if not exists weekly_spend_week_start_date_idx on weekly_spend(week_start_date);

-- ============================================================
-- INGREDIENT PRICES (Budget Intelligence — price lookup)
-- ============================================================

create table if not exists ingredient_prices (
  id                  uuid primary key default gen_random_uuid(),
  ingredient_name     text not null,
  normalized_name     text not null,
  zip_code            text not null,
  store               text not null,
  price_usd           numeric(8,2) not null,
  unit                text not null,
  quantity            numeric(8,3) not null default 1,
  price_per_unit_usd  numeric(8,4) generated always as (price_usd / nullif(quantity, 0)) stored,
  fetched_at          timestamptz not null default now(),
  source              price_source not null default 'estimate',
  unique (normalized_name, zip_code, store)
);

create index if not exists ingredient_prices_normalized_name_idx on ingredient_prices(normalized_name);
create index if not exists ingredient_prices_zip_code_idx on ingredient_prices(zip_code);
create index if not exists ingredient_prices_fetched_at_idx on ingredient_prices(fetched_at);
create index if not exists ingredient_prices_name_trgm_idx on ingredient_prices using gin(normalized_name gin_trgm_ops);

-- ============================================================
-- GROCERY LISTS
-- ============================================================

create table if not exists grocery_lists (
  id                uuid primary key default gen_random_uuid(),
  plan_id           uuid references plans(id) on delete set null,
  household_id      uuid not null references households(id) on delete cascade,
  estimated_total   numeric(8,2) not null default 0,
  generated_at      timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists grocery_lists_household_id_idx on grocery_lists(household_id);
create index if not exists grocery_lists_plan_id_idx on grocery_lists(plan_id) where plan_id is not null;

-- ============================================================
-- GROCERY ITEMS
-- ============================================================

create table if not exists grocery_items (
  id                    uuid primary key default gen_random_uuid(),
  grocery_list_id       uuid not null references grocery_lists(id) on delete cascade,
  name                  text not null,
  quantity              text not null default '1',
  unit                  text not null default '',
  category              grocery_category not null default 'other',
  estimated_cost        numeric(8,2) not null default 0,
  checked               boolean not null default false,
  owned_in_pantry       boolean not null default false,
  meal_usage            text[] not null default '{}',
  substitution_options  text[] not null default '{}',
  added_manually        boolean not null default false,
  created_at            timestamptz not null default now()
);

create index if not exists grocery_items_grocery_list_id_idx on grocery_items(grocery_list_id);
create index if not exists grocery_items_category_idx on grocery_items(category);

-- ============================================================
-- GROCERY EXPORTS
-- ============================================================

create table if not exists grocery_exports (
  id                    uuid primary key default gen_random_uuid(),
  grocery_list_id       uuid not null references grocery_lists(id) on delete cascade,
  household_id          uuid not null references households(id) on delete cascade,
  destination           grocery_export_dest not null,
  status                export_status not null default 'pending',
  external_cart_url     text,
  item_count            int not null default 0,
  estimated_total_usd   numeric(8,2) not null default 0,
  exported_at           timestamptz,
  created_at            timestamptz not null default now()
);

create index if not exists grocery_exports_grocery_list_id_idx on grocery_exports(grocery_list_id);
create index if not exists grocery_exports_household_id_idx on grocery_exports(household_id);

-- ============================================================
-- MEAL FEEDBACK
-- ============================================================

create table if not exists meal_feedback (
  id              uuid primary key default gen_random_uuid(),
  meal_id         uuid references meals(id) on delete set null,
  member_id       uuid references household_members(id) on delete set null,
  household_id    uuid not null references households(id) on delete cascade,
  rating          feedback_rating not null,
  effort_rating   text check (effort_rating in ('easy', 'moderate', 'hard')),
  cost_rating     text check (cost_rating in ('affordable', 'pricey')),
  notes           text,
  child_refused   boolean not null default false,
  texture_issue   boolean not null default false,
  symptom_noticed boolean not null default false,
  symptom_notes   text,
  created_at      timestamptz not null default now()
);

create index if not exists meal_feedback_meal_id_idx on meal_feedback(meal_id) where meal_id is not null;
create index if not exists meal_feedback_household_id_idx on meal_feedback(household_id);
create index if not exists meal_feedback_member_id_idx on meal_feedback(member_id) where member_id is not null;

-- ============================================================
-- CONTEXTUAL NUDGES
-- ============================================================

create table if not exists contextual_nudges (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  type          nudge_type not null,
  priority      int not null default 0,
  title         text not null,
  description   text not null default '',
  cta_label     text not null,
  cta_action    text not null,
  dismissible   boolean not null default true,
  shown_at      timestamptz,
  dismissed_at  timestamptz,
  clicked_at    timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists contextual_nudges_user_id_idx on contextual_nudges(user_id);
create index if not exists contextual_nudges_type_idx on contextual_nudges(type);
create index if not exists contextual_nudges_priority_idx on contextual_nudges(user_id, priority desc);
create index if not exists contextual_nudges_active_idx on contextual_nudges(user_id)
  where dismissed_at is null and (expires_at is null or expires_at > now());

-- ============================================================
-- SUBSCRIPTIONS (Stripe-backed)
-- ============================================================

create table if not exists user_subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references profiles(id) on delete cascade,
  tier                    subscription_tier not null default 'free',
  status                  text not null default 'active' check (status in ('active', 'cancelled', 'expired', 'trial')),
  started_at              timestamptz not null default now(),
  expires_at              timestamptz,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists user_subscriptions_user_id_idx on user_subscriptions(user_id);
create index if not exists user_subscriptions_stripe_customer_id_idx on user_subscriptions(stripe_customer_id) where stripe_customer_id is not null;
create index if not exists user_subscriptions_status_idx on user_subscriptions(status);

-- ============================================================
-- PUSH SUBSCRIPTIONS (Web Push / VAPID)
-- ============================================================

create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on push_subscriptions(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to all tables with updated_at
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'households', 'household_members',
    'recipes', 'plans', 'meals',
    'pantry_items', 'leftovers',
    'budget_settings', 'weekly_spend',
    'grocery_lists', 'user_subscriptions'
  ] loop
    execute format(
      'create trigger set_updated_at before update on %I
       for each row execute function set_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all user-owned tables
alter table profiles              enable row level security;
alter table households            enable row level security;
alter table household_members     enable row level security;
alter table member_allergies      enable row level security;
alter table member_conditions     enable row level security;
alter table recipes               enable row level security;
alter table plans                 enable row level security;
alter table plan_days             enable row level security;
alter table meals                 enable row level security;
alter table meal_variations       enable row level security;
alter table pantry_items          enable row level security;
alter table scans                 enable row level security;
alter table tonight_suggestions   enable row level security;
alter table saved_meals           enable row level security;
alter table leftovers             enable row level security;
alter table leftover_suggestions  enable row level security
