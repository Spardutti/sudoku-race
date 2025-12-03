import * as React from "react";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { validateSolution, submitCompletion } from "@/actions/puzzle";
import { toast } from "sonner";
import type { StreakData } from "@/lib/types/streak";

function mergeGrids(puzzle: number[][], userEntries: number[][]): number[][] {
  return puzzle.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      // If puzzle has a clue (non-zero), use it; otherwise use user entry
      return cell !== 0 ? cell : userEntries[rowIndex][colIndex];
    })
  );
}

interface UsePuzzleSubmissionProps {
  puzzleId: string;
  puzzle: number[][];
  userEntries: number[][];
  isGridComplete: boolean;
  elapsedTime: number;
  userId: string | null;
}

interface UsePuzzleSubmissionReturn {
  isSubmitting: boolean;
  validationMessage: string | null;
  showAnimation: boolean;
  showCompletionModal: boolean;
  serverCompletionTime: number | null;
  serverRank: number | undefined;
  streakData: StreakData | undefined;
  handleSubmit: () => Promise<void>;
  setShowCompletionModal: (show: boolean) => void;
}

export function usePuzzleSubmission({
  puzzleId,
  puzzle,
  userEntries,
  isGridComplete,
  elapsedTime,
  userId,
}: UsePuzzleSubmissionProps): UsePuzzleSubmissionReturn {
  const isCompleted = usePuzzleStore((state) => state.isCompleted);
  const markCompleted = usePuzzleStore((state) => state.markCompleted);
  const solvePath = usePuzzleStore((state) => state.solvePath);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationMessage, setValidationMessage] = React.useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  const [showAnimation, setShowAnimation] = React.useState(false);
  const [serverCompletionTime, setServerCompletionTime] = React.useState<number | null>(null);
  const [serverRank, setServerRank] = React.useState<number | undefined>(undefined);
  const [streakData, setStreakData] = React.useState<StreakData | undefined>(undefined);

  const handleSubmit = React.useCallback(async () => {
    if (!isGridComplete || isSubmitting) return;

    if (isCompleted) {
      setShowCompletionModal(true);
      return;
    }

    setIsSubmitting(true);
    setValidationMessage(null);

    const completeGrid = mergeGrids(puzzle, userEntries);
    const result = await validateSolution(puzzleId, completeGrid);

    if (!result.success) {
      setValidationMessage(result.error);
      setIsSubmitting(false);
      setTimeout(() => setValidationMessage(null), 4000);
      return;
    }

    if (!result.data.isValid) {
      setValidationMessage("Not quite right. Keep trying!");
      setIsSubmitting(false);
      setTimeout(() => {
        setValidationMessage(null);
      }, 4000);
      return;
    }

    markCompleted(elapsedTime);
    setShowAnimation(true);

    if (userId) {
      const completionResult = await submitCompletion(puzzleId, completeGrid, solvePath);
      if (!completionResult.success) {
        console.error("Failed to submit completion:", completionResult.error);
      } else {
        setServerCompletionTime(completionResult.data.completionTime);
        setServerRank(completionResult.data.rank);
        setStreakData(completionResult.data.streakData);

        if (completionResult.data.streakData?.freezeWasUsed) {
          toast.success("Streak Freeze Used!", {
            description: "You missed a day, but your streak is protected! 🛡️",
            duration: 4000,
          });
        }

        if (completionResult.data.streakData?.streakWasReset) {
          toast.info("Streak Reset", {
            description: "Your streak was reset, but today starts a new one! Keep going! 💪",
            duration: 4000,
          });
        }
      }
    }

    setTimeout(() => {
      setShowAnimation(false);
      setShowCompletionModal(true);
      setIsSubmitting(false);
    }, 1200);
  }, [isGridComplete, isSubmitting, isCompleted, puzzle, userEntries, elapsedTime, markCompleted, puzzleId, userId, solvePath]);

  return {
    isSubmitting,
    validationMessage,
    showAnimation,
    showCompletionModal,
    serverCompletionTime,
    serverRank,
    streakData,
    handleSubmit,
    setShowCompletionModal,
  };
}
