import type { Metadata } from "next";
import { getPuzzleToday } from "@/actions/puzzle";
import { getLeaderboard, getPersonalRank } from "@/actions/leaderboard";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { PersonalRankFooter } from "@/components/leaderboard/PersonalRankFooter";
import { EmptyState } from "@/components/leaderboard/EmptyState";
import { LeaderboardError } from "@/components/leaderboard/LeaderboardError";
import { LeaderboardHeader } from "@/components/leaderboard/LeaderboardHeader";
import { LeaderboardPageClient } from "@/components/leaderboard/LeaderboardPageClient";
import { getTranslations } from "next-intl/server";
import { ACTIVE_DIFFICULTY_LEVELS, type DifficultyLevel } from "@/lib/types/difficulty";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.leaderboard' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

type LeaderboardPageProps = {
  searchParams: Promise<{ difficulty?: string }>;
};

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const { difficulty: difficultyParam } = await searchParams;
  const difficulty: DifficultyLevel =
    difficultyParam && ACTIVE_DIFFICULTY_LEVELS.includes(difficultyParam as DifficultyLevel)
      ? (difficultyParam as DifficultyLevel)
      : "medium";

  const puzzleResult = await getPuzzleToday(difficulty);

  if (!puzzleResult.success) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <LeaderboardError error={puzzleResult.error} />
      </div>
    );
  }

  const puzzle = puzzleResult.data;
  const leaderboardResult = await getLeaderboard(puzzle.id);

  if (!leaderboardResult.success) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <LeaderboardError error={leaderboardResult.error} />
      </div>
    );
  }

  const { entries, puzzleNumber } = leaderboardResult.data;

  if (entries.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <LeaderboardHeader
          puzzleDate={puzzle.puzzle_date}
          puzzleNumber={puzzleNumber}
          totalCompletions={0}
          difficulty={difficulty}
        />
        <EmptyState difficulty={difficulty} />
      </div>
    );
  }

  const userId = await getCurrentUserId();
  let personalRank = null;

  if (userId) {
    const personalRankResult = await getPersonalRank(puzzle.id, userId);
    if (personalRankResult.success && personalRankResult.data) {
      personalRank = personalRankResult.data;
    }
  }

  const shouldScrollToPersonalRank =
    !!personalRank && personalRank.rank <= 100;

  return (
    <LeaderboardPageClient
      currentUserId={userId ?? undefined}
      shouldScrollToPersonalRank={shouldScrollToPersonalRank}
    >
      <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6 lg:max-w-3xl">
        <LeaderboardHeader
          puzzleDate={puzzle.puzzle_date}
          puzzleNumber={puzzleNumber}
          totalCompletions={entries.length}
          difficulty={difficulty}
        />

        <LeaderboardTable
          puzzleId={puzzle.id}
          puzzleNumber={puzzleNumber}
          initialEntries={entries}
          personalRank={personalRank ?? undefined}
          currentUserId={userId ?? undefined}
        />

        {personalRank && (
          <PersonalRankFooter
            personalRank={personalRank}
            puzzleId={puzzle.id}
            puzzleNumber={puzzleNumber}
            isGuest={!userId}
          />
        )}
      </div>
    </LeaderboardPageClient>
  );
}
