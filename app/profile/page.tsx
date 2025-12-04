import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { createServerClient } from "@/lib/supabase/server";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { dateToKey } from "@/lib/utils/calendar-utils";

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

  const CALENDAR_DAYS = 30;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - CALENDAR_DAYS);

  const { data: completions } = await supabase
    .from("completions")
    .select("completed_at, completion_time_seconds")
    .eq("user_id", userId)
    .eq("is_complete", true)
    .not("completion_time_seconds", "is", null);

  const completionCount = completions?.length ?? 0;

  const times = completions?.map((c) => c.completion_time_seconds) || [];
  const averageTime =
    times.length > 0
      ? Math.round(times.reduce((sum, t) => sum + t, 0) / times.length)
      : null;
  const bestTime = times.length > 0 ? Math.min(...times) : null;

  const { data: streakData } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak, last_completion_date, freeze_available, last_freeze_reset_date")
    .eq("user_id", userId)
    .single();

  const completionMap = completions
    ?.filter((c) => c.completed_at && new Date(c.completed_at) >= thirtyDaysAgo)
    .reduce((acc, c) => {
      if (!c.completed_at) return acc;
      const dateKey = dateToKey(new Date(c.completed_at));
      acc[dateKey] = { time: c.completion_time_seconds, completed: true };
      return acc;
    }, {} as Record<string, { time: number; completed: boolean }>) || {};

  const todayISO = dateToKey(new Date());

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
        averageTime,
        bestTime,
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
      completionMap={completionMap}
      todayISO={todayISO}
    />
  );
}
