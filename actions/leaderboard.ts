"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/types/result";

export async function getHypotheticalRank(
  puzzleId: string,
  completionTimeSeconds: number
): Promise<Result<number, string>> {
  try {
    const supabase = await createServerActionClient();

    const { count, error } = await supabase
      .from("leaderboards")
      .select("*", { count: "exact", head: true })
      .eq("puzzle_id", puzzleId)
      .lt("completion_time_seconds", completionTimeSeconds);

    if (error) {
      console.error("Failed to calculate hypothetical rank:", error);
      return { success: false, error: "Failed to calculate rank" };
    }

    const rank = (count ?? 0) + 1;

    return { success: true, data: rank };
  } catch (error) {
    console.error("Unexpected error calculating rank:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
