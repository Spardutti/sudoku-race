"use client";

import { useEffect } from "react";

 
export interface UseKeyboardInputProps {
  selectedCell: { row: number; col: number } | null;
  onNumberChange: (row: number, col: number, value: number) => void;
  isClueCell: (row: number, col: number) => boolean;
  noteMode?: boolean;
  onToggleNoteMode?: () => void;
}

export function useKeyboardInput({
  selectedCell,
  onNumberChange,
  isClueCell,
  noteMode = false,
  onToggleNoteMode,
}: UseKeyboardInputProps): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        onToggleNoteMode?.();
        return;
      }

      if (!selectedCell) return;

      const { row, col } = selectedCell;

      if (isClueCell(row, col) && !noteMode) return;

      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        onNumberChange(row, col, parseInt(e.key, 10));
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        onNumberChange(row, col, 0);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCell, onNumberChange, isClueCell, noteMode, onToggleNoteMode]);
}
