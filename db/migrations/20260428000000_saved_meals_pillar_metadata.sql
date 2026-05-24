-- Saved meal contract for all five active MealEase pillars.

create extension if not exists "pg_trgm";

create table if not exists saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  cuisine_type text,
  meal_data jsonb not null default '{}',
  pillar_source text not null default 'tonight'
    check (pillar_source in ('tonight', 'snap', 'weekly', 'leftovers', 'budget', 'saved')),
  tags text[] not null default '{}',
  image_url text,
  cost_estimate numeric(8,2),
  grocery_data jsonb not null default '[]',
  is_public boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

alter table saved_meals add column if not exists pillar_source text not null default 'tonight';
alter table saved_meals add column if not exists tags text[] not null default '{}';
alter table saved_meals add column if not exists image_url text;
alter table saved_meals add column if not exists cost_estimate numeric(8,2);
alter table saved_meals add column if not exists grocery_data jsonb not null default '[]';
alter table saved_meals add column if not exists updated_at timestamptz not null default now();

create index if not exists saved_meals_user_id_idx on saved_meals(user_id);
create index if not exists saved_meals_pillar_source_idx on saved_meals(user_id, pillar_source);
create index if not exists saved_meals_created_at_idx on saved_meals(user_id, created_at desc);
create index if not exists saved_meals_title_trgm_idx on saved_meals using gin(title gin_trgm_ops);

alter table saved_meals enable row level security;

drop policy if exists "saved_meals: owner full access" on saved_meals;
create policy "saved_meals: owner full access" on saved_meals
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "saved_meals: public readable" on saved_meals;
create policy "saved_meals: public readable" on saved_meals
  for select using (is_public = true);
