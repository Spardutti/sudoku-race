/**
 * Puzzle Store - Zustand State Management
 *
 * Centralized state management for puzzle gameplay including grid state, user entries,
 * selected cell, elapsed time, and completion status. Provides auto-save persistence
 * via localStorage for guest users and database sync for authenticated users.
 *
 * @see docs/architecture.md (State Management section)
 * @see docs/stories/2-4-puzzle-state-auto-save-session-management.md
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Puzzle state interface
 *
 * Represents the complete state of a puzzle session including both the initial
 * puzzle configuration and user's progress.
 */
export interface PuzzleState {
  /**
   * Unique identifier for the current puzzle
   * Null if no puzzle loaded
   */
  puzzleId: string | null;

  /**
   * Initial puzzle configuration (clues/given numbers)
   * 9x9 array where 0 = empty, 1-9 = clue
   */
  puzzle: number[][] | null;

  /**
   * User's entries on the grid
   * 9x9 array where 0 = empty, 1-9 = user input
   * Separate from puzzle to track modifications
   */
  userEntries: number[][];

  /**
   * Currently selected cell coordinates
   * Null if no cell selected
   */
  selectedCell: { row: number; col: number } | null;

  /**
   * Elapsed time in seconds
   * Tracked for both timer display and completion recording
   */
  elapsedTime: number;

  /**
   * Puzzle completion status
   * True when puzzle successfully validated
   */
  isCompleted: boolean;
}

/**
 * Puzzle actions interface
 *
 * Methods for modifying puzzle state. All actions are synchronous and
 * trigger persistence automatically via Zustand middleware.
 */
export interface PuzzleActions {
  /**
   * Initialize puzzle with ID and clue configuration
   *
   * @param id - Unique puzzle identifier
   * @param puzzle - 9x9 array of puzzle clues
   */
  setPuzzle: (id: string, puzzle: number[][]) => void;

  /**
   * Update a single cell value
   *
   * Triggers auto-save via persistence middleware and debounced server sync.
   *
   * @param row - Row index (0-8)
   * @param col - Column index (0-8)
   * @param value - Number value (0 = clear, 1-9 = number)
   */
  updateCell: (row: number, col: number, value: number) => void;

  /**
   * Set the currently selected cell
   *
   * Used for keyboard input and UI highlighting.
   *
   * @param cell - Cell coordinates or null to clear selection
   */
  setSelectedCell: (cell: { row: number; col: number } | null) => void;

  /**
   * Update elapsed time
   *
   * Called by timer implementation to track puzzle duration.
   *
   * @param seconds - Elapsed time in seconds
   */
  setElapsedTime: (seconds: number) => void;

  /**
   * Update elapsed time (alias for setElapsedTime)
   *
   * Provides consistent naming with timer hook expectations.
   *
   * @param seconds - Elapsed time in seconds
   */
  updateElapsedTime: (seconds: number) => void;

  /**
   * Mark puzzle as completed
   *
   * Called after successful validation.
   */
  setCompleted: () => void;

  /**
   * Restore state from partial state object
   *
   * Used for loading saved progress from database or localStorage.
   * Merges provided state with existing state.
   *
   * @param state - Partial state to restore
   */
  restoreState: (state: Partial<PuzzleState>) => void;

  /**
   * Reset puzzle to initial state
   *
   * Clears all user entries and progress. Useful for "new puzzle" or "restart".
   */
  resetPuzzle: () => void;
}

/**
 * Initial state factory
 *
 * Creates empty 9x9 grid for user entries.
 */
const createEmptyGrid = (): number[][] => {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));
};

/**
 * Puzzle Store
 *
 * Zustand store with localStorage persistence middleware. Automatically saves
 * state changes to localStorage for guest users. Authenticated users will have
 * additional database sync via useAutoSave hook.
 *
 * @example
 * ```typescript
 * // In a component
 * const puzzle = usePuzzleStore((state) => state.puzzle)
 * const updateCell = usePuzzleStore((state) => state.updateCell)
 *
 * // Update cell when user enters number
 * updateCell(row, col, number)
 * ```
 */
export const usePuzzleStore = create<PuzzleState & PuzzleActions>()(
  persist(
    (set) => ({
      // Initial state
      puzzleId: null,
      puzzle: null,
      userEntries: createEmptyGrid(),
      selectedCell: null,
      elapsedTime: 0,
      isCompleted: false,

      // Actions
      setPuzzle: (id: string, puzzle: number[][]) =>
        set(() => ({
          puzzleId: id,
          puzzle,
          userEntries: createEmptyGrid(),
          selectedCell: null,
          elapsedTime: 0,
          isCompleted: false,
        })),

      updateCell: (row: number, col: number, value: number) =>
        set((state) => {
          const newEntries = state.userEntries.map((r, i) =>
            i === row ? r.map((c, j) => (j === col ? value : c)) : r
          );
          return { userEntries: newEntries };
        }),

      setSelectedCell: (cell: { row: number; col: number } | null) =>
        set(() => ({ selectedCell: cell })),

      setElapsedTime: (seconds: number) =>
        set(() => ({ elapsedTime: seconds })),

      updateElapsedTime: (seconds: number) =>
        set(() => ({ elapsedTime: seconds })),

      setCompleted: () => set(() => ({ isCompleted: true })),

      restoreState: (state: Partial<PuzzleState>) =>
        set((current) => ({
          ...current,
          ...state,
        })),

      resetPuzzle: () =>
        set(() => ({
          puzzleId: null,
          puzzle: null,
          userEntries: createEmptyGrid(),
          selectedCell: null,
          elapsedTime: 0,
          isCompleted: false,
        })),
    }),
    {
      name: 'sudoku-race-puzzle-state',
      partialize: (state) => ({
        puzzleId: state.puzzleId,
        userEntries: state.userEntries,
        selectedCell: state.selectedCell,
        elapsedTime: state.elapsedTime,
        isCompleted: state.isCompleted,
      }),
    }
  )
);
