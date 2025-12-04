"use server";

import { headers } from "next/headers";
import { createServerActionClient } from "@/lib/supabase/server";
import { getClientIP } from "@/lib/utils/ip-utils";
import { ABUSE_ERRORS } from "@/lib/constants/errors";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import type { SolvePath } from "@/lib/types/solve-path";
import * as Sentry from "@sentry/nextjs";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { submissionLimiter } from "@/lib/abuse-prevention/rate-limiters";
import { updateStreak } from "./streak";
import type { StreakData } from "@/lib/types/streak";
import { insertLeaderboardEntry } from "./puzzle-leaderboard";

export async function submitCompletion(
  puzzleId: string,
  userEntries: number[][],
  solvePath: SolvePath = []
): Promise<
  Result<
    { completionTime: number; flagged: boolean; rank?: number; streakData?: StreakData },
    string
  >
> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: User must be authenticated to submit completion",
      };
    }

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

    const completedAt = new Date();
    const startedAt = new Date(completion.started_at);
    const completionTimeSeconds = Math.floor(
      (completedAt.getTime() - startedAt.getTime()) / 1000
    );

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

    const FAST_COMPLETION_THRESHOLD_SECONDS = 120;
    const flagged = completionTimeSeconds < FAST_COMPLETION_THRESHOLD_SECONDS;

    const { error } = await supabase
      .from("completions")
      .update({
        completed_at: completedAt.toISOString(),
        completion_time_seconds: completionTimeSeconds,
        flagged_for_review: flagged,
        is_complete: true,
        completion_data: { userEntries },
        solve_path: solvePath,
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

    const rank = await insertLeaderboardEntry(puzzleId, userId, completionTimeSeconds);

    const streakResult = await updateStreak(userId);
    let streakData: StreakData | undefined;

    if (streakResult.success) {
      streakData = streakResult.data;
      logger.info("Streak updated successfully", {
        userId,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
      });
    } else {
      logger.warn("Streak update failed - completion succeeded", {
        userId,
        puzzleId,
        streakError: streakResult.error,
      });
    }

    return {
      success: true,
      data: {
        completionTime: completionTimeSeconds,
        flagged,
        rank,
        streakData,
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
