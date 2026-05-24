-- Phase 4 category leader: autonomous household Food OS actions.

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'household_workspace_events'
  ) then
    alter table public.household_workspace_events
      drop constraint if exists household_workspace_events_event_type_check;

    alter table public.household_workspace_events
      add constraint household_workspace_events_event_type_check
      check (
        event_type in (
          'meal_vote',
          'meal_approved',
          'meal_changes_requested',
          'grocery_item_added',
          'grocery_item_checked',
          'grocery_handoff',
          'budget_update',
          'sms_relay',
          'autonomous_action_proposed',
          'autonomous_action_applied',
          'autonomous_action_dismissed'
        )
      );
  end if;
end $$;

create table if not exists public.household_autonomous_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  week_start date not null,
  action_type text not null check (
    action_type in (
      'budget_rebalance',
      'leftover_rescue',
      'grocery_prepare',
      'timing_adjustment',
      'collaboration_prompt'
    )
  ),
  title text not null,
  body text not null,
  cta_label text not null,
  cta_href text not null,
  status text not null default 'proposed' check (status in ('proposed', 'applied', 'dismissed', 'expired')),
  priority integer not null default 50,
  impact_usd numeric(10,2),
  confidence text not null default 'medium' check (confidence in ('high', 'medium', 'low')),
  source text not null default 'food_os',
  payload jsonb not null default '{}'::jsonb,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start, action_type, title)
);

create index if not exists household_autonomous_actions_user_week_idx
  on public.household_autonomous_actions(user_id, week_start desc, status, priority desc);

create index if not exists household_autonomous_actions_household_status_idx
  on public.household_autonomous_actions(household_id, status, created_at desc)
  where household_id is not null;

alter table public.household_autonomous_actions enable row level security;

drop policy if exists "household_autonomous_actions_select" on public.household_autonomous_actions;
create policy "household_autonomous_actions_select"
  on public.household_autonomous_actions for select
  using (auth.uid() = user_id or public.is_household_participant(household_id));

drop policy if exists "household_autonomous_actions_insert" on public.household_autonomous_actions;
create policy "household_autonomous_actions_insert"
  on public.household_autonomous_actions for insert
  with check (auth.uid() = user_id or public.is_household_editor(household_id));

drop policy if exists "household_autonomous_actions_update" on public.household_autonomous_actions;
create policy "household_autonomous_actions_update"
  on public.household_autonomous_actions for update
  using (auth.uid() = user_id or public.is_household_editor(household_id))
  with check (auth.uid() = user_id or public.is_household_editor(household_id));
