'use client';

import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";

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
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;
  const [year, month, day] = puzzleDate.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  const formattedDate = format(localDate, "MMMM d, yyyy", { locale: dateLocale });

  const dailyLeaderboard = locale === "es" ? "Clasificación Diaria" : "Daily Leaderboard";

  return (
    <div className="mb-6">
      <h1 className="mb-2 font-serif text-4xl font-bold uppercase sm:text-3xl">
        {dailyLeaderboard} - {formattedDate} #{puzzleNumber}
      </h1>
      <p className="text-base text-gray-600 sm:text-sm">
        {t('totalCompletions', { count: totalCompletions })}
      </p>
    </div>
  );
}
