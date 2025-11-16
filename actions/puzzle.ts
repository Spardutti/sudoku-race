"use server";

/**
 * Puzzle Server Actions
 *
 * Handles puzzle completion submissions with rate limiting and abuse prevention.
 * Full puzzle validation logic will be implemented in Story 2.6.
 *
 * @see docs/rate-limiting.md for rate limiting patterns
 * @see docs/architecture.md (Rate Limiting & Abuse Prevention section)
 */

import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/utils/rate-limit";
import { getClientIP } from "@/lib/utils/ip-utils";
import { ABUSE_ERRORS } from "@/lib/constants/errors";
import { logger } from "@/lib/utils/logger";
import * as Sentry from "@sentry/nextjs";

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
