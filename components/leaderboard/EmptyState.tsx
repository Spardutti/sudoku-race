"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function EmptyState() {
  const t = useTranslations('leaderboard');

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-4 font-serif text-2xl font-bold">
        {t('empty')}
      </h2>
      <Link
        href="/"
        className="rounded-md border-2 border-black bg-white px-6 py-3 font-serif text-lg font-bold transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        {t('startPuzzle')}
      </Link>
    </div>
  );
}
