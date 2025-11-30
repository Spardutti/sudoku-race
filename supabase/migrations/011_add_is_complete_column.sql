-- Add missing is_complete column to completions table
-- This column tracks whether a puzzle is fully completed vs in-progress

ALTER TABLE completions
  ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT false;

-- Create index for filtering completed puzzles
CREATE INDEX IF NOT EXISTS idx_completions_is_complete
  ON completions(is_complete)
  WHERE is_complete = true;

-- Update existing records: if completed_at is set, mark as complete
UPDATE completions
SET is_complete = true
WHERE completed_at IS NOT NULL AND is_complete IS NULL;
