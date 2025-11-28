"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CompletionModalProps {
  isOpen: boolean;
  completionTime: number;
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
  rank,
  isAuthenticated,
  onClose,
}: CompletionModalProps) {
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

        {isAuthenticated && rank !== undefined ? (
          <div className="mb-6 rounded-md bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">Your rank:</p>
            <p className="text-2xl font-bold text-gray-900">#{rank}</p>
          </div>
        ) : (
          <div className="mb-6 rounded-md border-2 border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 font-semibold text-gray-900">
              Sign in to save your time!
            </p>
            <p className="mb-4 text-sm text-gray-600">
              {rank !== undefined
                ? `You'd be ranked #${rank}! Create an account to claim your spot.`
                : "Join the leaderboard and track your progress."}
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full">Sign in with Google</Button>
              <Button className="w-full">Sign in with GitHub</Button>
              <Button className="w-full">Sign in with Apple</Button>
            </div>
          </div>
        )}

        <Button onClick={onClose} variant="secondary" className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
