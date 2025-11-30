import type { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";
import { getPuzzleToday } from "@/actions/puzzle";
import { getLeaderboard, getPersonalRank } from "@/actions/leaderboard";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { PersonalRankFooter } from "@/components/leaderboard/PersonalRankFooter";
import { EmptyState } from "@/components/leaderboard/EmptyState";
import { LeaderboardError } from "@/components/leaderboard/LeaderboardError";
import { LeaderboardHeader } from "@/components/leaderboard/LeaderboardHeader";
import { LeaderboardPageClient } from "@/components/leaderboard/LeaderboardPageClient";

export const dynamic = "force-dynamic";

/**
 * Leaderboard Page Metadata
 * SEO optimized for competitive ranking queries
 */
export const metadata: Metadata = generateMetadata({
  title: "Global Leaderboard",
  description:
    "Top Sudoku solvers worldwide. See the fastest completion times and compete for your rank on the daily leaderboard.",
  canonicalPath: "/leaderboard",
  ogImage: "/og-image.png",
  twitterCard: "/twitter-card.png",
});

export default async function LeaderboardPage() {
  const puzzleResult = await getPuzzleToday();

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
        <EmptyState />
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
