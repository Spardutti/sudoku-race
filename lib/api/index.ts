"use client";

import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { leaderboardKeys } from "./leaderboard";
import { puzzleKeys } from "./puzzle";
import { userKeys } from "./user";

export const queryKeys = mergeQueryKeys(
  leaderboardKeys,
  puzzleKeys,
  userKeys
);

export { leaderboardKeys, puzzleKeys, userKeys };

export { useLeaderboardQuery } from "./leaderboard";
export { useTodayPuzzle } from "./puzzle";

export type QueryKeys = typeof queryKeys;
