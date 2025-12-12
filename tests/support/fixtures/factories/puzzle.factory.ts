/**
 * Puzzle Factory
 *
 * Generates test data for sudoku puzzles using faker.
 * Supports overrides for specific test scenarios.
 *
 * Pattern: faker-based generation + overrides + auto-cleanup tracking
 */

import { faker } from '@faker-js/faker';

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleData {
  id: string;
  puzzle_data: number[][];
  difficulty: PuzzleDifficulty;
  puzzle_date: string;
  puzzle_number: number;
}

/**
 * Generate a minimal valid sudoku puzzle grid (partially filled)
 * Note: This is a placeholder. Real sudoku generation requires sudoku-core logic.
 */
function generateSudokuGrid(): number[][] {
  // Create 9x9 grid with zeros (empty cells)
  const grid = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

  // Add some random starting numbers (simplified for testing)
  for (let i = 0; i < 20; i++) {
    const row = faker.number.int({ min: 0, max: 8 });
    const col = faker.number.int({ min: 0, max: 8 });
    const value = faker.number.int({ min: 1, max: 9 });
    grid[row][col] = value;
  }

  return grid;
}

/**
 * Create a single puzzle with optional overrides
 */
export function createPuzzle(overrides: Partial<PuzzleData> = {}): PuzzleData {
  return {
    id: faker.string.uuid(),
    puzzle_data: generateSudokuGrid(),
    difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard'] as const),
    puzzle_date: faker.date.recent().toISOString(),
    puzzle_number: faker.number.int({ min: 1, max: 1000 }),
    ...overrides,
  };
}

/**
 * Create multiple puzzles
 */
export function createPuzzles(count: number): PuzzleData[] {
  return Array.from({ length: count }, () => createPuzzle());
}

/**
 * Create a solved sudoku grid (all 81 cells filled)
 *
 * Returns a valid, complete sudoku solution.
 * For tests requiring specific patterns, use sudoku-core library.
 */
export function createSolvedGrid(): number[][] {
  // Valid solved sudoku grid
  return [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
}

/**
 * Create an alternative solved grid for variety
 */
export function createSolvedGridAlt(): number[][] {
  return [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 1, 4, 3, 6, 5, 8, 9, 7],
    [3, 6, 5, 8, 9, 7, 2, 1, 4],
    [8, 9, 7, 2, 1, 4, 3, 6, 5],
    [5, 3, 1, 6, 4, 2, 9, 7, 8],
    [6, 4, 2, 9, 7, 8, 5, 3, 1],
    [9, 7, 8, 5, 3, 1, 6, 4, 2],
  ];
}
