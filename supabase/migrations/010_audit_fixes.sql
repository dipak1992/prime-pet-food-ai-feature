-- Audit fixes: indexes, TTL cleanup function, unsubscribe tokens
-- #14: Missing database indexes
-- #16: TTL cleanup for email_logs and feature_usage

-- ── Performance Indexes ─────────────────────────────────────

-- saved_meals: user lookups + public listings
create index if not exists idx_saved_meals_user_id on saved_meals(user_id);
create index if not exists idx_saved_meals_is_public on saved_meals(is_public) where is_public = true;

-- published_plans
create index if not exists idx_published_plans_user_id on published_plans(user_id);

-- onboarding_preferences
create index if not exists idx_onboarding_prefs_user_id on onboarding_preferences(user_id);

-- profiles
create index if not exists idx_profiles_user_id on profiles(user_id);

-- feature_usage: queried by user + feature + date
create index if not exists idx_feature_usage_user_feature on feature_usage(user_id, feature_name);
create index if not exists idx_feature_usage_created on feature_usage(created_at);

-- referral_codes / referral_links
create index if not exists idx_referral_codes_user_id on referral_codes(user_id);
create index if not exists idx_referral_codes_code on referral_codes(code);
create index if not exists idx_referral_links_referrer on referral_links(referrer_id);

-- meal_feedback
create index if not exists idx_meal_feedback_user_id on meal_feedback(user_id);
create index if not exists idx_meal_feedback_created on meal_feedback(created_at);

-- habit_streaks
create index if not exists idx_habit_streaks_user_id on habit_streaks(user_id);

-- notification_preferences
create index if not exists idx_notification_prefs_user_id on notification_preferences(user_id);

-- email_logs: queried by recipient + status + idempotency
create index if not exists idx_email_logs_recipient on email_logs(recipient);
create index if not exists idx_email_logs_created on email_logs(created_at);
create index if not exists idx_email_logs_idempotency on email_logs(idempotency_key) where idempotency_key is not null;

-- reminder_schedules
create index if not exists idx_reminder_schedules_user_id on reminder_schedules(user_id);

-- meal_signals: queried by user + created_at (decide route)
create index if not exists idx_meal_signals_user_id on meal_signals(user_id);
create index if not exists idx_meal_signals_user_created on meal_signals(user_id, created_at desc);

-- pantry_items
create index if not exists idx_pantry_items_user_id on pantry_items(user_id);

-- user_preference_snapshot
create index if not exists idx_user_pref_snapshot_user_id on user_preference_snapshot(user_id);

-- weekly_plans
create index if not exists idx_weekly_plans_user_id on weekly_plans(user_id);

-- receipts
create index if not exists idx_receipts_user_id on receipts(user_id);

-- ── TTL Cleanup Function (#16) ──────────────────────────────

-- Delete email_logs older than 90 days and feature_usage older than 180 days
create or replace function cleanup_old_records()
returns void
language plpgsql
security definer
as $$
begin
  delete from email_logs where created_at < now() - interval '90 days';
  delete from feature_usage where created_at < now() - interval '180 days';
end;
$$;

-- Schedule via pg_cron (run manually if pg_cron not available):
-- select cron.schedule('cleanup-old-records', '0 3 * * 0', 'select cleanup_old_records()');

-- ── Unsubscribe tokens table ────────────────────────────────

create table if not exists unsubscribe_tokens (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade not null,
  token      text        unique not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_unsub_tokens_token on unsubscribe_tokens(token);
create index if not exists idx_unsub_tokens_user_id on unsubscribe_tokens(user_id);

alter table unsubscribe_tokens enable row level security;
-- No user-facing policies — only service role accesses this table

-- ── increment_feature_usage RPC (#17 AI Budget) ─────────────

create or replace function increment_feature_usage(
  p_user_id uuid,
  p_feature_key text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into feature_usage (user_id, feature_key, usage_date, usage_count)
  values (p_user_id, p_feature_key, current_date, 1)
  on conflict (user_id, feature_key, usage_date)
  do update set usage_count = feature_usage.usage_count + 1,
               updated_at = now();
end;
$$;
