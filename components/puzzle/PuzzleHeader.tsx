'use client';

import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { NoteModeToggle } from "@/components/puzzle/NoteModeToggle";
import { LockToggle } from "@/components/puzzle/LockToggle";
import { ResetButton } from "@/components/puzzle/ResetButton";
import { useTranslations, useLocale } from "next-intl";

type PuzzleHeaderProps = {
  puzzleDate: string;
  puzzleNumber?: number;
  noteMode?: boolean;
  onToggleNoteModeAction?: () => void;
  lockMode?: boolean;
  onToggleLockModeAction?: () => void;
  onResetUnlockedAction?: () => void;
  hasUnlockedCells?: boolean;
};

export const PuzzleHeader = ({
  puzzleDate,
  puzzleNumber,
  noteMode = false,
  onToggleNoteModeAction,
  lockMode = false,
  onToggleLockModeAction,
  onResetUnlockedAction,
  hasUnlockedCells = false,
}: PuzzleHeaderProps) => {
  const t = useTranslations('puzzle');
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;
  const [year, month, day] = puzzleDate.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  const formattedDate = format(localDate, "MMMM d, yyyy", { locale: dateLocale });

  return (
    <header className="text-center md:space-y-2 mb-0">
      <div className="flex items-center justify-center gap-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-black">
          {t('title')}
        </h1>
        <div className="flex items-center gap-2">
          {onToggleNoteModeAction && (
            <NoteModeToggle noteMode={noteMode} onToggle={onToggleNoteModeAction} />
          )}
          {onToggleLockModeAction && (
            <LockToggle lockMode={lockMode} onToggle={onToggleLockModeAction} />
          )}
          {onResetUnlockedAction && (
            <ResetButton onReset={onResetUnlockedAction} hasUnlockedCells={hasUnlockedCells} />
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 text-gray-600">
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
