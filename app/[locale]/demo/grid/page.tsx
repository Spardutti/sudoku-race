/**
 * SudokuGrid Component Demo Page
 *
 * Interactive demo for manual testing of the SudokuGrid component.
 * Demonstrates cell selection, keyboard navigation, and responsive design.
 *
 * Access at: http://localhost:3000/demo/grid
 *
 * @see components/puzzle/SudokuGrid.tsx
 * @see docs/stories/2-2-sudoku-grid-ui-component-mobile-optimized.md
 */

"use client";

import { useState } from "react";
import { SudokuGrid } from "@/components/puzzle/SudokuGrid";

/**
 * Create empty 9x9 grid
 */
function createEmptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

/**
 * Sample puzzle with moderate difficulty
 * Pattern: Classic Sudoku layout with strategic clues
 */
const samplePuzzle: number[][] = [
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

export default function GridDemoPage() {
  const [userEntries, setUserEntries] = useState<number[][]>(
    createEmptyGrid()
  );
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  /**
   * Handle number change from simulated input
   * In real app, this will be triggered by NumberPad component (Story 2.3)
   */
  function handleNumberChange(row: number, col: number, value: number) {
    const newEntries = userEntries.map((r) => [...r]);
    newEntries[row][col] = value;
    setUserEntries(newEntries);
  }

  /**
   * Simulate number entry when user clicks number button
   */
  function handleNumberClick(num: number) {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    // Only allow input on non-clue cells
    if (samplePuzzle[row][col] === 0) {
      handleNumberChange(row, col, num);
      setSelectedNumber(num);
    }
  }

  /**
   * Clear selected cell
   */
  function handleClear() {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    // Only allow clearing non-clue cells
    if (samplePuzzle[row][col] === 0) {
      handleNumberChange(row, col, 0);
      setSelectedNumber(null);
    }
  }

  /**
   * Reset entire grid
   */
  function handleReset() {
    setUserEntries(createEmptyGrid());
    setSelectedCell(null);
    setSelectedNumber(null);
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">
            SudokuGrid Demo
          </h1>
          <p className="text-neutral">
            Interactive testing for Story 2.2 - Sudoku Grid UI Component
          </p>
        </div>

        {/* Grid Component */}
        <div className="mb-8">
          <SudokuGrid
            puzzle={samplePuzzle}
            userEntries={userEntries}
            selectedCell={selectedCell}
            onCellSelect={(row, col) => setSelectedCell({ row, col })}
            onNumberChange={handleNumberChange}
          />
        </div>

        {/* Number Input Simulation (Story 2.3 will add real NumberPad) */}
        <div className="max-w-[360px] sm:max-w-[540px] mx-auto mb-8">
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={!selectedCell}
                className="min-h-[52px] px-4 text-lg font-sans border-2 border-primary bg-background text-primary hover:bg-primary hover:text-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={!selectedCell}
              className="col-span-1 min-h-[52px] px-4 text-lg font-sans border-2 border-primary bg-background text-primary hover:bg-primary hover:text-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-[360px] sm:max-w-[540px] mx-auto mb-8">
          <button
            onClick={handleReset}
            className="w-full min-h-[52px] px-6 text-lg font-medium border-2 border-primary bg-primary text-background hover:bg-background hover:text-primary transition-colors"
          >
            Reset Grid
          </button>
        </div>

        {/* Debug Info */}
        <div className="max-w-[360px] sm:max-w-[540px] mx-auto border-2 border-black p-4">
          <h2 className="text-xl font-serif font-bold mb-4">Debug Info</h2>

          <div className="space-y-2 text-sm font-sans">
            <div>
              <strong>Selected Cell:</strong>{" "}
              {selectedCell
                ? `Row ${selectedCell.row + 1}, Col ${selectedCell.col + 1}`
                : "None"}
            </div>

            <div>
              <strong>Cell Type:</strong>{" "}
              {selectedCell
                ? samplePuzzle[selectedCell.row][selectedCell.col] !== 0
                  ? "Clue (read-only)"
                  : "Empty (editable)"
                : "N/A"}
            </div>

            <div>
              <strong>Cell Value:</strong>{" "}
              {selectedCell
                ? userEntries[selectedCell.row][selectedCell.col] !== 0
                  ? `User entry: ${userEntries[selectedCell.row][selectedCell.col]}`
                  : samplePuzzle[selectedCell.row][selectedCell.col] !== 0
                    ? `Clue: ${samplePuzzle[selectedCell.row][selectedCell.col]}`
                    : "Empty"
                : "N/A"}
            </div>

            <div>
              <strong>Last Number Entered:</strong>{" "}
              {selectedNumber ?? "None"}
            </div>

            <div>
              <strong>Filled Cells:</strong>{" "}
              {userEntries.flat().filter((n) => n !== 0).length} user entries,{" "}
              {samplePuzzle.flat().filter((n) => n !== 0).length} clues
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="max-w-[360px] sm:max-w-[540px] mx-auto mt-8 border-2 border-black p-4">
          <h2 className="text-xl font-serif font-bold mb-4">
            Testing Instructions
          </h2>

          <div className="space-y-4 text-sm font-sans">
            <div>
              <strong>Cell Selection:</strong>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>Click/tap empty cells to select them</li>
                <li>Gray clue cells cannot be selected</li>
                <li>Only one cell can be selected at a time</li>
                <li>Selected cells have blue highlight</li>
              </ul>
            </div>

            <div>
              <strong>Keyboard Navigation:</strong>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>Arrow keys move selection (wraps at edges)</li>
                <li>Tab focuses the grid container</li>
                <li>Press Tab, then use arrow keys to navigate</li>
              </ul>
            </div>

            <div>
              <strong>Number Input:</strong>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>Select empty cell, then click number button</li>
                <li>Click &quot;Clear&quot; to remove user entry</li>
                <li>Clue cells cannot be modified</li>
              </ul>
            </div>

            <div>
              <strong>Responsive Testing:</strong>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>Resize browser to test mobile (320px width)</li>
                <li>Verify grid scales without horizontal scroll</li>
                <li>Check tap targets are large enough (44x44px min)</li>
              </ul>
            </div>

            <div>
              <strong>Accessibility Testing:</strong>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>Use screen reader to verify cell announcements</li>
                <li>Navigate with keyboard only (no mouse)</li>
                <li>Check focus indicators are visible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
