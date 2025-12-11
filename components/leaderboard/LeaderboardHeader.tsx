'use client';

import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import type { DifficultyLevel } from "@/lib/types/difficulty";
import { ACTIVE_DIFFICULTY_LEVELS } from "@/lib/types/difficulty";
import Link from "next/link";
import { useParams } from "next/navigation";

interface LeaderboardHeaderProps {
  puzzleDate: string;
  puzzleNumber: number;
  totalCompletions: number;
  difficulty: DifficultyLevel;
}

export function LeaderboardHeader({
  puzzleDate,
  puzzleNumber,
  totalCompletions,
  difficulty,
}: LeaderboardHeaderProps) {
  const t = useTranslations('leaderboard');
  const locale = useLocale();
  const params = useParams();
  const dateLocale = locale === "es" ? es : enUS;
  const [year, month, day] = puzzleDate.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  const formattedDate = format(localDate, "MMMM d, yyyy", { locale: dateLocale });

  const dailyLeaderboard = locale === "es" ? "Clasificación Diaria" : "Daily Leaderboard";

  return (
    <div className="mb-6">
      <div className="mb-4 flex gap-2 border-b border-gray-300">
        {ACTIVE_DIFFICULTY_LEVELS.map((diff) => {
          const isActive = diff === difficulty;
          return (
            <Link
              key={diff}
              href={`/${params.locale}/leaderboard?difficulty=${diff}`}
              className={`
                px-4 py-2 font-medium transition-colors
                ${isActive
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {t(`difficulties.${diff}`)}
            </Link>
          );
        })}
      </div>

      <h1 className="mb-2 font-serif text-4xl font-bold uppercase sm:text-3xl">
        {dailyLeaderboard} - {formattedDate} #{puzzleNumber}
      </h1>
      <p className="text-base text-gray-600 sm:text-sm">
        {t('totalCompletions', { count: totalCompletions })}
      </p>
    </div>
  );
}
