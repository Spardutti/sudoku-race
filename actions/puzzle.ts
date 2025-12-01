"use server";

import { headers } from "next/headers";
import { createServerActionClient } from "@/lib/supabase/server";
import { getClientIP } from "@/lib/utils/ip-utils";
import { ABUSE_ERRORS } from "@/lib/constants/errors";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";
import { isValidGrid, gridsEqual, isValidSudoku } from "@/lib/sudoku/grid-validator";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { validationLimiter, submissionLimiter } from "@/lib/abuse-prevention/rate-limiters";
import { trackViolation } from "@/lib/abuse-prevention/violation-tracker";

export type Puzzle = {
  id: string;
  puzzle_date: string;
  puzzle_data: number[][];
  difficulty: "easy" | "medium" | "hard";
  solution?: number[][]; // Optional, only for dev tools
};

export async function getPuzzleToday(): Promise<Result<Puzzle, string>> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const supabase = await createServerActionClient();

    // In dev mode, include solution for dev tools
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

    // Include solution only in dev mode
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

    const supabase = await createServerActionClient();

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

export async function validateSolution(
  puzzleId: string,
  userEntries: number[][]
): Promise<Result<{ isValid: boolean; errors?: string[] }, string>> {
  try {
    if (!isValidGrid(userEntries)) {
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
      logger.warn("Solution validation rate limit exceeded", {
        userId: userId || undefined,
        ip: userId ? undefined : clientIP,
        puzzleId,
        action: "validateSolution",
        limit: 100,
        windowSeconds: 3600,
      });

      return { success: false, error: ABUSE_ERRORS.RATE_LIMIT_EXCEEDED };
    }

    if (!isValidSudoku(userEntries)) {
      logger.info("Solution validation failed: invalid Sudoku rules", {
        puzzleId,
        action: "validateSolution",
      });

      return {
        success: true,
        data: { isValid: false },
      };
    }

    const supabase = await createServerActionClient();

    const { data, error } = await supabase
      .from("puzzles")
      .select("solution")
      .eq("id", puzzleId)
      .single();

    if (error || !data) {
      const fetchError = error || new Error("Puzzle not found");

      logger.error("Failed to fetch puzzle for validation", fetchError, {
        puzzleId,
        action: "validateSolution",
      });

      return {
        success: false,
        error: "Puzzle not found. Please try again.",
      };
    }

    const storedSolution = data.solution as number[][];
    const isValid = gridsEqual(userEntries, storedSolution);

    logger.info("Solution validation completed", {
      puzzleId,
      isValid,
      action: "validateSolution",
    });

    return {
      success: true,
      data: { isValid },
    };
  } catch (error) {
    const validationError = error as Error;

    logger.error("Failed to validate solution", validationError, {
      puzzleId,
      action: "validateSolution",
    });

    Sentry.captureException(validationError, {
      extra: { puzzleId, action: "validateSolution" },
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

  const supabase = await createServerActionClient();

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

/**
 * Progress data returned from loadProgress
 */
export type PuzzleProgress = {
  userEntries?: number[][];
  elapsedTime: number;
  isCompleted: boolean;
};

/**
 * Save puzzle progress for authenticated users
 *
 * Stores in-progress puzzle state to enable cross-device sync and resumption.
 * Uses upsert to handle both new progress and updates to existing progress.
 *
 * @param puzzleId - Unique puzzle identifier
 * @param userEntries - 9x9 grid of user's current entries
 * @param elapsedTime - Elapsed time in seconds
 * @param isCompleted - Whether puzzle is completed
 * @returns Result with void data on success, error message on failure
 */
export async function saveProgress(
  puzzleId: string,
  userEntries: number[][],
  elapsedTime: number,
  isCompleted: boolean
): Promise<Result<void, string>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: User must be authenticated to save progress",
      };
    }

    const supabase = await createServerActionClient();

    const { error } = await supabase.from("completions").upsert(
      {
        user_id: userId,
        puzzle_id: puzzleId,
        completion_data: { userEntries },
        completion_time_seconds: elapsedTime,
        is_complete: isCompleted,
        is_guest: false,
        started_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,puzzle_id",
        ignoreDuplicates: false,
      }
    );

    if (error) {
      logger.error("Failed to save puzzle progress", error, {
        userId,
        puzzleId,
        action: "saveProgress",
      });

      return {
        success: false,
        error: "Failed to save progress. Please try again.",
      };
    }

    logger.info("Puzzle progress saved", {
      userId,
      puzzleId,
      elapsedTime,
      isCompleted,
      action: "saveProgress",
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    const saveError = error as Error;

    logger.error("Exception saving puzzle progress", saveError, {
      puzzleId,
      action: "saveProgress",
    });

    Sentry.captureException(saveError, {
      extra: { puzzleId, action: "saveProgress" },
    });

    return {
      success: false,
      error: "Failed to save progress. Please try again.",
    };
  }
}

/**
 * Load puzzle progress for authenticated users
 *
 * Retrieves saved in-progress puzzle state to enable resumption across
 * devices or sessions.
 *
 * @param puzzleId - Unique puzzle identifier
 * @returns Result with progress data on success (null if no progress found), error message on failure
 */
export async function loadProgress(
  puzzleId: string
): Promise<Result<PuzzleProgress | null, string>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: User must be authenticated to load progress",
      };
    }

    const supabase = await createServerActionClient();

    const { data, error } = await supabase
      .from("completions")
      .select("completion_data, completion_time_seconds, is_complete, started_at")
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId)
      .maybeSingle();

    if (error) {
      logger.error("Failed to load puzzle progress", error, {
        userId,
        puzzleId,
        action: "loadProgress",
      });

      return {
        success: false,
        error: "Failed to load progress. Please try again.",
      };
    }

    if (!data) {
      logger.info("No progress found for puzzle", {
        userId,
        puzzleId,
        action: "loadProgress",
      });

      return {
        success: true,
        data: null,
      };
    }

    const completionData = data.completion_data as { userEntries?: number[][] } | null;
    const userEntries = completionData?.userEntries;

    // Calculate current elapsed time from started_at (server time = source of truth)
    let elapsedTime = 0;
    if (data.is_complete) {
      // Puzzle completed: use final completion_time_seconds
      elapsedTime = data.completion_time_seconds || 0;
    } else if (data.started_at) {
      // Puzzle in progress: calculate from started_at to now
      const startedAt = new Date(data.started_at);
      const now = new Date();
      elapsedTime = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
    }

    logger.info("Puzzle progress loaded", {
      userId,
      puzzleId,
      hasUserEntries: !!userEntries && userEntries.length > 0,
      elapsedTime,
      isComplete: data.is_complete,
      action: "loadProgress",
    });

    return {
      success: true,
      data: {
        userEntries: userEntries && userEntries.length > 0 ? userEntries : undefined,
        elapsedTime,
        isCompleted: data.is_complete || false,
      },
    };
  } catch (error) {
    const loadError = error as Error;

    logger.error("Exception loading puzzle progress", loadError, {
      puzzleId,
      action: "loadProgress",
    });

    Sentry.captureException(loadError, {
      extra: { puzzleId, action: "loadProgress" },
    });

    return {
      success: false,
      error: "Failed to load progress. Please try again.",
    };
  }
}

