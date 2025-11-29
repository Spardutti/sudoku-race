"use client";

import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";
import { getPuzzleToday } from "@/actions/puzzle";

export const puzzleKeys = createQueryKeys("puzzle", {
  today: () => ({
    queryKey: ["today"],
    queryFn: async () => {
      const result = await getPuzzleToday();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  }),
});

export function useTodayPuzzle() {
  return useQuery(puzzleKeys.today());
}
