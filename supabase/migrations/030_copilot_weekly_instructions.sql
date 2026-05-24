create table if not exists public.copilot_weekly_instructions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instruction_type text not null check (
    instruction_type in (
      'cuisine_boost',
      'avoid',
      'time_constraint',
      'budget_override',
      'variety_rule'
    )
  ),
  value text not null,
  label text not null,
  emoji text,
  week_start date not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_copilot_weekly_instruction_unique
  on public.copilot_weekly_instructions(user_id, instruction_type, value, week_start);

create index if not exists idx_copilot_weekly_instructions_user_active
  on public.copilot_weekly_instructions(user_id, expires_at desc);

alter table public.copilot_weekly_instructions enable row level security;

drop policy if exists "users can read own weekly copilot instructions" on public.copilot_weekly_instructions;
create policy "users can read own weekly copilot instructions"
  on public.copilot_weekly_instructions for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own weekly copilot instructions" on public.copilot_weekly_instructions;
create policy "users can insert own weekly copilot instructions"
  on public.copilot_weekly_instructions for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own weekly copilot instructions" on public.copilot_weekly_instructions;
create policy "users can update own weekly copilot instructions"
  on public.copilot_weekly_instructions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own weekly copilot instructions" on public.copilot_weekly_instructions;
create policy "users can delete own weekly copilot instructions"
  on public.copilot_weekly_instructions for delete
  using (auth.uid() = user_id);

drop policy if exists "service role can manage weekly copilot instructions" on public.copilot_weekly_instructions;
create policy "service role can manage weekly copilot instructions"
  on public.copilot_weekly_instructions for all to service_role
  using (true)
  with check (true);
