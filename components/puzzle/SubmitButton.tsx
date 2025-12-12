'use client';

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface SubmitButtonProps {
  onSubmit: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  isCompleted: boolean;
}

export function SubmitButton({
  onSubmit,
  isDisabled,
  isLoading,
  isCompleted,
}: SubmitButtonProps) {
  const t = useTranslations('puzzle');

  const getButtonText = () => {
    if (isLoading) return t('checkingSubmission');
    if (isCompleted) return "View Results";
    return t('submitButton');
  };

  const getAriaLabel = () => {
    if (isLoading) return "Checking solution...";
    if (isCompleted) return "View completion results";
    return "Submit solution";
  };

  return (
    <Button
      onClick={onSubmit}
      disabled={isDisabled || isLoading}
      className="w-full"
      aria-label={getAriaLabel()}
      data-testid="submit-button"
    >
      {getButtonText()}
    </Button>
  );
}
