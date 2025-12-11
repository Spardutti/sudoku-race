"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { SudokuGrid } from "@/components/puzzle/SudokuGrid";
import { NumberPad } from "@/components/puzzle/NumberPad";
import { Timer } from "@/components/puzzle/Timer";
import { SubmitButton } from "@/components/puzzle/SubmitButton";
import { PuzzleHeader } from "@/components/puzzle/PuzzleHeader";
import { InstructionsCard } from "@/components/puzzle/InstructionsCard";
import { PuzzleLoadingView } from "@/components/puzzle/PuzzleLoadingView";
import { PuzzleCompletedView } from "@/components/puzzle/PuzzleCompletedView";
import { DevToolbar } from "@/components/dev/DevToolbar";
import { PauseOverlay } from "@/components/puzzle/PauseOverlay";
import { PauseButton } from "@/components/puzzle/PauseButton";
import { useKeyboardInput } from "@/lib/hooks/useKeyboardInput";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { useStateRestoration } from "@/lib/hooks/useStateRestoration";
import { useTimer } from "@/lib/hooks/useTimer";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import { usePuzzleSubmission } from "@/lib/hooks/usePuzzleSubmission";
import { useMigrationNotification } from "@/lib/hooks/useMigrationNotification";
import { useTimerActions } from "@/lib/hooks/useTimerActions";
import { useAuthState } from "@/lib/hooks/useAuthState";
import { startTimer } from "@/actions/puzzle";
import type { Puzzle } from "@/actions/puzzle";

const CompletionModal = dynamic(
  () => import("@/components/puzzle/CompletionModal").then((mod) => mod.CompletionModal),
  { ssr: false }
);

type PuzzlePageClientProps = {
  puzzle: Puzzle;
  initialCompletionStatus?: { isCompleted: boolean; completionTime?: number; rank?: number };
};

