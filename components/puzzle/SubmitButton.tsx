import { Button } from "@/components/ui/button";

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
  const getButtonText = () => {
    if (isLoading) return "Checking...";
    if (isCompleted) return "View Results";
    return "Submit";
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
    >
      {getButtonText()}
    </Button>
  );
}
