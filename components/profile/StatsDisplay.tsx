"use client";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { StatItem } from "./StatItem";
import { formatTime } from "@/lib/utils/formatTime";
import { useTranslations } from "next-intl";

interface StatsDisplayProps {
  easyStats: {
    totalSolved: number;
    averageTime: number | null;
    bestTime: number | null;
  };
  mediumStats: {
    totalSolved: number;
    averageTime: number | null;
    bestTime: number | null;
  };
  combinedStats: {
    totalPuzzles: number;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    perfectDayStreak: number;
  } | null;
}

export function StatsDisplay({ easyStats, mediumStats, combinedStats, streak }: StatsDisplayProps) {
  const t = useTranslations("profile");

  if (combinedStats.totalPuzzles === 0) {
    return (
      <Card className="p-6 space-y-4">
        <Typography variant="h2" className="text-2xl">
          {t("stats")}
        </Typography>
        <div className="text-center py-8">
          <p className="text-gray-500">{t("completeFirstPuzzle")}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <Typography variant="h2" className="text-2xl">
        {t("stats")}
      </Typography>

      {/* Difficulty-specific stats - side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Easy Stats */}
        <div className="space-y-3">
          <Typography variant="h3" className="text-lg font-semibold border-b pb-2">
            {t("easyStats")}
          </Typography>
          <div className="grid grid-cols-2 gap-3">
            <StatItem
              label={t("totalSolved")}
              value={easyStats.totalSolved}
            />
            <StatItem
              label={t("averageTime")}
              value={easyStats.averageTime ? formatTime(easyStats.averageTime) : "—"}
            />
            <StatItem
              label={t("bestTime")}
              value={easyStats.bestTime ? formatTime(easyStats.bestTime) : "—"}
            />
          </div>
        </div>

        {/* Medium Stats */}
        <div className="space-y-3">
          <Typography variant="h3" className="text-lg font-semibold border-b pb-2">
            {t("mediumStats")}
          </Typography>
          <div className="grid grid-cols-2 gap-3">
            <StatItem
              label={t("totalSolved")}
              value={mediumStats.totalSolved}
            />
            <StatItem
              label={t("averageTime")}
              value={mediumStats.averageTime ? formatTime(mediumStats.averageTime) : "—"}
            />
            <StatItem
              label={t("bestTime")}
              value={mediumStats.bestTime ? formatTime(mediumStats.bestTime) : "—"}
            />
          </div>
        </div>
      </div>

      {/* Combined Stats */}
      <div className="space-y-3">
        <Typography variant="h3" className="text-lg font-semibold border-b pb-2">
          {t("combinedStats")}
        </Typography>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatItem
            label={t("totalPuzzlesSolved")}
            value={combinedStats.totalPuzzles}
          />
          <StatItem
            label={t("currentStreak")}
            value={streak?.currentStreak ?? 0}
          />
          <StatItem
            label={t("perfectDayStreak")}
            value={streak?.perfectDayStreak ?? 0}
          />
          <StatItem
            label={t("longestStreak")}
            value={streak?.longestStreak ?? 0}
          />
        </div>
      </div>
    </Card>
  );
}
