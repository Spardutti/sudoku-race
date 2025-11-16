import type { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";
import { SITE_URL } from "@/lib/config";

/**
 * Home Page Metadata
 * Overrides root layout with puzzle-specific title and description
 */
export const metadata: Metadata = generateMetadata({
  title: "Today's Puzzle",
  description:
    "Solve today's medium-difficulty Sudoku puzzle. Compete on the global leaderboard with authentic challenge - no hints, pure skill.",
  canonicalPath: "/",
  ogImage: "/og-image.png",
  twitterCard: "/twitter-card.png",
});

export default function Home() {
  // WebPage structured data for search engines
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Today's Sudoku Puzzle",
    description: "Solve today's Sudoku challenge and compete on the leaderboard",
    url: SITE_URL,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema),
        }}
      />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="mb-4 font-serif text-5xl font-bold text-black md:text-6xl">
            Coming Soon
          </h1>
          <h2 className="mb-6 font-serif text-2xl text-black md:text-3xl">
            Daily Sudoku
          </h2>
          <p className="text-lg text-gray-700">
            Your daily competitive Sudoku challenge
          </p>
        </div>
      </div>
    </>
  );
}
