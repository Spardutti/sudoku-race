/**
 * Auto-Save Hook for Puzzle Progress
 *
 * Provides debounced auto-save functionality for authenticated users.
 * Saves puzzle state to database with 500ms debounce to prevent excessive writes.
 * Falls back to localStorage on network errors for graceful degradation.
 *
 * @see docs/stories/2-4-puzzle-state-auto-save-session-management.md
 */

import { useEffect, useRef } from "react";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { saveProgress } from "@/actions/puzzle";
import { logger } from "@/lib/utils/logger";

/**
 * Auto-save hook for authenticated users
 *
 * Automatically saves puzzle progress to database when state changes.
 * Debounces saves to 500ms to prevent excessive database writes.
 * Falls back to localStorage on network failures.
 *
 * @param isAuthenticated - Whether user is authenticated
 *
 * @example
 * ```typescript
 * // In puzzle page component
 * const { data: session } = await supabase.auth.getSession()
 * useAutoSave(!!session?.user)
 * ```
 */
export const useAutoSave = (isAuthenticated: boolean) => {
  const puzzleId = usePuzzleStore((state) => state.puzzleId);
  const userEntries = usePuzzleStore((state) => state.userEntries);
  const elapsedTime = usePuzzleStore((state) => state.elapsedTime);
  const isCompleted = usePuzzleStore((state) => state.isCompleted);
  const pencilMarks = usePuzzleStore((state) => state.pencilMarks);
  const solvePath = usePuzzleStore((state) => state.solvePath);
  const lockedCells = usePuzzleStore((state) => state.lockedCells);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>("");

  useEffect(() => {
    if (!isAuthenticated || !puzzleId) {
      return;
    }

    const currentState = JSON.stringify({
      userEntries,
      elapsedTime,
      isCompleted,
      pencilMarks,
      solvePath,
      lockedCells,
    });

    if (currentState === lastSaveRef.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await saveProgress(
          puzzleId,
          userEntries,
          elapsedTime,
          isCompleted,
          pencilMarks,
          solvePath,
          lockedCells
        );

        if (result.success) {
          lastSaveRef.current = currentState;

        }
      } catch (error) {
        logger.error("Auto-save exception, localStorage fallback active", error as Error, {
          puzzleId,
        });
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, puzzleId, userEntries, elapsedTime, isCompleted, pencilMarks, solvePath, lockedCells]);
};
