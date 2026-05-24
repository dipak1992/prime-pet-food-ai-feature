-- ============================================================
-- MealEase — Email System Fixes
-- Migration 013: add last_weekend_sent_at to reminder_schedules
-- ============================================================

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'reminder_schedules'
      and column_name  = 'last_weekend_sent_at'
  ) then
    alter table public.reminder_schedules
      add column last_weekend_sent_at timestamptz;
  end if;
end $$;
