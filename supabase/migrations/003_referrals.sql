-- ============================================================
-- 003_referrals.sql  –  Referral system
-- ============================================================

-- Add referral reward columns to profiles
alter table public.profiles
  add column if not exists referral_code   text unique,
  add column if not exists bonus_days      integer not null default 0,
  add column if not exists temp_pro_until  timestamptz;

-- Referrals tracking
create table if not exists public.referrals (
  id            uuid        primary key default gen_random_uuid(),
  referrer_id   uuid        not null references auth.users(id) on delete cascade,
  referee_id    uuid        not null references auth.users(id) on delete cascade,
  code          text        not null,
  status        text        not null default 'completed'
                            check (status in ('completed', 'rewarded')),
  created_at    timestamptz not null default timezone('utc', now()),
  unique (referee_id)  -- each new user can only be referred once
);

alter table public.referrals enable row level security;

-- Referrer can see their outgoing referrals; referee can see their own
create policy "referrals_select_referrer"
  on public.referrals for select
  using (auth.uid() = referrer_id);

create policy "referrals_select_referee"
  on public.referrals for select
  using (auth.uid() = referee_id);

-- Only service-role / server inserts via security-definer function
-- Client insert policy for the referee applying their own referral
create policy "referrals_insert_referee"
  on public.referrals for insert
  with check (auth.uid() = referee_id);
