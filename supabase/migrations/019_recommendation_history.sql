-- ============================================================
-- Migration 019: Recommendation history for freshness/variety
-- ============================================================

create table if not exists public.recently_shown_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_id text not null,
  source_mode text not null default 'smart-meal',
  metadata jsonb not null default '{}'::jsonb,
  shown_at timestamptz not null default now()
);

create index if not exists idx_recently_shown_user_time
  on public.recently_shown_meals(user_id, shown_at desc);

create index if not exists idx_recently_shown_user_mode
  on public.recently_shown_meals(user_id, source_mode, shown_at desc);

alter table public.recently_shown_meals enable row level security;

drop policy if exists "recently_shown_select_own" on public.recently_shown_meals;
create policy "recently_shown_select_own"
  on public.recently_shown_meals for select
  using (user_id = auth.uid());

drop policy if exists "recently_shown_insert_own" on public.recently_shown_meals;
create policy "recently_shown_insert_own"
  on public.recently_shown_meals for insert
  with check (user_id = auth.uid());

drop policy if exists "recently_shown_delete_own" on public.recently_shown_meals;
create policy "recently_shown_delete_own"
  on public.recently_shown_meals for delete
  using (user_id = auth.uid());
