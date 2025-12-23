import * as React from "react";
import { startTimer } from "@/actions/puzzle";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";

type UsePuzzleInitializationProps = {
  puzzleId: string;
  userId: string | null;
  isStarted: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  alreadyCompleted: boolean;
  isLoading: boolean;
  isPauseLoading: boolean;
  isResumeLoading: boolean;
  handlePause: () => void;
  handleResume: () => void;
};

export const usePuzzleInitialization = ({
  puzzleId,
  userId,
  isStarted,
  isPaused,
  isCompleted,
  alreadyCompleted,
  isLoading,
  isPauseLoading,
  isResumeLoading,
  handlePause,
  handleResume,
}: UsePuzzleInitializationProps) => {
  const startPuzzle = usePuzzleStore((state) => state.startPuzzle);

  const handleStart = React.useCallback(() => {
    startPuzzle();
    if (userId) {
      startTimer(puzzleId).catch((error) => {
        console.error("Failed to start server timer:", error);
      });
    }
  }, [startPuzzle, userId, puzzleId]);

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

  return { handleStart };
};
