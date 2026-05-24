-- ============================================================
-- Weekend Mode: entertainment preferences + scheduler column
-- ============================================================

-- Add entertainment_prefs to onboarding_preferences
alter table public.onboarding_preferences
  add column if not exists entertainment_prefs jsonb default null;

comment on column public.onboarding_preferences.entertainment_prefs is
  'Weekend Mode entertainment preferences: { language: string, genre: string[], watchStyle: "solo"|"couple"|"family" }';

-- Add last_weekend_sent_at to reminder_schedules
alter table public.reminder_schedules
  add column if not exists last_weekend_sent_at timestamptz default null;

comment on column public.reminder_schedules.last_weekend_sent_at is
  'Timestamp of last Weekend Mode email sent to this user';
