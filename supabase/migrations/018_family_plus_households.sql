-- ============================================================
-- Migration 018: Family Plus household members (up to 6)
-- ============================================================

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'My Household',
  max_members integer not null default 6 check (max_members between 1 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_name text not null,
  first_name text not null,
  role text not null check (role in ('adult', 'teen', 'child', 'toddler', 'baby')),
  age_years integer,
  age_range text,
  dietary_type text,
  allergies_json jsonb not null default '[]'::jsonb,
  foods_loved_json jsonb not null default '[]'::jsonb,
  foods_disliked_json jsonb not null default '[]'::jsonb,
  protein_preferences_json jsonb not null default '[]'::jsonb,
  cuisine_likes_json jsonb not null default '[]'::jsonb,
  spice_tolerance text check (spice_tolerance in ('none', 'mild', 'medium', 'high')),
  picky_eater_level integer not null default 0 check (picky_eater_level between 0 and 5),
  portion_size text check (portion_size in ('small', 'medium', 'large')),
  school_lunch_needed boolean not null default false,
  snack_frequency text,
  texture_sensitivity text,
  foods_accepted_json jsonb not null default '[]'::jsonb,
  foods_rejected_json jsonb not null default '[]'::jsonb,
  allergy_notes text,
  notes text,
  is_primary_shopper boolean not null default false,
  is_primary_cook boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_household_members_household_id
  on public.household_members(household_id);

create index if not exists idx_household_members_user_id
  on public.household_members(user_id);

create index if not exists idx_household_members_role
  on public.household_members(role);

alter table public.households enable row level security;
alter table public.household_members enable row level security;

drop policy if exists "households_owner_select" on public.households;
create policy "households_owner_select"
  on public.households for select
  using (owner_user_id = auth.uid());

drop policy if exists "households_owner_insert" on public.households;
create policy "households_owner_insert"
  on public.households for insert
  with check (owner_user_id = auth.uid());

drop policy if exists "households_owner_update" on public.households;
create policy "households_owner_update"
  on public.households for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "households_owner_delete" on public.households;
create policy "households_owner_delete"
  on public.households for delete
  using (owner_user_id = auth.uid());

drop policy if exists "members_owner_select" on public.household_members;
create policy "members_owner_select"
  on public.household_members for select
  using (
    exists (
      select 1
      from public.households h
      where h.id = household_members.household_id
      and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "members_owner_insert" on public.household_members;
create policy "members_owner_insert"
  on public.household_members for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.households h
      where h.id = household_members.household_id
      and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "members_owner_update" on public.household_members;
create policy "members_owner_update"
  on public.household_members for update
  using (
    exists (
      select 1
      from public.households h
      where h.id = household_members.household_id
      and h.owner_user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.households h
      where h.id = household_members.household_id
      and h.owner_user_id = auth.uid()
    )
  );

drop policy if exists "members_owner_delete" on public.household_members;
create policy "members_owner_delete"
  on public.household_members for delete
  using (
    exists (
      select 1
      from public.households h
      where h.id = household_members.household_id
      and h.owner_user_id = auth.uid()
    )
  );

create or replace function public.set_households_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_household_members_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_households_updated_at on public.households;
create trigger trg_households_updated_at
before update on public.households
for each row
execute function public.set_households_updated_at();

drop trigger if exists trg_household_members_updated_at on public.household_members;
create trigger trg_household_members_updated_at
before update on public.household_members
for each row
execute function public.set_household_members_updated_at();
