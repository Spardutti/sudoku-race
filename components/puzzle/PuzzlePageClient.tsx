"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { SudokuGrid } from "@/components/puzzle/SudokuGrid";
import { NumberPad } from "@/components/puzzle/NumberPad";
import { Timer } from "@/components/puzzle/Timer";
import { SubmitButton } from "@/components/puzzle/SubmitButton";
import { PuzzleHeader } from "@/components/puzzle/PuzzleHeader";
import { InstructionsCard } from "@/components/puzzle/InstructionsCard";
import { PuzzleLoadingView } from "@/components/puzzle/PuzzleLoadingView";
import { PuzzleCompletedView } from "@/components/puzzle/PuzzleCompletedView";
import { DevToolbar } from "@/components/dev/DevToolbar";
import { useKeyboardInput } from "@/lib/hooks/useKeyboardInput";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { useStateRestoration } from "@/lib/hooks/useStateRestoration";
import { useTimer } from "@/lib/hooks/useTimer";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import { usePuzzleSubmission } from "@/lib/hooks/usePuzzleSubmission";
import { useMigrationNotification } from "@/lib/hooks/useMigrationNotification";
import { startTimer } from "@/actions/puzzle";
import type { Puzzle } from "@/actions/puzzle";
import { calculatePuzzleNumber } from "@/lib/utils/share-text";

const CompletionModal = dynamic(
  () => import("@/components/puzzle/CompletionModal").then((mod) => mod.CompletionModal),
  { ssr: false }
);

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
  const setPuzzle = usePuzzleStore((state) => state.setPuzzle);
  const updateCell = usePuzzleStore((state) => state.updateCell);
  const setSelectedCell = usePuzzleStore((state) => state.setSelectedCell);
  const trackCellEntry = usePuzzleStore((state) => state.trackCellEntry);
  const puzzleData = usePuzzleStore((state) => state.puzzle);
  const solvePath = usePuzzleStore((state) => state.solvePath);

  const isOnline = useNetworkStatus();
  const userId = initialUserId || null;
  const alreadyCompleted = initialCompletionStatus?.isCompleted || false;
  const previousCompletionTime = initialCompletionStatus?.completionTime || null;

  React.useEffect(() => {
    const storedPuzzleId = usePuzzleStore.getState().puzzleId;

    if (!storedPuzzleId || storedPuzzleId !== puzzle.id) {
      setPuzzle(puzzle.id, puzzle.puzzle_data);
    } else if (!usePuzzleStore.getState().puzzle) {
      usePuzzleStore.setState({ puzzle: puzzle.puzzle_data });
    }
  }, [puzzle.id, puzzle.puzzle_data, setPuzzle]);

  const isLoading = useStateRestoration(!!userId, puzzle.id);
  useAutoSave(false);
  useTimer();
  useMigrationNotification();

  React.useEffect(() => {
    if (userId && !alreadyCompleted) {
      startTimer(puzzle.id).catch((error) => {
        console.error("Failed to start server timer:", error);
      });
    }
  }, [userId, puzzle.id, alreadyCompleted]);

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
      if (puzzle.puzzle_data[row][col] !== 0) return;
      if (value === 0) {
        updateCell(row, col, value);
        return;
      }

      updateCell(row, col, value);
      trackCellEntry(row, col, value);
    },
    [updateCell, trackCellEntry, puzzle.puzzle_data]
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

  useKeyboardInput({
    selectedCell,
    onNumberChange: handleNumberChange,
    isClueCell,
  });

  const isGridComplete = React.useMemo(() => {
    return userEntries.every((row, rowIndex) =>
      row.every((cell, colIndex) => {
        const isClue = puzzle.puzzle_data[rowIndex][colIndex] !== 0;
        return isClue || cell !== 0;
      })
    );
  }, [userEntries, puzzle.puzzle_data]);

  const {
    isSubmitting,
    validationMessage,
    showAnimation,
    showCompletionModal,
    serverCompletionTime,
    serverRank,
    streakData,
    handleSubmit,
    setShowCompletionModal,
  } = usePuzzleSubmission({
    puzzleId: puzzle.id,
    puzzle: puzzle.puzzle_data,
    userEntries,
    isGridComplete,
    elapsedTime,
    userId,
  });

  if (isLoading) {
    return <PuzzleLoadingView />;
  }

  if (alreadyCompleted && previousCompletionTime) {
    return (
      <PuzzleCompletedView
        completionTime={previousCompletionTime}
        puzzleId={puzzle.id}
        solution={puzzle.solution}
        userId={userId}
      />
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
        <section className="flex justify-center px-2" aria-label="Sudoku grid">
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
        <div className="max-w-xs mx-auto pb-48 lg:pb-0">
          <SubmitButton
            onSubmit={handleSubmit}
            isDisabled={!isGridComplete}
            isLoading={isSubmitting}
            isCompleted={isCompleted}
          />
        </div>

        {validationMessage && (
          <div
            role="alert"
            className="max-w-xs mx-auto p-4 bg-blue-50 border-2 border-blue-200 rounded-md text-center"
          >
            <p className="text-blue-900 font-semibold">{validationMessage}</p>
          </div>
        )}

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

        {process.env.NODE_ENV !== "production" && (
          <DevToolbar
            puzzleId={puzzle.id}
            solution={puzzle.solution}
            userId={userId}
          />
        )}

        <NumberPad
          onNumberChange={handleNumberPadChange}
          selectedCell={selectedCell}
          isClueCell={
            selectedCell ? isClueCell(selectedCell.row, selectedCell.col) : false
          }
        />

        <CompletionModal
          isOpen={showCompletionModal}
          completionTime={serverCompletionTime ?? elapsedTime}
          puzzleId={puzzle.id}
          isAuthenticated={!!userId}
          rank={serverRank}
          onClose={() => setShowCompletionModal(false)}
          puzzle={puzzleData ?? puzzle.puzzle_data}
          solvePath={solvePath}
          puzzleNumber={calculatePuzzleNumber(puzzle.puzzle_date)}
          streakData={streakData}
        />
      </main>
    </div>
  );
}