/**
 * Start puzzle timer
 *
 * Records server-side timestamp when puzzle starts. Idempotent - only sets
 * started_at if not already set.
 *
 * @param puzzleId - Unique puzzle identifier
 * @returns Result with started_at timestamp on success, error message on failure
 */
export async function startTimer(
  puzzleId: string
): Promise<Result<{ startedAt: string }, string>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: User must be authenticated to start timer",
      };
    }

    const supabase = await createServerActionClient();

    // Check if timer already started (idempotent)
    const { data: existing } = await supabase
      .from("completions")
      .select("started_at")
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId)
      .maybeSingle();

    if (existing?.started_at) {
      logger.info("Timer already started (idempotent)", {
        userId,
        puzzleId,
        startedAt: existing.started_at,
        action: "startTimer",
      });

      return {
        success: true,
        data: { startedAt: existing.started_at },
      };
    }

    // Insert or update with started_at timestamp
    const startedAt = new Date().toISOString();

    const { error } = await supabase.from("completions").upsert(
      {
        user_id: userId,
        puzzle_id: puzzleId,
        started_at: startedAt,
        is_complete: false,
        is_guest: false,
      },
      {
        onConflict: "user_id,puzzle_id",
        ignoreDuplicates: false,
      }
    );

    if (error) {
      logger.error("Failed to start puzzle timer", error, {
        userId,
        puzzleId,
        action: "startTimer",
      });

      return {
        success: false,
        error: "Failed to start timer. Please try again.",
      };
    }

    logger.info("Puzzle timer started", {
      userId,
      puzzleId,
      startedAt,
      action: "startTimer",
    });

    return {
      success: true,
      data: { startedAt },
    };
  } catch (error) {
    const startError = error as Error;

    logger.error("Exception starting puzzle timer", startError, {
      puzzleId,
      action: "startTimer",
    });

    Sentry.captureException(startError, {
      extra: { puzzleId, action: "startTimer" },
    });

    return {
      success: false,
      error: "Failed to start timer. Please try again.",
    };
  }
}

