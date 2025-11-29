"use client";

import { formatTime } from "@/lib/utils/formatTime";
import type { LeaderboardEntry, PersonalRank } from "@/actions/leaderboard";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  personalRank?: PersonalRank;
}

export function LeaderboardTable({
  entries,
  personalRank,
}: LeaderboardTableProps) {
  const isPersonalRankInTop100 =
    personalRank && personalRank.rank <= 100 && personalRank.rank > 0;

  return (
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
          {entries.map((entry) => {
            const isPersonalRow =
              isPersonalRankInTop100 && entry.rank === personalRank.rank;

            return (
              <tr
                key={entry.rank}
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
  );
}
