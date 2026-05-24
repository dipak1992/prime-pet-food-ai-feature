-- ============================================================
-- Dashboard Redesign: pantry, preferences, plans, receipts
-- meal_signals already exists via migration 006.
-- ============================================================

-- ── Pantry Items (server-side) ──────────────────────────────

create table if not exists public.pantry_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  category   text not null default 'other',
  quantity   real not null default 1,
  unit       text not null default 'unit',
  expires_at date,
  added_via  text not null default 'manual' check (added_via in ('manual', 'receipt', 'barcode')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists pantry_items_user_idx
  on public.pantry_items (user_id);

alter table public.pantry_items enable row level security;

create policy "pantry_items_select_own"
  on public.pantry_items for select
  using (auth.uid() = user_id);

create policy "pantry_items_insert_own"
  on public.pantry_items for insert
  with check (auth.uid() = user_id);

create policy "pantry_items_update_own"
  on public.pantry_items for update
  using (auth.uid() = user_id);

create policy "pantry_items_delete_own"
  on public.pantry_items for delete
  using (auth.uid() = user_id);

-- ── User Preference Snapshot ────────────────────────────────
-- Periodically materialized from meal_signals for fast reads.

create table if not exists public.user_preference_snapshot (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  snapshot    jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default timezone('utc', now())
);

alter table public.user_preference_snapshot enable row level security;

create policy "pref_snapshot_select_own"
  on public.user_preference_snapshot for select
  using (auth.uid() = user_id);

create policy "pref_snapshot_upsert_own"
  on public.user_preference_snapshot for insert
  with check (auth.uid() = user_id);

create policy "pref_snapshot_update_own"
  on public.user_preference_snapshot for update
  using (auth.uid() = user_id);

-- ── Weekly Plans ────────────────────────────────────────────

create table if not exists public.weekly_plans (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users (id) on delete cascade,
  week_of  date not null,
  plan     jsonb not null default '[]'::jsonb,
  status   text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, week_of)
);

create index if not exists weekly_plans_user_week_idx
  on public.weekly_plans (user_id, week_of desc);

alter table public.weekly_plans enable row level security;

create policy "weekly_plans_select_own"
  on public.weekly_plans for select
  using (auth.uid() = user_id);

create policy "weekly_plans_insert_own"
  on public.weekly_plans for insert
  with check (auth.uid() = user_id);

create policy "weekly_plans_update_own"
  on public.weekly_plans for update
  using (auth.uid() = user_id);

create policy "weekly_plans_delete_own"
  on public.weekly_plans for delete
  using (auth.uid() = user_id);

-- ── Receipts (for pantry OCR scanning) ──────────────────────

create table if not exists public.receipts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  image_url   text,
  parsed_items jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default timezone('utc', now())
);

create index if not exists receipts_user_idx
  on public.receipts (user_id, created_at desc);

alter table public.receipts enable row level security;

create policy "receipts_select_own"
  on public.receipts for select
  using (auth.uid() = user_id);

create policy "receipts_insert_own"
  on public.receipts for insert
  with check (auth.uid() = user_id);

create policy "receipts_delete_own"
  on public.receipts for delete
  using (auth.uid() = user_id);
