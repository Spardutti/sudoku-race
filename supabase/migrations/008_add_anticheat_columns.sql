-- Story 4.3: Server-Side Time Validation & Anti-Cheat
-- Add columns for anti-cheat measures and time validation
-- AC1, AC3, AC5, AC6

-- Add columns to completions table
ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS flagged_for_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pause_events JSONB DEFAULT '[]'::jsonb;

-- Create index for flagged completions (WHERE clause makes this a partial index)
-- Only indexes rows where flagged_for_review is true for performance
CREATE INDEX IF NOT EXISTS idx_completions_flagged
  ON completions(flagged_for_review)
  WHERE flagged_for_review = true;

-- Note: UNIQUE(user_id, puzzle_id) constraint already exists in 001_initial_schema.sql
