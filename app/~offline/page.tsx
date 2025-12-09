import { WifiOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline - Sudoku Race",
  description: "You're currently offline. Reconnect to continue playing.",
};

export default function OfflinePage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full border-4 border-black p-6">
            <WifiOff className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold">
            You&apos;re Offline
          </h1>
          <p className="text-gray-600">
            No internet connection detected. Reconnect to continue playing Sudoku Race.
          </p>
        </div>

        <div className="space-y-4 border-t-2 border-black pt-6">
          <h2 className="font-serif text-lg font-bold">
            Cached Puzzles Available
          </h2>
          <p className="text-sm text-gray-700">
            Previously viewed puzzles may be available for offline play. Your progress will sync when you reconnect.
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Offline limitations:</strong>
          </p>
          <ul className="space-y-1 text-left">
            <li>• Cannot submit for leaderboard</li>
            <li>• Real-time updates disabled</li>
            <li>• Authentication unavailable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
