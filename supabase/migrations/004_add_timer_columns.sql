-- Add Timer-Related Columns to Completions Table
-- Generated: 2025-11-28
-- Story: 2-5-timer-implementation-auto-start-fair-timing

-- Add flagged_for_review column for anti-cheat system
-- Flags completions with suspiciously fast times (<120 seconds) for manual review
ALTER TABLE completions
ADD COLUMN IF NOT EXISTS flagged_for_review BOOLEAN DEFAULT FALSE;

-- Add index for filtering flagged completions (admin/review queries)
CREATE INDEX IF NOT EXISTS idx_completions_flagged
  ON completions(flagged_for_review)
  WHERE flagged_for_review = true;

-- Note: started_at and completion_time_seconds already exist from initial schema
-- Note: completed_at already exists from initial schema
