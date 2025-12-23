"use client";

import * as React from "react";
import { PuzzleLoadingView } from "@/components/puzzle/PuzzleLoadingView";
import { PuzzleCompletedView } from "@/components/puzzle/PuzzleCompletedView";
import { PuzzleActiveView } from "@/components/puzzle/PuzzleActiveView";
import { CompletionModalWrapper } from "@/components/puzzle/CompletionModalWrapper";
import { useKeyboardInput } from "@/lib/hooks/useKeyboardInput";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { useStateRestoration } from "@/lib/hooks/useStateRestoration";
import { useTimer } from "@/lib/hooks/useTimer";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import { usePuzzleSubmission } from "@/lib/hooks/usePuzzleSubmission";
import { useMigrationNotification } from "@/lib/hooks/useMigrationNotification";
import { useTimerActions } from "@/lib/hooks/useTimerActions";
import { useAuthState } from "@/lib/hooks/useAuthState";
import { usePuzzleEventHandlers } from "@/lib/hooks/usePuzzleEventHandlers";
import { usePuzzleInitialization } from "@/lib/hooks/usePuzzleInitialization";
import { usePuzzleSetup } from "@/lib/hooks/usePuzzleSetup";
import { usePuzzleCompletion } from "@/lib/hooks/usePuzzleCompletion";
import { usePuzzleState } from "@/lib/hooks/usePuzzleState";
import { usePuzzleValidation } from "@/lib/hooks/usePuzzleValidation";
import type { Puzzle } from "@/actions/puzzle";

type PuzzlePageClientProps = {
  puzzle: Puzzle;
  initialCompletionStatus?: { isCompleted: boolean; completionTime?: number; rank?: number };
  serverUserId?: string | null;
};

export const PuzzlePageClient = ({ puzzle, initialCompletionStatus, serverUserId }: PuzzlePageClientProps) => {
  const state = usePuzzleState();
  const isOnline = useNetworkStatus();
  const { user } = useAuthState();
  const userId = serverUserId ?? user?.id ?? null;
  const alreadyCompleted = initialCompletionStatus?.isCompleted || false;
  const previousCompletionTime = initialCompletionStatus?.completionTime ?? null;
  const previousRank = initialCompletionStatus?.rank;
  const isLoading = useStateRestoration(!!userId, puzzle.id);

  usePuzzleSetup(puzzle, isLoading);
  useAutoSave(!!userId);
  useTimer();
  useMigrationNotification();

  const { handlePause, handleResume, isPauseLoading, isResumeLoading, lastError: timerError } = useTimerActions({
    puzzleId: puzzle.id,
    userId,
  });

  usePuzzleInitialization({
    puzzleId: puzzle.id,
    userId,
    isStarted: state.isStarted,
    isPaused: state.isPaused,
    isCompleted: state.isCompleted,
    alreadyCompleted,
    isLoading,
    isPauseLoading,
    isResumeLoading,
    handlePause,
    handleResume,
  });

  const { handleCellSelect, handleNumberChange, isClueCell, isCellFilled } = usePuzzleEventHandlers({
    puzzle: puzzle.puzzle_data,
    noteMode: state.noteMode,
    lockMode: state.lockMode,
    pencilMarks: state.pencilMarks,
  });

  const { hasUnlockedCells, isGridComplete } = usePuzzleValidation({
    userEntries: state.userEntries,
    puzzle: puzzle.puzzle_data,
    lockedCells: state.lockedCells,
  });

  const handleNumberPadChange = React.useCallback(
    (value: number) => {
      if (!state.selectedCell) return;
      handleNumberChange(state.selectedCell.row, state.selectedCell.col, value);
    },
    [state.selectedCell, handleNumberChange]
  );

  useKeyboardInput({
    selectedCell: state.selectedCell,
    onNumberChange: handleNumberChange,
    isClueCell,
    noteMode: state.noteMode,
    onToggleNoteMode: state.toggleNoteMode,
    lockMode: state.lockMode,
    onToggleLockMode: state.toggleLockMode,
    onToggleCellLock: state.toggleCellLock,
    isCellFilled,
  });

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
    userEntries: state.userEntries,
    isGridComplete,
    elapsedTime: state.elapsedTime,
    userId,
  });

  usePuzzleCompletion({ isCompleted: state.isCompleted, setShowCompletionModal });

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
        solvePath={state.solvePath}
        puzzleNumber={puzzle.puzzle_number}
        rank={previousRank}
        streakData={streakData}
        difficulty={state.difficulty ?? undefined}
      />
    );
  }

  if (!state.isStarted && !alreadyCompleted) {
    return <PuzzleLoadingView />;
  }

  return (
    <>
      <PuzzleActiveView
        puzzle={puzzle.puzzle_data}
        puzzleId={puzzle.id}
        puzzleDate={puzzle.puzzle_date}
        solution={puzzle.solution}
        userEntries={state.userEntries}
        selectedCell={state.selectedCell}
        elapsedTime={state.elapsedTime}
        isCompleted={state.isCompleted}
        isStarted={state.isStarted}
        isPaused={state.isPaused}
        noteMode={state.noteMode}
        lockMode={state.lockMode}
        pencilMarks={state.pencilMarks}
        lockedCells={state.lockedCells}
        isGridComplete={isGridComplete}
        isSubmitting={isSubmitting}
        validationMessage={validationMessage}
        showAnimation={showAnimation}
        hasUnlockedCells={hasUnlockedCells}
        isOnline={isOnline}
        timerError={timerError}
        isPauseLoading={isPauseLoading}
        isResumeLoading={isResumeLoading}
        userId={userId}
        onCellSelect={handleCellSelect}
        onNumberChange={handleNumberChange}
        onNumberPadChange={handleNumberPadChange}
        onToggleNoteModeAction={state.toggleNoteMode}
        onToggleLockModeAction={state.toggleLockMode}
        onResetUnlockedAction={state.resetUnlockedCells}
        onSubmit={handleSubmit}
        onPause={handlePause}
        onResume={handleResume}
        isClueCell={isClueCell}
      />
      <CompletionModalWrapper
        isOpen={showCompletionModal}
        serverCompletionTime={serverCompletionTime}
        elapsedTime={state.elapsedTime}
        puzzleId={puzzle.id}
        userId={userId}
        serverRank={serverRank}
        onClose={() => setShowCompletionModal(false)}
        puzzleData={state.puzzleData ?? null}
        puzzleFallback={puzzle.puzzle_data}
        solvePath={state.solvePath}
        puzzleNumber={puzzle.puzzle_number}
        streakData={streakData}
        difficulty={state.difficulty ?? undefined}
      />
    </>
  );
};
