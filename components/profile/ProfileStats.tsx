import { createServerClient } from "@/lib/supabase/server";
import { StatsDisplay } from "./StatsDisplay";

interface ProfileStatsProps {
  userId: string;
}

type DifficultyStats = {
  total_count: number;
  avg_time: number | null;
  best_time: number | null;
};

type CombinedStats = {
  total_puzzles: number;
  easy_count: number;
  medium_count: number;
};

export async function ProfileStats({ userId }: ProfileStatsProps) {
  const supabase = await createServerClient();

  const [easyStatsData, mediumStatsData, combinedStatsData, streakData] = await Promise.all([
    supabase.rpc("get_user_stats_by_difficulty", { p_user_id: userId, p_difficulty: 'easy' }).single<DifficultyStats>(),
    supabase.rpc("get_user_stats_by_difficulty", { p_user_id: userId, p_difficulty: 'medium' }).single<DifficultyStats>(),
    supabase.rpc("get_user_combined_stats", { p_user_id: userId }).single<CombinedStats>(),
    supabase
      .from("streaks")
      .select("current_streak, longest_streak, perfect_day_streak")
      .eq("user_id", userId)
      .single()
  ]);

  const easyStats = {
    totalSolved: Number(easyStatsData.data?.total_count ?? 0),
    averageTime: easyStatsData.data?.avg_time ?? null,
    bestTime: easyStatsData.data?.best_time ?? null,
  };

  const mediumStats = {
    totalSolved: Number(mediumStatsData.data?.total_count ?? 0),
    averageTime: mediumStatsData.data?.avg_time ?? null,
    bestTime: mediumStatsData.data?.best_time ?? null,
  };

  const combinedStats = {
    totalPuzzles: Number(combinedStatsData.data?.total_puzzles ?? 0),
  };

  const streak = streakData.data
    ? {
        currentStreak: streakData.data.current_streak,
        longestStreak: streakData.data.longest_streak,
        perfectDayStreak: streakData.data.perfect_day_streak,
      }
    : null;

  return <StatsDisplay easyStats={easyStats} mediumStats={mediumStats} combinedStats={combinedStats} streak={streak} />;
}
