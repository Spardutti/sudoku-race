import Link from "next/link";
import { DevToolbar } from "@/components/dev/DevToolbar";

interface PuzzleCompletedViewProps {
  completionTime: number;
  puzzleId: string;
  solution?: number[][];
  userId: string | null;
}

export function PuzzleCompletedView({
  completionTime,
  puzzleId,
  solution,
  userId,
}: PuzzleCompletedViewProps) {
  const minutes = Math.floor(completionTime / 60);
  const seconds = completionTime % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      {process.env.NODE_ENV !== "production" && solution && (
        <DevToolbar
          puzzleId={puzzleId}
          solution={solution}
          userId={userId}
        />
      )}

      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-black">
            Puzzle Complete!
          </h1>
          <p className="text-gray-600">
            You&apos;ve already completed today&apos;s puzzle in {timeString}
          </p>
        </div>
        <Link
          href="/"
          className="inline-block w-full px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
