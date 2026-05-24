-- ============================================================
-- Migration 024: Lock down feature usage quotas
--
-- Authenticated users should be able to read their own usage, but not insert
-- or update usage counters directly. The quota increment RPC must derive the
-- user id from the active JWT instead of accepting an arbitrary p_user_id.
-- ============================================================

drop policy if exists "feature_usage_insert_own" on public.feature_usage;
drop policy if exists "feature_usage_update_own" on public.feature_usage;

revoke insert, update on table public.feature_usage from anon;
revoke insert, update on table public.feature_usage from authenticated;

drop function if exists public.increment_feature_usage(uuid, text);

create or replace function public.increment_feature_usage(p_feature_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_feature_key is null or length(trim(p_feature_key)) = 0 then
    raise exception 'feature key is required';
  end if;

  insert into feature_usage (user_id, feature_key, usage_date, usage_count)
  values (current_user_id, p_feature_key, current_date, 1)
  on conflict (user_id, feature_key, usage_date)
  do update set usage_count = feature_usage.usage_count + 1,
                updated_at = now();
end;
$$;

revoke execute on function public.increment_feature_usage(text) from public;
revoke execute on function public.increment_feature_usage(text) from anon;
grant execute on function public.increment_feature_usage(text) to authenticated;
