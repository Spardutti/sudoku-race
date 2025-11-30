"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/types/result";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  completion_time_seconds: number;
  user_id?: string;
  isOptimistic?: boolean;
}

export interface PersonalRank {
  rank: number;
  completion_time_seconds: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  puzzleNumber: number;
}

export async function getLeaderboard(
  puzzleId: string
): Promise<Result<LeaderboardData, string>> {
  try {
    const supabase = await createServerActionClient();

    const [leaderboardResult, puzzleResult] = await Promise.all([
      supabase
        .from("leaderboards")
        .select("completion_time_seconds, submitted_at, users!inner(username)")
        .eq("puzzle_id", puzzleId)
        .order("completion_time_seconds", { ascending: true })
        .order("submitted_at", { ascending: true })
        .limit(100),
      supabase
        .from("puzzles")
        .select("puzzle_number")
        .eq("id", puzzleId)
        .single(),
    ]);

    if (leaderboardResult.error) {
      console.error("Failed to fetch leaderboard:", leaderboardResult.error);
      return { success: false, error: "Failed to load leaderboard" };
    }

    if (puzzleResult.error) {
      console.error("Failed to fetch puzzle number:", puzzleResult.error);
      return { success: false, error: "Failed to load puzzle data" };
    }

    const entries: LeaderboardEntry[] = (leaderboardResult.data || []).map((entry, index) => {
      const users = Array.isArray(entry.users) ? entry.users[0] : entry.users;
      return {
        rank: index + 1,
        username: users?.username || "Unknown",
        completion_time_seconds: entry.completion_time_seconds,
      };
    });

    return {
      success: true,
      data: {
        entries,
        puzzleNumber: puzzleResult.data.puzzle_number || 0,
      },
    };
  } catch (error) {
    console.error("Unexpected error fetching leaderboard:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getPersonalRank(
  puzzleId: string,
  userId: string
): Promise<Result<PersonalRank | null, string>> {
  try {
    const supabase = await createServerActionClient();

    const { data, error } = await supabase
      .from("leaderboards")
      .select("rank, completion_time_seconds")
      .eq("puzzle_id", puzzleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch personal rank:", error);
      return { success: false, error: "Failed to load personal rank" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error fetching personal rank:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

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
