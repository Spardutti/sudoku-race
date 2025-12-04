import { createServerClient } from "@/lib/supabase/server";
import { StatsDisplay } from "./StatsDisplay";

interface ProfileStatsProps {
  userId: string;
}

type UserProfileStats = {
  total_count: number;
  avg_time: number | null;
  best_time: number | null;
};

export async function ProfileStats({ userId }: ProfileStatsProps) {
  const supabase = await createServerClient();

  const [statsData, streakData] = await Promise.all([
    supabase.rpc("get_user_profile_stats", { p_user_id: userId }).single<UserProfileStats>(),
    supabase
      .from("streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", userId)
      .single()
  ]);

  const stats = {
    totalPuzzlesSolved: Number(statsData.data?.total_count ?? 0),
    averageTime: statsData.data?.avg_time ?? null,
    bestTime: statsData.data?.best_time ?? null,
  };

  const streak = streakData.data
    ? {
        currentStreak: streakData.data.current_streak,
        longestStreak: streakData.data.longest_streak,
      }
    : null;

  return <StatsDisplay stats={stats} streak={streak} />;
}
