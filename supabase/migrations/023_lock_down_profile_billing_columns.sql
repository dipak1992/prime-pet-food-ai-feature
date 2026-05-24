-- ============================================================
-- Migration 023: Lock down billing and entitlement fields
--
-- The profiles_update_own RLS policy intentionally lets users manage their
-- own profile row, but PostgreSQL column privileges must also prevent browser
-- clients from updating entitlements, Stripe IDs, trials, and referral rewards.
-- ============================================================

-- Remove broad write privileges first. RLS still applies, but column grants
-- below narrow what authenticated clients can write through PostgREST.
revoke insert, update on table public.profiles from anon;
revoke insert, update on table public.profiles from authenticated;

-- Keep ordinary profile self-service writes available. This block checks for
-- columns because profile shape has evolved across migrations and environments.
do $$
declare
  safe_insert_columns text[] := array[
    'id',
    'email',
    'full_name',
    'avatar_url',
    'onboarding_completed',
    'has_completed_onboarding',
    'first_name',
    'dietary_preferences',
    'disliked_foods',
    'notification_prefs',
    'updated_at',
    'last_active_at'
  ];
  safe_update_columns text[] := array[
    'full_name',
    'avatar_url',
    'onboarding_completed',
    'has_completed_onboarding',
    'first_name',
    'dietary_preferences',
    'disliked_foods',
    'notification_prefs',
    'updated_at',
    'last_active_at',
    'referral_code'
  ];
  col text;
begin
  foreach col in array safe_insert_columns loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = col
    ) then
      execute format('grant insert (%I) on table public.profiles to authenticated', col);
    end if;
  end loop;

  foreach col in array safe_update_columns loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = col
    ) then
      execute format('grant update (%I) on table public.profiles to authenticated', col);
    end if;
  end loop;
end $$;

-- Explicitly deny entitlement/billing columns even if a future migration grants
-- broad write access again. Service role bypasses RLS for webhook/server jobs.
do $$
declare
  protected_columns text[] := array[
    'subscription_tier',
    'stripe_customer_id',
    'stripe_subscription_id',
    'stripe_price_id',
    'billing_interval',
    'trial_started_at',
    'trial_ends_at',
    'trial_ending_email_sent_at',
    'temp_pro_until',
    'bonus_days',
    'plan',
    'plan_status',
    'plan_renews_at'
  ];
  col text;
begin
  foreach col in array protected_columns loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = col
    ) then
      execute format('revoke insert (%I), update (%I) on table public.profiles from anon', col, col);
      execute format('revoke insert (%I), update (%I) on table public.profiles from authenticated', col, col);
    end if;
  end loop;
end $$;
