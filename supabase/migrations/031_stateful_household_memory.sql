-- Stateful household memory for durable meal planning context.
-- Stores long-lived facts Copilot and the meal engines can reuse across sessions.

create table if not exists public.household_memory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  memory_type text not null check (
    memory_type in (
      'like',
      'dislike',
      'schedule',
      'budget',
      'cooking_time',
      'allergy',
      'calorie_goal',
      'household_rule',
      'pantry_inventory',
      'leftover_inventory'
    )
  ),
  subject text not null,
  normalized_subject text not null,
  details jsonb not null default '{}'::jsonb,
  strength numeric(4,3) not null default 0.700 check (strength >= 0 and strength <= 1),
  source text not null default 'copilot',
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, memory_type, normalized_subject)
);

create index if not exists household_memory_items_user_seen_idx
  on public.household_memory_items(user_id, last_seen_at desc);

create index if not exists household_memory_items_user_type_idx
  on public.household_memory_items(user_id, memory_type, strength desc);

create index if not exists household_memory_items_expiry_idx
  on public.household_memory_items(user_id, expires_at)
  where expires_at is not null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pantry_items' and column_name = 'user_id'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'pantry_items' and column_name = 'expires_at'
  ) then
    create index if not exists pantry_items_user_expires_idx
      on public.pantry_items(user_id, expires_at)
      where expires_at is not null;
  end if;
end $$;

alter table public.household_memory_items enable row level security;

drop policy if exists "household_memory_items_select_own" on public.household_memory_items;
create policy "household_memory_items_select_own"
  on public.household_memory_items for select
  using (auth.uid() = user_id);

drop policy if exists "household_memory_items_insert_own" on public.household_memory_items;
create policy "household_memory_items_insert_own"
  on public.household_memory_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "household_memory_items_update_own" on public.household_memory_items;
create policy "household_memory_items_update_own"
  on public.household_memory_items for update
  using (auth.uid() = user_id);

drop policy if exists "household_memory_items_delete_own" on public.household_memory_items;
create policy "household_memory_items_delete_own"
  on public.household_memory_items for delete
  using (auth.uid() = user_id);
