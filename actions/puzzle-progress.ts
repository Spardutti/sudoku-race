"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";
import { getCurrentUserId } from "@/lib/auth/get-current-user";

export type PuzzleProgress = {
  userEntries?: number[][];
  elapsedTime: number;
  isCompleted: boolean;
};

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

    let elapsedTime = 0;
    if (data.is_complete) {
      elapsedTime = data.completion_time_seconds || 0;
    } else if (data.started_at) {
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
