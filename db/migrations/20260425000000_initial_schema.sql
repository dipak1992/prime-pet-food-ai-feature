-- ============================================================
-- MealEase AI — Initial Schema Migration
-- Timestamp: 20260425000000
-- Description: Full 5-pillar schema from clean state
--
-- Pillars:
--   1. Tonight Suggestions  — "What's for dinner?"
--   2. Snap & Cook          — "What's in my fridge?"
--   3. Weekly Autopilot     — "What's this week?"
--   4. Leftovers AI         — "What do I do with leftovers?"
--   5. Budget Intelligence  — "What will it cost me?"
--
-- Run: psql $DATABASE_URL -f this_file.sql
-- Rollback: see DOWN MIGRATION at bottom of file
-- ============================================================

-- ============================================================
-- UP MIGRATION
-- ============================================================

begin;

-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- fuzzy ingredient name search

-- ============================================================
-- ENUMS
-- ============================================================

do $$ begin
  create type subscription_tier as enum ('free', 'pro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type life_stage as enum ('adult', 'teen', 'kid', 'toddler', 'baby');
exception when duplicate_object then null; end $$;

do $$ begin
  create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');
exception when duplicate_object then null; end $$;

do $$ begin
  create type budget_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cooking_time as enum ('quick', 'moderate', 'any');
exception when duplicate_object then null; end $$;

do $$ begin
  create type feedback_rating as enum ('loved', 'okay', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_status as enum ('draft', 'active', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type grocery_category as enum (
    'produce', 'protein', 'dairy', 'grains', 'pantry',
    'frozen', 'beverages', 'spices', 'condiments', 'snacks', 'baby', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type scan_mode as enum ('auto', 'fridge', 'pantry', 'receipt');
exception when duplicate_object then null; end $$;

do $$ begin
  create type scan_detected_type as enum ('fridge', 'pantry', 'receipt', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type leftover_status as enum ('active', 'used', 'expired', 'discarded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type price_tier as enum ('budget', 'mid', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type preferred_store as enum ('instacart', 'kroger', 'walmart', 'whole_foods', 'generic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type nudge_type as enum (
    'upgrade', 'onboarding', 'feature_education', 'household_invite',
    'budget_alert', 'leftover_reminder', 'pantry_expiry', 'plan_missing', 'streak_encouragement'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type recipe_source as enum ('ai_generated', 'curated', 'user_saved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tonight_mode as enum ('tired', 'smart', 'ingredients', 'rescue');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tonight_outcome as enum ('cooked', 'swapped', 'saved', 'ignored');
exception when duplicate_object then null; end $$;

do $$ begin
  create type grocery_export_dest as enum ('instacart', 'amazon_fresh', 'kroger', 'email', 'pdf', 'clipboard');
exception when duplicate_object then null; end $$;

do $$ begin
  create type export_status as enum ('pending', 'sent', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type price_source as enum ('instacart_api', 'kroger_api', 'manual', 'estimate');
exception when duplicate_object then null; end $$;

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

create table if not exists profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  email                   text not null,
  full_name               text,
  avatar_url              text,
  subscription_tier       subscription_tier not null default 'free',
  trial_ends_at           timestamptz,
  onboarding_completed    boolean not null default false,
  has_seen_dashboard_tour boolean not null default false,
  zip_code                text,
  timezone                text not null default 'America/Chicago',
  last_active_at          timestamptz,
  -- Stripe
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  plan_renews_at          timestamptz,
  temp_pro_until          timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists profiles_subscription_tier_idx on profiles(subscription_tier);
create index if not exists profiles_last_active_at_idx on profiles(last_active_at);
create index if not exists profiles_stripe_customer_id_idx on profiles(stripe_customer_id) where stripe_customer_id is not null;

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
  cooking_skill_level       text not null default 'comfortable'
                              check (cooking_skill_level in ('beginner', 'comfortable', 'confident')),
  cuisine_preferences       text[] not null default '{}',
  low_energy_mode           boolean not null default false,
  one_pot_preference        boolean not null default false,
  leftovers_preference      boolean not null default true,
  pantry_staples            text[] not null default '{}',
  preferred_proteins        text[] not null default '{}',
  meals_per_day             int not null default 1,
  -- Budget Intelligence (Pillar 5)
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
  user_id               uuid references profiles(id) on delete set null,
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
create index if not exists recipes_name_trgm_idx on recipes using gin(name gin_trgm_ops);

-- ============================================================
-- PLANS (Pillar 3: Weekly Autopilot)
-- ============================================================

create table if not exists plans (
  id                        uuid primary key default gen_random_uuid(),
  household_id              uuid not null references households(id) on delete cascade,
  week_start                date not null,
  week_end                  date not null,
  status                    plan_status not null default 'draft',
  is_autopilot_generated    boolean not null default false,
  generation_params         jsonb,
  generation_time_ms        int,
  regeneration_count        int not null default 0,
  total_estimated_cost_usd  numeric(8,2),
  accepted_at               timestamptz,
  generated_at              timestamptz not null default now(),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
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
-- LEFTOVERS (Pillar 4: Leftovers AI)
-- ============================================================

create table if not exists leftovers (
  id                            uuid primary key default gen_random_uuid(),
  household_id                  uuid not null references households(id) on delete cascade,
  source_meal_id                uuid references meals(id) on delete set null,
  source_recipe_id              uuid references recipes(id) on delete set null,
  display_name                  text not null,
  cooked_at                     timestamptz not null,
  estimated_servings_remaining  int not null default 2,
  main_ingredients              text[] not null default '{}',
  status                        leftover_status not null default 'active',
  expires_at                    timestamptz not null,
  used_in_recipe_id             uuid references recipes(id) on delete set null,
  used_in_meal_id               uuid references meals(id) on delete set null,
  used_at                       timestamptz,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
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

-- Apply trigger to all tables with updated_at
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
      'drop trigger if exists set_updated_at on %I;
       create trigger set_updated_at before update on %I
       for each row execute function set_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

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
alter table leftovers             enable row level security;
alter table leftover_suggestions  enable row level security;
alter table budget_settings       enable row level security;
alter table weekly_spend          enable row level security;
alter table ingredient_prices     enable row level security;
alter table grocery_lists         enable row level security;
alter table grocery_items         enable row level security;
alter table grocery_exports       enable row level security;
alter table meal_feedback         enable row level security;
alter table contextual_nudges     enable row level security;
alter table user_subscriptions    enable row level security;
alter table push_subscriptions    enable row level security;

-- Profiles: users can only read/write their own row
create policy "profiles: own row" on profiles
  for all using (auth.uid() = id);

-- Households: owner can do everything; members can read
create policy "households: owner full access" on households
  for all using (auth.uid() = owner_id);

create policy "households: members can read" on households
  for select using (
    exists (
      select 1 from household_members
      where household_members.household_id = households.id
        and household_members.user_id = auth.uid()
    )
  );

-- Household members: scoped to household owner or self
create policy "household_members: household owner" on household_members
  for all using (
    exists (
      select 1 from households
      where households.id = household_members.household_id
        and households.owner_id = auth.uid()
    )
  );

-- Generic household-scoped policy helper (used for most tables)
-- Each table below: user must own the household
create policy "member_allergies: household owner" on member_allergies
  for all using (
    exists (
      select 1 from household_members hm
      join households h on h.id = hm.household_id
      where hm.id = member_allergies.member_id and h.owner_id = auth.uid()
    )
  );

create policy "member_conditions: household owner" on member_conditions
  for all using (
    exists (
      select 1 from household_members hm
      join households h on h.id = hm.household_id
      where hm.id = member_conditions.member_id and h.owner_id = auth.uid()
    )
  );

-- Recipes: public recipes readable by all; private by creator
create policy "recipes: public readable" on recipes
  for select using (is_public = true or created_by = auth.uid());

create policy "recipes: creator full access" on recipes
  for all using (created_by = auth.uid());

-- Plans, meals, pantry, scans, leftovers, grocery, feedback, nudges:
-- scoped to household owner
create policy "plans: household owner" on plans
  for all using (
    exists (select 1 from households where id = plans.household_id and owner_id = auth.uid())
  );

create policy "plan_days: household owner" on plan_days
  for all using (
    exists (
      select 1 from plans p
      join households h on h.id = p.household_id
      where p.id = plan_days.plan_id and h.owner_id = auth.uid()
    )
  );

create policy "meals: household owner" on meals
  for all using (
    exists (select 1 from households where id = meals.household_id and owner_id = auth.uid())
  );

create policy "meal_variations: household owner" on meal_variations
  for all using (
    exists (
      select 1 from meals m
      join households h on h.id = m.household_id
      where m.id = meal_variations.meal_id and h.owner_id = auth.uid()
    )
  );

create policy "pantry_items: household owner" on pantry_items
  for all using (
    exists (select 1 from households where id = pantry_items.household_id and owner_id = auth.uid())
  );

create policy "scans: own scans" on scans
  for all using (auth.uid() = user_id);

create policy "tonight_suggestions: own" on tonight_suggestions
  for all using (auth.uid() = user_id);

create policy "leftovers: household owner" on leftovers
  for all using (
    exists (select 1 from households where id = leftovers.household_id and owner_id = auth.uid())
  );

create policy "leftover_suggestions: household owner" on leftover_suggestions
  for all using (
    exists (select 1 from households where id = leftover_suggestions.household_id and owner_id = auth.uid())
  );

create policy "budget_settings: household owner" on budget_settings
  for all using (
    exists (select 1 from households where id = budget_settings.household_id and owner_id = auth.uid())
  );

create policy "weekly_spend: household owner" on weekly_spend
  for all using (
    exists (select 1 from households where id = weekly_spend.household_id and owner_id = auth.uid())
  );

-- Ingredient prices: readable by all authenticated users
create policy "ingredient_prices: authenticated read" on ingredient_prices
  for select using (auth.role() = 'authenticated');

create policy "grocery_lists: household owner" on grocery_lists
  for all using (
    exists (select 1 from households where id = grocery_lists.household_id and owner_id = auth.uid())
  );

create policy "grocery_items: household owner" on grocery_items
  for all using (
    exists (
      select 1 from grocery_lists gl
      join households h on h.id = gl.household_id
      where gl.id = grocery_items.grocery_list_id and h.owner_id = auth.uid()
    )
  );

create policy "grocery_exports: household owner" on grocery_exports
  for all using (
    exists (select 1 from households where id = grocery_exports.household_id and owner_id = auth.uid())
  );

create policy "meal_feedback: household owner" on meal_feedback
  for all using (
    exists (select 1 from households where id = meal_feedback.household_id and owner_id = auth.uid())
  );

create policy "contextual_nudges: own" on contextual_nudges
  for all using (auth.uid() = user_id);

create policy "user_subscriptions: own" on user_subscriptions
  for all using (auth.uid() = user_id);

create policy "push_subscriptions: own" on push_subscriptions
  for all using (auth.uid() = user_id);

-- ============================================================
-- SEED DATA PLACEHOLDER
-- ============================================================

-- Uncomment and populate before running in staging/production:
--
-- insert into recipes (slug, name, description, prep_time_minutes, cook_time_minutes, servings, difficulty, source, is_public)
-- values
--   ('quick-pasta-primavera', 'Quick Pasta Primavera', 'A fast weeknight pasta with seasonal vegetables.', 10, 15, 4, 'easy', 'curated', true),
--   ('sheet-pan-chicken', 'Sheet Pan Chicken & Veggies', 'One pan, minimal cleanup, maximum flavor.', 10, 35, 4, 'easy', 'curated', true);

commit;

-- ============================================================
-- DOWN MIGRATION (rollback)
-- Run: psql $DATABASE_URL -f this_file.sql --variable=direction=down
-- Or copy-paste the section below manually.
-- ============================================================

-- begin;
--
-- drop table if exists push_subscriptions cascade;
-- drop table if exists user_subscriptions cascade;
-- drop table if exists contextual_nudges cascade;
-- drop table if exists meal_feedback cascade;
-- drop table if exists grocery_exports cascade;
-- drop table if exists grocery_items cascade;
-- drop table if exists grocery_lists cascade;
-- drop table if exists ingredient_prices cascade;
-- drop table if exists weekly_spend cascade;
-- drop table if exists budget_settings cascade;
-- drop table if exists leftover_suggestions cascade;
-- drop table if exists leftovers cascade;
-- drop table if exists tonight_suggestions cascade;
-- drop table if exists scans cascade;
-- drop table if exists pantry_items cascade;
-- drop table if exists meal_variations cascade;
-- drop table if exists meals cascade;
-- drop table if exists plan_days cascade;
-- drop table if exists plans cascade;
-- drop table if exists recipes cascade;
-- drop table if exists member_conditions cascade;
-- drop table if exists member_allergies cascade;
-- drop table if exists household_members cascade;
-- drop table if exists households cascade;
-- drop table if exists profiles cascade;
--
-- drop function if exists set_updated_at cascade;
--
-- drop type if exists push_subscriptions cascade;
-- drop type if exists export_status cascade;
-- drop type if exists grocery_export_dest cascade;
-- drop type if exists tonight_outcome cascade;
-- drop type if exists tonight_mode cascade;
-- drop type if exists recipe_source cascade;
-- drop type if exists nudge_type cascade;
-- drop type if exists preferred_store cascade;
-- drop type if exists price_tier cascade;
-- drop type if exists leftover_status cascade;
-- drop type if exists scan_detected_type cascade;
-- drop type if exists scan_mode cascade;
-- drop type if exists grocery_category cascade;
-- drop type if exists plan_status cascade;
-- drop type if exists feedback_rating cascade;
-- drop type if exists cooking_time cascade;
-- drop type if exists budget_level cascade;
-- drop type if exists meal_type cascade;
-- drop type if exists life_stage cascade;
-- drop type if exists subscription_tier cascade;
--
-- commit;
