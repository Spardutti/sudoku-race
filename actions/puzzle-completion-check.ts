"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import type { Result } from "@/lib/types/result";
import type { DifficultyLevel } from "@/lib/types/difficulty";
import { logger } from "@/lib/utils/logger";

export async function getTodayCompletedDifficulties(): Promise<Result<DifficultyLevel[], string>> {
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
      .select("puzzle_id, puzzles!inner(difficulty, puzzle_date)")
      .eq("user_id", userId)
      .eq("puzzles.puzzle_date", today)
      .not("completed_at", "is", null);

    if (error) {
      logger.error("Failed to fetch completed difficulties", error, {
        userId,
        action: "getTodayCompletedDifficulties",
      });

      return {
        success: false,
        error: "Failed to check completion status",
      };
    }

    const completed = (data || []).map((item) => {
      const puzzleData = item.puzzles as unknown as { difficulty: DifficultyLevel };
      return puzzleData.difficulty;
    });

    return {
      success: true,
      data: completed,
    };
  } catch (error) {
    logger.error("Exception checking completed difficulties", error as Error, {
      action: "getTodayCompletedDifficulties",
    });

    return {
      success: false,
      error: "Failed to check completion status",
    };
  }
}
