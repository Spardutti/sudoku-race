"use server";

import { headers } from "next/headers";
import { createServerActionClient } from "@/lib/supabase/server";
import { getClientIP } from "@/lib/utils/ip-utils";
import { ABUSE_ERRORS } from "@/lib/constants/errors";
import { logger } from "@/lib/utils/logger";
import * as Sentry from "@sentry/nextjs";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { submissionLimiter } from "@/lib/abuse-prevention/rate-limiters";
import { trackViolation } from "@/lib/abuse-prevention/violation-tracker";

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
