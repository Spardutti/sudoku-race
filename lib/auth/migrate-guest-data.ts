import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
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

const CompletedPuzzleSchema = z.object({
  puzzleId: z.string(),
  completionTime: z.number().positive(),
  solvePath: z.unknown().optional(),
  completedAt: z.string(),
});

const CurrentPuzzleSchema = z.object({
  puzzleId: z.string(),
  userEntries: z.array(z.array(z.number())),
  elapsedTime: z.number().nonnegative(),
});

const LocalStorageStateSchema = z.object({
  state: z.object({
    completedPuzzles: z.array(CompletedPuzzleSchema).optional(),
    currentPuzzle: CurrentPuzzleSchema.nullable().optional(),
    puzzleId: z.string().optional(),
    isCompleted: z.boolean().optional(),
    elapsedTime: z.number().optional(),
  }).optional(),
});

type CompletedPuzzle = z.infer<typeof CompletedPuzzleSchema>;
type CurrentPuzzle = z.infer<typeof CurrentPuzzleSchema>;
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

    const completedPuzzles = localStorageData.state?.completedPuzzles || [];

    for (const puzzle of completedPuzzles) {
      const result = await migrateCompletedPuzzle(supabase, userId, puzzle);
      if (result.success && result.data) {
        completedCount++;
        if (result.data.rank !== null) {
          if (highestRank === null || result.data.rank < highestRank) {
            highestRank = result.data.rank;
          }
        }
      }
    }

    const currentPuzzle = localStorageData.state?.currentPuzzle;
    if (
      currentPuzzle &&
      currentPuzzle.puzzleId &&
      !localStorageData.state?.isCompleted
    ) {
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

    await retryOperation(
      async () => {
        const { error: completionError } = await supabase.from("completions").insert({
          user_id: userId,
          puzzle_id: puzzle.puzzleId,
          completion_time_seconds: puzzle.completionTime,
          solve_path: puzzle.solvePath || null,
          completed_at: completedAt.toISOString(),
          started_at: startedAt.toISOString(),
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

    await retryOperation(
      async () => {
        const { error: insertError } = await supabase.from("completions").insert({
          user_id: userId,
          puzzle_id: currentPuzzle.puzzleId,
          completion_time_seconds: null,
          completed_at: null,
          started_at: new Date(
            Date.now() - currentPuzzle.elapsedTime * 1000
          ).toISOString(),
          completion_data: {
            userEntries: currentPuzzle.userEntries,
            elapsedTime: currentPuzzle.elapsedTime,
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
