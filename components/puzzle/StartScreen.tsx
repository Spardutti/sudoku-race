import { Button } from "@/components/ui/button";

interface StartScreenProps {
  puzzleNumber: number;
  onStart: () => void;
}

export function StartScreen({ puzzleNumber, onStart }: StartScreenProps) {
  return (
    <div className="absolute inset-0 bg-white z-20 flex items-center justify-center animate-in fade-in duration-200">
      <div className="text-center max-w-md px-4">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          Daily Sudoku #{puzzleNumber}
        </h2>
        <p className="text-gray-600 mb-8">
          Press Start when you&apos;re ready to begin. The timer will start immediately.
        </p>
        <Button
          onClick={onStart}
          size="lg"
          aria-label="Start puzzle timer"
        >
          Start Puzzle
        </Button>
      </div>
    </div>
  );
}
