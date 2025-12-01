"use client";

import { usePuzzleStore } from "@/lib/stores/puzzleStore";

/**
 * Auto-solve puzzle by filling grid with solution
 *
 * Fills all cells with correct values. User must manually click Submit
 * to validate and complete the puzzle. This allows testing the full
 * validation flow including server-side checks.
 *
 * @param solution - 9x9 array of correct values
 */
export function autoSolvePuzzle(solution: number[][]): void {
  // Validate solution is a valid 9x9 array before accessing indices
  if (!solution || !Array.isArray(solution) || solution.length !== 9) {
    console.error("Invalid solution format: must be 9x9 array");
    return;
  }

  if (!solution.every(row => Array.isArray(row) && row.length === 9)) {
    console.error("Invalid solution format: all rows must have 9 columns");
    return;
  }

  const { updateCell } = usePuzzleStore.getState();

  // Fill all 81 cells with correct solution
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      updateCell(row, col, solution[row][col]);
    }
  }

  // Don't mark as completed - let user click Submit to trigger validation
}

/**
 * Reset client-side state (localStorage + Zustand store)
 *
 * Clears puzzle-specific localStorage and resets Zustand store to initial state.
 * Does NOT clear auth session or non-puzzle localStorage.
 */
export function resetClientState(): void {
  // Clear localStorage for puzzle state
  localStorage.removeItem("sudoku-race-puzzle-state");

  // Reset Zustand store to initial values
  usePuzzleStore.getState().resetPuzzle();
}

/**
 * Nuclear option: Clear ALL browser data
 *
 * Clears all localStorage (including auth), resets all Zustand stores,
 * and reloads the page for a complete fresh start.
 *
 * Use with caution: This will log out the user.
 */
export function clearAllBrowserData(): void {
  // Clear ALL localStorage (including auth)
  localStorage.clear();

  // Reset Zustand store
  usePuzzleStore.getState().resetPuzzle();

  // Force page reload for clean slate
  window.location.reload();
}
