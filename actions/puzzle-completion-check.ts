"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import type { Result } from "@/lib/types/result";
import type { DifficultyLevel } from "@/lib/types/difficulty";
import { logger } from "@/lib/utils/logger";

export type PuzzleStatus = {
  difficulty: DifficultyLevel;
  status: "not-started" | "in-progress" | "completed";
  completionTime?: number;
};

export async function getTodayPuzzleStatuses(): Promise<Result<PuzzleStatus[], string>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: true,
        data: [],
      };
    }

    const supabase = await createServerActionClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("completions")
      .select("puzzle_id, completed_at, completion_time_seconds, puzzles!inner(difficulty, puzzle_date)")
      .eq("user_id", userId)
      .eq("puzzles.puzzle_date", today);

    if (error) {
      logger.error("Failed to fetch puzzle statuses", error, {
        userId,
        action: "getTodayPuzzleStatuses",
      });

      return {
        success: false,
        error: "Failed to check completion status",
      };
    }

    const statuses: PuzzleStatus[] = (data || []).map((item) => {
      const puzzleData = item.puzzles as unknown as { difficulty: DifficultyLevel };
      const isCompleted = item.completed_at !== null;

      return {
        difficulty: puzzleData.difficulty,
        status: isCompleted ? "completed" : "in-progress",
        completionTime: item.completion_time_seconds ?? undefined,
      };
    });

    return {
      success: true,
      data: statuses,
    };
  } catch (error) {
    logger.error("Exception checking puzzle statuses", error as Error, {
      action: "getTodayPuzzleStatuses",
    });

    return {
      success: false,
      error: "Failed to check completion status",
    };
  }
}

export async function getTodayCompletedDifficulties(): Promise<Result<DifficultyLevel[], string>> {
  const result = await getTodayPuzzleStatuses();

  if (!result.success) {
    return result;
  }

  const completed = result.data
    .filter((status) => status.status === "completed")
    .map((status) => status.difficulty);

  return {
    success: true,
    data: completed,
  };
}
