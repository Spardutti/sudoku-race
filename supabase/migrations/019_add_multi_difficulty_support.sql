-- Migration: Add Multi-Difficulty Support
-- Story: 6.6 Multi-Difficulty Puzzle System
-- Generated: 2025-12-11
-- AC: 1.1, 1.2, 1.4, 8.1-8.5, 9.1

-- ============================================================================
-- STEP 1: Create difficulty ENUM type
-- ============================================================================

CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- ============================================================================
-- STEP 2: Convert existing TEXT difficulty column to ENUM
-- ============================================================================

-- Add temporary column with ENUM type
ALTER TABLE puzzles ADD COLUMN difficulty_new difficulty_level;

-- Migrate existing data (all existing puzzles are medium)
UPDATE puzzles SET difficulty_new = 'medium'::difficulty_level;

-- Make new column NOT NULL
ALTER TABLE puzzles ALTER COLUMN difficulty_new SET NOT NULL;

-- Drop old TEXT column
ALTER TABLE puzzles DROP COLUMN difficulty;

-- Rename new column to difficulty
ALTER TABLE puzzles RENAME COLUMN difficulty_new TO difficulty;

-- ============================================================================
-- STEP 3: Add perfect_day_streak to streaks table
-- ============================================================================

ALTER TABLE streaks ADD COLUMN perfect_day_streak INT NOT NULL DEFAULT 0;

-- ============================================================================
-- STEP 4: Drop old puzzle_date UNIQUE constraint
-- ============================================================================

-- Drop the existing unique constraint on puzzle_date
-- (allows multiple puzzles per day with different difficulties)
ALTER TABLE puzzles DROP CONSTRAINT IF EXISTS puzzles_puzzle_date_key;

-- ============================================================================
-- STEP 5: Add composite unique constraint and index
-- ============================================================================

-- Ensure one puzzle per day per difficulty
ALTER TABLE puzzles ADD CONSTRAINT puzzles_date_difficulty_unique
  UNIQUE (puzzle_date, difficulty);

-- Composite index for efficient queries by date + difficulty
CREATE INDEX IF NOT EXISTS idx_puzzles_date_difficulty
  ON puzzles(puzzle_date DESC, difficulty);

-- ============================================================================
-- STEP 6: Update existing indexes (optimization)
-- ============================================================================

-- Keep existing date index for backward compatibility queries
-- (already exists from 001_initial_schema.sql)

-- ============================================================================
-- STEP 7: Add comments for documentation
-- ============================================================================

COMMENT ON TYPE difficulty_level IS 'Sudoku puzzle difficulty levels';
COMMENT ON COLUMN puzzles.difficulty IS 'Puzzle difficulty (easy, medium, hard)';
COMMENT ON COLUMN streaks.perfect_day_streak IS 'Count of days completing BOTH easy and medium puzzles';
COMMENT ON CONSTRAINT puzzles_date_difficulty_unique ON puzzles IS 'Ensures one puzzle per day per difficulty';

-- ============================================================================
-- ROLLBACK PROCEDURE (for reference, not executed)
-- ============================================================================
-- To rollback this migration:
-- 1. ALTER TABLE puzzles DROP CONSTRAINT puzzles_date_difficulty_unique;
-- 2. ALTER TABLE puzzles ADD CONSTRAINT puzzles_puzzle_date_key UNIQUE (puzzle_date);
-- 3. ALTER TABLE streaks DROP COLUMN perfect_day_streak;
-- 4. ALTER TABLE puzzles ALTER COLUMN difficulty TYPE TEXT;
-- 5. DROP TYPE difficulty_level;
