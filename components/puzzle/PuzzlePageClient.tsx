"use client";

import * as React from "react";
import Link from "next/link";
import { SudokuGrid } from "@/components/puzzle/SudokuGrid";
import { NumberPad } from "@/components/puzzle/NumberPad";
import { Timer } from "@/components/puzzle/Timer";
import { SubmitButton } from "@/components/puzzle/SubmitButton";
import dynamic from "next/dynamic";

const CompletionModal = dynamic(
  () => import("@/components/puzzle/CompletionModal").then((mod) => mod.CompletionModal),
  { ssr: false }
);
import { PuzzleHeader } from "@/components/puzzle/PuzzleHeader";
import { InstructionsCard } from "@/components/puzzle/InstructionsCard";
import { useKeyboardInput } from "@/lib/hooks/useKeyboardInput";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { useStateRestoration } from "@/lib/hooks/useStateRestoration";
import { useTimer } from "@/lib/hooks/useTimer";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import { validateSolution, submitCompletion } from "@/actions/puzzle";
import type { Puzzle } from "@/actions/puzzle";

type PuzzlePageClientProps = {
  puzzle: Puzzle;
  initialUserId?: string | null;
  initialCompletionStatus?: { isCompleted: boolean; completionTime?: number };
};

export function PuzzlePageClient({ puzzle, initialUserId, initialCompletionStatus }: PuzzlePageClientProps) {
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

  const isOnline = useNetworkStatus();
  const userId = initialUserId || null;
  const alreadyCompleted = initialCompletionStatus?.isCompleted || false;
  const previousCompletionTime = initialCompletionStatus?.completionTime || null;

  // Initialize puzzle on mount
  React.useEffect(() => {
    const storedPuzzleId = usePuzzleStore.getState().puzzleId;

    if (!storedPuzzleId || storedPuzzleId !== puzzle.id) {
      setPuzzle(puzzle.id, puzzle.puzzle_data);
    } else if (!usePuzzleStore.getState().puzzle) {
      usePuzzleStore.setState({ puzzle: puzzle.puzzle_data });
    }
  }, [puzzle.id, puzzle.puzzle_data, setPuzzle]);


  // State restoration (loads from localStorage or DB for auth users)
  const isLoading = useStateRestoration(false, puzzle.id);

  // Auto-save (localStorage for guests, DB for auth users)
  useAutoSave(false);

  // Timer - auto-starts on mount
  useTimer();

  // Auto-focus grid on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const firstCell = document.querySelector<HTMLButtonElement>(
        '[data-cell-button="true"]'
      );
      firstCell?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
      return puzzle.puzzle_data[row][col] !== 0;
    },
    [puzzle.puzzle_data]
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

    const result = await validateSolution(puzzle.id, userEntries);

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

    const completionResult = await submitCompletion(puzzle.id, userEntries);
    if (!completionResult.success) {
      console.error("Failed to submit completion:", completionResult.error);
    }

    setIsSubmitting(false);
  }, [isGridComplete, isSubmitting, isCompleted, userEntries, elapsedTime, markCompleted, puzzle.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-gray-600">Loading puzzle...</div>
        </div>
      </div>
    );
  }

  if (alreadyCompleted && previousCompletionTime) {
    const minutes = Math.floor(previousCompletionTime / 60);
    const seconds = previousCompletionTime % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-black">
              Puzzle Complete!
            </h1>
            <p className="text-gray-600">
              You&apos;ve already completed today&apos;s puzzle in {timeString}
            </p>
          </div>
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <PuzzleHeader puzzleDate={puzzle.puzzle_date} />

        {/* Timer */}
        <div className="flex justify-center">
          <Timer elapsedTime={elapsedTime} isCompleted={isCompleted} />
        </div>

        {/* Instructions (first visit only) */}
        <InstructionsCard />

        {/* Puzzle Grid */}
        <section className="flex justify-center pb-32 lg:pb-0" aria-label="Sudoku grid">
          <div className={showAnimation ? "animate-completion" : ""}>
            <SudokuGrid
              puzzle={puzzle.puzzle_data}
              userEntries={userEntries}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onNumberChange={handleNumberChange}
            />
          </div>
        </section>

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
          <div
            role="alert"
            className="max-w-xs mx-auto p-4 bg-blue-50 border-2 border-blue-200 rounded-md text-center"
          >
            <p className="text-blue-900 font-semibold">{validationMessage}</p>
          </div>
        )}

        {/* Offline Message */}
        {!isOnline && (
          <div
            role="alert"
            className="max-w-xs mx-auto p-4 bg-orange-50 border-2 border-orange-200 rounded-md text-center"
          >
            <p className="text-orange-900 font-semibold">
              You&apos;re offline. Please check your connection.
            </p>
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
          puzzleId={puzzle.id}
          isAuthenticated={!!userId}
          onClose={() => setShowCompletionModal(false)}
        />
      </main>
    </div>
  );
}
