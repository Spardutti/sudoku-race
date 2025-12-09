"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface NumberPadProps {
  onNumberChange: (value: number) => void;
  selectedCell: { row: number; col: number } | null;
  isClueCell: boolean;
}

export const NumberPad = React.memo<NumberPadProps>(function NumberPad({
  onNumberChange,
  selectedCell,
  isClueCell,
}) {
  const t = useTranslations('puzzle');

  const handleNumberClick = React.useCallback(
    (value: number) => {
      if (!selectedCell) return;
      onNumberChange(value);
    },
    [selectedCell, onNumberChange]
  );

  const handleClear = React.useCallback(() => {
    if (!selectedCell || isClueCell) return;
    onNumberChange(0);
  }, [selectedCell, isClueCell, onNumberChange]);

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div
      className={cn(
        "sticky bottom-0 z-50 mt-auto",
        "bg-white border-t-2 border-black",
        "px-4 py-3.5 pb-safe",
        "lg:hidden",
        "portrait:py-3.5 landscape:py-1.5 landscape:px-2"
      )}
      role="group"
      aria-label="Number input pad"
    >
      <div className="max-w-md mx-auto space-y-2">
        {/* Number buttons 1-9 in 3x3 grid */}
        <div className="grid grid-cols-3 gap-1.5 landscape:gap-1">
          {numbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num)}
              disabled={!selectedCell}
              aria-label={`Number ${num}`}
              className={cn(
                "min-w-11 min-h-11 h-10",
                "landscape:min-h-10 landscape:h-8",
                "flex items-center justify-center",
                "text-base font-sans font-medium",
                "bg-white border-2 border-black",
                "transition-colors duration-100",
                "touch-manipulation",
                selectedCell
                  ? "text-black hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              )}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Clear button */}
        <button
          type="button"
          onClick={handleClear}
          disabled={!selectedCell || isClueCell}
          aria-label="Clear selected cell"
          className={cn(
            "w-full min-h-11 h-9",
            "landscape:min-h-10 landscape:h-8",
            "flex items-center justify-center",
            "text-base font-sans font-medium",
            "bg-white border-2 border-black",
            "transition-colors duration-100",
            "touch-manipulation",
            selectedCell && !isClueCell
              ? "text-black hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
              : "text-gray-400 cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          )}
        >
          {t('clear')}
        </button>
      </div>
    </div>
  );
});
