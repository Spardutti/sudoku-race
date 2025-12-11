-- Add solve_path column to completions table for emoji grid generation
-- Story 5.1: Solve Path Tracking During Gameplay
-- Date: 2025-12-01

ALTER TABLE completions
ADD COLUMN IF NOT EXISTS solve_path JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN completions.solve_path IS 'Tracks each cell entry during gameplay: [{row, col, value, timestamp, isCorrection}]';

-- Optional: Add GIN index for querying solve path (may be useful in Story 5.2)
CREATE INDEX IF NOT EXISTS idx_completions_solve_path ON completions USING GIN (solve_path);
