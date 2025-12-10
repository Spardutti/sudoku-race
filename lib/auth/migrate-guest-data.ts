import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import type { TimerEvent } from "@/lib/types/timer";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

async function retryOperation<T>(
  operation: () => Promise<T>,
  context: { userId: string; operation: string; metadata?: Record<string, unknown> },
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        logger.warn(`${context.operation} attempt ${attempt} failed, retrying...`, {
          ...context.metadata,
          userId: context.userId,
          retriesLeft: maxRetries - attempt,
        });

        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 100)
        );
      }
    }
  }

  throw lastError;
}

export interface MigrationResult {
  completedCount: number;
  inProgressCount: number;
  highestRank: number | null;
}

type CompletedPuzzle = {
  puzzleId: string;
  completionTime: number;
  solvePath?: unknown;
  completedAt: string;
  userEntries?: number[][];
  pencilMarks?: Record<string, number[]>;
};

type CurrentPuzzle = {
  puzzleId: string;
  userEntries: number[][];
  elapsedTime: number;
  pencilMarks?: Record<string, number[]>;
  solvePath?: unknown[];
  isPaused?: boolean;
  pausedAt?: number | null;
  selectedCell?: {
    row: number;
    col: number;
  } | null;
};

const LocalStorageStateSchema = z.object({
  state: z.object({
    puzzleId: z.string().optional(),
    userEntries: z.array(z.array(z.number())).optional(),
    elapsedTime: z.number().optional(),
    isCompleted: z.boolean().optional(),
    completionTime: z.number().nullable().optional(),
    solvePath: z.array(z.unknown()).optional(),
    pencilMarks: z.record(z.string(), z.array(z.number())).optional(),
    isPaused: z.boolean().optional(),
    pausedAt: z.number().nullable().optional(),
    selectedCell: z.object({
      row: z.number(),
      col: z.number(),
    }).nullable().optional(),
    noteMode: z.boolean().optional(),
    isStarted: z.boolean().optional(),
  }).optional(),
});

export type LocalStorageState = z.infer<typeof LocalStorageStateSchema>;

export async function migrateGuestCompletions(
  userId: string,
  localStorageData: LocalStorageState | null
): Promise<Result<MigrationResult, string>> {
  try {
    const supabase = await createServerClient();

    if (!localStorageData || !localStorageData.state) {
      logger.info("No guest data found for migration", { userId });
      return {
        success: true,
        data: { completedCount: 0, inProgressCount: 0, highestRank: null },
      };
    }

    let completedCount = 0;
    let inProgressCount = 0;
    let highestRank: number | null = null;

    if (
      localStorageData.state?.isCompleted &&
      localStorageData.state?.puzzleId &&
      localStorageData.state?.completionTime
    ) {
      logger.info("Migrating completed puzzle", {
        userId,
        puzzleId: localStorageData.state.puzzleId,
        completionTime: localStorageData.state.completionTime,
        elapsedTime: localStorageData.state.elapsedTime,
        isCompleted: localStorageData.state.isCompleted,
      });

      const completedPuzzle: CompletedPuzzle = {
        puzzleId: localStorageData.state.puzzleId,
        completionTime: localStorageData.state.completionTime,
        solvePath: localStorageData.state.solvePath,
        completedAt: new Date().toISOString(),
        userEntries: localStorageData.state.userEntries,
        pencilMarks: localStorageData.state.pencilMarks,
      };

      const result = await migrateCompletedPuzzle(supabase, userId, completedPuzzle);
      if (result.success && result.data) {
        completedCount++;
        if (result.data.rank !== null) {
          if (highestRank === null || result.data.rank < highestRank) {
            highestRank = result.data.rank;
          }
        }
      }
    }

    if (
      localStorageData.state?.puzzleId &&
      !localStorageData.state?.isCompleted &&
      localStorageData.state?.userEntries
    ) {
      const currentPuzzle: CurrentPuzzle = {
        puzzleId: localStorageData.state.puzzleId,
        userEntries: localStorageData.state.userEntries,
        elapsedTime: localStorageData.state.elapsedTime || 0,
        pencilMarks: localStorageData.state.pencilMarks,
        solvePath: localStorageData.state.solvePath,
        isPaused: localStorageData.state.isPaused,
        pausedAt: localStorageData.state.pausedAt,
        selectedCell: localStorageData.state.selectedCell,
      };

      const result = await migrateInProgressPuzzle(supabase, userId, currentPuzzle);
      if (result.success) {
        inProgressCount++;
      }
    }

    logger.info("Guest data migration completed", {
      userId,
      completedCount,
      inProgressCount,
      highestRank,
    });

    return {
      success: true,
      data: { completedCount, inProgressCount, highestRank },
    };
  } catch (error) {
    logger.error("Migration failed", error as Error, { userId });
    Sentry.captureException(error, {
      level: "error",
      extra: { userId },
    });

    return {
      success: false,
      error: "Failed to migrate guest data. Please contact support.",
    };
  }
}

