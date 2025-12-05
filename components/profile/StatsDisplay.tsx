"use client";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { StatItem } from "./StatItem";
import { formatTime } from "@/lib/utils/formatTime";
import { useTranslations } from "next-intl";

interface StatsDisplayProps {
  stats: {
    totalPuzzlesSolved: number;
    averageTime: number | null;
    bestTime: number | null;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
  } | null;
}

export function StatsDisplay({ stats, streak }: StatsDisplayProps) {
  const t = useTranslations("profile");

  if (stats.totalPuzzlesSolved === 0) {
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
    <Card className="p-6 space-y-4">
      <Typography variant="h2" className="text-2xl">
        {t("stats")}
      </Typography>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatItem
          label={t("totalPuzzlesSolved")}
          value={stats.totalPuzzlesSolved}
        />
        <StatItem
          label={t("currentStreak")}
          value={streak?.currentStreak ?? 0}
        />
        <StatItem
          label={t("longestStreak")}
          value={streak?.longestStreak ?? 0}
        />
        <StatItem
          label={t("averageTime")}
          value={stats.averageTime ? formatTime(stats.averageTime) : "—"}
        />
        <StatItem
          label={t("bestTime")}
          value={stats.bestTime ? formatTime(stats.bestTime) : "—"}
        />
      </div>
    </Card>
  );
}
