/**
 * Timer Hook - Auto-Start
 *
 * Manages puzzle timer with automatic start and stop on completion.
 * Updates Zustand store every second. Timer runs continuously (no pause on blur).
 *
 * @see docs/architecture.md (ADR-005: Server-Side Timer Validation)
 * @see docs/stories/2-5-timer-implementation-auto-start-fair-timing.md
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";

interface UseTimerReturn {
  /**
   * Whether the timer is currently running
   */
  isRunning: boolean;
  /**
   * Pause the timer manually
   */
  pause: () => void;
  /**
   * Resume the timer manually
   */
  resume: () => void;
  /**
   * Reset the timer to 0
   */
  reset: () => void;
}

const TIMER_INTERVAL_MS = 1000;

/**
 * Timer Hook
 *
 * Auto-starts on mount, runs continuously until puzzle completed.
 * Updates Zustand store `elapsedTime` every second.
 *
 * @returns Timer control methods and running state
 *
 * @example
 * ```tsx
 * function PuzzlePage() {
 *   const { isRunning, pause, resume } = useTimer();
 *   const elapsedTime = usePuzzleStore((s) => s.elapsedTime);
 *   const isCompleted = usePuzzleStore((s) => s.isCompleted);
 *
 *   return <Timer elapsedTime={elapsedTime} isCompleted={isCompleted} />;
 * }
 * ```
 */
export function useTimer(): UseTimerReturn {
  const { updateElapsedTime, isCompleted, isStarted, isPaused } = usePuzzleStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const shouldRun = isStarted && !isPaused && !isCompleted;
  const [isRunning, setIsRunning] = useState(shouldRun);

  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resume = () => {
    if (!isCompleted) {
      setIsRunning(true);
    }
  };

  const reset = () => {
    pause();
    updateElapsedTime(0);
  };

  // Timer interval - increment elapsed time every second
  useEffect(() => {
    if (!shouldRun) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const currentTime = usePuzzleStore.getState().elapsedTime;
      updateElapsedTime(currentTime + 1);
    }, TIMER_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldRun, updateElapsedTime]);

  useEffect(() => {
    setIsRunning(shouldRun);
  }, [shouldRun]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    isRunning,
    pause,
    resume,
    reset,
  };
}
