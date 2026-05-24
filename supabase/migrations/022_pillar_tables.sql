-- ============================================================
-- Migration 022: 5-Pillar Tables
-- MealEase AI — Tonight Suggestions, Snap & Cook, Weekly Autopilot,
--               Leftovers AI, Budget Intelligence
--
-- This migration adds NEW tables only.
-- Existing tables (profiles, households, household_members, plans,
-- meals, pantry_items, grocery_lists, etc.) are already covered
-- by migrations 001–021.
--
-- DOWN migration at bottom of file.
-- ============================================================

-- ============================================================
-- NEW ENUMS (only those not already defined)
-- ============================================================

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
-- RECIPES
-- Shared across all pillars — canonical recipe store
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
  created_by            uuid references auth.users(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);

create index if not exists recipes_slug_idx on recipes(slug);
create index if not exists recipes_is_public_idx on recipes(is_public) where is_public = true;
create index if not exists recipes_dietary_tags_idx on recipes using gin(dietary_tags);
create index if not exists recipes_tags_idx on recipes using gin(tags);
create index if not exists recipes_created_by_idx on recipes(created_by) where created_by is not null;

-- ============================================================
-- SCANS — Pillar 2: Snap & Cook
-- ============================================================

create table if not exists scans (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  household_id          uuid not null references households(id) on delete cascade,
  image_url             text not null,
  mode                  scan_mode not null default 'auto',
  detected_type         scan_detected_type,
  detected_items        text[] not null default '{}',
  detection_confidence  jsonb not null default '{}',
  result_recipe_ids     uuid[] not null default '{}',
  result_meals          jsonb not null default '[]',
  processing_time_ms    int,
  error                 text,
  created_at            timestamptz not null default now()
);

create index if not exists scans_user_id_idx on scans(user_id);
create index if not exists scans_household_id_idx on scans(household_id);
create index if not exists scans_created_at_idx on scans(created_at);

-- ============================================================
-- TONIGHT SUGGESTIONS — Pillar 1: Tonight Suggestions
-- ============================================================

create table if not exists tonight_suggestions (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  recipe_id     uuid references recipes(id) on delete set null,
  meal_data     jsonb,
  mode          tonight_mode not null default 'smart',
  input_text    text,
  applied_chips text[] not null default '{}',
  outcome       tonight_outcome,
  outcome_at    timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists tonight_suggestions_household_id_idx on tonight_suggestions(household_id);
create index if not exists tonight_suggestions_user_id_idx on tonight_suggestions(user_id);
create index if not exists tonight_suggestions_created_at_idx on tonight_suggestions(created_at);
create index if not exists tonight_suggestions_outcome_idx on tonight_suggestions(outcome) where outcome is not null;

-- ============================================================
-- LEFTOVERS — Pillar 4: Leftovers AI
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
  id                                uuid primary key default gen_random_uuid(),
  leftover_id                       uuid not null references leftovers(id) on delete cascade,
  household_id                      uuid not null references households(id) on delete cascade,
  suggestion_title                  text not null,
  suggestion_description            text not null default '',
  estimated_additional_ingredients  text[] not null default '{}',
  estimated_cook_time_minutes       int,
  difficulty                        text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  accepted                          boolean not null default false,
  accepted_at                       timestamptz,
  created_at                        timestamptz not null default now()
);

create index if not exists leftover_suggestions_leftover_id_idx on leftover_suggestions(leftover_id);
create index if not exists leftover_suggestions_household_id_idx on leftover_suggestions(household_id);

-- ============================================================
-- BUDGET SETTINGS — Pillar 5: Budget Intelligence
-- ============================================================

create table if not exists budget_settings (
  id                uuid primary key default gen_random_uuid(),
  household_id      uuid not null unique references households(id) on delete cascade,
  weekly_budget_usd numeric(8,2),
  is_strict_mode    boolean not null default false,
  zip_code          text,
  preferred_store   preferred_store,
  price_tier        price_tier not null default 'mid',
  updated_at        timestamptz not null default now()
);

create index if not exists budget_settings_household_id_idx on budget_settings(household_id);

-- ============================================================
-- WEEKLY SPEND
-- ============================================================

create table if not exists weekly_spend (
  id                  uuid primary key default gen_random_uuid(),
  household_id        uuid not null references households(id) on delete cascade,
  week_start_date     date not null,
  estimated_total_usd numeric(8,2) not null default 0,
  actual_total_usd    numeric(8,2),
  meals_count         int not null default 0,
  cost_per_meal_usd   numeric(8,2) not null default 0,
  under_budget        boolean,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (household_id, week_start_date)
);

create index if not exists weekly_spend_household_id_idx on weekly_spend(household_id);
create index if not exists weekly_spend_week_start_date_idx on weekly_spend(week_start_date);

-- ============================================================
-- INGREDIENT PRICES (Budget Intelligence — cost lookup)
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

-- ============================================================
-- GROCERY EXPORTS
-- ============================================================

