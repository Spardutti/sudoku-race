"use client";

import { useMemo } from "react";
import { formatTime } from "@/lib/utils/formatTime";
import type { LeaderboardEntry, PersonalRank } from "@/actions/leaderboard";
import { useLeaderboardQuery } from "@/lib/api";
import { ShareButton } from "./ShareButton";
import { useTranslations } from "next-intl";

interface LeaderboardTableProps {
  puzzleId: string;
  puzzleNumber: number;
  initialEntries: LeaderboardEntry[];
  personalRank?: PersonalRank;
  currentUserId?: string;
}

const getRankIcon = (rank: number): string => {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "";
  }
};

export function LeaderboardTable({
  puzzleId,
  puzzleNumber,
  initialEntries,
  personalRank: initialPersonalRank,
  currentUserId,
}: LeaderboardTableProps) {
  const t = useTranslations('leaderboard');
  const { data: entries } = useLeaderboardQuery({
    puzzleId,
    enabled: true,
  });

  const displayEntries = entries ?? initialEntries;

  const personalRank = useMemo(() => {
    if (!currentUserId) return initialPersonalRank;

    const userEntry = displayEntries.find((e) => e.user_id === currentUserId);
    if (userEntry) {
      return {
        rank: userEntry.rank,
        completion_time_seconds: userEntry.completion_time_seconds,
      };
    }

    return initialPersonalRank;
  }, [displayEntries, currentUserId, initialPersonalRank]);

  const isPersonalRankInTop100 =
    personalRank && personalRank.rank <= 100 && personalRank.rank > 0;

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <table
          className="w-full border-collapse border border-gray-200"
          aria-label="Daily leaderboard rankings"
        >
          <caption className="sr-only">Rankings for today&apos;s puzzle</caption>
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th
                scope="col"
                className="px-4 py-3 text-left font-serif text-base font-bold uppercase sm:px-2 sm:py-2 sm:text-sm"
              >
                {t('rank')}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-serif text-base font-bold uppercase sm:px-2 sm:py-2 sm:text-sm"
              >
                {t('username')}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-serif text-base font-bold uppercase sm:px-2 sm:py-2 sm:text-sm"
              >
                {t('time')}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-serif text-base font-bold uppercase sm:px-2 sm:py-2 sm:text-sm"
              >
                <span className="sr-only">{t('share')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayEntries.map((entry) => {
              const isPersonalRow =
                isPersonalRankInTop100 && entry.rank === personalRank.rank;
              const rankIcon = getRankIcon(entry.rank);

              return (
                <tr
                  key={`${entry.rank}-${entry.username}`}
                  data-user-id={
                    isPersonalRow && currentUserId ? currentUserId : undefined
                  }
                  aria-current={isPersonalRow ? "true" : undefined}
                  className={`border-b border-gray-200 ${
                    entry.rank % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } ${
                    isPersonalRow
                      ? "border-l-4 border-l-yellow-500 bg-yellow-50 font-bold"
                      : ""
                  }`}
                >
                  <td
                    scope="row"
                    className="min-h-11 px-4 py-3 font-mono text-sm sm:px-2 sm:py-2"
                  >
                    {rankIcon && <span className="mr-1">{rankIcon}</span>}
                    <span>#{entry.rank}</span>
                  </td>
                  <td className="min-h-11 px-4 py-3 font-sans text-sm sm:px-2 sm:py-2">
                    {entry.username}
                  </td>
                  <td className="min-h-11 px-4 py-3 font-mono text-sm sm:px-2 sm:py-2">
                    {formatTime(entry.completion_time_seconds)}
                  </td>
                  <td className="min-h-11 px-4 py-3 sm:px-2 sm:py-2">
                    {isPersonalRow && (
                      <ShareButton
                        rank={entry.rank}
                        time={entry.completion_time_seconds}
                        puzzleNumber={puzzleNumber}
                        puzzleId={puzzleId}
                        isGuest={!currentUserId}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
