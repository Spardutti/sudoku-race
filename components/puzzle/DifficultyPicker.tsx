"use client";

import { useState } from "react";
import { ACTIVE_DIFFICULTY_LEVELS, type DifficultyLevel } from "@/lib/types/difficulty";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type DifficultyPickerProps = {
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
  completedDifficulties: DifficultyLevel[];
};

const DIFFICULTY_CONFIG: Record<DifficultyLevel, { estimatedTime: string }> = {
  easy: {
    estimatedTime: "5-10 min",
  },
  medium: {
    estimatedTime: "10-15 min",
  },
  hard: {
    estimatedTime: "15-25 min",
  },
};

export function DifficultyPicker({ onSelectDifficulty, completedDifficulties }: DifficultyPickerProps) {
  const t = useTranslations("puzzle.difficultyPicker");
  const [loading, setLoading] = useState(false);

  const handleSelect = (difficulty: DifficultyLevel) => {
    setLoading(true);
    onSelectDifficulty(difficulty);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-black">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACTIVE_DIFFICULTY_LEVELS.map((difficulty) => {
            const isCompleted = completedDifficulties.includes(difficulty);
            const config = DIFFICULTY_CONFIG[difficulty];

            return (
              <Card
                key={difficulty}
                padding="lg"
                className="relative hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => !loading && handleSelect(difficulty)}
              >
                {isCompleted && (
                  <div className="absolute top-6 right-6">
                    <CheckCircle2 className="w-6 h-6 text-green-600" strokeWidth={2.5} />
                  </div>
                )}

                <div className="space-y-4 min-h-[120px]">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-black capitalize">
                      {t(`difficulties.${difficulty}.name`)}
                    </h2>
                    <p className="text-sm text-gray-500 font-mono mt-1">
                      {config.estimatedTime}
                    </p>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed">
                    {t(`difficulties.${difficulty}.description`)}
                  </p>

                  {isCompleted && (
                    <div className="pt-2">
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                        {t("completed")}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>{t("canPlayBoth")}</p>
          {completedDifficulties.length === ACTIVE_DIFFICULTY_LEVELS.length && (
            <p className="font-semibold text-green-600">
              {t("perfectDay")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
