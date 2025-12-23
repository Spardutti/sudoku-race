import * as React from "react";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";

type UsePuzzleEventHandlersProps = {
  puzzle: number[][];
  noteMode: boolean;
  lockMode: boolean;
  pencilMarks: Record<string, number[]>;
};

export const usePuzzleEventHandlers = ({
  puzzle,
  noteMode,
  lockMode,
  pencilMarks,
}: UsePuzzleEventHandlersProps) => {
  const userEntries = usePuzzleStore((state) => state.userEntries);
  const updateCell = usePuzzleStore((state) => state.updateCell);
  const setSelectedCell = usePuzzleStore((state) => state.setSelectedCell);
  const trackCellEntry = usePuzzleStore((state) => state.trackCellEntry);
  const addPencilMark = usePuzzleStore((state) => state.addPencilMark);
  const removePencilMark = usePuzzleStore((state) => state.removePencilMark);
  const toggleCellLock = usePuzzleStore((state) => state.toggleCellLock);

  const handleCellSelect = React.useCallback(
    (row: number, col: number) => {
      if (lockMode && userEntries[row][col] !== 0 && puzzle[row][col] === 0) {
        toggleCellLock(row, col);
      } else {
        setSelectedCell({ row, col });
      }
    },
    [lockMode, userEntries, puzzle, toggleCellLock, setSelectedCell]
  );

  const handleNumberChange = React.useCallback(
    (row: number, col: number, value: number) => {
      if (puzzle[row][col] !== 0 && !noteMode) return;

      if (noteMode) {
        if (value === 0) return;
        const key = `${row}-${col}`;
        const marks = pencilMarks[key] || [];
        if (marks.includes(value)) {
          removePencilMark(row, col, value);
        } else {
          addPencilMark(row, col, value);
        }
        return;
      }

      if (value === 0) {
        updateCell(row, col, value);
        return;
      }

      updateCell(row, col, value);
      trackCellEntry(row, col, value);
    },
    [updateCell, trackCellEntry, puzzle, noteMode, pencilMarks, addPencilMark, removePencilMark]
  );

  const isClueCell = React.useCallback(
    (row: number, col: number): boolean => {
      return puzzle[row][col] !== 0;
    },
    [puzzle]
  );

  const isCellFilled = React.useCallback(
    (row: number, col: number): boolean => {
      return userEntries[row][col] !== 0;
    },
    [userEntries]
  );

  return {
    handleCellSelect,
    handleNumberChange,
    isClueCell,
    isCellFilled,
  };
};
