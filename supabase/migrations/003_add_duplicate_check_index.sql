-- Duplicate Submission Prevention Index
-- Generated: 2025-11-16
-- Story: 1-7-rate-limiting-implementation (Task 3)
--
-- Optimizes duplicate submission checks for completePuzzle() Server Action.
-- Prevents users from submitting multiple solutions for the same puzzle.
--
-- Performance target: <10ms query time
--
-- @see docs/rate-limiting.md
-- @see docs/architecture.md (Rate Limiting & Abuse Prevention section)

-- ============================================================================
-- ADD is_complete COLUMN
-- ============================================================================
-- Add explicit is_complete boolean for clearer semantics
-- Allows partial completions (started but not finished) vs actual completions
ALTER TABLE completions
ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT FALSE;

-- Backfill existing completions
-- If completed_at is not null, mark as complete
UPDATE completions
SET is_complete = TRUE
WHERE completed_at IS NOT NULL;

-- ============================================================================
-- CREATE COMPOSITE INDEX
-- ============================================================================
-- Optimizes the duplicate submission query:
--   SELECT id FROM completions
--   WHERE user_id = ? AND puzzle_id = ? AND is_complete = true
--
-- Partial index (WHERE is_complete = true) reduces index size
-- and speeds up queries by excluding incomplete attempts
CREATE INDEX IF NOT EXISTS idx_completions_user_puzzle_complete
  ON completions(user_id, puzzle_id, is_complete)
  WHERE is_complete = true;

-- ============================================================================
-- PERFORMANCE VERIFICATION
-- ============================================================================
-- Run this query to verify index is used:
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT id FROM completions
-- WHERE user_id = '...' AND puzzle_id = '...' AND is_complete = true;
--
-- Expected: "Index Scan using idx_completions_user_puzzle_complete"
-- Expected execution time: <10ms
