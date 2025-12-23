import * as React from "react";
import { useSearchParams } from "next/navigation";

type UsePuzzleCompletionProps = {
  isCompleted: boolean;
  setShowCompletionModal: (show: boolean) => void;
};

export const usePuzzleCompletion = ({
  isCompleted,
  setShowCompletionModal,
}: UsePuzzleCompletionProps) => {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (!searchParams) return;
    const showCompletion = searchParams.get("showCompletion");
    if (showCompletion === "true" && isCompleted) {
      setShowCompletionModal(true);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/puzzle");
      }
    }
  }, [searchParams, isCompleted, setShowCompletionModal]);
};
