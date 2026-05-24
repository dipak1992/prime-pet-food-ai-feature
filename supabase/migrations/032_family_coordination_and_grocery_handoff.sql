-- Family coordination moat + grocery commerce handoff foundation.
-- Adds household-scoped collaboration, meal approval votes, and recorded retailer handoffs.

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'household_members'
  ) then
    alter table public.household_members
      add column if not exists invite_status text not null default 'accepted'
        check (invite_status in ('none', 'pending', 'accepted', 'revoked')),
      add column if not exists invite_role text not null default 'editor'
        check (invite_role in ('viewer', 'editor'));
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'weekly_plans'
  ) then
    alter table public.weekly_plans
      add column if not exists household_id uuid references public.households(id) on delete cascade,
      add column if not exists last_edited_by uuid references auth.users(id) on delete set null,
      add column if not exists approval_status text not null default 'draft'
        check (approval_status in ('draft', 'needs_review', 'approved', 'changes_requested')),
      add column if not exists approved_at timestamptz;

    create index if not exists weekly_plans_household_week_idx
      on public.weekly_plans(household_id, week_of desc)
      where household_id is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'meal_plans'
  ) then
    alter table public.meal_plans
      add column if not exists household_id uuid references public.households(id) on delete cascade;

    create index if not exists meal_plans_household_week_idx
      on public.meal_plans(household_id, week_start desc)
      where household_id is not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'grocery_lists'
  ) then
    alter table public.grocery_lists
      add column if not exists household_id uuid references public.households(id) on delete cascade,
      add column if not exists updated_by uuid references auth.users(id) on delete set null,
      add column if not exists last_handoff_provider text,
      add column if not exists last_handoff_at timestamptz;

    create index if not exists grocery_lists_household_week_idx
      on public.grocery_lists(household_id, week_start desc)
      where household_id is not null;
  end if;
end $$;

create table if not exists public.household_workspace_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (
    event_type in (
      'meal_vote',
      'meal_approved',
      'meal_changes_requested',
      'grocery_item_added',
      'grocery_item_checked',
      'grocery_handoff',
      'budget_update',
      'sms_relay'
    )
  ),
  subject_type text,
  subject_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists household_workspace_events_household_created_idx
  on public.household_workspace_events(household_id, created_at desc);

create table if not exists public.household_meal_votes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  meal_id text not null,
  meal_title text not null,
  vote text not null check (vote in ('approve', 'maybe', 'reject', 'request_swap')),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, week_start, meal_id, user_id)
);

create index if not exists household_meal_votes_household_week_idx
  on public.household_meal_votes(household_id, week_start desc);

