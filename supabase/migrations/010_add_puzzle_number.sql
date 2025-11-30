-- Add puzzle_number column for sequential puzzle numbering (used in share text)
ALTER TABLE puzzles ADD COLUMN IF NOT EXISTS puzzle_number SERIAL;

-- Create index for puzzle_number lookups
CREATE INDEX IF NOT EXISTS idx_puzzles_number ON puzzles(puzzle_number);

-- Add comment for documentation
COMMENT ON COLUMN puzzles.puzzle_number IS 'Sequential puzzle number starting from 1 for social sharing (e.g., Sudoku Daily #42)';
