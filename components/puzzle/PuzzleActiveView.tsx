"use client";

import * as React from "react";
import { SudokuGrid } from "@/components/puzzle/SudokuGrid";
import { NumberPad } from "@/components/puzzle/NumberPad";
import { Timer } from "@/components/puzzle/Timer";
import { SubmitButton } from "@/components/puzzle/SubmitButton";
import { PuzzleHeader } from "@/components/puzzle/PuzzleHeader";
import { InstructionsCard } from "@/components/puzzle/InstructionsCard";
import { DevToolbar } from "@/components/dev/DevToolbar";
import { PauseOverlay } from "@/components/puzzle/PauseOverlay";
import { PauseButton } from "@/components/puzzle/PauseButton";

type PuzzleActiveViewProps = {
  puzzle: number[][];
  puzzleId: string;
  puzzleDate: string;
  solution?: number[][];
  userEntries: number[][];
  selectedCell: { row: number; col: number } | null;
  elapsedTime: number;
  isCompleted: boolean;
  isStarted: boolean;
  isPaused: boolean;
  noteMode: boolean;
  lockMode: boolean;
  pencilMarks: Record<string, number[]>;
  lockedCells: Record<string, boolean>;
  isGridComplete: boolean;
  isSubmitting: boolean;
  validationMessage: string | null;
  showAnimation: boolean;
  hasUnlockedCells: boolean;
  isOnline: boolean;
  timerError: string | null;
  isPauseLoading: boolean;
  isResumeLoading: boolean;
  userId: string | null;
  onCellSelect: (row: number, col: number) => void;
  onNumberChange: (row: number, col: number, value: number) => void;
  onNumberPadChange: (value: number) => void;
  onToggleNoteModeAction: () => void;
  onToggleLockModeAction: () => void;
  onResetUnlockedAction: () => void;
  onSubmit: () => Promise<void>;
  onPause: () => void;
  onResume: () => void;
  isClueCell: (row: number, col: number) => boolean;
};

export const PuzzleActiveView = ({
  puzzle,
  puzzleId,
  puzzleDate,
  solution,
  userEntries,
  selectedCell,
  elapsedTime,
  isCompleted,
  isStarted,
  isPaused,
  noteMode,
  lockMode,
  pencilMarks,
  lockedCells,
  isGridComplete,
  isSubmitting,
  validationMessage,
  showAnimation,
  hasUnlockedCells,
  isOnline,
  timerError,
  isPauseLoading,
  isResumeLoading,
  userId,
  onCellSelect,
  onNumberChange,
  onNumberPadChange,
  onToggleNoteModeAction,
  onToggleLockModeAction,
  onResetUnlockedAction,
  onSubmit,
  onPause,
  onResume,
  isClueCell,
}: PuzzleActiveViewProps) => {
  return (
    <div className="flex flex-col min-h-full bg-white relative">
      {isPaused && !isCompleted && <PauseOverlay onResume={onResume} disabled={isPauseLoading || isResumeLoading} />}

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-1 md:p-4">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 md:space-y-6">
            <PuzzleHeader
              puzzleDate={puzzleDate}
              noteMode={noteMode}
              onToggleNoteModeAction={onToggleNoteModeAction}
              lockMode={lockMode}
              onToggleLockModeAction={onToggleLockModeAction}
              onResetUnlockedAction={onResetUnlockedAction}
              hasUnlockedCells={hasUnlockedCells}
            />

            <div className="flex justify-center items-center gap-4 mb-0">
              <Timer elapsedTime={elapsedTime} isCompleted={isCompleted} />
              {isStarted && !isPaused && !isCompleted && (
                <PauseButton onPause={onPause} disabled={isPauseLoading || isResumeLoading} />
              )}
            </div>

            <InstructionsCard />

            <section className="flex justify-center px-0 grow" aria-label="Sudoku grid">
              <div className={`w-full px-1 ${showAnimation ? "animate-completion" : ""}`}>
                <SudokuGrid
                  puzzle={puzzle}
                  userEntries={userEntries}
                  selectedCell={selectedCell}
                  onCellSelect={onCellSelect}
                  onNumberChange={onNumberChange}
                  pencilMarks={pencilMarks}
                  isBlurred={!isStarted || isPaused}
                  solution={solution}
                  lockedCells={lockedCells}
                />
              </div>
            </section>

            <div className="max-w-xs mx-auto">
              <SubmitButton
                onSubmit={onSubmit}
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
                puzzleId={puzzleId}
                solution={solution}
                userId={userId}
              />
            )}
          </div>
        </div>

        <NumberPad
          onNumberChange={onNumberPadChange}
          selectedCell={selectedCell}
          isClueCell={
            selectedCell ? isClueCell(selectedCell.row, selectedCell.col) : false
          }
        />
      </main>
    </div>
  );
};
