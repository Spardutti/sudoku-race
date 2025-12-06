"use client";

import { useCallback, useState } from "react";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { pauseTimer, resumeTimer } from "@/actions/puzzle-timer";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

interface UseTimerActionsProps {
  puzzleId: string;
  userId: string | null;
}

interface UseTimerActionsReturn {
  handlePause: () => void;
  handleResume: () => void;
  isPauseLoading: boolean;
  isResumeLoading: boolean;
  lastError: string | null;
}

export function useTimerActions({
  puzzleId,
  userId,
}: UseTimerActionsProps): UseTimerActionsReturn {
  const pausePuzzle = usePuzzleStore((state) => state.pausePuzzle);
  const resumePuzzle = usePuzzleStore((state) => state.resumePuzzle);

  const [isPauseLoading, setIsPauseLoading] = useState(false);
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const executePauseWithRetry = useCallback(async () => {
    if (!userId) {
      return false;
    }

    let attempts = 0;
    while (attempts < MAX_RETRY_ATTEMPTS) {
      try {
        const result = await pauseTimer(puzzleId);

        if (result.success) {
          setLastError(null);
          return true;
        }

        throw new Error(result.error);
      } catch (error) {
        attempts++;
        const errorMsg =
          error instanceof Error ? error.message : "Failed to pause";

        if (attempts >= MAX_RETRY_ATTEMPTS) {
          console.error(
            errorMsg
          );
          setLastError(`Failed to pause timer. Please check your connection.`);
          return false;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempts)
        );
      }
    }
    return false;
  }, [userId, puzzleId]);

  const executeResumeWithRetry = useCallback(async () => {
    if (!userId) {
      return false;
    }

    let attempts = 0;
    while (attempts < MAX_RETRY_ATTEMPTS) {
      try {
        const result = await resumeTimer(puzzleId);

        if (result.success) {
          setLastError(null);
          return true;
        }

        throw new Error(result.error);
      } catch (error) {
        attempts++;
        const errorMsg =
          error instanceof Error ? error.message : "Failed to resume";

        if (attempts >= MAX_RETRY_ATTEMPTS) {
          console.error(
            `Failed to resume after ${attempts} attempts:`,
            errorMsg
          );
          setLastError(`Failed to resume timer. Please check your connection.`);
          return false;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempts)
        );
      }
    }
    return false;
  }, [userId, puzzleId]);

  const handlePause = useCallback(async () => {
    if (isPauseLoading || isResumeLoading) {
      return;
    }

    pausePuzzle();

    if (!userId) {
      return;
    }

    setIsPauseLoading(true);
    const success = await executePauseWithRetry();
    setIsPauseLoading(false);

    if (!success) {
      resumePuzzle();
    }
  }, [isPauseLoading, isResumeLoading, pausePuzzle, resumePuzzle, executePauseWithRetry, userId]);

  const handleResume = useCallback(async () => {
    if (isPauseLoading || isResumeLoading) {
      return;
    }

    resumePuzzle();

    if (!userId) {
      return;
    }

    setIsResumeLoading(true);
    const success = await executeResumeWithRetry();
    setIsResumeLoading(false);

    if (!success) {
      pausePuzzle();
    }
  }, [isPauseLoading, isResumeLoading, resumePuzzle, pausePuzzle, executeResumeWithRetry, userId]);

  return {
    handlePause,
    handleResume,
    isPauseLoading,
    isResumeLoading,
    lastError,
  };
}
