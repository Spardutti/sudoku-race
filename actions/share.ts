"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/types/result";

export interface LogShareEventParams {
  puzzleId: string;
  channel: "twitter" | "whatsapp" | "clipboard";
  rankAtShare: number;
}

export async function logShareEvent({
  puzzleId,
  channel,
  rankAtShare,
}: LogShareEventParams): Promise<Result<void, string>> {
  try {
    const supabase = await createServerActionClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error: insertError } = await supabase.from("share_events").insert({
      user_id: user.id,
      puzzle_id: puzzleId,
      channel,
      rank_at_share: rankAtShare,
    });

    if (insertError) {
      console.error("Failed to log share event:", insertError);

      return { success: false, error: "Failed to log share event" };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Unexpected error logging share event:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
