-- Phase 1-5 product foundation: trust metadata, flavor onboarding,
-- household invite tracking, shared list preferences, and proactive nudges.

alter table public.recipes
  add column if not exists verified_status text not null default 'unverified'
    check (verified_status in ('unverified', 'chef_verified', 'safety_reviewed')),
  add column if not exists verified_by text,
  add column if not exists verified_at timestamptz,
  add column if not exists allergen_warnings jsonb not null default '[]'::jsonb,
  add column if not exists safety_notes text[] not null default '{}',
  add column if not exists culinary_rules jsonb not null default '[]'::jsonb;

alter table public.household_preferences
  add column if not exists cuisine_preferences text[] not null default '{}',
  add column if not exists spice_tolerance text not null default 'mild'
    check (spice_tolerance in ('none', 'mild', 'medium', 'hot')),
  add column if not exists budget_style integer not null default 2 check (budget_style between 1 and 5),
  add column if not exists family_mode_enabled boolean not null default false,
  add column if not exists sunday_plan_push_enabled boolean not null default true,
  add column if not exists pantry_decay_push_enabled boolean not null default true,
  add column if not exists sunday_plan_hour integer not null default 18 check (sunday_plan_hour between 0 and 23);

create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('viewer', 'editor')),
  token text not null unique,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index if not exists idx_household_invites_household_id on public.household_invites(household_id);
create index if not exists idx_household_invites_email on public.household_invites(lower(email));

alter table public.household_invites enable row level security;

drop policy if exists "household owners can manage invites" on public.household_invites;
create policy "household owners can manage invites"
  on public.household_invites for all
  using (
    exists (
      select 1 from public.households h
      where h.id = household_invites.household_id
        and h.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.households h
      where h.id = household_invites.household_id
        and h.owner_user_id = auth.uid()
    )
  );

create table if not exists public.proactive_nudges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nudge_type text not null check (nudge_type in ('sunday_plan', 'pantry_decay')),
  subject_id text,
  sent_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_proactive_nudges_user_type_sent
  on public.proactive_nudges(user_id, nudge_type, sent_at desc);

alter table public.proactive_nudges enable row level security;

drop policy if exists "users can read own proactive nudges" on public.proactive_nudges;
create policy "users can read own proactive nudges"
  on public.proactive_nudges for select
  using (auth.uid() = user_id);

drop policy if exists "service role can manage proactive nudges" on public.proactive_nudges;
create policy "service role can manage proactive nudges"
  on public.proactive_nudges for all to service_role
  using (true)
  with check (true);
