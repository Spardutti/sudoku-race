import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { createServerClient } from "@/lib/supabase/server";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/?message=Please sign in to view your profile");
  }

  const supabase = await createServerClient();

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("username, email, created_at, oauth_provider")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    redirect("/?message=Failed to load profile");
  }

  const { count: completionCount } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: streakData } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak, last_completion_date, freeze_available, last_freeze_reset_date")
    .eq("user_id", userId)
    .single();

  return (
    <ProfilePageClient
      user={{
        id: userId,
        username: userData.username,
        email: userData.email,
        createdAt: userData.created_at,
        oauthProvider: userData.oauth_provider,
      }}
      stats={{
        totalPuzzlesSolved: completionCount ?? 0,
      }}
      streak={
        streakData
          ? {
              currentStreak: streakData.current_streak,
              longestStreak: streakData.longest_streak,
              lastCompletionDate: streakData.last_completion_date,
              freezeAvailable: streakData.freeze_available,
              lastFreezeResetDate: streakData.last_freeze_reset_date,
            }
          : null
      }
    />
  );
}
