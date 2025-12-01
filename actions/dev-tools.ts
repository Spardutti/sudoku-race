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
  // Block in production - use server-side runtime check
  // process.env.DEV_TOOLS_ENABLED is server-only (not bundled to client)
  const isDevToolsEnabled = process.env.DEV_TOOLS_ENABLED === "true";
  if (!isDevToolsEnabled) {
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

/**
 * DEV ONLY: Delete completion and leaderboard records for testing
 *
 * Allows re-testing completion flows by removing server-side records.
 * Only works for authenticated users on their own records.
 * Deletes from both completions and leaderboards tables.
 *
 * @param puzzleId - The puzzle ID to delete records for
 * @returns Result with void data on success, error message on failure
 */
export async function deleteCompletionRecord(
  puzzleId: string
): Promise<Result<void, string>> {
  // Block in production - use server-side runtime check
  // process.env.DEV_TOOLS_ENABLED is server-only (not bundled to client)
  const isDevToolsEnabled = process.env.DEV_TOOLS_ENABLED === "true";
  if (!isDevToolsEnabled) {
    return {
      success: false,
      error: "Dev tools not available in production",
    };
  }

  try {
    // Import auth helper dynamically to avoid circular dependencies
    const { getCurrentUserId } = await import("@/lib/auth/get-current-user");
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "Must be authenticated to delete records",
      };
    }

    const supabase = createServiceRoleClient();

    // Delete completion record
    const { error: completionError } = await supabase
      .from("completions")
      .delete()
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId);

    if (completionError) {
      console.error("Failed to delete completion:", completionError);
      return {
        success: false,
        error: "Failed to delete completion record",
      };
    }

    // Delete leaderboard entry (if exists - non-fatal if missing)
    const { error: leaderboardError } = await supabase
      .from("leaderboards")
      .delete()
      .eq("user_id", userId)
      .eq("puzzle_id", puzzleId);

    // Leaderboard deletion failure is non-fatal (record may not exist yet)
    if (leaderboardError) {
      console.warn("Failed to delete leaderboard entry:", leaderboardError);
    }

    console.log(
      `✅ Dev deletion: userId=${userId}, puzzleId=${puzzleId}`
    );

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Dev deletion error:", error);
    return {
      success: false,
      error: "Unexpected error during deletion",
    };
  }
}

