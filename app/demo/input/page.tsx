"use client";

import * as React from "react";
import { SudokuGrid } from "@/components/puzzle/SudokuGrid";
import { NumberPad } from "@/components/puzzle/NumberPad";
import { Timer } from "@/components/puzzle/Timer";
import { useKeyboardInput } from "@/lib/hooks/useKeyboardInput";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { useStateRestoration } from "@/lib/hooks/useStateRestoration";
import { useTimer } from "@/lib/hooks/useTimer";

/**
 * Demo Page: Number Input System + Auto-Save + Timer
 *
 * Tests integration of:
 * - SudokuGrid component (from Story 2.2)
 * - NumberPad component (mobile touch input - Story 2.3)
 * - useKeyboardInput hook (desktop keyboard shortcuts - Story 2.3)
 * - Zustand store with auto-save (Story 2.4)
 * - State restoration from localStorage (Story 2.4)
 * - Timer component + useTimer hook (Story 2.5)
 *
 * Instructions:
 * - Mobile: Tap cells to select, use number pad at bottom to input
 * - Desktop: Click cells to select, press 1-9 to input, Backspace/Delete/0 to clear
 * - Arrow keys navigate between cells (from Grid component)
 * - Progress auto-saves to localStorage (refresh page to test)
 * - Timer auto-starts and pauses when tab loses focus
 */

// Sample puzzle (easy difficulty)
const DEMO_PUZZLE: number[][] = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const PUZZLE_ID = "demo-puzzle-001";

export default function InputDemoPage() {
  // Use Zustand store instead of local state
  const puzzle = usePuzzleStore((state) => state.puzzle);
  const userEntries = usePuzzleStore((state) => state.userEntries);
  const selectedCell = usePuzzleStore((state) => state.selectedCell);
  const elapsedTime = usePuzzleStore((state) => state.elapsedTime);
  const isCompleted = usePuzzleStore((state) => state.isCompleted);
  const setPuzzle = usePuzzleStore((state) => state.setPuzzle);
  const updateCell = usePuzzleStore((state) => state.updateCell);
  const setSelectedCell = usePuzzleStore((state) => state.setSelectedCell);

  // Initialize puzzle clues on mount
  React.useEffect(() => {
    const storedPuzzleId = usePuzzleStore.getState().puzzleId;

    if (!storedPuzzleId || storedPuzzleId !== PUZZLE_ID) {
      // First time or different puzzle - use setPuzzle (resets userEntries)
      setPuzzle(PUZZLE_ID, DEMO_PUZZLE);
    } else if (!puzzle) {
      // Same puzzle ID but clues not loaded (after localStorage restore)
      // Only restore clues without resetting userEntries
      usePuzzleStore.setState({ puzzle: DEMO_PUZZLE });
    }
  }, [puzzle, setPuzzle]);

  // State restoration (for authenticated users, this would load from DB)
  // For demo, localStorage restoration happens automatically via Zustand persist
  const isLoading = useStateRestoration(false, PUZZLE_ID);

  // Auto-save hook (for authenticated users, this would save to DB)
  // For demo, localStorage saving happens automatically via Zustand persist
  useAutoSave(false);

  // Timer hook - auto-starts on mount, pauses on tab visibility change
  useTimer();

  // Note: In production, this would call startTimer(PUZZLE_ID) on mount
  // For demo, localStorage persistence is sufficient

  const handleCellSelect = React.useCallback(
    (row: number, col: number) => {
      setSelectedCell({ row, col });
    },
    [setSelectedCell]
  );

  const handleNumberChange = React.useCallback(
    (row: number, col: number, value: number) => {
      updateCell(row, col, value);
    },
    [updateCell]
  );

  const isClueCell = React.useCallback(
    (row: number, col: number): boolean => {
      return DEMO_PUZZLE[row][col] !== 0;
    },
    []
  );

  const handleNumberPadChange = React.useCallback(
    (value: number) => {
      if (!selectedCell) return;
      handleNumberChange(selectedCell.row, selectedCell.col, value);
    },
    [selectedCell, handleNumberChange]
  );

  // Desktop keyboard shortcuts
  useKeyboardInput({
    selectedCell,
    onNumberChange: handleNumberChange,
    isClueCell,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-gray-600">Loading puzzle...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-black">
            Number Input System + Auto-Save + Timer Demo
          </h1>
          <p className="text-gray-600">
            Story 2.3 + 2.4 + 2.5: Input + Auto-Save + Timer
          </p>
        </div>

        {/* Timer Display */}
        <div className="flex justify-center">
          <Timer elapsedTime={elapsedTime} isCompleted={isCompleted} />
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 border-2 border-black p-4 space-y-2">
          <h2 className="font-bold text-lg">Instructions:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <strong>Mobile:</strong> Tap cells to select, use number pad at
              bottom
            </li>
            <li>
              <strong>Desktop:</strong> Click cells, press 1-9 to input,
              Backspace/Delete/0 to clear
            </li>
            <li>Arrow keys navigate between cells</li>
            <li>Clue cells (pre-filled numbers) cannot be modified</li>
            <li>
              <strong>Auto-Save:</strong> Progress auto-saves to localStorage -
              refresh page to test!
            </li>
            <li>
              <strong>Timer:</strong> Auto-starts on load, pauses when tab loses
              focus, resumes on return
            </li>
          </ul>
        </div>

        {/* Puzzle Grid */}
        <div className="flex justify-center pb-32 lg:pb-0">
          <SudokuGrid
            puzzle={DEMO_PUZZLE}
            userEntries={userEntries}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
            onNumberChange={handleNumberChange}
          />
        </div>

        {/* Selected Cell Info (Debug) */}
        {selectedCell && (
          <div className="text-center text-sm text-gray-600">
            Selected: Row {selectedCell.row + 1}, Col {selectedCell.col + 1}
            {isClueCell(selectedCell.row, selectedCell.col) && (
              <span className="ml-2 text-red-600">(Clue - Read Only)</span>
            )}
          </div>
        )}

        {/* Mobile Number Pad (sticky bottom) */}
        <NumberPad
          onNumberChange={handleNumberPadChange}
          selectedCell={selectedCell}
          isClueCell={
            selectedCell ? isClueCell(selectedCell.row, selectedCell.col) : false
          }
        />
      </div>
    </div>
  );
}
