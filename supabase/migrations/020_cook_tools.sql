-- ============================================================
-- Migration 020: Cook Tools — Personal Preferences + Scan History
-- Adds personal nutrition profile and scan history for
-- Smart Menu Scan and Food Check features.
-- ============================================================

-- ── Personal Preferences (individual, NOT household) ──────────────────────────

CREATE TABLE IF NOT EXISTS public.personal_preferences (
  user_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Weight goal
  weight_goal          text NOT NULL DEFAULT 'maintain'
                         CHECK (weight_goal IN ('lose','maintain','gain')),

  -- Protein focus
  protein_focus        boolean NOT NULL DEFAULT false,

  -- Vegetarian
  is_vegetarian        boolean NOT NULL DEFAULT false,

  -- Allergies (free-text array)
  allergies            text[] NOT NULL DEFAULT '{}',

  -- Foods to avoid (free-text array)
  avoid_foods          text[] NOT NULL DEFAULT '{}',

  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ── Scan History (menu scans + food checks) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.scan_history (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 'menu_scan' or 'food_check'
  scan_type            text NOT NULL CHECK (scan_type IN ('menu_scan','food_check')),

  -- The goal the user selected (menu_scan only)
  goal                 text,

  -- AI response stored as JSONB
  result               jsonb NOT NULL DEFAULT '{}',

  -- Optional: image hash for dedup (not storing actual images)
  image_hash           text,

  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user
  ON public.scan_history(user_id, created_at DESC);

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.personal_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own personal preferences"
  ON public.personal_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal preferences"
  ON public.personal_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal preferences"
  ON public.personal_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to personal preferences"
  ON public.personal_preferences
  FOR ALL TO service_role
  USING (true);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scan history"
  ON public.scan_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan history"
  ON public.scan_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to scan history"
  ON public.scan_history
  FOR ALL TO service_role
  USING (true);
