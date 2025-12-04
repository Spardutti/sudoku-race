import { createServerClient } from "@/lib/supabase/server";
import { StreakFreezeCard } from "./StreakFreezeCard";

interface ProfileStreakProps {
  userId: string;
}

export async function ProfileStreak({ userId }: ProfileStreakProps) {
  const supabase = await createServerClient();

  const { data: streakData } = await supabase
    .from("streaks")
    .select("freeze_available, last_freeze_reset_date")
    .eq("user_id", userId)
    .single();

  if (!streakData) {
    return null;
  }

  return (
    <StreakFreezeCard
      freezeAvailable={streakData.freeze_available}
      lastFreezeResetDate={streakData.last_freeze_reset_date}
    />
  );
}
