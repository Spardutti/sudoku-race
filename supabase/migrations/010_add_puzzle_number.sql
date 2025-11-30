-- Add puzzle_number column for sequential puzzle numbering (used in share text)
ALTER TABLE puzzles ADD COLUMN IF NOT EXISTS puzzle_number SERIAL;

-- Backfill existing puzzles with sequential numbers based on puzzle_date
-- Only update rows where puzzle_number is NULL (handles re-running migration)
WITH numbered_puzzles AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY puzzle_date ASC) AS seq_num
  FROM puzzles
  WHERE puzzle_number IS NULL
)
UPDATE puzzles
SET puzzle_number = numbered_puzzles.seq_num
FROM numbered_puzzles
WHERE puzzles.id = numbered_puzzles.id;

-- Create index for puzzle_number lookups
CREATE INDEX IF NOT EXISTS idx_puzzles_number ON puzzles(puzzle_number);

-- Add comment for documentation
COMMENT ON COLUMN puzzles.puzzle_number IS 'Sequential puzzle number starting from 1 for social sharing (e.g., Sudoku Daily #42)';
