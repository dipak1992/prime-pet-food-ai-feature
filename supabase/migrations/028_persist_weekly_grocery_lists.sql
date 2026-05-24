alter table public.weekly_plans
  add column if not exists grocery_list jsonb,
  add column if not exists planner_payload jsonb,
  add column if not exists source text not null default 'planner',
  add column if not exists activation_context jsonb;

create index if not exists weekly_plans_source_idx
  on public.weekly_plans (source);
