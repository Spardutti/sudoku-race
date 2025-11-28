"use server";

import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { getClientIP } from "@/lib/utils/ip-utils";
import { ABUSE_ERRORS } from "@/lib/constants/errors";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";
import { isValidGrid, gridsEqual } from "@/lib/sudoku/grid-validator";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { validationLimiter, submissionLimiter } from "@/lib/abuse-prevention/rate-limiters";
import { trackViolation } from "@/lib/abuse-prevention/violation-tracker";

export type Puzzle = {
  id: string;
  puzzle_date: string;
  puzzle_data: number[][];
  difficulty: "easy" | "medium" | "hard";
};

export async function getPuzzleToday(): Promise<Result<Puzzle, string>> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("puzzles")
      .select("id, puzzle_date, puzzle_data, difficulty")
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

    return {
      success: true,
      data: {
        id: data.id,
        puzzle_date: data.puzzle_date,
        puzzle_data: data.puzzle_data as number[][],
        difficulty: data.difficulty as "easy" | "medium" | "hard",
      },
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

export async function validatePuzzle(
  puzzleId: string,
  solution: number[][]
): Promise<Result<{ correct: boolean }, string>> {
  try {
    if (!isValidGrid(solution)) {
      return {
        success: false,
        error: "Invalid solution format. Grid must be 9x9 with values 1-9.",
      };
    }

    const userId = await getCurrentUserId();
    const headersList = await headers();
    const clientIP = getClientIP({ headers: headersList });
    const token = userId || clientIP;

    try {
      await validationLimiter.check(100, token);
    } catch {
      logger.warn("Puzzle validation rate limit exceeded", {
        userId: userId || undefined,
        ip: userId ? undefined : clientIP,
        puzzleId,
        action: "validatePuzzle",
        limit: 100,
        windowSeconds: 3600,
      });

      return { success: false, error: ABUSE_ERRORS.RATE_LIMIT_EXCEEDED };
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("puzzles")
      .select("solution")
      .eq("id", puzzleId)
      .single();

    if (error || !data) {
      const fetchError = error || new Error("Puzzle not found");

      logger.error("Failed to fetch puzzle for validation", fetchError, {
        puzzleId,
        action: "validatePuzzle",
      });

      return {
        success: false,
        error: "Puzzle not found. Please try again.",
      };
    }

    const storedSolution = data.solution as number[][];
    const correct = gridsEqual(solution, storedSolution);

    logger.info("Puzzle validation completed", {
      puzzleId,
      correct,
      action: "validatePuzzle",
    });

    return {
      success: true,
      data: { correct },
    };
  } catch (error) {
    const validationError = error as Error;

    logger.error("Failed to validate puzzle", validationError, {
      puzzleId,
      action: "validatePuzzle",
    });

    Sentry.captureException(validationError, {
      extra: { puzzleId, action: "validatePuzzle" },
    });

    return {
      success: false,
      error: "Failed to validate solution. Please try again.",
    };
  }
}

export type CompletionData = {
  completionId: string;
  completionTimeSeconds: number;
  rank?: number;
};

export type CompletePuzzleResult =
  | { success: true; data: CompletionData }
  | { success: false; error: string };

export async function completePuzzle(
  puzzleId: string,
  solution: number[][],
  completionTimeSeconds: number
): Promise<CompletePuzzleResult> {
  const userId = await getCurrentUserId();
  const headersList = await headers();
  const clientIP = getClientIP({ headers: headersList });
  const token = userId || clientIP;

  try {
    await submissionLimiter.check(3, token);
  } catch {
    const logContext = userId
      ? {
          userId,
          puzzleId,
          action: "completePuzzle",
          limit: 3,
          windowSeconds: 60,
        }
      : {
          ip: clientIP,
          puzzleId,
          action: "completePuzzle",
          limit: 3,
          windowSeconds: 60,
          isGuest: true,
        };

    logger.warn("Puzzle submission rate limit exceeded", logContext);

    const violationCount = trackViolation(token);

    if (violationCount >= 10) {
      Sentry.captureMessage("Excessive puzzle submission attempts", {
        level: "warning",
        user: userId ? { id: userId } : undefined,
        extra: {
          attemptCount: violationCount,
          puzzleId,
          ip: userId ? undefined : clientIP,
          isGuest: !userId,
          timeWindow: "1 hour",
        },
      });
    }

    return { success: false, error: ABUSE_ERRORS.RATE_LIMIT_EXCEEDED };
  }

  const supabase = await createServerClient();

  if (userId) {
    const { data: existing } = await supabase
      .from("completions")
      .select("id")
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId)
      .eq("is_complete", true)
      .single();

    if (existing) {
      logger.info("Duplicate puzzle submission blocked", {
        userId,
        puzzleId,
        existingCompletionId: existing.id,
      });

      return { success: false, error: ABUSE_ERRORS.DUPLICATE_SUBMISSION };
    }
  }

  const { data: completion, error } = await supabase
    .from("completions")
    .insert({
      user_id: userId,
      puzzle_id: puzzleId,
      completion_time_seconds: completionTimeSeconds,
      completed_at: new Date().toISOString(),
      is_complete: true,
      is_guest: !userId,
      completion_data: { solution },
    })
    .select("id")
    .single();

  if (error || !completion) {
    const saveError = error || new Error("Failed to save completion");

    logger.error("Failed to save puzzle completion", saveError, {
      userId: userId || undefined,
      puzzleId,
    });

    Sentry.captureException(saveError, {
      user: { id: userId || undefined },
      extra: { puzzleId, completionTimeSeconds },
    });

    return { success: false, error: "Failed to save your completion" };
  }

  logger.info("Puzzle completed successfully", {
    userId: userId || undefined,
    puzzleId,
    completionId: completion.id,
    completionTimeSeconds,
  });

  return {
    success: true,
    data: {
      completionId: completion.id,
      completionTimeSeconds,
    },
  };
}
