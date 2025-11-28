"use client";

import * as React from "react";
import { SudokuGrid } from "@/components/puzzle/SudokuGrid";
import { NumberPad } from "@/components/puzzle/NumberPad";
import { Timer } from "@/components/puzzle/Timer";
import { SubmitButton } from "@/components/puzzle/SubmitButton";
import { CompletionModal } from "@/components/puzzle/CompletionModal";
import { useKeyboardInput } from "@/lib/hooks/useKeyboardInput";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { useStateRestoration } from "@/lib/hooks/useStateRestoration";
import { useTimer } from "@/lib/hooks/useTimer";
import { validateSolution, submitCompletion } from "@/actions/puzzle";

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
  const completionTime = usePuzzleStore((state) => state.completionTime);
  const setPuzzle = usePuzzleStore((state) => state.setPuzzle);
  const updateCell = usePuzzleStore((state) => state.updateCell);
  const setSelectedCell = usePuzzleStore((state) => state.setSelectedCell);
  const markCompleted = usePuzzleStore((state) => state.markCompleted);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationMessage, setValidationMessage] = React.useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  const [showAnimation, setShowAnimation] = React.useState(false);

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

  const isGridComplete = React.useMemo(() => {
    return userEntries.every((row) => row.every((cell) => cell !== 0));
  }, [userEntries]);

  const handleSubmit = React.useCallback(async () => {
    if (!isGridComplete || isSubmitting || isCompleted) return;

    setIsSubmitting(true);
    setValidationMessage(null);

    const result = await validateSolution(PUZZLE_ID, userEntries);

    if (!result.success) {
      setValidationMessage(result.error);
      setIsSubmitting(false);
      setTimeout(() => setValidationMessage(null), 4000);
      return;
    }

    if (!result.data.isValid) {
      setValidationMessage("Not quite right. Keep trying!");
      setIsSubmitting(false);
      setTimeout(() => {
        setValidationMessage(null);
      }, 4000);
      return;
    }

    markCompleted(elapsedTime);
    setShowAnimation(true);

    setTimeout(() => {
      setShowAnimation(false);
      setShowCompletionModal(true);
    }, 1200);

    const completionResult = await submitCompletion(PUZZLE_ID, userEntries);
    if (!completionResult.success) {
      console.error("Failed to submit completion:", completionResult.error);
    }

    setIsSubmitting(false);
  }, [isGridComplete, isSubmitting, isCompleted, userEntries, elapsedTime, markCompleted]);

  React.useEffect(() => {
    if (validationMessage) {
      const timer = setTimeout(() => setValidationMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [validationMessage]);

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
          <div className={showAnimation ? "animate-completion" : ""}>
            <SudokuGrid
              puzzle={DEMO_PUZZLE}
              userEntries={userEntries}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onNumberChange={handleNumberChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="max-w-xs mx-auto">
          <SubmitButton
            onSubmit={handleSubmit}
            isDisabled={!isGridComplete || isCompleted}
            isLoading={isSubmitting}
          />
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <div className="max-w-xs mx-auto p-4 bg-blue-50 border-2 border-blue-200 rounded-md text-center">
            <p className="text-blue-900 font-semibold">{validationMessage}</p>
          </div>
        )}

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

        {/* Completion Modal */}
        <CompletionModal
          isOpen={showCompletionModal}
          completionTime={completionTime || elapsedTime}
          puzzleId={PUZZLE_ID}
          isAuthenticated={false}
          onClose={() => setShowCompletionModal(false)}
        />
      </div>
    </div>
  );
}
