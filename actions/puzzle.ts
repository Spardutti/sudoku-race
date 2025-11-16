"use server";

/**
 * Puzzle Server Actions
 *
 * Handles daily puzzle retrieval, solution validation, and completion submissions.
 * Implements server-side security to prevent solution exposure and cheating.
 *
 * @see docs/tech-spec-epic-2.md (Sections 2.2, 2.8, 2.9)
 * @see docs/rate-limiting.md for rate limiting patterns
 * @see docs/architecture.md (Server Actions Pattern, Rate Limiting & Abuse Prevention)
 */

import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/utils/rate-limit";
import { getClientIP } from "@/lib/utils/ip-utils";
import { ABUSE_ERRORS } from "@/lib/constants/errors";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";

/**
 * Daily puzzle data (never includes solution field for security)
 */
export type Puzzle = {
  id: string;
  puzzle_date: string; // YYYY-MM-DD format
  puzzle_data: number[][]; // 9x9 array with 0 for empty cells, 1-9 for clues
  difficulty: "easy" | "medium" | "hard";
};

/**
 * Get today's puzzle
 *
 * Fetches the daily puzzle for the current UTC date.
 * CRITICAL: Solution field is NEVER returned (server-side only for validation).
 *
 * @returns Result with today's puzzle or error message
 *
 * @example
 * ```typescript
 * const result = await getPuzzleToday()
 * if (result.success) {
 *   const puzzle = result.data
 *   console.log('Puzzle date:', puzzle.puzzle_date)
 *   console.log('Grid:', puzzle.puzzle_data)
 * } else {
 *   toast.error(result.error)
 * }
 * ```
 */
