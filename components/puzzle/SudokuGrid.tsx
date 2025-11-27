/**
 * SudokuGrid Component - Mobile-Optimized 9x9 Grid
 *
 * Interactive Sudoku grid with cell selection, keyboard navigation,
 * and accessibility features. Designed mobile-first with newspaper aesthetic.
 *
 * @example
 * ```tsx
 * const [userEntries, setUserEntries] = useState<number[][]>(emptyGrid)
 * const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
 *
 * <SudokuGrid
 *   puzzle={puzzleData}
 *   userEntries={userEntries}
 *   selectedCell={selectedCell}
 *   onCellSelect={(row, col) => setSelectedCell({ row, col })}
 *   onNumberChange={(row, col, value) => {
 *     const newEntries = userEntries.map(r => [...r])
 *     newEntries[row][col] = value
 *     setUserEntries(newEntries)
 *   }}
 * />
 * ```
 *
 * @see docs/tech-spec-epic-2.md (Section 2.3 - SudokuGrid Component)
 * @see docs/architecture.md (Frontend Layer, Component Structure)
 * @see docs/stories/2-2-sudoku-grid-ui-component-mobile-optimized.md
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props for SudokuGrid component
 * Follows controlled component pattern for state management
 */
export interface SudokuGridProps {
  /** Initial puzzle data (0 = empty, 1-9 = clue number) */
  puzzle: number[][];
  /** User-filled numbers (0 = empty, 1-9 = user entry) */
  userEntries: number[][];
  /** Currently selected cell position (null = no selection) */
  selectedCell: { row: number; col: number } | null;
  /** Callback when user selects a cell */
  onCellSelect: (row: number, col: number) => void;
  /** Callback when user changes a cell value */
  onNumberChange: (row: number, col: number, value: number) => void;
}

/**
 * Props for individual SudokuCell component
 */
interface SudokuCellProps {
  row: number;
  col: number;
  value: number;
  isClue: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Individual cell component with conditional styling
 * Handles clue vs user entry distinction and selection state
 */
const SudokuCell = React.memo<SudokuCellProps>(function SudokuCell({
  row,
  col,
  value,
  isClue,
  isSelected,
  onSelect,
}) {
  /**
   * Generate accessible ARIA label for screen readers
   * Format: "Row X, Column Y, [Clue Z | Value Z | Empty]"
   */
  const ariaLabel = React.useMemo(() => {
    const position = `Row ${row + 1}, Column ${col + 1}`;
    const valueText =
      value === 0 ? "Empty" : isClue ? `Clue ${value}` : `Value ${value}`;
    return `${position}, ${valueText}`;
  }, [row, col, value, isClue]);

  /**
   * Determine if cell should have thicker border for 3x3 subgrid
   * Right border: every 3rd column (except last column)
   * Bottom border: every 3rd row (except last row)
   */
  const hasThickRightBorder = (col + 1) % 3 === 0 && col !== 8;
  const hasThickBottomBorder = (row + 1) % 3 === 0 && row !== 8;

  return (
    <button
      type="button"
      role="gridcell"
      aria-label={ariaLabel}
      className={cn(
        // Base cell styling
        "w-full aspect-square flex items-center justify-center",
        "text-lg font-sans border border-gray-300",
        "transition-colors duration-100",
        // Tap target sizing (min 44x44px for WCAG AA)
        "min-w-11 min-h-11",
        // Clue vs user entry styling
        isClue
          ? "text-neutral bg-white cursor-default"
          : "text-primary bg-white cursor-pointer hover:bg-gray-50",
        // Selection highlight
        isSelected &&
          !isClue &&
          "ring-2 ring-accent ring-inset bg-blue-50 z-10",
        // Focus indicators for keyboard navigation
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset focus-visible:z-10",
        // 3x3 subgrid borders (thicker)
        hasThickRightBorder && "border-r-2 border-r-black",
        hasThickBottomBorder && "border-b-2 border-b-black"
      )}
      onClick={() => !isClue && onSelect()}
      disabled={isClue}
      tabIndex={-1} // Grid container handles tab navigation
    >
      {value !== 0 && <span className="select-none">{value}</span>}
    </button>
  );
});

/**
 * SudokuGrid Component
 *
 * Renders a 9x9 interactive Sudoku grid with:
 * - Visual distinction between clues and user entries
 * - Cell selection via tap/click
 * - Keyboard navigation (arrow keys)
 * - Accessibility (ARIA labels, screen reader support)
 * - Mobile-first responsive design
 * - Newspaper aesthetic styling
 */
export const SudokuGrid = React.memo<SudokuGridProps>(function SudokuGrid({
  puzzle,
  userEntries,
  selectedCell,
  onCellSelect,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onNumberChange, // Used by Story 2.3 NumberPad component
}) {
  const gridRef = React.useRef<HTMLDivElement>(null);

  /**
   * Get the displayed value for a cell
   * Priority: user entry > puzzle clue > empty (0)
   */
  const getCellValue = React.useCallback(
    (row: number, col: number): number => {
      return userEntries[row][col] !== 0
        ? userEntries[row][col]
        : puzzle[row][col];
    },
    [puzzle, userEntries]
  );

  /**
   * Check if a cell is a puzzle clue (read-only)
   * A cell is a clue if it has a value in the original puzzle AND user hasn't overridden it
   */
  const isClueCell = React.useCallback(
    (row: number, col: number): boolean => {
      return puzzle[row][col] !== 0 && userEntries[row][col] === 0;
    },
    [puzzle, userEntries]
  );

  /**
   * Check if a cell is currently selected
   */
  const isSelectedCell = React.useCallback(
    (row: number, col: number): boolean => {
      return selectedCell?.row === row && selectedCell?.col === col;
    },
    [selectedCell]
  );

  /**
   * Handle cell selection
   * Only non-clue cells can be selected
   */
  const handleCellSelect = React.useCallback(
    (row: number, col: number) => {
      if (!isClueCell(row, col)) {
        onCellSelect(row, col);
      }
    },
    [isClueCell, onCellSelect]
  );

  /**
   * Handle keyboard navigation with arrow keys
   * Supports wrapping at grid edges for better UX
   */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedCell) return;

      const { row, col } = selectedCell;
      let newRow = row;
      let newCol = col;

      switch (e.key) {
        case "ArrowUp":
          newRow = row > 0 ? row - 1 : 8; // Wrap to bottom
          e.preventDefault();
          break;
        case "ArrowDown":
          newRow = row < 8 ? row + 1 : 0; // Wrap to top
          e.preventDefault();
          break;
        case "ArrowLeft":
          newCol = col > 0 ? col - 1 : 8; // Wrap to right
          e.preventDefault();
          break;
        case "ArrowRight":
          newCol = col < 8 ? col + 1 : 0; // Wrap to left
          e.preventDefault();
          break;
        default:
          return;
      }

      // Move to new position
      onCellSelect(newRow, newCol);
    },
    [selectedCell, onCellSelect]
  );

  /**
   * Render all 81 cells in 9x9 grid
   */
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
  }, [  getCellValue, isClueCell, isSelectedCell, handleCellSelect]);

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Sudoku puzzle grid"
      className={cn(
        // Grid layout: 9x9 with CSS Grid
        "grid grid-cols-9 grid-rows-9",
        // Responsive sizing
        "w-full max-w-[360px] sm:max-w-[540px] mx-auto",
        // Outer border (newspaper aesthetic)
        "border-2 border-black",
        // Focus management for keyboard navigation
        "focus:outline-none"
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {renderCells}
    </div>
  );
});
