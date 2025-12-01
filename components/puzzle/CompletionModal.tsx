"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getHypotheticalRank } from "@/actions/leaderboard";
import { AuthButtons } from "@/components/auth/AuthButtons";

interface CompletionModalProps {
  isOpen: boolean;
  completionTime: number;
  puzzleId: string;
  rank?: number;
  isAuthenticated: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function CompletionModal({
  isOpen,
  completionTime,
  puzzleId,
  rank,
  isAuthenticated,
  onClose,
}: CompletionModalProps) {
  const [hypotheticalRank, setHypotheticalRank] = React.useState<number | null>(null);
  const [isLoadingRank, setIsLoadingRank] = React.useState(false);
  const [showAuthButtons, setShowAuthButtons] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated && isOpen && !hypotheticalRank) {
      setIsLoadingRank(true);
      getHypotheticalRank(puzzleId, completionTime)
        .then((result) => {
          if (result.success) {
            setHypotheticalRank(result.data);
          }
        })
        .finally(() => setIsLoadingRank(false));
    }
  }, [isOpen, isAuthenticated, puzzleId, completionTime, hypotheticalRank]);

  const guestRank = hypotheticalRank ?? null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-3xl font-bold text-gray-900">
            Congratulations!
          </DialogTitle>
        </DialogHeader>

        <div className="text-center mb-6">
          <p className="mb-2 text-gray-600">Your time:</p>
          <p className="font-mono text-4xl font-bold text-gray-900">
            {formatTime(completionTime)}
          </p>
        </div>

        {isAuthenticated ? (
          <div className="mb-6 rounded-md bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">Your rank:</p>
            <p className="text-2xl font-bold text-gray-900">
              {rank !== undefined ? `#${rank}` : "Calculating..."}
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded-md border-2 border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-lg font-semibold text-gray-900">
              {isLoadingRank
                ? "Calculating your rank..."
                : guestRank !== null
                  ? `Nice time! You'd be #${guestRank}! Sign in to claim your rank on the leaderboard.`
                  : "Sign in to claim your rank on the leaderboard!"}
            </p>
            <p className="mb-4 text-xs text-gray-500">
              Without signing in: No leaderboard rank • No streaks • No stats
            </p>
            {showAuthButtons ? (
              <div className="flex flex-col gap-2">
                <AuthButtons />
                <Button onClick={() => setShowAuthButtons(false)} variant="secondary" className="w-full">
                  Back
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button onClick={() => setShowAuthButtons(true)} className="w-full">Sign In</Button>
                <Button onClick={onClose} variant="secondary" className="w-full">
                  Maybe Later
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
