create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  source text not null default 'planner',
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  activation_context jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, week_start)
);

create table if not exists public.meal_plan_days (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans(id) on delete cascade,
  day_index int not null check (day_index between 0 and 6),
  meal_date date,
  meal_id text,
  meal_title text,
  meal_payload jsonb,
  locked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (meal_plan_id, day_index)
);

create table if not exists public.grocery_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_plan_id uuid references public.meal_plans(id) on delete set null,
  week_start date not null,
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  store_format text not null default 'standard',
  total_estimated_cost numeric(10,2) not null default 0,
  generated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, week_start)
);

create table if not exists public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  grocery_list_id uuid not null references public.grocery_lists(id) on delete cascade,
  stable_key text not null,
  name text not null,
  quantity numeric(10,3) not null default 1,
  unit text not null default 'whole',
  category text not null default 'other',
  estimated_cost numeric(10,2) not null default 0,
  is_in_pantry boolean not null default false,
  is_checked boolean not null default false,
  is_custom boolean not null default false,
  user_removed boolean not null default false,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (grocery_list_id, stable_key)
);

create table if not exists public.grocery_item_sources (
  id uuid primary key default gen_random_uuid(),
  grocery_item_id uuid not null references public.grocery_items(id) on delete cascade,
  meal_plan_day_id uuid references public.meal_plan_days(id) on delete set null,
  meal_title text,
  source_type text not null default 'meal' check (source_type in ('meal', 'custom', 'pantry')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists meal_plans_user_week_idx
  on public.meal_plans(user_id, week_start desc);

create index if not exists meal_plan_days_plan_idx
  on public.meal_plan_days(meal_plan_id, day_index);

create index if not exists grocery_lists_user_week_idx
  on public.grocery_lists(user_id, week_start desc);

create index if not exists grocery_items_list_idx
  on public.grocery_items(grocery_list_id, category, name);

create index if not exists grocery_item_sources_item_idx
  on public.grocery_item_sources(grocery_item_id);

alter table public.meal_plans enable row level security;
alter table public.meal_plan_days enable row level security;
alter table public.grocery_lists enable row level security;
alter table public.grocery_items enable row level security;
alter table public.grocery_item_sources enable row level security;

drop policy if exists "meal_plans_select_own" on public.meal_plans;
create policy "meal_plans_select_own" on public.meal_plans
  for select using (auth.uid() = user_id);

drop policy if exists "meal_plans_insert_own" on public.meal_plans;
create policy "meal_plans_insert_own" on public.meal_plans
  for insert with check (auth.uid() = user_id);

drop policy if exists "meal_plans_update_own" on public.meal_plans;
create policy "meal_plans_update_own" on public.meal_plans
  for update using (auth.uid() = user_id);

drop policy if exists "meal_plan_days_select_own" on public.meal_plan_days;
create policy "meal_plan_days_select_own" on public.meal_plan_days
  for select using (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_days.meal_plan_id
        and mp.user_id = auth.uid()
    )
  );

drop policy if exists "meal_plan_days_insert_own" on public.meal_plan_days;
create policy "meal_plan_days_insert_own" on public.meal_plan_days
  for insert with check (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_days.meal_plan_id
        and mp.user_id = auth.uid()
    )
  );

drop policy if exists "meal_plan_days_update_own" on public.meal_plan_days;
create policy "meal_plan_days_update_own" on public.meal_plan_days
  for update using (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_days.meal_plan_id
        and mp.user_id = auth.uid()
    )
  );

drop policy if exists "meal_plan_days_delete_own" on public.meal_plan_days;
create policy "meal_plan_days_delete_own" on public.meal_plan_days
  for delete using (
    exists (
      select 1 from public.meal_plans mp
      where mp.id = meal_plan_days.meal_plan_id
        and mp.user_id = auth.uid()
    )
  );

drop policy if exists "grocery_lists_select_own" on public.grocery_lists;
create policy "grocery_lists_select_own" on public.grocery_lists
  for select using (auth.uid() = user_id);

drop policy if exists "grocery_lists_insert_own" on public.grocery_lists;
create policy "grocery_lists_insert_own" on public.grocery_lists
  for insert with check (auth.uid() = user_id);

drop policy if exists "grocery_lists_update_own" on public.grocery_lists;
create policy "grocery_lists_update_own" on public.grocery_lists
  for update using (auth.uid() = user_id);

drop policy if exists "grocery_items_select_own" on public.grocery_items;
create policy "grocery_items_select_own" on public.grocery_items
  for select using (
    exists (
      select 1 from public.grocery_lists gl
      where gl.id = grocery_items.grocery_list_id
        and gl.user_id = auth.uid()
    )
  );

drop policy if exists "grocery_items_insert_own" on public.grocery_items;
create policy "grocery_items_insert_own" on public.grocery_items
  for insert with check (
    exists (
      select 1 from public.grocery_lists gl
      where gl.id = grocery_items.grocery_list_id
        and gl.user_id = auth.uid()
    )
  );

drop policy if exists "grocery_items_update_own" on public.grocery_items;
create policy "grocery_items_update_own" on public.grocery_items
  for update using (
    exists (
      select 1 from public.grocery_lists gl
      where gl.id = grocery_items.grocery_list_id
        and gl.user_id = auth.uid()
    )
  );

drop policy if exists "grocery_items_delete_own" on public.grocery_items;
create policy "grocery_items_delete_own" on public.grocery_items
  for delete using (
    exists (
      select 1 from public.grocery_lists gl
      where gl.id = grocery_items.grocery_list_id
        and gl.user_id = auth.uid()
    )
  );

drop policy if exists "grocery_item_sources_select_own" on public.grocery_item_sources;
create policy "grocery_item_sources_select_own" on public.grocery_item_sources
  for select using (
    exists (
      select 1
      from public.grocery_items gi
      join public.grocery_lists gl on gl.id = gi.grocery_list_id
      where gi.id = grocery_item_sources.grocery_item_id
        and gl.user_id = auth.uid()
    )
  );

drop policy if exists "grocery_item_sources_insert_own" on public.grocery_item_sources;
create policy "grocery_item_sources_insert_own" on public.grocery_item_sources
  for insert with check (
    exists (
      select 1
      from public.grocery_items gi
      join public.grocery_lists gl on gl.id = gi.grocery_list_id
      where gi.id = grocery_item_sources.grocery_item_id
        and gl.user_id = auth.uid()
    )
  );

drop policy if exists "grocery_item_sources_delete_own" on public.grocery_item_sources;
create policy "grocery_item_sources_delete_own" on public.grocery_item_sources
  for delete using (
    exists (
      select 1
      from public.grocery_items gi
      join public.grocery_lists gl on gl.id = gi.grocery_list_id
      where gi.id = grocery_item_sources.grocery_item_id
        and gl.user_id = auth.uid()
    )
  );
