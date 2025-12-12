import { Metadata } from "next";
import { DifficultyPicker } from "@/components/puzzle/DifficultyPicker";
import { getTodayPuzzleStatuses } from "@/actions/puzzle-completion-check";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.puzzle' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: "website",
      images: [
        {
          url: "/og1200.png",
          width: 1200,
          height: 630,
          alt: "Sudoku Race - Daily Sudoku puzzle",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t('title'),
      description: t('description'),
      images: ["/og1200.png"],
    },
  };
}

export default async function PuzzlePage() {
  const statusResult = await getTodayPuzzleStatuses();
  const puzzleStatuses = statusResult.success ? statusResult.data : [];

  return <DifficultyPicker puzzleStatuses={puzzleStatuses} />;
}
