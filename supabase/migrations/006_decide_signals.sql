-- Meal signals: server-side memory for the decide engine.
-- Client-side learning store (localStorage) continues to operate; this table
-- is the cross-device source of truth that future sync code will read.

create table if not exists public.meal_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_id text not null,
  signal text not null check (signal in (
    'accepted', 'rejected', 'swapped', 'cooked', 'skipped', 'saved'
  )),
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists meal_signals_user_created_idx
  on public.meal_signals (user_id, created_at desc);

create index if not exists meal_signals_user_meal_idx
  on public.meal_signals (user_id, meal_id);

alter table public.meal_signals enable row level security;

create policy "meal_signals_select_own"
  on public.meal_signals for select
  using (auth.uid() = user_id);

create policy "meal_signals_insert_own"
  on public.meal_signals for insert
  with check (auth.uid() = user_id);

create policy "meal_signals_delete_own"
  on public.meal_signals for delete
  using (auth.uid() = user_id);
