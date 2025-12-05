"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SudokuCell } from "./SudokuCell";

export interface SudokuGridProps {
  puzzle: number[][];
  userEntries: number[][];
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (row: number, col: number) => void;
  onNumberChange: (row: number, col: number, value: number) => void;
  pencilMarks?: Record<string, number[]>;
  isBlurred?: boolean;
}

export const SudokuGrid = React.memo<SudokuGridProps>(function SudokuGrid({
  puzzle,
  userEntries,
  selectedCell,
  onCellSelect,
  pencilMarks = {},
  isBlurred = false,
}) {
  const gridRef = React.useRef<HTMLDivElement>(null);

  const getCellValue = React.useCallback(
    (row: number, col: number): number => {
      if (row < 0 || row >= 9 || col < 0 || col >= 9) {
        return 0;
      }

      if (!Array.isArray(userEntries) || !Array.isArray(puzzle)) {
        return 0;
      }

      if (!userEntries[row] || !puzzle[row]) {
        return 0;
      }

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
      onCellSelect(row, col);
    },
    [onCellSelect]
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
        const key = `${row}-${col}`;
        cells.push(
          <SudokuCell
            key={key}
            row={row}
            col={col}
            value={getCellValue(row, col)}
            isClue={isClueCell(row, col)}
            isSelected={isSelectedCell(row, col)}
            onSelect={() => handleCellSelect(row, col)}
            pencilMarks={pencilMarks[key]}
          />
        );
      }
    }

    return cells;
  }, [getCellValue, isClueCell, isSelectedCell, handleCellSelect, pencilMarks]);

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Sudoku puzzle grid"
      className={cn(
        "grid grid-cols-9 grid-rows-9",
        "w-full max-w-[360px] sm:max-w-[540px] mx-auto box-border",
        "border-2 border-black",
        "focus:outline-none",
        "transition-all duration-200",
        isBlurred && "blur-lg pointer-events-none"
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {renderCells}
    </div>
  );
});
