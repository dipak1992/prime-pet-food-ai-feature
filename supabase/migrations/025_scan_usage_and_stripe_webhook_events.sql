-- ============================================================
-- Migration 025: Server-owned scan usage and Stripe idempotency
--
-- Scan quota counters and Stripe webhook processing markers must not be
-- writable from browser Supabase clients.
-- ============================================================

create table if not exists public.scan_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_type text not null check (scan_type in ('fridge', 'menu', 'food')),
  created_at timestamptz not null default now()
);

create index if not exists scan_usage_user_type_created_idx
  on public.scan_usage (user_id, scan_type, created_at desc);

alter table public.scan_usage enable row level security;

drop policy if exists "scan_usage_select_own" on public.scan_usage;
drop policy if exists "scan_usage_insert_own" on public.scan_usage;
drop policy if exists "scan_usage_update_own" on public.scan_usage;
drop policy if exists "scan_usage_delete_own" on public.scan_usage;

revoke all on table public.scan_usage from anon;
revoke all on table public.scan_usage from authenticated;
grant select on table public.scan_usage to authenticated;

create policy "scan_usage_select_own"
  on public.scan_usage
  for select
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.stripe_webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;

revoke all on table public.stripe_webhook_events from anon;
revoke all on table public.stripe_webhook_events from authenticated;
