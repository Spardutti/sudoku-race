import type { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";
import { getPuzzleToday } from "@/actions/puzzle";
import { getLeaderboard, getPersonalRank } from "@/actions/leaderboard";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { PersonalRankFooter } from "@/components/leaderboard/PersonalRankFooter";
import { EmptyState } from "@/components/leaderboard/EmptyState";
import { LeaderboardError } from "@/components/leaderboard/LeaderboardError";

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

  const entries = leaderboardResult.data;

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

  const puzzleNumber = new Date(puzzle.puzzle_date)
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "");
  const formattedDate = new Date(puzzle.puzzle_date).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 font-serif text-4xl font-bold">
          Daily Leaderboard
        </h1>
        <p className="text-lg text-gray-600">
          Puzzle #{puzzleNumber} - {formattedDate}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {entries.length} {entries.length === 1 ? "player" : "players"}{" "}
          completed today&apos;s puzzle
        </p>
      </div>

      <LeaderboardTable
        entries={entries}
        personalRank={personalRank ?? undefined}
      />

      {personalRank && <PersonalRankFooter personalRank={personalRank} />}
    </div>
  );
}
