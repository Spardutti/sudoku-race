import type { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

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

export default function LeaderboardPage() {
  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="mb-4 font-serif text-5xl font-bold text-black md:text-6xl">
          Leaderboard
        </h1>
        <h2 className="mb-6 font-serif text-2xl text-black md:text-3xl">
          Coming Soon
        </h2>
        <p className="text-lg text-gray-700">
          Daily rankings available after Epic 2
        </p>
      </div>
    </div>
  );
}
