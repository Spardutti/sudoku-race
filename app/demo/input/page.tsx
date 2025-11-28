"use client";

import * as React from "react";
import { SudokuGrid } from "@/components/puzzle/SudokuGrid";
import { NumberPad } from "@/components/puzzle/NumberPad";
import { useKeyboardInput } from "@/lib/hooks/useKeyboardInput";

/**
 * Demo Page: Number Input System
 *
 * Tests integration of:
 * - SudokuGrid component (from Story 2.2)
 * - NumberPad component (mobile touch input)
 * - useKeyboardInput hook (desktop keyboard shortcuts)
 *
 * Instructions:
 * - Mobile: Tap cells to select, use number pad at bottom to input
 * - Desktop: Click cells to select, press 1-9 to input, Backspace/Delete/0 to clear
 * - Arrow keys navigate between cells (from Grid component)
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

export default function InputDemoPage() {
  const [userEntries, setUserEntries] = React.useState<number[][]>(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(0))
  );

  const [selectedCell, setSelectedCell] = React.useState<{
    row: number;
    col: number;
  } | null>(null);

  const handleCellSelect = React.useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const handleNumberChange = React.useCallback(
    (row: number, col: number, value: number) => {
      setUserEntries((prev) => {
        const newEntries = prev.map((r) => [...r]);
        newEntries[row][col] = value;
        return newEntries;
      });
    },
    []
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

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-black">
            Number Input System Demo
          </h1>
          <p className="text-gray-600">
            Story 2.3: Touch & Keyboard Number Input
          </p>
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
