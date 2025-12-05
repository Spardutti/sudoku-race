import { Metadata } from "next";
import { getPuzzleToday, checkPuzzleCompletion } from "@/actions/puzzle";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { PuzzlePageClient } from "@/components/puzzle/PuzzlePageClient";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

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
  const t = await getTranslations('puzzle');
  const tCommon = await getTranslations('common');
  const result = await getPuzzleToday();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-black">
              {t('notAvailable')}
            </h1>
            <p className="text-gray-600">{result.error}</p>
          </div>
          <Link
            href="/puzzle"
            className="inline-block w-full px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            {tCommon('tryAgain')}
          </Link>
        </div>
      </div>
    );
  }

  const userId = await getCurrentUserId();
  const completionCheck = await checkPuzzleCompletion(result.data.id);
  const completionData = completionCheck.success ? completionCheck.data : { isCompleted: false };

  return <PuzzlePageClient puzzle={result.data} initialUserId={userId} initialCompletionStatus={completionData} />;
}
