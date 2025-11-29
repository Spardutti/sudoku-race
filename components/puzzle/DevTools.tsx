"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { devSubmitCompletion } from "@/actions/dev-tools";

type DevToolsProps = {
  puzzleId: string;
  solution?: number[][];
};

export function DevTools({ puzzleId, solution }: DevToolsProps) {
  const [username, setUsername] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const updateCell = usePuzzleStore((state) => state.updateCell);
  const markCompleted = usePuzzleStore((state) => state.markCompleted);

  // Only show in development and if solution is available
  if (process.env.NODE_ENV === "production" || !solution) {
    return null;
  }

  const handleCompleteAndSubmit = async () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    if (!solution) {
      alert("Solution not available");
      return;
    }

    setIsSubmitting(true);

    // Fill grid with solution
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        updateCell(row, col, solution[row][col]);
      }
    }

    // Generate random time between 20-300 seconds
    const randomTime = Math.floor(Math.random() * (300 - 20 + 1)) + 20;
    markCompleted(randomTime);

    // Submit to leaderboard with fake user
    try {
      const result = await devSubmitCompletion(puzzleId, username, randomTime);

      if (result.success) {
        const timeFormatted = `${Math.floor(randomTime / 60)}:${(randomTime % 60).toString().padStart(2, '0')}`;
        console.log(`✅ Submitted as "${username}" - Time: ${timeFormatted} - Rank: #${result.data.rank}`);
        alert(`Submitted!\nUser: ${username}\nTime: ${timeFormatted}\nRank: #${result.data.rank}`);
      } else {
        console.error("Submission failed:", result.error);
        alert(`Failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to submit. Check console.");
    }

    setIsSubmitting(false);
  };

  const handleGenerateNew = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-xs mx-auto mt-8 p-4 border-2 border-yellow-400 bg-yellow-50 rounded-md space-y-4">
      <div className="text-xs font-bold text-yellow-800 text-center">
        DEV TOOLS (Local Only)
      </div>

      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Test username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          ariaLabel="Test username for leaderboard submission"
          className="text-sm"
        />

        <Button
          onClick={handleCompleteAndSubmit}
          disabled={isSubmitting || !username.trim()}
          className="w-full"
          size="sm"
        >
          {isSubmitting ? "Submitting..." : "Complete & Submit"}
        </Button>

        <Button
          onClick={handleGenerateNew}
          variant="secondary"
          className="w-full"
          size="sm"
        >
          Generate New Puzzle
        </Button>
      </div>
    </div>
  );
}
