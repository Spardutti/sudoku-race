"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import * as Sentry from "@sentry/nextjs";
import { getCurrentUserId } from "@/lib/auth/get-current-user";

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

export async function getElapsedTime(
  puzzleId: string
): Promise<Result<number | null, string>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: true,
        data: null,
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
        data: null,
      };
    }

    if (completion.is_complete) {
      return {
        success: true,
        data: null,
      };
    }

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
