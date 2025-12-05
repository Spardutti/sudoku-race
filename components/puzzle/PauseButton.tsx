import { Button } from "@/components/ui/button";
import { Pause } from "lucide-react";

interface PauseButtonProps {
  onPause: () => void;
  disabled?: boolean;
}

export function PauseButton({ onPause, disabled = false }: PauseButtonProps) {
  return (
    <Button
      onClick={onPause}
      disabled={disabled}
      variant="ghost"
      size="sm"
      aria-label="Pause puzzle"
      className="gap-2"
    >
      <Pause className="h-4 w-4" />
      Pause
    </Button>
  );
}
