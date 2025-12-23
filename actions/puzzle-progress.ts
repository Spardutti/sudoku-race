"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import type { Result } from "@/lib/types/result";
import type { TimerEvent } from "@/lib/types/timer";
import type { SolvePath } from "@/lib/types/solve-path";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import {
  getCurrentPauseState,
  calculateElapsedTime,
  extractCompletionData,
} from "@/lib/utils/timer-helpers";
import { handleSaveError, handleLoadError } from "@/lib/utils/progress-errors";

export type PuzzleProgress = {
  userEntries?: number[][];
  elapsedTime: number;
  isCompleted: boolean;
  isStarted?: boolean;
  isPaused?: boolean;
  pausedAt?: number | null;
  pencilMarks?: Record<string, number[]>;
  solvePath?: SolvePath;
  lockedCells?: Record<string, boolean>;
};

export const saveProgress = async (
  puzzleId: string,
  userEntries: number[][],
  elapsedTime: number,
  isCompleted: boolean,
  pencilMarks?: Record<string, number[]>,
  solvePath?: SolvePath,
  lockedCells?: Record<string, boolean>
): Promise<Result<void, string>> => {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized: User must be authenticated to save progress",
      };
    }

    const supabase = await createServerActionClient();

    const { data: existing } = await supabase
      .from("completions")
      .select("started_at")
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId)
      .maybeSingle();

    const upsertData: {
      user_id: string;
      puzzle_id: string;
      completion_data: {
        userEntries: number[][];
        pencilMarks: Record<string, number[]>;
        solvePath?: SolvePath;
        lockedCells?: Record<string, boolean>;
      };
      completion_time_seconds: number;
      is_complete: boolean;
      is_guest: boolean;
      started_at?: string;
    } = {
      user_id: userId,
      puzzle_id: puzzleId,
      completion_data: {
        userEntries,
        pencilMarks: pencilMarks || {},
        solvePath: solvePath || [],
        lockedCells: lockedCells || {}
      },
      completion_time_seconds: elapsedTime,
      is_complete: isCompleted,
      is_guest: false,
    };

    if (existing?.started_at) {
      upsertData.started_at = existing.started_at;
    }

    const { error } = await supabase.from("completions").upsert(
      upsertData,
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
    return handleSaveError(error, puzzleId);
  }
};

export const loadProgress = async (
  puzzleId: string
): Promise<Result<PuzzleProgress | null, string>> => {
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

    const completionData = extractCompletionData(data.completion_data);
    const timerEvents = (data.timer_events || []) as TimerEvent[];

    const elapsedTime = calculateElapsedTime(
      data.is_complete,
      data.completion_time_seconds,
      data.started_at,
      timerEvents
    );

    const pauseState = getCurrentPauseState(timerEvents);
    const pausedAtTimestamp = pauseState.pausedAt ? new Date(pauseState.pausedAt).getTime() : null;

    const resultData = {
      userEntries: completionData?.userEntries && completionData.userEntries.length > 0
        ? completionData.userEntries
        : undefined,
      elapsedTime,
      isCompleted: data.is_complete || false,
      isPaused: pauseState.isPaused,
      pausedAt: pausedAtTimestamp,
      pencilMarks: completionData?.pencilMarks || {},
      solvePath: completionData?.solvePath || [],
      lockedCells: completionData?.lockedCells || {},
    };

    logger.info("Puzzle progress loaded", {
      userId,
      puzzleId,
      hasUserEntries: !!completionData?.userEntries && completionData.userEntries.length > 0,
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
    return handleLoadError(error, puzzleId);
  }
};
