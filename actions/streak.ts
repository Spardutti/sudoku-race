"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import type { StreakData } from "@/lib/types/streak";
import * as Sentry from "@sentry/nextjs";

export async function updateStreak(userId: string): Promise<Result<StreakData, string>> {
  if (!userId || typeof userId !== "string") {
    return {
      success: false,
      error: "Invalid user ID",
    };
  }

  try {
    const supabase = await createServerActionClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase.rpc("update_user_streak", {
      p_user_id: userId,
      p_today: today,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No streak data returned from RPC");
    }

    const streakRecord = data[0];

    logger.info("Streak updated", {
      userId,
      currentStreak: streakRecord.current_streak,
      longestStreak: streakRecord.longest_streak,
    });

    return {
      success: true,
      data: {
        currentStreak: streakRecord.current_streak,
        longestStreak: streakRecord.longest_streak,
        lastCompletionDate: streakRecord.last_completion_date,
        freezeAvailable: streakRecord.freeze_available,
        lastFreezeResetDate: streakRecord.last_freeze_reset_date,
        freezeWasUsed: streakRecord.freeze_was_used,
        streakWasReset: streakRecord.streak_was_reset,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Streak update failed", error instanceof Error ? error : new Error(errorMessage), {
      userId,
      operation: "updateStreak",
    });

    Sentry.captureException(error, {
      tags: { userId },
      extra: { operation: "updateStreak" },
    });

    return {
      success: false,
      error: "Failed to update streak",
    };
  }
}
