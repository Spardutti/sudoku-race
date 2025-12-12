import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPuzzleToday, checkPuzzleCompletion } from "@/actions/puzzle";
import { PuzzlePageClient } from "@/components/puzzle/PuzzlePageClient";
import { ACTIVE_DIFFICULTY_LEVELS, type DifficultyLevel } from "@/lib/types/difficulty";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string; difficulty: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, difficulty } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.puzzle' });

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const title = `${t('title')} - ${difficultyLabel}`;

  return {
    title,
    description: t('description'),
    openGraph: {
      title,
      description: t('description'),
      type: "website",
      images: [
        {
          url: "/og1200.png",
          width: 1200,
          height: 630,
          alt: `Sudoku Race ${difficultyLabel} - Daily Sudoku puzzle`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t('description'),
      images: ["/og1200.png"],
    },
  };
}

export default async function PuzzleDifficultyPage({ params }: Props) {
  const { difficulty } = await params;

  if (!ACTIVE_DIFFICULTY_LEVELS.includes(difficulty as DifficultyLevel)) {
    notFound();
  }

  const result = await getPuzzleToday(difficulty as DifficultyLevel);

  if (!result.success) {
    const t = await getTranslations('puzzle');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-black">
              {t('notAvailable')}
            </h1>
            <p className="text-gray-600">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const completionCheck = await checkPuzzleCompletion(result.data.id);
  const completionData = completionCheck.success ? completionCheck.data : { isCompleted: false };

  return <PuzzlePageClient puzzle={result.data} initialCompletionStatus={completionData} />;
}
