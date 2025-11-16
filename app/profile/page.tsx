import type { Metadata } from "next";
import { generateMetadata } from "@/lib/utils/metadata";

/**
 * Profile Page Metadata
 * Private page - excluded from search indexing
 */
export const metadata: Metadata = generateMetadata({
  title: "Your Profile",
  description:
    "Track your Sudoku solving statistics, streaks, and personal best times.",
  canonicalPath: "/profile",
  robots: {
    index: false, // Profile pages are private, don't index
    follow: true,
  },
});

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="mb-4 font-serif text-5xl font-bold text-black md:text-6xl">
          Profile
        </h1>
        <h2 className="mb-6 font-serif text-2xl text-black md:text-3xl">
          Coming Soon
        </h2>
        <p className="text-lg text-gray-700">
          Authentication required (Epic 3)
        </p>
      </div>
    </div>
  );
}