/**
 * Get current elapsed time from server
 *
 * Calculates elapsed time based on server's started_at timestamp.
 * Used to sync client timer with server time after page refresh.
 *
 * @param puzzleId - Unique puzzle identifier
 * @returns Result with elapsed time in seconds, null if timer not started
 */
export async function getElapsedTime(
  puzzleId: string
): Promise<Result<number | null, string>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: true,
        data: null, // Guest users don't have server timer
      };
    }

    const supabase = await createServerActionClient();

    const { data: completion } = await supabase
      .from("completions")
      .select("started_at, is_complete")
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId)
      .maybeSingle();

    if (!completion?.started_at) {
      return {
        success: true,
        data: null, // Timer not started yet
      };
    }

    if (completion.is_complete) {
      return {
        success: true,
        data: null, // Puzzle already completed, don't update timer
      };
    }

    // Calculate current elapsed time from started_at
    const startedAt = new Date(completion.started_at);
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

    return {
      success: true,
      data: elapsedSeconds,
    };
  } catch (error) {
    const elapsedError = error as Error;

    logger.error("Exception getting elapsed time", elapsedError, {
      puzzleId,
      action: "getElapsedTime",
    });

    return {
      success: false,
      error: "Failed to get elapsed time.",
    };
  }
}

/**
 * Submit puzzle completion with server-side time validation
 *
 * Records completion timestamp and calculates server-side completion time.
 * Flags suspiciously fast completions (<120s) for review.
 *
 * @param puzzleId - Unique puzzle identifier
 * @param userEntries - 9x9 grid of user's final entries
 * @returns Result with completion time and flagged status, error message on failure
 */
