"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";

export type Puzzle = {
  id: string;
  puzzle_date: string;
  puzzle_data: number[][];
  difficulty: "easy" | "medium" | "hard";
  solution?: number[][];
};

export async function getPuzzleToday(): Promise<Result<Puzzle, string>> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const supabase = await createServerActionClient();

    const isDev = process.env.NODE_ENV !== "production";

    const { data, error } = await supabase
      .from("puzzles")
      .select("id, puzzle_date, puzzle_data, difficulty, solution")
      .eq("puzzle_date", today)
      .single();

    if (error || !data) {
      logger.warn("Daily puzzle not found", {
        puzzle_date: today,
        errorMessage: error?.message,
      });

      Sentry.captureMessage("Daily puzzle missing", {
        level: "warning",
        extra: { puzzle_date: today, error: error?.message },
      });

      return {
        success: false,
        error: "Today's puzzle is not available yet. Please check back later.",
      };
    }

    logger.info("Daily puzzle fetched", {
      puzzleId: data.id,
      puzzle_date: data.puzzle_date,
      difficulty: data.difficulty,
    });

    const puzzleData: Puzzle = {
      id: data.id,
      puzzle_date: data.puzzle_date,
      puzzle_data: data.puzzle_data as number[][],
      difficulty: data.difficulty as "easy" | "medium" | "hard",
    };

    if (isDev && data.solution) {
      puzzleData.solution = data.solution as number[][];
    }

    return {
      success: true,
      data: puzzleData,
    };
  } catch (error) {
    const fetchError = error as Error;

    logger.error("Failed to fetch daily puzzle", fetchError, {
      action: "getPuzzleToday",
    });

    Sentry.captureException(fetchError, {
      extra: { action: "getPuzzleToday" },
    });

    return {
      success: false,
      error: "Failed to load today's puzzle. Please try again.",
    };
  }
}

export async function checkPuzzleCompletion(
  puzzleId: string
): Promise<Result<{ isCompleted: boolean; completionTime?: number }, string>> {
  try {
    const { getCurrentUserId } = await import("@/lib/auth/get-current-user");
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: true,
        data: { isCompleted: false },
      };
    }

    const supabase = await createServerActionClient();

    const { data, error } = await supabase
      .from("completions")
      .select("completion_time_seconds")
      .eq("puzzle_id", puzzleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.error("Failed to check puzzle completion", error, {
        puzzleId,
        userId,
        action: "checkPuzzleCompletion",
      });

      return {
        success: false,
        error: "Failed to check completion status.",
      };
    }

    if (data) {
      return {
        success: true,
        data: {
          isCompleted: true,
          completionTime: data.completion_time_seconds,
        },
      };
    }

    return {
      success: true,
      data: { isCompleted: false },
    };
  } catch (error) {
    const checkError = error as Error;

    logger.error("Failed to check puzzle completion", checkError, {
      puzzleId,
      action: "checkPuzzleCompletion",
    });

    Sentry.captureException(checkError, {
      extra: { puzzleId, action: "checkPuzzleCompletion" },
    });

    return {
      success: false,
      error: "Failed to check completion status.",
    };
  }
}
