"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardSkeleton() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse" aria-label="Loading leaderboard">
        <thead>
          <tr className="border-b-2 border-gray-200">
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
          {[...Array(10)].map((_, i) => (
            <tr
              key={i}
              className={`border-b border-gray-200 ${
                i % 2 === 0 ? "bg-white" : "bg-gray-50"
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
