import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  onSubmit: () => void;
  isDisabled: boolean;
  isLoading: boolean;
}

export function SubmitButton({
  onSubmit,
  isDisabled,
  isLoading,
}: SubmitButtonProps) {
  return (
    <Button
      onClick={onSubmit}
      disabled={isDisabled || isLoading}
      className="w-full"
      aria-label={isLoading ? "Checking solution..." : "Submit solution"}
    >
      {isLoading ? "Checking..." : "Submit"}
    </Button>
  );
}
