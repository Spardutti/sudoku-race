"use client";

import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { StatItem } from "./StatItem";
import { formatTime } from "@/lib/utils/formatTime";

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
  if (stats.totalPuzzlesSolved === 0) {
    return (
      <Card className="p-6 space-y-4">
        <Typography variant="h2" className="text-2xl">
          Statistics
        </Typography>
        <div className="text-center py-8">
          <p className="text-gray-500">Complete your first puzzle to see your stats!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <Typography variant="h2" className="text-2xl">
        Statistics
      </Typography>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatItem
          label="Total Puzzles Solved"
          value={stats.totalPuzzlesSolved}
        />
        <StatItem
          label="Current Streak"
          value={streak?.currentStreak ?? 0}
        />
        <StatItem
          label="Longest Streak"
          value={streak?.longestStreak ?? 0}
        />
        <StatItem
          label="Average Time"
          value={stats.averageTime ? formatTime(stats.averageTime) : "—"}
        />
        <StatItem
          label="Best Time"
          value={stats.bestTime ? formatTime(stats.bestTime) : "—"}
        />
      </div>
    </Card>
  );
}
