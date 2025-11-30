"use client";

import { formatTime } from "@/lib/utils/formatTime";
import type { PersonalRank } from "@/actions/leaderboard";
import { ShareButton } from "./ShareButton";

interface PersonalRankFooterProps {
  personalRank: PersonalRank;
  puzzleId: string;
  puzzleNumber: number;
  isGuest?: boolean;
}

export function PersonalRankFooter({
  personalRank,
  puzzleId,
  puzzleNumber,
  isGuest = false,
}: PersonalRankFooterProps) {
  if (personalRank.rank <= 100) {
    return null;
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 border-t-2 border-gray-300 bg-white px-6 py-4 shadow-lg sm:px-4 sm:py-3">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <p className="text-center font-sans text-base sm:text-sm">
          Your rank: <span className="font-bold">#{personalRank.rank}</span> -
          Time:{" "}
          <span className="font-mono">
            {formatTime(personalRank.completion_time_seconds)}
          </span>
        </p>
        <ShareButton
          rank={personalRank.rank}
          time={personalRank.completion_time_seconds}
          puzzleNumber={puzzleNumber}
          puzzleId={puzzleId}
          isGuest={isGuest}
        />
      </div>
    </div>
  );
}
