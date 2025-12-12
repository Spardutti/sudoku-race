/**
 * Puzzle Test Helpers
 *
 * Utilities for mocking puzzle data in E2E tests.
 * Ensures test uses a known puzzle that matches the solved grid from factory.
 */

import { Page } from '@playwright/test';
import { createSolvedGrid } from '../fixtures/factories/puzzle.factory';

/**
 * Generate a puzzle grid with some cells removed (clues only)
 *
 * Takes a solved grid and removes ~40% of cells to create a solvable puzzle.
 * This creates a "puzzle" that the test can solve.
 */
export function generatePuzzleFromSolution(solvedGrid: number[][]): number[][] {
  const puzzle = solvedGrid.map((row) => [...row]); // Deep copy

  // Remove ~35 cells (easy puzzle has ~46 clues, medium ~36, hard ~27)
  const cellsToRemove = 35;
  const positions = [];

  // Generate all cell positions
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      positions.push([row, col]);
    }
  }

  // Shuffle positions
  positions.sort(() => Math.random() - 0.5);

  // Remove cells
  for (let i = 0; i < cellsToRemove; i++) {
    const [row, col] = positions[i];
    puzzle[row][col] = 0; // 0 = empty cell
  }

  return puzzle;
}

/**
 * Mock puzzle data for E2E tests
 *
 * Intercepts puzzle page load and injects a known puzzle that matches
 * the createSolvedGrid() factory output.
 *
 * Call this BEFORE navigating to /puzzle page.
 */
export async function mockPuzzleData(page: Page, difficulty: 'easy' | 'medium' | 'hard' = 'easy') {
  const solvedGrid = createSolvedGrid();
  const puzzleGrid = generatePuzzleFromSolution(solvedGrid);

  const mockPuzzle = {
    id: 'test-puzzle-123',
    puzzle_data: puzzleGrid,
    difficulty: difficulty,
    puzzle_date: new Date().toISOString().split('T')[0],
    puzzle_number: 999,
  };

  // Intercept the page HTML and inject puzzle data via script
  await page.route('**/puzzle/**', async (route) => {
    if (route.request().method() === 'GET') {
      const response = await route.fetch();
      let html = await response.text();

      // Inject mock puzzle data into window object before React hydrates
      const injectionScript = `
        <script>
          window.__MOCK_PUZZLE__ = ${JSON.stringify(mockPuzzle)};
        </script>
      `;

      html = html.replace('</head>', `${injectionScript}</head>`);

      route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body: html,
      });
    } else {
      route.continue();
    }
  });
}

/**
 * Seed a test puzzle in the database
 *
 * Alternative approach: Insert a known puzzle into the database before test runs.
 * Requires database access and cleanup.
 */
export async function seedTestPuzzle(difficulty: 'easy' | 'medium' | 'hard' = 'easy') {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for puzzle seeding');
  }

  const solvedGrid = createSolvedGrid();
  const puzzleGrid = generatePuzzleFromSolution(solvedGrid);

  const today = new Date().toISOString().split('T')[0];

  const response = await fetch(`${supabaseUrl}/rest/v1/puzzles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      puzzle_data: puzzleGrid,
      difficulty: difficulty,
      puzzle_date: today,
      puzzle_number: 999,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to seed test puzzle: ${response.statusText} - ${errorBody}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Clean up test puzzle from database
 */
export async function cleanupTestPuzzle(puzzleDate: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return; // Skip cleanup if not configured
  }

  await fetch(`${supabaseUrl}/rest/v1/puzzles?puzzle_date=eq.${puzzleDate}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
  });
}
