"use client";

import * as React from "react";
import { DevToolbar } from "@/components/dev/DevToolbar";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { CompletionModal } from "./CompletionModal";
import type { SolvePath } from "@/lib/types/solve-path";
import type { StreakData } from "@/lib/types/streak";

interface PuzzleCompletedViewProps {
  completionTime: number;
  puzzleId: string;
  solution?: number[][];
  userId: string | null;
  puzzle: number[][];
  solvePath: SolvePath;
  puzzleNumber: number;
  rank?: number;
  streakData?: StreakData;
}

export function PuzzleCompletedView({
  completionTime,
  puzzleId,
  solution,
  userId,
  puzzle,
  solvePath,
  puzzleNumber,
  rank,
  streakData,
}: PuzzleCompletedViewProps) {
  const t = useTranslations("puzzle");
  const [showShareModal, setShowShareModal] = React.useState(false);
  const minutes = Math.floor(completionTime / 60);
  const seconds = completionTime % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      {process.env.NODE_ENV !== "production" && solution && (
        <DevToolbar
          puzzleId={puzzleId}
          solution={solution}
          userId={userId}
        />
      )}

      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-black">
            {t("completed")}
          </h1>
          <p className="text-gray-600">
            {t("alreadyCompleted", { time: timeString })}
          </p>
        </div>
        <Button
          onClick={() => setShowShareModal(true)}
          className="w-full"
        >
          <Share2 className="mr-2 h-4 w-4" />
          {t("shareYourResult")}
        </Button>
      </div>

      <CompletionModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        completionTime={completionTime}
        puzzleId={puzzleId}
        rank={rank}
        isAuthenticated={!!userId}
        puzzle={puzzle}
        solvePath={solvePath}
        puzzleNumber={puzzleNumber}
        streakData={streakData}
      />
    </div>
  );
}
