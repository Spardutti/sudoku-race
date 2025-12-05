"use client";

import { useTranslations } from "next-intl";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const t = useTranslations('leaderboard');
  const tc = useTranslations('common');

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-2 font-serif text-2xl font-bold">
        {t('error')}
      </h2>
      <p className="mb-6 text-gray-600">
        {error || "Please try again later."}
      </p>
      <button
        onClick={onRetry}
        className="rounded-md border-2 border-black bg-white px-6 py-3 font-serif text-lg font-bold transition-colors hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        {tc('tryAgain')}
      </button>
    </div>
  );
}
