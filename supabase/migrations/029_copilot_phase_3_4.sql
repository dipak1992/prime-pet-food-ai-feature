-- Phase 3/4 conversational copilot support.

alter table public.proactive_nudges
  drop constraint if exists proactive_nudges_nudge_type_check;

alter table public.proactive_nudges
  add constraint proactive_nudges_nudge_type_check
  check (
    nudge_type in (
      'sunday_plan',
      'pantry_decay',
      'leftover_expiry',
      'budget_pressure',
      'dinner_time',
      'plan_gap',
      'grocery_ready',
      'copilot_nudge'
    )
  );

create table if not exists public.copilot_schedule_constraints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_of_week text not null,
  constraint_label text not null,
  source_text text,
  confidence numeric not null default 0.7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, day_of_week, constraint_label)
);

create index if not exists idx_copilot_schedule_constraints_user
  on public.copilot_schedule_constraints(user_id, updated_at desc);

alter table public.copilot_schedule_constraints enable row level security;

drop policy if exists "users can read own copilot schedule constraints" on public.copilot_schedule_constraints;
create policy "users can read own copilot schedule constraints"
  on public.copilot_schedule_constraints for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert own copilot schedule constraints" on public.copilot_schedule_constraints;
create policy "users can insert own copilot schedule constraints"
  on public.copilot_schedule_constraints for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update own copilot schedule constraints" on public.copilot_schedule_constraints;
create policy "users can update own copilot schedule constraints"
  on public.copilot_schedule_constraints for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "service role can manage copilot schedule constraints" on public.copilot_schedule_constraints;
create policy "service role can manage copilot schedule constraints"
  on public.copilot_schedule_constraints for all to service_role
  using (true)
  with check (true);
