import type { SupabaseClient } from "@supabase/supabase-js";

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completion_date: string;
  freeze_available: boolean;
  last_freeze_reset_date: string | null;
};

export async function getStreakForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<Streak | null> {
  const { data, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data;
}

export async function upsertStreak(
  supabase: SupabaseClient,
  userId: string,
  streakData: Omit<Streak, "id" | "user_id">
): Promise<Streak> {
  const { data, error } = await supabase
    .from("streaks")
    .upsert(
      {
        user_id: userId,
        ...streakData,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