create table if not exists public.grocery_handoffs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date,
  provider text not null check (
    provider in ('instacart', 'amazon_fresh', 'walmart_us', 'walmart_ca', 'kroger', 'generic')
  ),
  status text not null default 'opened' check (status in ('prepared', 'opened', 'failed')),
  external_cart_url text,
  item_count integer not null default 0,
  estimated_total_usd numeric(10,2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists grocery_handoffs_household_created_idx
  on public.grocery_handoffs(household_id, created_at desc);

create or replace function public.is_household_participant(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.households h
    where h.id = target_household_id
      and h.owner_user_id = auth.uid()
  ) or exists (
    select 1 from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
      and coalesce(hm.invite_status, 'accepted') <> 'revoked'
  );
$$;

create or replace function public.is_household_editor(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.households h
    where h.id = target_household_id
      and h.owner_user_id = auth.uid()
  ) or exists (
    select 1 from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
      and coalesce(hm.invite_status, 'accepted') <> 'revoked'
      and coalesce(hm.invite_role, 'editor') = 'editor'
  );
$$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'weekly_plans'
  ) then
    drop policy if exists "weekly_plans_select_household" on public.weekly_plans;
    create policy "weekly_plans_select_household"
      on public.weekly_plans for select
      using (user_id = auth.uid() or public.is_household_participant(household_id));

    drop policy if exists "weekly_plans_insert_household" on public.weekly_plans;
    create policy "weekly_plans_insert_household"
      on public.weekly_plans for insert
      with check (user_id = auth.uid() or public.is_household_editor(household_id));

    drop policy if exists "weekly_plans_update_household" on public.weekly_plans;
    create policy "weekly_plans_update_household"
      on public.weekly_plans for update
      using (user_id = auth.uid() or public.is_household_editor(household_id))
      with check (user_id = auth.uid() or public.is_household_editor(household_id));
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'meal_plans'
  ) then
    drop policy if exists "meal_plans_select_household" on public.meal_plans;
    create policy "meal_plans_select_household"
      on public.meal_plans for select
      using (user_id = auth.uid() or public.is_household_participant(household_id));

    drop policy if exists "meal_plans_insert_household" on public.meal_plans;
    create policy "meal_plans_insert_household"
      on public.meal_plans for insert
      with check (user_id = auth.uid() or public.is_household_editor(household_id));

    drop policy if exists "meal_plans_update_household" on public.meal_plans;
    create policy "meal_plans_update_household"
      on public.meal_plans for update
      using (user_id = auth.uid() or public.is_household_editor(household_id))
      with check (user_id = auth.uid() or public.is_household_editor(household_id));
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'meal_plan_days'
  ) and exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'meal_plans'
  ) then
    drop policy if exists "meal_plan_days_select_household" on public.meal_plan_days;
    create policy "meal_plan_days_select_household"
      on public.meal_plan_days for select
      using (
        exists (
          select 1 from public.meal_plans mp
          where mp.id = meal_plan_days.meal_plan_id
            and (mp.user_id = auth.uid() or public.is_household_participant(mp.household_id))
        )
      );
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'grocery_lists'
  ) then
    drop policy if exists "grocery_lists_select_household" on public.grocery_lists;
    create policy "grocery_lists_select_household"
      on public.grocery_lists for select
      using (user_id = auth.uid() or public.is_household_participant(household_id));

    drop policy if exists "grocery_lists_insert_household" on public.grocery_lists;
    create policy "grocery_lists_insert_household"
      on public.grocery_lists for insert
      with check (user_id = auth.uid() or public.is_household_editor(household_id));

    drop policy if exists "grocery_lists_update_household" on public.grocery_lists;
    create policy "grocery_lists_update_household"
      on public.grocery_lists for update
      using (user_id = auth.uid() or public.is_household_editor(household_id))
      with check (user_id = auth.uid() or public.is_household_editor(household_id));
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'grocery_items'
  ) and exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'grocery_lists'
  ) then
    drop policy if exists "grocery_items_select_household" on public.grocery_items;
    create policy "grocery_items_select_household"
      on public.grocery_items for select
      using (
        exists (
          select 1 from public.grocery_lists gl
          where gl.id = grocery_items.grocery_list_id
            and (gl.user_id = auth.uid() or public.is_household_participant(gl.household_id))
        )
      );

    drop policy if exists "grocery_items_insert_household" on public.grocery_items;
    create policy "grocery_items_insert_household"
      on public.grocery_items for insert
      with check (
        exists (
          select 1 from public.grocery_lists gl
          where gl.id = grocery_items.grocery_list_id
            and (gl.user_id = auth.uid() or public.is_household_editor(gl.household_id))
        )
      );

    drop policy if exists "grocery_items_update_household" on public.grocery_items;
    create policy "grocery_items_update_household"
      on public.grocery_items for update
      using (
        exists (
          select 1 from public.grocery_lists gl
          where gl.id = grocery_items.grocery_list_id
            and (gl.user_id = auth.uid() or public.is_household_editor(gl.household_id))
        )
      )
      with check (
        exists (
          select 1 from public.grocery_lists gl
          where gl.id = grocery_items.grocery_list_id
            and (gl.user_id = auth.uid() or public.is_household_editor(gl.household_id))
        )
      );
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'grocery_item_sources'
  ) and exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'grocery_items'
  ) and exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'grocery_lists'
  ) then
    drop policy if exists "grocery_item_sources_insert_household" on public.grocery_item_sources;
    create policy "grocery_item_sources_insert_household"
      on public.grocery_item_sources for insert
      with check (
        exists (
          select 1
          from public.grocery_items gi
          join public.grocery_lists gl on gl.id = gi.grocery_list_id
          where gi.id = grocery_item_sources.grocery_item_id
            and (gl.user_id = auth.uid() or public.is_household_editor(gl.household_id))
        )
      );

    drop policy if exists "grocery_item_sources_delete_household" on public.grocery_item_sources;
    create policy "grocery_item_sources_delete_household"
      on public.grocery_item_sources for delete
      using (
        exists (
          select 1
          from public.grocery_items gi
          join public.grocery_lists gl on gl.id = gi.grocery_list_id
          where gi.id = grocery_item_sources.grocery_item_id
            and (gl.user_id = auth.uid() or public.is_household_editor(gl.household_id))
        )
      );
  end if;
end $$;

alter table public.household_workspace_events enable row level security;
alter table public.household_meal_votes enable row level security;
alter table public.grocery_handoffs enable row level security;

drop policy if exists "household_workspace_events_select" on public.household_workspace_events;
create policy "household_workspace_events_select"
  on public.household_workspace_events for select
  using (public.is_household_participant(household_id));

drop policy if exists "household_workspace_events_insert" on public.household_workspace_events;
create policy "household_workspace_events_insert"
  on public.household_workspace_events for insert
  with check (public.is_household_participant(household_id));

drop policy if exists "household_meal_votes_select" on public.household_meal_votes;
create policy "household_meal_votes_select"
  on public.household_meal_votes for select
  using (public.is_household_participant(household_id));

drop policy if exists "household_meal_votes_upsert" on public.household_meal_votes;
create policy "household_meal_votes_upsert"
  on public.household_meal_votes for all
  using (public.is_household_participant(household_id))
  with check (public.is_household_participant(household_id) and user_id = auth.uid());

drop policy if exists "grocery_handoffs_select" on public.grocery_handoffs;
create policy "grocery_handoffs_select"
  on public.grocery_handoffs for select
  using (public.is_household_participant(household_id));

drop policy if exists "grocery_handoffs_insert" on public.grocery_handoffs;
create policy "grocery_handoffs_insert"
  on public.grocery_handoffs for insert
  with check (public.is_household_participant(household_id) and user_id = auth.uid());
