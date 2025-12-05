"use client";

import { useCallback, useRef, useState } from "react";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { pauseTimer, resumeTimer } from "@/actions/puzzle-timer";

const DEBOUNCE_MS = 300;
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

  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executePauseWithRetry = useCallback(async () => {
    if (!userId) return;

    let attempts = 0;
    while (attempts < MAX_RETRY_ATTEMPTS) {
      try {
        const result = await pauseTimer(puzzleId);

        if (result.success) {
          setLastError(null);
          return;
        }

        throw new Error(result.error);
      } catch (error) {
        attempts++;
        const errorMsg =
          error instanceof Error ? error.message : "Failed to pause";

        if (attempts >= MAX_RETRY_ATTEMPTS) {
          console.error(
            `Failed to pause after ${attempts} attempts:`,
            errorMsg
          );
          setLastError(`Failed to pause timer. Please check your connection.`);
          return;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempts)
        );
      }
    }
  }, [userId, puzzleId]);

  const executeResumeWithRetry = useCallback(async () => {
    if (!userId) return;

    let attempts = 0;
    while (attempts < MAX_RETRY_ATTEMPTS) {
      try {
        const result = await resumeTimer(puzzleId);

        if (result.success) {
          setLastError(null);
          return;
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
          return;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * attempts)
        );
      }
    }
  }, [userId, puzzleId]);

  const handlePause = useCallback(() => {
    if (isPauseLoading || isResumeLoading) return;

    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    pausePuzzle();

    pauseTimeoutRef.current = setTimeout(async () => {
      setIsPauseLoading(true);
      await executePauseWithRetry();
      setIsPauseLoading(false);
    }, DEBOUNCE_MS);
  }, [isPauseLoading, isResumeLoading, pausePuzzle, executePauseWithRetry]);

  const handleResume = useCallback(() => {
    if (isPauseLoading || isResumeLoading) return;

    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }

    resumePuzzle();

    resumeTimeoutRef.current = setTimeout(async () => {
      setIsResumeLoading(true);
      await executeResumeWithRetry();
      setIsResumeLoading(false);
    }, DEBOUNCE_MS);
  }, [isPauseLoading, isResumeLoading, resumePuzzle, executeResumeWithRetry]);

  return {
    handlePause,
    handleResume,
    isPauseLoading,
    isResumeLoading,
    lastError,
  };
}
