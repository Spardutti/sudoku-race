import * as React from "react";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";
import { validateSolution, submitCompletion } from "@/actions/puzzle";

interface UsePuzzleSubmissionProps {
  puzzleId: string;
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
  handleSubmit: () => Promise<void>;
  setShowCompletionModal: (show: boolean) => void;
}

export function usePuzzleSubmission({
  puzzleId,
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

  const handleSubmit = React.useCallback(async () => {
    if (!isGridComplete || isSubmitting || isCompleted) return;

    setIsSubmitting(true);
    setValidationMessage(null);

    const result = await validateSolution(puzzleId, userEntries);

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

    setTimeout(() => {
      setShowAnimation(false);
      setShowCompletionModal(true);
    }, 1200);

    if (userId) {
      const completionResult = await submitCompletion(puzzleId, userEntries, solvePath);
      if (!completionResult.success) {
        console.error("Failed to submit completion:", completionResult.error);
      } else {
        setServerCompletionTime(completionResult.data.completionTime);
        setServerRank(completionResult.data.rank);
      }
    }

    setIsSubmitting(false);
  }, [isGridComplete, isSubmitting, isCompleted, userEntries, elapsedTime, markCompleted, puzzleId, userId, solvePath]);

  return {
    isSubmitting,
    validationMessage,
    showAnimation,
    showCompletionModal,
    serverCompletionTime,
    serverRank,
    handleSubmit,
    setShowCompletionModal,
  };
}