create table if not exists grocery_exports (
  id                  uuid primary key default gen_random_uuid(),
  grocery_list_id     uuid not null references grocery_lists(id) on delete cascade,
  household_id        uuid not null references households(id) on delete cascade,
  destination         grocery_export_dest not null,
  status              export_status not null default 'pending',
  external_cart_url   text,
  item_count          int not null default 0,
  estimated_total_usd numeric(8,2) not null default 0,
  exported_at         timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists grocery_exports_grocery_list_id_idx on grocery_exports(grocery_list_id);
create index if not exists grocery_exports_household_id_idx on grocery_exports(household_id);

-- ============================================================
-- CONTEXTUAL NUDGES
-- ============================================================

create table if not exists contextual_nudges (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
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
-- UPDATED_AT TRIGGER — apply to new tables
-- (set_updated_at() function already exists from earlier migrations)
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on recipes
  for each row execute function set_updated_at();

create trigger set_updated_at before update on leftovers
  for each row execute function set_updated_at();

create trigger set_updated_at before update on weekly_spend
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table recipes               enable row level security;
alter table scans                 enable row level security;
alter table tonight_suggestions   enable row level security;
alter table leftovers             enable row level security;
alter table leftover_suggestions  enable row level security;
alter table budget_settings       enable row level security;
alter table weekly_spend          enable row level security;
alter table ingredient_prices     enable row level security;
alter table grocery_exports       enable row level security;
alter table contextual_nudges     enable row level security;

-- Recipes: public recipes readable by all; private only by creator
create policy "Public recipes are readable by everyone"
  on recipes for select using (is_public = true or created_by = auth.uid());

create policy "Users can insert their own recipes"
  on recipes for insert with check (created_by = auth.uid());

create policy "Users can update their own recipes"
  on recipes for update using (created_by = auth.uid());

-- Scans: users see only their own
create policy "Users see their own scans"
  on scans for all using (user_id = auth.uid());

-- Tonight suggestions: household-scoped
create policy "Household members see tonight suggestions"
  on tonight_suggestions for all using (
    household_id in (
      select id from households where owner_id = auth.uid()
      union
      select household_id from household_members where user_id = auth.uid()
    )
  );

-- Leftovers: household-scoped
create policy "Household members see leftovers"
  on leftovers for all using (
    household_id in (
      select id from households where owner_id = auth.uid()
      union
      select household_id from household_members where user_id = auth.uid()
    )
  );

-- Leftover suggestions: household-scoped
create policy "Household members see leftover suggestions"
  on leftover_suggestions for all using (
    household_id in (
      select id from households where owner_id = auth.uid()
      union
      select household_id from household_members where user_id = auth.uid()
    )
  );

-- Budget settings: household owner only
create policy "Household owner manages budget settings"
  on budget_settings for all using (
    household_id in (select id from households where owner_id = auth.uid())
  );

-- Weekly spend: household-scoped
create policy "Household members see weekly spend"
  on weekly_spend for all using (
    household_id in (
      select id from households where owner_id = auth.uid()
      union
      select household_id from household_members where user_id = auth.uid()
    )
  );

-- Ingredient prices: readable by all authenticated users
create policy "Authenticated users can read ingredient prices"
  on ingredient_prices for select using (auth.role() = 'authenticated');

-- Grocery exports: household-scoped
create policy "Household members see grocery exports"
  on grocery_exports for all using (
    household_id in (
      select id from households where owner_id = auth.uid()
      union
      select household_id from household_members where user_id = auth.uid()
    )
  );

-- Contextual nudges: user-scoped
create policy "Users see their own nudges"
  on contextual_nudges for all using (user_id = auth.uid());

-- ============================================================
-- SEED DATA PLACEHOLDER
-- Uncomment and populate before running in staging/prod
-- ============================================================

-- insert into ingredient_prices (ingredient_name, normalized_name, zip_code, store, price_usd, unit, quantity, source)
-- values
--   ('Chicken breast', 'chicken breast', '00000', 'generic', 5.99, 'lb', 1, 'estimate'),
--   ('Ground beef', 'ground beef', '00000', 'generic', 6.49, 'lb', 1, 'estimate'),
--   ('Salmon fillet', 'salmon fillet', '00000', 'generic', 9.99, 'lb', 1, 'estimate');

-- ============================================================
-- DOWN MIGRATION
-- Run this to reverse migration 022 completely
-- ============================================================

-- drop table if exists contextual_nudges cascade;
-- drop table if exists grocery_exports cascade;
-- drop table if exists ingredient_prices cascade;
-- drop table if exists weekly_spend cascade;
-- drop table if exists budget_settings cascade;
-- drop table if exists leftover_suggestions cascade;
-- drop table if exists leftovers cascade;
-- drop table if exists tonight_suggestions cascade;
-- drop table if exists scans cascade;
-- drop table if exists recipes cascade;
-- drop type if exists price_source;
-- drop type if exists export_status;
-- drop type if exists grocery_export_dest;
-- drop type if exists tonight_outcome;
-- drop type if exists tonight_mode;
-- drop type if exists recipe_source;
-- drop type if exists nudge_type;
-- drop type if exists preferred_store;
-- drop type if exists price_tier;
-- drop type if exists leftover_status;
-- drop type if exists scan_detected_type;
-- drop type if exists scan_mode;
