-- ============================================================
-- Migration 009: Receipts table for Stripe payment records
-- ============================================================

create table if not exists public.receipts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  stripe_invoice_id   text unique,
  stripe_charge_id    text,
  amount_cents  integer not null,
  currency      text not null default 'usd',
  status        text not null default 'paid',
  description   text,
  period_start  timestamptz,
  period_end    timestamptz,
  receipt_url   text,
  created_at    timestamptz not null default now()
);

-- Index for querying receipts by user
create index if not exists receipts_user_id_idx on public.receipts(user_id);

-- RLS: users can only read their own receipts
alter table public.receipts enable row level security;

create policy "Users can view own receipts"
  on public.receipts
  for select
  using (auth.uid() = user_id);

-- Service role inserts from Stripe webhook (bypasses RLS automatically)
