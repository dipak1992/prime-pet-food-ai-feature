-- Add trial lifecycle columns to profiles
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'profiles'
      and column_name  = 'trial_ends_at'
  ) then
    alter table public.profiles
      add column trial_ends_at timestamptz;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'profiles'
      and column_name  = 'trial_ending_email_sent_at'
  ) then
    alter table public.profiles
      add column trial_ending_email_sent_at timestamptz;
  end if;
end $$;

-- Index for the daily cron query (trial_ends_at range + null email filter)
create index if not exists idx_profiles_trial_ends_at
  on public.profiles (trial_ends_at)
  where trial_ends_at is not null;
