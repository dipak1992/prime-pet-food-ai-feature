-- Weekly Instructions table for copilot temporal preferences
CREATE TABLE IF NOT EXISTS copilot_weekly_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  instruction TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  -- Categories: 'cuisine', 'speed', 'dietary', 'avoidance', 'general'
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Index for fast lookup of active instructions
CREATE INDEX idx_weekly_instructions_user_active 
  ON copilot_weekly_instructions(user_id, is_active) 
  WHERE is_active = true;

-- Index for expiry cleanup
CREATE INDEX idx_weekly_instructions_expires 
  ON copilot_weekly_instructions(expires_at) 
  WHERE is_active = true;

-- RLS policies
ALTER TABLE copilot_weekly_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own instructions"
  ON copilot_weekly_instructions FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own instructions"
  ON copilot_weekly_instructions FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own instructions"
  ON copilot_weekly_instructions FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Service role can do everything (for API routes using service key)
CREATE POLICY "Service role full access"
  ON copilot_weekly_instructions FOR ALL
  USING (true)
  WITH CHECK (true);
