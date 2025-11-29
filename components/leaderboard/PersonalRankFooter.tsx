"use client";

import { formatTime } from "@/lib/utils/formatTime";
import type { PersonalRank } from "@/actions/leaderboard";

interface PersonalRankFooterProps {
  personalRank: PersonalRank;
}

export function PersonalRankFooter({
  personalRank,
}: PersonalRankFooterProps) {
  if (personalRank.rank <= 100) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t-2 border-black bg-white px-4 py-3 shadow-lg">
      <p className="text-center font-serif text-lg">
        Your rank: <span className="font-bold">#{personalRank.rank}</span> -
        Time:{" "}
        <span className="font-mono">
          {formatTime(personalRank.completion_time_seconds)}
        </span>
      </p>
    </div>
  );
}
