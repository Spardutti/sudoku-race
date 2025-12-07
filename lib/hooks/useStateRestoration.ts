/**
 * State Restoration Hook for Puzzle Progress
 *
 * Loads saved puzzle progress on page mount from database (authenticated users)
 * or localStorage (guest users). Handles puzzle ID mismatch (new day) by
 * clearing old state.
 *
 * @see docs/stories/2-4-puzzle-state-auto-save-session-management.md
 */

import { useEffect, useState } from "react";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { loadProgress } from "@/actions/puzzle";
import { logger } from "@/lib/utils/logger";

/**
 * State restoration hook
 *
 * Loads saved progress for authenticated users from database.
 * For guest users, Zustand persist middleware handles localStorage restoration automatically.
 * Validates puzzle ID matches current puzzle to prevent loading stale data.
 *
 * @param isAuthenticated - Whether user is authenticated
 * @param puzzleId - Current puzzle identifier
 * @returns Loading state (true while restoring, false when complete)
 *
 * @example
 * ```typescript
 * // In puzzle page component
 * const isLoading = useStateRestoration(isAuthenticated, puzzle.id)
 *
 * if (isLoading) {
 *   return <LoadingSkeleton />
 * }
 * ```
 */
export function useStateRestoration(
  isAuthenticated: boolean,
  puzzleId: string | null
): boolean {
  const [isLoading, setIsLoading] = useState(true);
  const restoreState = usePuzzleStore((state) => state.restoreState);
  const storedPuzzleId = usePuzzleStore((state) => state.puzzleId);
  const resetPuzzle = usePuzzleStore((state) => state.resetPuzzle);

  useEffect(() => {
    async function restore() {
      if (!puzzleId) {
        setIsLoading(false);
        return;
      }

      if (storedPuzzleId && storedPuzzleId !== puzzleId) {
        logger.info("Puzzle ID mismatch, clearing old state", {
          storedPuzzleId,
          currentPuzzleId: puzzleId,
        });
        resetPuzzle();
      }

      if (isAuthenticated) {
        try {
          const result = await loadProgress(puzzleId);

          if (result.success && result.data) {
            const hasEntries =
              result.data.userEntries &&
              Array.isArray(result.data.userEntries) &&
              result.data.userEntries.length === 9 &&
              result.data.userEntries.some(
                (row) => Array.isArray(row) && row.length === 9 && row.some((cell) => cell > 0)
              );

            logger.info("Restoring state from database", {
              hasEntries,
              hasUserEntriesData: !!result.data.userEntries,
              userEntriesLength: result.data.userEntries?.length,
              firstRowPreview: result.data.userEntries?.[0]?.slice(0, 3),
              elapsedTime: result.data.elapsedTime,
            });

            const stateToRestore: Partial<typeof result.data> = {
              elapsedTime: result.data.elapsedTime,
              isCompleted: result.data.isCompleted,
              isStarted: result.data.elapsedTime > 0 || hasEntries,
              isPaused: result.data.isPaused ?? false,
              pausedAt: result.data.pausedAt ?? null,
            };

            if (result.data.userEntries) {
              stateToRestore.userEntries = result.data.userEntries;
            }

            restoreState(stateToRestore);
          } else if (result.success && !result.data) {
            logger.info("No saved progress found in database", { puzzleId });
          } else {
            logger.warn("Failed to load progress from database, using localStorage", {
              puzzleId,
              errorMessage: !result.success ? result.error : "Unknown error",
            });
          }
        } catch (error) {
          logger.error("Exception during state restoration", error as Error, {
            puzzleId,
          });
        }
      }

      setIsLoading(false);
    }

    restore();
  }, [isAuthenticated, puzzleId, storedPuzzleId, restoreState, resetPuzzle]);

  return isLoading;
}
