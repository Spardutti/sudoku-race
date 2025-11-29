"use client";

import { useMemo } from "react";
import { formatTime } from "@/lib/utils/formatTime";
import type { LeaderboardEntry, PersonalRank } from "@/actions/leaderboard";
import { useLeaderboardQuery } from "@/lib/api";

interface LeaderboardTableProps {
  puzzleId: string;
  initialEntries: LeaderboardEntry[];
  personalRank?: PersonalRank;
  currentUserId?: string;
}

export function LeaderboardTable({
  puzzleId,
  initialEntries,
  personalRank: initialPersonalRank,
  currentUserId,
}: LeaderboardTableProps) {
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
          className="w-full border-collapse"
          aria-label="Daily leaderboard"
        >
          <thead>
            <tr className="border-b-2 border-black">
              <th
                scope="col"
                className="px-4 py-3 text-left font-serif text-lg font-bold"
              >
                Rank
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-serif text-lg font-bold"
              >
                Username
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-serif text-lg font-bold"
              >
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {displayEntries.map((entry) => {
              const isPersonalRow =
                isPersonalRankInTop100 && entry.rank === personalRank.rank;

              return (
                <tr
                  key={`${entry.rank}-${entry.username}`}
                  className={`border-b border-gray-300 ${
                    entry.rank % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } ${isPersonalRow ? "bg-blue-50 font-bold" : ""}`}
                >
                  <td scope="row" className="px-4 py-3">
                    #{entry.rank}
                  </td>
                  <td className="px-4 py-3">{entry.username}</td>
                  <td className="px-4 py-3 font-mono">
                    {formatTime(entry.completion_time_seconds)}
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
