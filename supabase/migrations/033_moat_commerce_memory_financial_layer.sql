-- Phase 3 moat building: localized commerce, durable behavior learning, and financial impact.

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'grocery_handoffs'
  ) then
    alter table public.grocery_handoffs
      drop constraint if exists grocery_handoffs_provider_check;

    alter table public.grocery_handoffs
      add constraint grocery_handoffs_provider_check
      check (
        provider in (
          'instacart',
          'amazon_fresh',
          'walmart_us',
          'walmart_ca',
          'kroger',
          'costco_us',
          'costco_ca',
          'regional_market',
          'generic'
        )
      );
  end if;
end $$;

create table if not exists public.household_behavior_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  pattern_type text not null check (
    pattern_type in (
      'repeat_meal',
      'rejected_meal',
      'busy_night',
      'budget_pressure',
      'store_preference',
      'leftover_reuse',
      'pantry_decay'
    )
  ),
  subject text not null,
  normalized_subject text not null,
  signal_count integer not null default 1 check (signal_count >= 0),
  confidence numeric(4,3) not null default 0.500 check (confidence >= 0 and confidence <= 1),
  details jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, pattern_type, normalized_subject)
);

create index if not exists household_behavior_patterns_user_type_idx
  on public.household_behavior_patterns(user_id, pattern_type, confidence desc);

create index if not exists household_behavior_patterns_household_seen_idx
  on public.household_behavior_patterns(household_id, last_seen_at desc)
  where household_id is not null;

alter table public.household_behavior_patterns enable row level security;

drop policy if exists "household_behavior_patterns_select_own" on public.household_behavior_patterns;
create policy "household_behavior_patterns_select_own"
  on public.household_behavior_patterns for select
  using (auth.uid() = user_id or public.is_household_participant(household_id));

drop policy if exists "household_behavior_patterns_insert_own" on public.household_behavior_patterns;
create policy "household_behavior_patterns_insert_own"
  on public.household_behavior_patterns for insert
  with check (auth.uid() = user_id or public.is_household_editor(household_id));

drop policy if exists "household_behavior_patterns_update_own" on public.household_behavior_patterns;
create policy "household_behavior_patterns_update_own"
  on public.household_behavior_patterns for update
  using (auth.uid() = user_id or public.is_household_editor(household_id))
  with check (auth.uid() = user_id or public.is_household_editor(household_id));

create table if not exists public.household_financial_impact (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  week_start date not null,
  estimated_waste_saved_usd numeric(10,2) not null default 0,
  estimated_budget_saved_usd numeric(10,2) not null default 0,
  takeout_avoided_count integer not null default 0,
  leftovers_reused_count integer not null default 0,
  grocery_handoff_count integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists household_financial_impact_user_week_idx
  on public.household_financial_impact(user_id, week_start desc);

alter table public.household_financial_impact enable row level security;

drop policy if exists "household_financial_impact_select_own" on public.household_financial_impact;
create policy "household_financial_impact_select_own"
  on public.household_financial_impact for select
  using (auth.uid() = user_id or public.is_household_participant(household_id));

drop policy if exists "household_financial_impact_insert_own" on public.household_financial_impact;
create policy "household_financial_impact_insert_own"
  on public.household_financial_impact for insert
  with check (auth.uid() = user_id or public.is_household_editor(household_id));

drop policy if exists "household_financial_impact_update_own" on public.household_financial_impact;
create policy "household_financial_impact_update_own"
  on public.household_financial_impact for update
  using (auth.uid() = user_id or public.is_household_editor(household_id))
  with check (auth.uid() = user_id or public.is_household_editor(household_id));