export function PuzzlePageClient({ puzzle, initialCompletionStatus }: PuzzlePageClientProps) {
  const searchParams = useSearchParams();
  const userEntries = usePuzzleStore((state) => state.userEntries);
  const selectedCell = usePuzzleStore((state) => state.selectedCell);
  const elapsedTime = usePuzzleStore((state) => state.elapsedTime);
  const isCompleted = usePuzzleStore((state) => state.isCompleted);
  const isStarted = usePuzzleStore((state) => state.isStarted);
  const isPaused = usePuzzleStore((state) => state.isPaused);
  const setPuzzle = usePuzzleStore((state) => state.setPuzzle);
  const updateCell = usePuzzleStore((state) => state.updateCell);
  const setSelectedCell = usePuzzleStore((state) => state.setSelectedCell);
  const trackCellEntry = usePuzzleStore((state) => state.trackCellEntry);
  const puzzleData = usePuzzleStore((state) => state.puzzle);
  const solvePath = usePuzzleStore((state) => state.solvePath);
  const noteMode = usePuzzleStore((state) => state.noteMode);
  const pencilMarks = usePuzzleStore((state) => state.pencilMarks);
  const toggleNoteMode = usePuzzleStore((state) => state.toggleNoteMode);
  const addPencilMark = usePuzzleStore((state) => state.addPencilMark);
  const removePencilMark = usePuzzleStore((state) => state.removePencilMark);
  const startPuzzle = usePuzzleStore((state) => state.startPuzzle);

  const isOnline = useNetworkStatus();
  const { user } = useAuthState();
  const userId = user?.id || null;
  const alreadyCompleted = initialCompletionStatus?.isCompleted || false;
  const previousCompletionTime = initialCompletionStatus?.completionTime ?? null;
  const previousRank = initialCompletionStatus?.rank;

  const isLoading = useStateRestoration(!!userId, puzzle.id);

  React.useEffect(() => {
    if (isLoading) return;

    const storedPuzzleId = usePuzzleStore.getState().puzzleId;

    if (!storedPuzzleId || storedPuzzleId !== puzzle.id) {
      setPuzzle(puzzle.id, puzzle.puzzle_data, puzzle.difficulty, puzzle.puzzle_date);
    } else if (!usePuzzleStore.getState().puzzle) {
      usePuzzleStore.setState({ puzzle: puzzle.puzzle_data });
    }
  }, [puzzle.id, puzzle.puzzle_data, puzzle.difficulty, puzzle.puzzle_date, setPuzzle, isLoading]);
  useAutoSave(!!userId);
  useTimer();
  useMigrationNotification();

  const {
    handlePause,
    handleResume,
    isPauseLoading,
    isResumeLoading,
    lastError: timerError,
  } = useTimerActions({
    puzzleId: puzzle.id,
    userId,
  });

  const handleStart = React.useCallback(() => {
    startPuzzle();
    if (userId) {
      startTimer(puzzle.id).catch((error) => {
        console.error("Failed to start server timer:", error);
      });
    }
  }, [startPuzzle, userId, puzzle.id]);

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p' && isStarted && !isCompleted) {
        e.preventDefault();

        if (isPauseLoading || isResumeLoading) return;

        if (isPaused) {
          handleResume();
        } else {
          handlePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isStarted, isPaused, isCompleted, isPauseLoading, isResumeLoading, handlePause, handleResume]);

  React.useEffect(() => {
    if (!isStarted && !alreadyCompleted && !isLoading) {
      handleStart();
    }
  }, [isStarted, alreadyCompleted, isLoading, handleStart]);

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
      if (puzzle.puzzle_data[row][col] !== 0 && !noteMode) return;

      if (noteMode) {
        if (value === 0) return;
        const key = `${row}-${col}`;
        const marks = pencilMarks[key] || [];
        if (marks.includes(value)) {
          removePencilMark(row, col, value);
        } else {
          addPencilMark(row, col, value);
        }
        return;
      }

      if (value === 0) {
        updateCell(row, col, value);
        return;
      }

      updateCell(row, col, value);
      trackCellEntry(row, col, value);
    },
    [updateCell, trackCellEntry, puzzle.puzzle_data, noteMode, pencilMarks, addPencilMark, removePencilMark]
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
    noteMode,
    onToggleNoteMode: toggleNoteMode,
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

  React.useEffect(() => {
    if (!searchParams) return;
    const showCompletion = searchParams.get("showCompletion");
    if (showCompletion === "true" && isCompleted) {
      setShowCompletionModal(true);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/puzzle");
      }
    }
  }, [searchParams, isCompleted, setShowCompletionModal]);

  if (isLoading) {
    return <PuzzleLoadingView />;
  }

  if (alreadyCompleted && typeof previousCompletionTime === 'number') {
    return (
      <PuzzleCompletedView
        completionTime={previousCompletionTime}
        puzzleId={puzzle.id}
        solution={puzzle.solution}
        userId={userId}
        puzzle={puzzle.puzzle_data}
        solvePath={solvePath}
        puzzleNumber={puzzle.puzzle_number}
        rank={previousRank}
        streakData={streakData}
      />
    );
  }

  if (!isStarted && !alreadyCompleted) {
    return <PuzzleLoadingView />;
  }

  return (
    <div className="flex flex-col min-h-full bg-white relative">
      {isPaused && !isCompleted && <PauseOverlay onResume={handleResume} disabled={isPauseLoading || isResumeLoading} />}

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-1 md:p-4">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 md:space-y-6">
        {/* Header */}
        <PuzzleHeader
          puzzleDate={puzzle.puzzle_date}
          noteMode={noteMode}
          onToggleNoteMode={toggleNoteMode}
        />

        {/* Timer and Pause Button */}
        <div className="flex justify-center items-center gap-4 mb-0">
          <Timer elapsedTime={elapsedTime} isCompleted={isCompleted} />
          {isStarted && !isPaused && !isCompleted && (
            <PauseButton onPause={handlePause} disabled={isPauseLoading || isResumeLoading} />
          )}
        </div>

        {/* Instructions (first visit only) */}
        <InstructionsCard />

        {/* Puzzle Grid */}
        <section className="flex justify-center px-0 grow" aria-label="Sudoku grid">
          <div className={`w-full px-1 ${showAnimation ? "animate-completion" : ""}`}>
            <SudokuGrid
              puzzle={puzzle.puzzle_data}
              userEntries={userEntries}
              selectedCell={selectedCell}
              onCellSelect={handleCellSelect}
              onNumberChange={handleNumberChange}
              pencilMarks={pencilMarks}
              isBlurred={!isStarted || isPaused}
            />
          </div>
        </section>

        {/* Submit Button */}
        <div className="max-w-xs mx-auto">
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

        {timerError && (
          <div
            role="alert"
            className="max-w-xs mx-auto p-4 bg-red-50 border-2 border-red-200 rounded-md text-center"
          >
            <p className="text-red-900 font-semibold">{timerError}</p>
          </div>
        )}

        {process.env.NODE_ENV !== "production" && (
          <DevToolbar
            puzzleId={puzzle.id}
            solution={puzzle.solution}
            userId={userId}
          />
        )}
          </div>
        </div>

        <NumberPad
          onNumberChange={handleNumberPadChange}
          selectedCell={selectedCell}
          isClueCell={
            selectedCell ? isClueCell(selectedCell.row, selectedCell.col) : false
          }
        />
      </main>

      <CompletionModal
        isOpen={showCompletionModal}
        completionTime={(() => {
          const storedCompletionTime = usePuzzleStore.getState().completionTime;
          return serverCompletionTime ?? storedCompletionTime ?? elapsedTime;
        })()}
        puzzleId={puzzle.id}
        isAuthenticated={!!userId}
        rank={serverRank}
        onClose={() => setShowCompletionModal(false)}
        puzzle={puzzleData ?? puzzle.puzzle_data}
        solvePath={solvePath}
        puzzleNumber={puzzle.puzzle_number}
        streakData={streakData}
      />
    </div>
  );
}
