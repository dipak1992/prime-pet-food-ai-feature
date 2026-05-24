-- ============================================================
-- MealEase — Email & Notification System
-- Migration 005: email_logs, email_webhook_events,
--               reminder_schedules, admin_alerts_log
--               + extend notification_preferences
-- ============================================================

-- 1. email_logs — every send attempt
create table if not exists public.email_logs (
  id                 uuid        primary key default gen_random_uuid(),
  recipient          text        not null,
  subject            text        not null,
  status             text        not null check (status in ('sent', 'failed', 'bounced', 'complained')),
  resend_message_id  text,
  error_message      text,
  idempotency_key    text,
  created_at         timestamptz not null default now()
);

create index if not exists email_logs_recipient_idx     on public.email_logs (recipient);
create index if not exists email_logs_status_idx        on public.email_logs (status);
create index if not exists email_logs_idempotency_idx   on public.email_logs (idempotency_key)
  where idempotency_key is not null;
create index if not exists email_logs_created_at_idx    on public.email_logs (created_at desc);

-- Service role only — no user-level RLS
alter table public.email_logs enable row level security;
create policy "email_logs_service_only" on public.email_logs
  using (false);

-- 2. email_webhook_events — Resend webhook payloads
create table if not exists public.email_webhook_events (
  id               uuid        primary key default gen_random_uuid(),
  resend_event_id  text        unique,
  event_type       text        not null,
  email_id         text,
  recipient        text,
  payload          jsonb,
  processed_at     timestamptz not null default now()
);

create index if not exists webhook_events_type_idx     on public.email_webhook_events (event_type);
create index if not exists webhook_events_email_id_idx on public.email_webhook_events (email_id);

alter table public.email_webhook_events enable row level security;
create policy "webhook_events_service_only" on public.email_webhook_events
  using (false);

-- 3. reminder_schedules — per-user reminder config
create table if not exists public.reminder_schedules (
  user_id              uuid        primary key references auth.users(id) on delete cascade,
  dinner_enabled       boolean     not null default true,
  dinner_hour          integer     not null default 17 check (dinner_hour between 0 and 23),
  weekly_enabled       boolean     not null default true,
  weekly_day           integer     not null default 0 check (weekly_day between 0 and 6), -- 0=Sunday
  timezone             text        not null default 'UTC',
  last_dinner_sent_at  timestamptz,
  last_weekly_sent_at  timestamptz,
  updated_at           timestamptz not null default now()
);

alter table public.reminder_schedules enable row level security;
create policy "reminder_schedules_owner" on public.reminder_schedules
  for all using (auth.uid() = user_id);

-- 4. admin_alerts_log — track outbound admin alerts
create table if not exists public.admin_alerts_log (
  id          uuid        primary key default gen_random_uuid(),
  alert_type  text        not null,
  subject     text        not null,
  metadata    jsonb,
  sent_at     timestamptz not null default now()
);

alter table public.admin_alerts_log enable row level security;
create policy "admin_alerts_service_only" on public.admin_alerts_log
  using (false);

-- 5. Extend notification_preferences (added in migration 004)
--    Add email-specific columns
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'notification_preferences'
      and column_name  = 'dinner_reminders'
  ) then
    alter table public.notification_preferences
      add column dinner_reminders  boolean not null default true,
      add column weekly_reminders  boolean not null default true,
      add column referral_emails   boolean not null default true,
      add column product_updates   boolean not null default true;
  end if;
end $$;
