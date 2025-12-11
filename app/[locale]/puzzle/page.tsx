import { Metadata } from "next";
import { PuzzlePageWrapper } from "@/components/puzzle/PuzzlePageWrapper";
import { getTodayCompletedDifficulties } from "@/actions/puzzle-completion-check";
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
    },
  };
}

export default async function PuzzlePage() {
  const completedResult = await getTodayCompletedDifficulties();
  const completedDifficulties = completedResult.success ? completedResult.data : [];

  return <PuzzlePageWrapper initialCompletedDifficulties={completedDifficulties} />;
}
