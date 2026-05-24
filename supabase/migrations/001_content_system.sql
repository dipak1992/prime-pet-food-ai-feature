-- Content system: saved meals + published plans
-- Run in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ── Saved meals ──────────────────────────────────────────────

create table if not exists saved_meals (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users(id) on delete cascade not null,
  slug          text        unique not null,
  title         text        not null,
  description   text,
  cuisine_type  text,
  meal_data     jsonb       not null,
  is_public     boolean     not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table saved_meals enable row level security;

-- Owners have full access
create policy "saved_meals_owner"
  on saved_meals for all
  using (auth.uid() = user_id);

-- Anyone (including anon) can read public meals
create policy "saved_meals_public_read"
  on saved_meals for select
  using (is_public = true);

-- ── Published plans ──────────────────────────────────────────

create table if not exists published_plans (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users(id) on delete cascade not null,
  slug          text        unique not null,
  title         text        not null,
  description   text,
  plan_data     jsonb       not null,
  is_public     boolean     not null default true,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table published_plans enable row level security;

create policy "published_plans_owner"
  on published_plans for all
  using (auth.uid() = user_id);

create policy "published_plans_public_read"
  on published_plans for select
  using (is_public = true);