export function parseLocalStorageData(
  localStorageJson: string | null
): LocalStorageState | null {
  try {
    if (!localStorageJson) {
      return null;
    }

    const parsed = JSON.parse(localStorageJson);

    const validationResult = LocalStorageStateSchema.safeParse(parsed);

    if (!validationResult.success) {
      logger.error("localStorage data failed schema validation", validationResult.error, {
        issues: validationResult.error.issues,
      });
      Sentry.captureException(new Error("Invalid localStorage schema"), {
        level: "warning",
        tags: { component: "migrate-guest-data" },
        extra: { validationErrors: validationResult.error.issues },
      });
      return null;
    }

    return validationResult.data;
  } catch (error) {
    logger.error("Failed to parse localStorage JSON", error as Error);
    Sentry.captureException(error, {
      level: "warning",
      tags: { component: "migrate-guest-data" },
    });
    return null;
  }
}

async function migrateCompletedPuzzle(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  puzzle: CompletedPuzzle
): Promise<Result<{ rank: number | null }, string>> {
  try {
    const { data: existingPuzzle } = await supabase
      .from("puzzles")
      .select("id")
      .eq("id", puzzle.puzzleId)
      .single();

    if (!existingPuzzle) {
      logger.warn("Puzzle not found in database", { puzzleId: puzzle.puzzleId });
      return {
        success: true,
        data: { rank: null },
      };
    }

    const { data: existingCompletion } = await supabase
      .from("completions")
      .select("id")
      .eq("user_id", userId)
      .eq("puzzle_id", puzzle.puzzleId)
      .single();

    if (existingCompletion) {
      logger.info("Completion already exists, skipping", {
        userId,
        puzzleId: puzzle.puzzleId,
      });
      return {
        success: true,
        data: { rank: null },
      };
    }

    const completedAt = new Date(puzzle.completedAt);
    const startedAt = new Date(
      completedAt.getTime() - puzzle.completionTime * 1000
    );

    const timerEvents: TimerEvent[] = [
      { type: "start", timestamp: startedAt.toISOString() },
      { type: "complete", timestamp: completedAt.toISOString() }
    ];

    logger.info("Inserting completed puzzle to database", {
      userId,
      puzzleId: puzzle.puzzleId,
      completion_time_seconds: puzzle.completionTime,
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      time_delta_seconds: Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000),
    });

    await retryOperation(
      async () => {
        const { error: completionError } = await supabase.from("completions").insert({
          user_id: userId,
          puzzle_id: puzzle.puzzleId,
          completion_time_seconds: puzzle.completionTime,
          solve_path: puzzle.solvePath || null,
          completed_at: completedAt.toISOString(),
          started_at: startedAt.toISOString(),
          is_complete: true,
          timer_events: timerEvents,
          completion_data: {
            userEntries: puzzle.userEntries,
            elapsedTime: puzzle.completionTime,
            solvePath: puzzle.solvePath,
            pencilMarks: puzzle.pencilMarks,
            isPaused: false,
            pausedAt: null,
          },
        });

        if (completionError) {
          logger.error("Failed to insert completion", completionError, {
            userId,
            puzzleId: puzzle.puzzleId,
          });
          throw completionError;
        }
      },
      {
        userId,
        operation: "Completion insert",
        metadata: { puzzleId: puzzle.puzzleId },
      }
    );

    const rank = await calculateAndInsertLeaderboardRank(
      supabase,
      userId,
      puzzle.puzzleId,
      puzzle.completionTime
    );

    return {
      success: true,
      data: { rank },
    };
  } catch (error) {
    logger.error("Failed to migrate completed puzzle", error as Error, {
      userId,
      puzzleId: puzzle.puzzleId,
    });
    return {
      success: false,
      error: "Failed to migrate completion",
    };
  }
}

