"use client";

import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/actions/leaderboard";
import type { LeaderboardEntry } from "@/actions/leaderboard";

export const leaderboardKeys = createQueryKeys("leaderboard", {
  list: (puzzleId: string) => ({
    queryKey: [puzzleId],
    queryFn: async () => {
      const result = await getLeaderboard(puzzleId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data.entries;
    },
  }),
});

interface UseLeaderboardQueryParams {
  puzzleId: string;
  enabled?: boolean;
}

export function useLeaderboardQuery({
  puzzleId,
  enabled = true,
}: UseLeaderboardQueryParams) {
  return useQuery({
    ...leaderboardKeys.list(puzzleId),
    enabled,
    refetchInterval: enabled ? 5000 : false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export type { LeaderboardEntry };