export async function getPuzzleToday(): Promise<Result<Puzzle, string>> {
  try {
    // Calculate today's UTC date (YYYY-MM-DD format)
    const today = new Date().toISOString().split("T")[0];

    // Create server-side Supabase client
    const supabase = await createServerClient();

    // Fetch today's puzzle
    // CRITICAL: Do NOT select 'solution' field (security - server-side only)
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

/**
 * Helper function to validate grid structure
 *
 * @param grid - 9x9 number array to validate
 * @returns true if valid grid structure, false otherwise
 */
function isValidGrid(grid: number[][]): boolean {
  // Check if grid is 9x9
  if (grid.length !== 9) return false;
  if (!grid.every((row) => row.length === 9)) return false;

  // Check if all cells are filled (no 0s) and values are 1-9
  const allValid = grid.flat().every((n) => n >= 1 && n <= 9);
  return allValid;
}

/**
 * Deep equality check for 9x9 grids
 *
 * @param grid1 - First 9x9 array
 * @param grid2 - Second 9x9 array
 * @returns true if all 81 cells match, false otherwise
 */
function gridsEqual(grid1: number[][], grid2: number[][]): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid1[i][j] !== grid2[i][j]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Validate puzzle solution
 *
 * Server-side solution validation comparing user's solution against stored solution.
 * CRITICAL: Solution is never exposed to client - only correct/incorrect result returned.
 *
 * @param puzzleId - Puzzle UUID
 * @param solution - User's completed solution grid (9x9 array, all filled with 1-9)
 * @returns Result with { correct: boolean } or error message
 *
 * @example
 * ```typescript
 * const result = await validatePuzzle(puzzleId, userSolution)
 * if (result.success) {
 *   if (result.data.correct) {
 *     toast.success('Correct solution!')
 *   } else {
 *     toast.error('Incorrect solution. Keep trying!')
 *   }
 * } else {
 *   toast.error(result.error)
 * }
 * ```
 */
export async function validatePuzzle(
  puzzleId: string,
  solution: number[][]
): Promise<Result<{ correct: boolean }, string>> {
  try {
    // Validate grid structure
    if (!isValidGrid(solution)) {
      return {
        success: false,
        error: "Invalid solution format. Grid must be 9x9 with values 1-9.",
      };
    }

    // Get user identifier for rate limiting
    const userId = await getCurrentUserId();
    const headersList = await headers();
    const clientIP = getClientIP({ headers: headersList });
    const token = userId || clientIP;

    // Apply rate limiting: max 100 validation attempts per hour (AC3 requirement)
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

    // Create server-side Supabase client
    const supabase = await createServerClient();

    // Fetch stored solution from database (server-side only)
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

    // Compare user solution with stored solution (deep equality)
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

/**
 * Validation rate limiter
 * Allows 100 validation attempts per hour per user (AC3 requirement)
 */
const validationLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

/**
 * Submission rate limiter
 * Allows 3 puzzle submissions per minute per user
 */
const submissionLimiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

/**
 * Violation tracker for excessive abuse detection
 * Maps user/IP to timestamps of rate limit violations
 */
const violationTimestamps = new Map<string, number[]>();

/**
 * Track a rate limit violation and return count in last hour
 */
function trackViolation(token: string): number {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // Get existing violations for this token
  const timestamps = violationTimestamps.get(token) || [];

  // Filter out violations older than 1 hour
  const recentViolations = timestamps.filter((ts) => ts > oneHourAgo);

  // Add current violation
  recentViolations.push(now);

  // Update map
  violationTimestamps.set(token, recentViolations);

  // Clean up old tokens periodically (when map gets large)
  if (violationTimestamps.size > 10000) {
    for (const [key, times] of violationTimestamps.entries()) {
      const recent = times.filter((ts) => ts > oneHourAgo);
      if (recent.length === 0) {
        violationTimestamps.delete(key);
      } else {
        violationTimestamps.set(key, recent);
      }
    }
  }

  return recentViolations.length;
}

/**
 * Completion data returned on successful submission
 */
export type CompletionData = {
  completionId: string;
  completionTimeSeconds: number;
  rank?: number;
};

/**
 * Server Action result type
 */
export type CompletePuzzleResult =
  | { success: true; data: CompletionData }
  | { success: false; error: string };

/**
 * Get current user ID from Supabase session
 *
 * @returns User ID or null if not authenticated
 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Complete a puzzle submission
 *
 * Applies rate limiting, duplicate submission prevention, and validation.
 * Full puzzle validation logic will be implemented in Story 2.6.
 *
 * @param puzzleId - Puzzle UUID
 * @param solution - User's solution grid (9x9 array)
 * @param completionTimeSeconds - Time taken to solve (seconds)
 * @returns Result with completion data or error message
 *
 * @example
 * ```typescript
 * const result = await completePuzzle(puzzleId, solution, 245)
 * if (result.success) {
 *   console.log('Completed in', result.data.completionTimeSeconds, 'seconds')
 * } else {
 *   toast.error(result.error)
 * }
 * ```
 */
export async function completePuzzle(
  puzzleId: string,
  solution: number[][],
  completionTimeSeconds: number
): Promise<CompletePuzzleResult> {
  const userId = await getCurrentUserId();

  // Get user identifier for rate limiting
  // Authenticated users: Use userId
  // Guest users: Use IP address (fallback identifier)
  const headersList = await headers();
  const clientIP = getClientIP({ headers: headersList });
  const token = userId || clientIP;

  try {
    // CRITICAL: Check rate limit BEFORE expensive validation
    // This prevents wasting server resources on malicious traffic
    await submissionLimiter.check(3, token);
  } catch {
    // Rate limit exceeded - log for monitoring
    // Include IP for guest users (helps identify abuse patterns)
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

    // Track excessive violations in Sentry (abuse pattern detection)
    const violationCount = trackViolation(token);

    // Alert on excessive violations (10+ in 1 hour)
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

  // Create server-side Supabase client
  const supabase = await createServerClient();

  // Check for duplicate submission (prevents leaderboard gaming)
  // Uses optimized composite index: idx_completions_user_puzzle_complete
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

  // TODO (Story 2.6): Implement full puzzle validation
  // - Validate solution correctness
  // - Check for invalid moves
  // - Verify puzzle state
  // - Calculate accurate completion time
  // - Detect pause abuse

  // Placeholder: For now, accept the submission
  // Story 2.6 will add full validation logic
  const { data: completion, error } = await supabase
    .from("completions")
    .insert({
      user_id: userId,
      puzzle_id: puzzleId,
      completion_time_seconds: completionTimeSeconds,
      completed_at: new Date().toISOString(),
      is_complete: true, // Mark as complete
      is_guest: !userId,
      completion_data: { solution }, // Store for validation
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

  // TODO (Epic 4): Add leaderboard rank calculation
  return {
    success: true,
    data: {
      completionId: completion.id,
      completionTimeSeconds,
    },
  };
}