async function calculateAndInsertLeaderboardRank(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  puzzleId: string,
  completionTimeSeconds: number
): Promise<number | null> {
  try {
    const { data: fasterCompletions, error: countError } = await supabase
      .from("leaderboards")
      .select("id")
      .eq("puzzle_id", puzzleId)
      .lt("completion_time_seconds", completionTimeSeconds);

    if (countError) {
      logger.error("Failed to calculate rank", countError, {
        userId,
        puzzleId,
      });
      return null;
    }

    const rank = (fasterCompletions?.length || 0) + 1;

    await retryOperation(
      async () => {
        const { error: insertError } = await supabase.from("leaderboards").insert({
          puzzle_id: puzzleId,
          user_id: userId,
          rank,
          completion_time_seconds: completionTimeSeconds,
        });

        if (insertError) {
          logger.error("Failed to insert leaderboard entry", insertError, {
            userId,
            puzzleId,
            rank,
          });
          throw insertError;
        }
      },
      {
        userId,
        operation: "Leaderboard insert",
        metadata: { puzzleId, rank },
      }
    );

    return rank;
  } catch (error) {
    logger.error("Failed to calculate/insert leaderboard rank", error as Error, {
      userId,
      puzzleId,
    });
    return null;
  }
}

async function migrateInProgressPuzzle(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  currentPuzzle: CurrentPuzzle
): Promise<Result<void, string>> {
  try {
    const { data: existingPuzzle } = await supabase
      .from("puzzles")
      .select("id")
      .eq("id", currentPuzzle.puzzleId)
      .single();

    if (!existingPuzzle) {
      logger.warn("In-progress puzzle not found in database", {
        puzzleId: currentPuzzle.puzzleId,
      });
      return { success: true, data: undefined };
    }

    const { data: existingCompletion } = await supabase
      .from("completions")
      .select("id")
      .eq("user_id", userId)
      .eq("puzzle_id", currentPuzzle.puzzleId)
      .single();

    if (existingCompletion) {
      logger.info("In-progress puzzle already has completion, skipping", {
        userId,
        puzzleId: currentPuzzle.puzzleId,
      });
      return { success: true, data: undefined };
    }

    const startedAt = new Date(Date.now() - currentPuzzle.elapsedTime * 1000);

    const timerEvents: TimerEvent[] = [
      { type: "start", timestamp: startedAt.toISOString() }
    ];

    if (currentPuzzle.isPaused && currentPuzzle.pausedAt) {
      timerEvents.push({
        type: "pause",
        timestamp: new Date(currentPuzzle.pausedAt).toISOString()
      });
    }

    logger.info("Migrating in-progress puzzle with timer events", {
      userId,
      puzzleId: currentPuzzle.puzzleId,
      eventCount: timerEvents.length,
      elapsedTime: currentPuzzle.elapsedTime,
    });

    await retryOperation(
      async () => {
        const { error: insertError } = await supabase.from("completions").insert({
          user_id: userId,
          puzzle_id: currentPuzzle.puzzleId,
          completion_time_seconds: null,
          completed_at: null,
          is_complete: false,
          started_at: startedAt.toISOString(),
          timer_events: timerEvents,
          completion_data: {
            userEntries: currentPuzzle.userEntries,
            elapsedTime: currentPuzzle.elapsedTime,
            pencilMarks: currentPuzzle.pencilMarks,
            solvePath: currentPuzzle.solvePath,
            isPaused: currentPuzzle.isPaused,
            pausedAt: currentPuzzle.pausedAt,
            selectedCell: currentPuzzle.selectedCell,
          },
        });

        if (insertError) {
          logger.error("Failed to insert in-progress puzzle", insertError, {
            userId,
            puzzleId: currentPuzzle.puzzleId,
          });
          throw insertError;
        }
      },
      {
        userId,
        operation: "In-progress puzzle insert",
        metadata: { puzzleId: currentPuzzle.puzzleId },
      }
    );

    logger.info("In-progress puzzle migrated", {
      userId,
      puzzleId: currentPuzzle.puzzleId,
    });

    return { success: true, data: undefined };
  } catch (error) {
    logger.error("Failed to migrate in-progress puzzle", error as Error, {
      userId,
      puzzleId: currentPuzzle.puzzleId,
    });
    return {
      success: false,
      error: "Failed to migrate in-progress puzzle",
    };
  }
}