export async function submitCompletion(
  puzzleId: string,
  userEntries: number[][]
): Promise<Result<{ completionTime: number; flagged: boolean; rank?: number }, string>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: User must be authenticated to submit completion",
      };
    }

    // AC4: Rate limiting (3 submissions/minute per user)
    const headersList = await headers();
    const clientIP = getClientIP({ headers: headersList });
    const token = userId || clientIP;

    try {
      await submissionLimiter.check(3, token);
    } catch {
      logger.warn("Puzzle submission rate limit exceeded", {
        userId: userId || undefined,
        ip: userId ? undefined : clientIP,
        puzzleId,
        action: "submitCompletion",
        limit: 3,
        windowSeconds: 60,
      });

      return { success: false, error: ABUSE_ERRORS.RATE_LIMIT_EXCEEDED };
    }

    const supabase = await createServerActionClient();

    // Get started_at timestamp
    const { data: completion } = await supabase
      .from("completions")
      .select("started_at")
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId)
      .maybeSingle();

    if (!completion?.started_at) {
      logger.warn("Cannot submit completion without started_at", {
        userId,
        puzzleId,
        action: "submitCompletion",
      });

      return {
        success: false,
        error: "Timer not started. Please refresh the page.",
      };
    }

    // Calculate server-side completion time
    const completedAt = new Date();
    const startedAt = new Date(completion.started_at);
    const completionTimeSeconds = Math.floor(
      (completedAt.getTime() - startedAt.getTime()) / 1000
    );

    // AC2: Reject if time <60 seconds (too fast to be legitimate)
    // In development, disable minimum time check (0 seconds) for auto-solve testing
    const MINIMUM_TIME_SECONDS = process.env.NODE_ENV === "production" ? 60 : 0;
    if (completionTimeSeconds < MINIMUM_TIME_SECONDS) {
      logger.warn("Completion rejected: time too short", {
        userId,
        puzzleId,
        completionTimeSeconds,
        minimumTime: MINIMUM_TIME_SECONDS,
        action: "submitCompletion",
      });

      return {
        success: false,
        error: ABUSE_ERRORS.TIME_TOO_SHORT,
      };
    }

    // AC3: Flag suspiciously fast completions (<120s)
    const FAST_COMPLETION_THRESHOLD_SECONDS = 120;
    const flagged = completionTimeSeconds < FAST_COMPLETION_THRESHOLD_SECONDS;

    // Update completion record
    const { error } = await supabase
      .from("completions")
      .update({
        completed_at: completedAt.toISOString(),
        completion_time_seconds: completionTimeSeconds,
        flagged_for_review: flagged,
        is_complete: true,
        completion_data: { userEntries },
      })
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId);

    if (error) {
      logger.error("Failed to submit puzzle completion", error, {
        userId,
        puzzleId,
        action: "submitCompletion",
      });

      return {
        success: false,
        error: "Failed to submit completion. Please try again.",
      };
    }

    logger.info("Puzzle completion submitted", {
      userId,
      puzzleId,
      completionTimeSeconds,
      flagged,
      action: "submitCompletion",
    });

    if (flagged) {
      logger.warn("Fast completion flagged for review", {
        userId,
        puzzleId,
        completionTimeSeconds,
        threshold: FAST_COMPLETION_THRESHOLD_SECONDS,
      });
    }

    // Calculate rank and insert into leaderboard
    // Count how many have faster times to determine rank
    const { count: fasterCount } = await supabase
      .from("leaderboards")
      .select("*", { count: "exact", head: true })
      .eq("puzzle_id", puzzleId)
      .lt("completion_time_seconds", completionTimeSeconds);

    const calculatedRank = (fasterCount ?? 0) + 1;

    // Insert into leaderboard (upsert to handle re-submissions)
    const { error: leaderboardInsertError } = await supabase
      .from("leaderboards")
      .upsert(
        {
          puzzle_id: puzzleId,
          user_id: userId,
          rank: calculatedRank,
          completion_time_seconds: completionTimeSeconds,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "puzzle_id,user_id" }
      );

    if (leaderboardInsertError) {
      logger.error("Failed to insert leaderboard entry", leaderboardInsertError, {
        userId,
        puzzleId,
        action: "submitCompletion",
      });
      // Don't fail the whole submission - completion was saved
    }

    // Use calculated rank directly (we just inserted it)
    const rank = leaderboardInsertError ? undefined : calculatedRank;

    return {
      success: true,
      data: {
        completionTime: completionTimeSeconds,
        flagged,
        rank,
      },
    };
  } catch (error) {
    const submitError = error as Error;

    logger.error("Exception submitting puzzle completion", submitError, {
      puzzleId,
      action: "submitCompletion",
    });

    Sentry.captureException(submitError, {
      extra: { puzzleId, action: "submitCompletion" },
    });

    return {
      success: false,
      error: "Failed to submit completion. Please try again.",
    };
  }
}

export async function checkPuzzleCompletion(
  puzzleId: string
): Promise<Result<{ isCompleted: boolean; completionTime?: number }, string>> {
  try {
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

