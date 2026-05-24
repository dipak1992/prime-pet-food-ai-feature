-- ============================================================
-- Migration 021: Tiered member gating + future shared logins
-- ============================================================
-- 
-- Tier limits:
--   Free:        1 household member profile
--   Pro:         2 household member profiles
--   Family Plus: 6 household member profiles
--
-- Future-ready columns for shared account access:
--   invited_email  — email of a person invited to share the household
--   invited_user_id — links to auth.users once they accept the invite
--   invite_status  — pending / accepted / revoked
--   invite_role    — viewer / editor (controls what the invited user can do)

-- Add shared-login columns to household_members (nullable for now)
alter table public.household_members
  add column if not exists invited_email text,
  add column if not exists invited_user_id uuid references auth.users(id) on delete set null,
  add column if not exists invite_status text not null default 'none'
    check (invite_status in ('none', 'pending', 'accepted', 'revoked')),
  add column if not exists invite_role text not null default 'viewer'
    check (invite_role in ('viewer', 'editor'));

-- Add a weight_goal column for personal nutrition goals per member
alter table public.household_members
  add column if not exists weight_goal text
    check (weight_goal in ('lose', 'maintain', 'gain', 'build_muscle'));

-- Index for future invite lookups
create index if not exists idx_household_members_invited_email
  on public.household_members(invited_email)
  where invited_email is not null;

create index if not exists idx_household_members_invited_user_id
  on public.household_members(invited_user_id)
  where invited_user_id is not null;

-- Future RLS policy: invited users can read their own member row
-- (commented out until shared logins are implemented)
--
-- drop policy if exists "members_invited_select" on public.household_members;
-- create policy "members_invited_select"
--   on public.household_members for select
--   using (invited_user_id = auth.uid() and invite_status = 'accepted');
