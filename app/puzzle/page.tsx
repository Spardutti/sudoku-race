import { Metadata } from "next";
import { getPuzzleToday, checkPuzzleCompletion } from "@/actions/puzzle";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { PuzzlePageClient } from "@/components/puzzle/PuzzlePageClient";

export const metadata: Metadata = {
  title: "Today's Puzzle - Sudoku Race",
  description:
    "Solve today's Sudoku puzzle and compete on the global leaderboard. Fast, clean, competitive daily Sudoku.",
  openGraph: {
    title: "Today's Puzzle - Sudoku Race",
    description: "Solve today's Sudoku puzzle and compete on the global leaderboard",
    type: "website",
  },
};

export default async function PuzzlePage() {
  const result = await getPuzzleToday();

  if (!result.success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-black">
              Puzzle Not Available
            </h1>
            <p className="text-gray-600">{result.error}</p>
          </div>
          <a
            href="/puzzle"
            className="inline-block w-full px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }

  const userId = await getCurrentUserId();
  const completionCheck = await checkPuzzleCompletion(result.data.id);
  const completionData = completionCheck.success ? completionCheck.data : { isCompleted: false };

  return <PuzzlePageClient puzzle={result.data} initialUserId={userId} initialCompletionStatus={completionData} />;
}
