-- Add last_active_at to profiles for reactivation/winback email targeting.
-- Updated by app code whenever the user meaningfully interacts (generates a meal plan, logs a meal, etc.)

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'last_active_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_active_at TIMESTAMPTZ;
  END IF;
END $$;

-- Backfill: use updated_at as a reasonable approximation for existing rows
UPDATE public.profiles
SET last_active_at = updated_at
WHERE last_active_at IS NULL AND updated_at IS NOT NULL;
