-- ============================================================
-- NutriNest AI — Habit System Tables
-- Migration 004: meal_feedback, habit_streaks, notification_preferences
-- ============================================================

-- 1. meal_feedback: stores per-meal ratings (loved / okay / didnt_work)
create table if not exists public.meal_feedback (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  meal_id      text        not null,
  meal_title   text        not null,
  meal_cuisine text,
  rating       text        not null check (rating in ('loved', 'okay', 'didnt_work')),
  created_at   timestamptz not null default now()
);

alter table public.meal_feedback enable row level security;

create policy "meal_feedback_owner" on public.meal_feedback
  for all using (auth.uid() = user_id);

-- 2. habit_streaks: daily engagement streak per user
create table if not exists public.habit_streaks (
  user_id          uuid  primary key references auth.users(id) on delete cascade,
  current_streak   integer     not null default 0,
  longest_streak   integer     not null default 0,
  last_active_date date,
  updated_at       timestamptz not null default now()
);

alter table public.habit_streaks enable row level security;

create policy "habit_streaks_owner" on public.habit_streaks
  for all using (auth.uid() = user_id);

-- 3. notification_preferences: user notification settings
create table if not exists public.notification_preferences (
  user_id        uuid    primary key references auth.users(id) on delete cascade,
  enabled        boolean not null default false,
  preferred_hour integer not null default 17 check (preferred_hour between 0 and 23),
  updated_at     timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy "notification_preferences_owner" on public.notification_preferences
  for all using (auth.uid() = user_id);
