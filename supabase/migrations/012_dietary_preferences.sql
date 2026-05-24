-- ============================================================
-- Migration 012: User Dietary Preferences
-- Adds a dedicated table for expanded dietary profile data
-- including eating style, allergies, avoid foods, proteins,
-- cuisine love, and health goals.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_dietary_preferences (
  user_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Eating style (single select)
  eating_style         text NOT NULL DEFAULT 'omnivore'
                         CHECK (eating_style IN ('omnivore','vegetarian','vegan','pescatarian','halal','kosher','custom')),

  -- Foods to avoid (user preference, not allergy)
  avoid_foods          text[] NOT NULL DEFAULT '{}',

  -- Hard allergies — never include in AI output
  allergies            text[] NOT NULL DEFAULT '{}',

  -- Preferred protein sources
  favorite_proteins    text[] NOT NULL DEFAULT '{}',

  -- Loved cuisine styles
  cuisine_love         text[] NOT NULL DEFAULT '{}',

  -- Health / lifestyle goals
  goals                text[] NOT NULL DEFAULT '{}',

  -- Kids-specific settings (used when household has children)
  kids_spice_tolerance text NOT NULL DEFAULT 'mild'
                         CHECK (kids_spice_tolerance IN ('none','mild','medium','spicy')),
  kids_foods_love      text[] NOT NULL DEFAULT '{}',
  kids_foods_reject    text[] NOT NULL DEFAULT '{}',

  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- (Primary key on user_id is sufficient for this table)

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.user_dietary_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own dietary preferences"
  ON public.user_dietary_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dietary preferences"
  ON public.user_dietary_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dietary preferences"
  ON public.user_dietary_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Allow service role unrestricted access (webhooks, admin jobs)
CREATE POLICY "Service role full access to dietary preferences"
  ON public.user_dietary_preferences
  FOR ALL TO service_role
  USING (true);
