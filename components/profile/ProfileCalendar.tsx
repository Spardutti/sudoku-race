import { createServerClient } from "@/lib/supabase/server";
import { CompletionCalendar } from "@/components/calendar/CompletionCalendar";
import { dateToKey } from "@/lib/utils/calendar-utils";

interface ProfileCalendarProps {
  userId: string;
}

export async function ProfileCalendar({ userId }: ProfileCalendarProps) {
  const supabase = await createServerClient();

  const CALENDAR_DAYS = 30;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - CALENDAR_DAYS);

  const { data: completions } = await supabase
    .from("completions")
    .select("completed_at, completion_time_seconds, puzzle_id, puzzles!inner(difficulty)")
    .eq("user_id", userId)
    .eq("is_complete", true)
    .gte("completed_at", thirtyDaysAgo.toISOString())
    .not("completion_time_seconds", "is", null);

  type CompletionEntry = {
    easy?: { time: number; completed: boolean };
    medium?: { time: number; completed: boolean };
  };

  const completionMap = completions
    ?.reduce((acc, c) => {
      if (!c.completed_at || !c.puzzles || typeof c.puzzles !== 'object') return acc;
      const dateKey = dateToKey(new Date(c.completed_at));
      const difficulty = (c.puzzles as { difficulty: string }).difficulty as 'easy' | 'medium';

      if (!acc[dateKey]) {
        acc[dateKey] = {};
      }

      acc[dateKey][difficulty] = {
        time: c.completion_time_seconds,
        completed: true
      };

      return acc;
    }, {} as Record<string, CompletionEntry>) || {};

  const todayISO = dateToKey(new Date());

  return <CompletionCalendar completionMap={completionMap} todayISO={todayISO} />;
}
