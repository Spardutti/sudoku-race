"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function insertLeaderboardEntry(
  puzzleId: string,
  userId: string,
  completionTimeSeconds: number
): Promise<number | undefined> {
  const supabase = await createServerActionClient();

  const { count: fasterCount, error: countError } = await supabase
    .from("leaderboards")
    .select("*", { count: "exact", head: true })
    .eq("puzzle_id", puzzleId)
    .lt("completion_time_seconds", completionTimeSeconds);

  console.log("[insertLeaderboardEntry] Query result:", {
    fasterCount,
    countError,
    puzzleId,
    completionTimeSeconds
  });

  const calculatedRank = (fasterCount ?? 0) + 1;
  console.log("[insertLeaderboardEntry] Calculated rank:", calculatedRank);

  const { error } = await supabase.from("leaderboards").upsert(
    {
      puzzle_id: puzzleId,
      user_id: userId,
      rank: calculatedRank,
      completion_time_seconds: completionTimeSeconds,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "puzzle_id,user_id" }
  );

  if (error) {
    logger.error("Failed to insert leaderboard entry", error, {
      userId,
      puzzleId,
      action: "insertLeaderboardEntry",
    });
    return undefined;
  }

  console.log("[insertLeaderboardEntry] Returning rank:", calculatedRank);
  return calculatedRank;
}
