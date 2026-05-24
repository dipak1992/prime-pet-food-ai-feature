-- ============================================================
-- Migration 017: Web push subscriptions
-- ============================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (endpoint)
);

create index if not exists idx_push_subscriptions_user_id
  on public.push_subscriptions (user_id);

create index if not exists idx_push_subscriptions_is_active
  on public.push_subscriptions (is_active)
  where is_active = true;

alter table public.push_subscriptions enable row level security;

-- Users can manage only their own subscriptions.
drop policy if exists "users_can_select_own_push_subscriptions" on public.push_subscriptions;
create policy "users_can_select_own_push_subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "users_can_insert_own_push_subscriptions" on public.push_subscriptions;
create policy "users_can_insert_own_push_subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "users_can_update_own_push_subscriptions" on public.push_subscriptions;
create policy "users_can_update_own_push_subscriptions"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users_can_delete_own_push_subscriptions" on public.push_subscriptions;
create policy "users_can_delete_own_push_subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

create or replace function public.set_push_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_push_subscriptions_updated_at on public.push_subscriptions;
create trigger trg_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row
execute function public.set_push_subscriptions_updated_at();
