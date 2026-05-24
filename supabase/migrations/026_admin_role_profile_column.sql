-- ============================================================
-- Migration 026: Profile admin role
--
-- Admin access should be controlled by a server-checked role on profiles,
-- not by comparing against a single email address in application code.
-- Browser clients must not be able to grant themselves admin privileges.
-- ============================================================

alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin'));

create index if not exists idx_profiles_role
  on public.profiles (role);

revoke insert (role), update (role) on table public.profiles from anon;
revoke insert (role), update (role) on table public.profiles from authenticated;
