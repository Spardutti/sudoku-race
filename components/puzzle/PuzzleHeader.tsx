'use client';

import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { NoteModeToggle } from "./NoteModeToggle";
import { useTranslations, useLocale } from "next-intl";

type PuzzleHeaderProps = {
  puzzleDate: string;
  puzzleNumber?: number;
  noteMode?: boolean;
  onToggleNoteMode?: () => void;
};

export function PuzzleHeader({ puzzleDate, puzzleNumber, noteMode = false, onToggleNoteMode }: PuzzleHeaderProps) {
  const t = useTranslations('puzzle');
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;
  const formattedDate = format(new Date(puzzleDate), "MMMM d, yyyy", { locale: dateLocale });

  return (
    <header className="text-center space-y-2">
      <div className="flex items-center justify-center gap-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-black">
          {t('title')}
        </h1>
        {onToggleNoteMode && (
          <NoteModeToggle noteMode={noteMode} onToggle={onToggleNoteMode} />
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-600">
        <time dateTime={puzzleDate} className="text-sm md:text-base capitalize">
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
