"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import type { TimerEvent } from "@/lib/types/timer";
import * as Sentry from "@sentry/nextjs";
import { getCurrentUserId } from "@/lib/auth/get-current-user";

function getCurrentPauseState(events: TimerEvent[]): {
  isPaused: boolean;
  pausedAt: string | null;
} {
  if (!events || events.length === 0) {
    return { isPaused: false, pausedAt: null };
  }

  const lastPauseResumeEvent = [...events].reverse().find(
    (e) => e.type === "pause" || e.type === "resume"
  );

  if (!lastPauseResumeEvent) {
    return { isPaused: false, pausedAt: null };
  }

  return {
    isPaused: lastPauseResumeEvent.type === "pause",
    pausedAt:
      lastPauseResumeEvent.type === "pause"
        ? lastPauseResumeEvent.timestamp
        : null,
  };
}

function calculateActiveTimeFromEvents(
  events: TimerEvent[],
  startedAt: string
): number {
  if (!events || events.length === 0) {
    const start = new Date(startedAt);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / 1000);
  }

  let totalActive = 0;
  let lastStart: Date | null = new Date(startedAt);

  for (const event of events) {
    if (event.type === "start" || event.type === "resume") {
      lastStart = new Date(event.timestamp);
    } else if (event.type === "pause") {
      if (lastStart) {
        totalActive += new Date(event.timestamp).getTime() - lastStart.getTime();
        lastStart = null;
      }
    }
  }

  if (lastStart) {
    const now = new Date();
    totalActive += now.getTime() - lastStart.getTime();
  }

  return Math.floor(totalActive / 1000);
}

export type PuzzleProgress = {
  userEntries?: number[][];
  elapsedTime: number;
  isCompleted: boolean;
  isStarted?: boolean;
  isPaused?: boolean;
  pausedAt?: number | null;
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
      .select("completion_data, completion_time_seconds, is_complete, started_at, timer_events")
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

    const timerEvents = (data.timer_events || []) as TimerEvent[];

    let elapsedTime = 0;
    if (data.is_complete) {
      elapsedTime = data.completion_time_seconds || 0;
    } else if (data.started_at) {
      elapsedTime = calculateActiveTimeFromEvents(timerEvents, data.started_at);
    }

    const pauseState = getCurrentPauseState(timerEvents);
    const pausedAtTimestamp = pauseState.pausedAt ? new Date(pauseState.pausedAt).getTime() : null;

    const resultData = {
      userEntries: userEntries && userEntries.length > 0 ? userEntries : undefined,
      elapsedTime,
      isCompleted: data.is_complete || false,
      isPaused: pauseState.isPaused,
      pausedAt: pausedAtTimestamp,
    };

    logger.info("Puzzle progress loaded", {
      userId,
      puzzleId,
      hasUserEntries: !!userEntries && userEntries.length > 0,
      elapsedTime,
      isComplete: data.is_complete,
      isPaused: pauseState.isPaused,
      pausedAt: pausedAtTimestamp,
      action: "loadProgress",
    });

    return {
      success: true,
      data: resultData,
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
