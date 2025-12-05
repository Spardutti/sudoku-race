import { Button } from "@/components/ui/button";

interface PauseOverlayProps {
  onResume: () => void;
  disabled?: boolean;
}

export function PauseOverlay({ onResume, disabled = false }: PauseOverlayProps) {
  return (
    <div className="absolute inset-0 bg-white z-20 flex items-center justify-center animate-in fade-in duration-200">
      <div className="text-center max-w-md px-4">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Paused</h2>
        <p className="text-gray-600 mb-8">
          The timer is paused. Click Resume to continue.
        </p>
        <Button
          onClick={onResume}
          disabled={disabled}
          size="lg"
          aria-label="Resume puzzle"
        >
          Resume
        </Button>
      </div>
    </div>
  );
}
