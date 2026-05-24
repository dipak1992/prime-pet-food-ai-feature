-- ============================================================
-- Migration 008: Add Stripe & trial columns to profiles
-- ============================================================

alter table public.profiles
  add column if not exists stripe_customer_id      text,
  add column if not exists stripe_subscription_id  text,
  add column if not exists stripe_price_id         text,
  add column if not exists trial_started_at        timestamptz;

-- Index for fast lookups by Stripe customer ID (used in webhook)
create unique index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- Service role can update stripe fields from webhook (bypasses RLS)
-- The webhook uses SUPABASE_SERVICE_ROLE_KEY so RLS is bypassed automatically.
-- No extra policy needed — service role is a superuser in Supabase.
