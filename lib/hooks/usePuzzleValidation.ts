import * as React from "react";

type UsePuzzleValidationProps = {
  userEntries: number[][];
  puzzle: number[][];
  lockedCells: Record<string, boolean>;
};

export const usePuzzleValidation = ({ userEntries, puzzle, lockedCells }: UsePuzzleValidationProps) => {
  const hasUnlockedCells = React.useMemo(() => {
    return userEntries.some((row, r) =>
      row.some((val, c) => {
        const key = `${r}-${c}`;
        const isClue = puzzle[r][c] !== 0;
        const isLocked = lockedCells[key];
        return !isClue && !isLocked && val !== 0;
      })
    );
  }, [userEntries, puzzle, lockedCells]);

  const isGridComplete = React.useMemo(() => {
    return userEntries.every((row, rowIndex) =>
      row.every((cell, colIndex) => {
        const isClue = puzzle[rowIndex][colIndex] !== 0;
        return isClue || cell !== 0;
      })
    );
  }, [userEntries, puzzle]);

  return { hasUnlockedCells, isGridComplete };
};
