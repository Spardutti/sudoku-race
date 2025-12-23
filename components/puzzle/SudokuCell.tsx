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
  isLocked?: boolean;
}

export const SudokuCell = React.memo<SudokuCellProps>(({
  row,
  col,
  value,
  isClue,
  isSelected,
  onSelect,
  pencilMarks,
  isLocked = false,
}) => {
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
      aria-readonly={isClue}
      data-testid={`sudoku-cell-${row}-${col}`}
      className={cn(
        "w-full aspect-square flex items-center justify-center",
        "text-lg font-sans border border-gray-300",
        "transition-colors duration-100 sm:min-w-11 sm:min-h-11",
        "focus-visible:outline-none",
        "cursor-pointer",
        isClue
          ? "text-neutral bg-gray-100"
          : isLocked
          ? "text-primary bg-blue-50 font-semibold hover:bg-blue-100"
          : "text-primary bg-white hover:bg-gray-50",
        isSelected && isClue && "ring-2 ring-red-600 ring-inset z-10",
        isSelected &&
          !isClue &&
          "ring-2 ring-accent ring-inset bg-blue-50 z-10",
        hasThickRightBorder && "border-r-2 border-r-black",
        hasThickBottomBorder && "border-b-2 border-b-black"
      )}
      onClick={onSelect}
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

SudokuCell.displayName = 'SudokuCell';
