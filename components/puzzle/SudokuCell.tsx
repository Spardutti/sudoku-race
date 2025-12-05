"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SudokuCellProps {
  row: number;
  col: number;
  value: number;
  isClue: boolean;
  isSelected: boolean;
  onSelect: () => void;
  pencilMarks?: number[];
}

export const SudokuCell = React.memo<SudokuCellProps>(function SudokuCell({
  row,
  col,
  value,
  isClue,
  isSelected,
  onSelect,
  pencilMarks,
}) {
  const ariaLabel = React.useMemo(() => {
    const position = `Row ${row + 1}, Column ${col + 1}`;
    const valueText =
      value === 0 ? "Empty" : isClue ? `Clue ${value}` : `Value ${value}`;
    return `${position}, ${valueText}`;
  }, [row, col, value, isClue]);

  const hasThickRightBorder = (col + 1) % 3 === 0 && col !== 8;
  const hasThickBottomBorder = (row + 1) % 3 === 0 && row !== 8;

  return (
    <button
      type="button"
      role="gridcell"
      aria-label={ariaLabel}
      className={cn(
        "w-full aspect-square flex items-center justify-center",
        "text-lg font-sans border border-gray-300",
        "transition-colors duration-100 sm:min-w-11 sm:min-h-11",
        isClue
          ? "text-neutral bg-white cursor-default"
          : "text-primary bg-white cursor-pointer hover:bg-gray-50",
        isSelected &&
          !isClue &&
          "ring-2 ring-accent ring-inset bg-blue-50 z-10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset focus-visible:z-10",
        hasThickRightBorder && "border-r-2 border-r-black",
        hasThickBottomBorder && "border-b-2 border-b-black"
      )}
      onClick={() => !isClue && onSelect()}
      disabled={isClue}
      tabIndex={-1}
    >
      {value !== 0 ? (
        <span className="select-none">{value}</span>
      ) : pencilMarks && pencilMarks.length > 0 ? (
        <div className="grid grid-cols-3 gap-0.5 w-full h-full p-0.5 text-[0.5rem] text-gray-400">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div
              key={num}
              className="flex items-center justify-center"
            >
              {pencilMarks.includes(num) ? num : ""}
            </div>
          ))}
        </div>
      ) : null}
    </button>
  );
});
