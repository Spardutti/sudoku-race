"use client";

import { useState } from "react";
import { DifficultyPicker } from "./DifficultyPicker";
import { PuzzlePageClient } from "./PuzzlePageClient";
import { PuzzleLoadingView } from "./PuzzleLoadingView";
import { useTranslations } from "next-intl";
import { getPuzzleToday, checkPuzzleCompletion } from "@/actions/puzzle";
import type { DifficultyLevel } from "@/lib/types/difficulty";
import type { Puzzle } from "@/actions/puzzle-fetch";
import Link from "next/link";

type PuzzlePageWrapperProps = {
  initialCompletedDifficulties: DifficultyLevel[];
};

export function PuzzlePageWrapper({ initialCompletedDifficulties }: PuzzlePageWrapperProps) {
  const t = useTranslations("puzzle");
  const tCommon = useTranslations("common");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [completionData, setCompletionData] = useState<{ isCompleted: boolean; completionTime?: number; rank?: number }>({ isCompleted: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectDifficulty = async (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
    setLoading(true);
    setError(null);

    const result = await getPuzzleToday(difficulty);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const completionCheck = await checkPuzzleCompletion(result.data.id);
    const completionStatus = completionCheck.success ? completionCheck.data : { isCompleted: false };

    setPuzzle(result.data);
    setCompletionData(completionStatus);
    setLoading(false);
  };

  if (!selectedDifficulty) {
    return (
      <DifficultyPicker
        onSelectDifficulty={handleSelectDifficulty}
        completedDifficulties={initialCompletedDifficulties}
      />
    );
  }

  if (loading) {
    return <PuzzleLoadingView />;
  }

  if (error || !puzzle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-black">
              {t("notAvailable")}
            </h1>
            <p className="text-gray-600">{error}</p>
          </div>
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            {tCommon("tryAgain")}
          </Link>
        </div>
      </div>
    );
  }

  return <PuzzlePageClient puzzle={puzzle} initialCompletionStatus={completionData} />;
}
