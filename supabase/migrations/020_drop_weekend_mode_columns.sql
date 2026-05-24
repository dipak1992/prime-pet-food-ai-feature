-- Migration: Drop Weekend Mode columns
-- These columns were used by the Weekend Mode feature which has been removed.
-- Safe to drop — no application code references them after cleanup/remove-deprecated-features.

ALTER TABLE reminder_schedules
  DROP COLUMN IF EXISTS last_weekend_sent_at;

-- Drop entertainment_prefs column from profiles if it exists
-- (stored Weekend Mode movie/show preferences)
ALTER TABLE profiles
  DROP COLUMN IF EXISTS entertainment_prefs;
