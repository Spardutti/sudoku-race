'use client';

import { format } from "date-fns";
import { useTranslations } from "next-intl";

interface LeaderboardHeaderProps {
  puzzleDate: string;
  puzzleNumber: number;
  totalCompletions: number;
}

export function LeaderboardHeader({
  puzzleDate,
  puzzleNumber,
  totalCompletions,
}: LeaderboardHeaderProps) {
  const t = useTranslations('leaderboard');
  const formattedDate = format(new Date(puzzleDate), "MMMM d, yyyy");

  return (
    <div className="mb-6">
      <h1 className="mb-2 font-serif text-4xl font-bold uppercase sm:text-3xl">
        Daily Leaderboard - {formattedDate} #{puzzleNumber}
      </h1>
      <p className="text-base text-gray-600 sm:text-sm">
        {t('totalCompletions', { count: totalCompletions })}
      </p>
    </div>
  );
}
