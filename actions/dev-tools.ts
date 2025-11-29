"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/types/result";

/**
 * DEV ONLY: Submit completion with fake username for testing leaderboard
 *
 * This bypasses normal auth flow and directly creates user + leaderboard entry.
 * Only works in development mode.
 */
export async function devSubmitCompletion(
  puzzleId: string,
  username: string,
  completionTimeSeconds: number
): Promise<Result<{ rank: number }, string>> {
  // Block in production
  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      error: "Dev tools not available in production",
    };
  }

  try {
    const supabase = createServiceRoleClient();

    // Create or get fake user
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create fake user
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          username,
          email: `${username.toLowerCase().replace(/\s+/g, '')}@test.dev`,
          oauth_provider: "dev-test",
        })
        .select("id")
        .single();

      if (userError || !newUser) {
        console.error("Failed to create test user:", userError);
        return {
          success: false,
          error: "Failed to create test user",
        };
      }

      userId = newUser.id;
    }

    // Get current max rank for this puzzle
    const { data: maxRankData } = await supabase
      .from("leaderboards")
      .select("rank")
      .eq("puzzle_id", puzzleId)
      .order("rank", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Calculate rank (sorted by time, then submitted_at)
    const { count } = await supabase
      .from("leaderboards")
      .select("*", { count: "exact", head: true })
      .eq("puzzle_id", puzzleId)
      .or(`completion_time_seconds.lt.${completionTimeSeconds},and(completion_time_seconds.eq.${completionTimeSeconds},submitted_at.lt.now())`);

    const rank = (count || 0) + 1;

    // Insert into leaderboard (or update if exists)
    const { error: leaderboardError } = await supabase
      .from("leaderboards")
      .upsert(
        {
          puzzle_id: puzzleId,
          user_id: userId,
          rank,
          completion_time_seconds: completionTimeSeconds,
        },
        {
          onConflict: "puzzle_id,user_id",
        }
      );

    if (leaderboardError) {
      console.error("Failed to insert leaderboard entry:", leaderboardError);
      return {
        success: false,
        error: "Failed to submit to leaderboard",
      };
    }

    console.log(`✅ Dev submission: ${username} - ${completionTimeSeconds}s - Rank #${rank}`);

    return {
      success: true,
      data: { rank },
    };
  } catch (error) {
    console.error("Dev submission error:", error);
    return {
      success: false,
      error: "Unexpected error during dev submission",
    };
  }
}
