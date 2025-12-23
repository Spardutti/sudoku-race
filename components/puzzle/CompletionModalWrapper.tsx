"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import type { StreakData } from "@/lib/types/streak";
import type { SolvePath } from "@/lib/types/solve-path";

const CompletionModal = dynamic(
  () => import("@/components/puzzle/CompletionModal").then((mod) => mod.CompletionModal),
  { ssr: false }
);

type CompletionModalWrapperProps = {
  isOpen: boolean;
  serverCompletionTime: number | null;
  elapsedTime: number;
  puzzleId: string;
  userId: string | null;
  serverRank?: number;
  onClose: () => void;
  puzzleData: number[][] | null;
  puzzleFallback: number[][];
  solvePath: SolvePath;
  puzzleNumber: number;
  streakData?: StreakData;
  difficulty?: 'easy' | 'medium' | 'hard';
};

export const CompletionModalWrapper = ({
  isOpen,
  serverCompletionTime,
  elapsedTime,
  puzzleId,
  userId,
  serverRank,
  onClose,
  puzzleData,
  puzzleFallback,
  solvePath,
  puzzleNumber,
  streakData,
  difficulty,
}: CompletionModalWrapperProps) => {
  const completionTime = (() => {
    const storedCompletionTime = usePuzzleStore.getState().completionTime;
    return serverCompletionTime ?? storedCompletionTime ?? elapsedTime;
  })();

  return (
    <CompletionModal
      isOpen={isOpen}
      completionTime={completionTime}
      puzzleId={puzzleId}
      isAuthenticated={!!userId}
      rank={serverRank}
      onClose={onClose}
      puzzle={puzzleData ?? puzzleFallback}
      solvePath={solvePath}
      puzzleNumber={puzzleNumber}
      streakData={streakData}
      difficulty={difficulty}
    />
  );
};
