-- ============================================================
-- Migration 016: Normalize paid tiers to Plus/pro and update constraints
-- ============================================================

-- Update the constraint to allow only current tiers
do $$
begin
  -- Drop old constraint
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_subscription_tier_check'
  ) then
    alter table public.profiles drop constraint profiles_subscription_tier_check;
  end if;
end $$;

-- Normalize legacy family entries to pro before tightening the constraint.
update public.profiles
  set subscription_tier = 'pro'
  where subscription_tier = 'family';

-- Add current constraint
alter table public.profiles
  add constraint profiles_subscription_tier_check
  check (subscription_tier in ('free', 'pro'));

-- Add column to track if user has an active paid subscription (not trial)
alter table public.profiles
  add column if not exists billing_interval text check (billing_interval in ('monthly', 'yearly'));

-- Create index for faster lookups by billing_interval (used in analytics/reports)
create index if not exists idx_profiles_billing_interval
  on public.profiles (billing_interval)
  where subscription_tier = 'pro';

-- Update any legacy 'plus' entries to 'pro' (backward compatibility)
update public.profiles
  set subscription_tier = 'pro'
  where subscription_tier = 'plus';
