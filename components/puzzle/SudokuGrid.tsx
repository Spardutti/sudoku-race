"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SudokuGridProps {
  puzzle: number[][];
  userEntries: number[][];
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (row: number, col: number) => void;
  onNumberChange: (row: number, col: number, value: number) => void;
}

interface SudokuCellProps {
  row: number;
  col: number;
  value: number;
  isClue: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

const SudokuCell = React.memo<SudokuCellProps>(function SudokuCell({
  row,
  col,
  value,
  isClue,
  isSelected,
  onSelect,
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
        "transition-colors duration-100 min-w-11 min-h-11",
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
      {value !== 0 && <span className="select-none">{value}</span>}
    </button>
  );
});

export const SudokuGrid = React.memo<SudokuGridProps>(function SudokuGrid({
  puzzle,
  userEntries,
  selectedCell,
  onCellSelect,
  onNumberChange,
}) {
  const gridRef = React.useRef<HTMLDivElement>(null);

  const getCellValue = React.useCallback(
    (row: number, col: number): number => {
      return userEntries[row][col] !== 0
        ? userEntries[row][col]
        : puzzle[row][col];
    },
    [puzzle, userEntries]
  );

  const isClueCell = React.useCallback(
    (row: number, col: number): boolean => {
      return puzzle[row][col] !== 0 && userEntries[row][col] === 0;
    },
    [puzzle, userEntries]
  );

  const isSelectedCell = React.useCallback(
    (row: number, col: number): boolean => {
      return selectedCell?.row === row && selectedCell?.col === col;
    },
    [selectedCell]
  );

  const handleCellSelect = React.useCallback(
    (row: number, col: number) => {
      if (!isClueCell(row, col)) {
        onCellSelect(row, col);
      }
    },
    [isClueCell, onCellSelect]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedCell) return;

      const { row, col } = selectedCell;
      let newRow = row;
      let newCol = col;

      switch (e.key) {
        case "ArrowUp":
          newRow = row > 0 ? row - 1 : 8;
          e.preventDefault();
          break;
        case "ArrowDown":
          newRow = row < 8 ? row + 1 : 0;
          e.preventDefault();
          break;
        case "ArrowLeft":
          newCol = col > 0 ? col - 1 : 8;
          e.preventDefault();
          break;
        case "ArrowRight":
          newCol = col < 8 ? col + 1 : 0;
          e.preventDefault();
          break;
        default:
          return;
      }

      onCellSelect(newRow, newCol);
    },
    [selectedCell, onCellSelect]
  );

  const renderCells = React.useMemo(() => {
    const cells: React.ReactNode[] = [];

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        cells.push(
          <SudokuCell
            key={`${row}-${col}`}
            row={row}
            col={col}
            value={getCellValue(row, col)}
            isClue={isClueCell(row, col)}
            isSelected={isSelectedCell(row, col)}
            onSelect={() => handleCellSelect(row, col)}
          />
        );
      }
    }

    return cells;
  }, [getCellValue, isClueCell, isSelectedCell, handleCellSelect]);

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Sudoku puzzle grid"
      className={cn(
        "grid grid-cols-9 grid-rows-9",
        "w-full max-w-[360px] sm:max-w-[540px] mx-auto",
        "border-2 border-black",
        "focus:outline-none"
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {renderCells}
    </div>
  );
});
