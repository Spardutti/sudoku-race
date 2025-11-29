"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardSkeleton() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse" aria-label="Loading leaderboard">
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
          {[...Array(5)].map((_, i) => (
            <tr
              key={i}
              className={`border-b border-gray-300 ${
                i % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
            >
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-10" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-32" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-5 w-16" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
