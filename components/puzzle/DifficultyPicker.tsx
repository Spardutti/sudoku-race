"use client";

import { ACTIVE_DIFFICULTY_LEVELS, type DifficultyLevel } from "@/lib/types/difficulty";
import { useTranslations } from "next-intl";
import { CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { PuzzleStatus } from "@/actions/puzzle-completion-check";

type DifficultyPickerProps = {
  puzzleStatuses: PuzzleStatus[];
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

export function DifficultyPicker({ puzzleStatuses }: DifficultyPickerProps) {
  const t = useTranslations("puzzle.difficultyPicker");
  const params = useParams();

  const getStatus = (difficulty: DifficultyLevel) => {
    return puzzleStatuses.find((s) => s.difficulty === difficulty)?.status || "not-started";
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
            const status = getStatus(difficulty);
            const config = DIFFICULTY_CONFIG[difficulty];

            return (
              <Link
                key={difficulty}
                href={`/${params.locale}/puzzle/${difficulty}`}
              >
                <Card
                  padding="lg"
                  className="relative hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                >
                {status === "completed" && (
                  <div className="absolute top-6 right-6">
                    <CheckCircle2 className="w-6 h-6 text-green-600" strokeWidth={2.5} />
                  </div>
                )}
                {status === "in-progress" && (
                  <div className="absolute top-6 right-6">
                    <Clock className="w-6 h-6 text-orange-500" strokeWidth={2.5} />
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

                  {status === "completed" && (
                    <div className="pt-2">
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                        {t("completed")}
                      </span>
                    </div>
                  )}
                  {status === "in-progress" && (
                    <div className="pt-2">
                      <span className="inline-block px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200">
                        {t("inProgress")}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center text-sm text-gray-600 space-y-1">
          <p>{t("canPlayBoth")}</p>
          {puzzleStatuses.filter((s) => s.status === "completed").length === ACTIVE_DIFFICULTY_LEVELS.length && (
            <p className="font-semibold text-green-600">
              {t("perfectDay")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
