import { format } from "date-fns";
import { NoteModeToggle } from "./NoteModeToggle";

type PuzzleHeaderProps = {
  puzzleDate: string;
  puzzleNumber?: number;
  noteMode?: boolean;
  onToggleNoteMode?: () => void;
};

export function PuzzleHeader({ puzzleDate, puzzleNumber, noteMode = false, onToggleNoteMode }: PuzzleHeaderProps) {
  const formattedDate = format(new Date(puzzleDate), "MMMM d, yyyy");

  return (
    <header className="text-center space-y-2">
      <div className="flex items-center justify-center gap-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-black">
          Today&apos;s Puzzle
        </h1>
        {onToggleNoteMode && (
          <NoteModeToggle noteMode={noteMode} onToggle={onToggleNoteMode} />
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-600">
        <time dateTime={puzzleDate} className="text-sm md:text-base">
          {formattedDate}
        </time>
        {puzzleNumber && (
          <>
            <span className="hidden sm:inline">•</span>
            <span className="text-sm md:text-base">#{puzzleNumber}</span>
          </>
        )}
      </div>
    </header>
  );
}
