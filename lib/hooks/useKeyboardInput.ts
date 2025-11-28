"use client";

import { useEffect } from "react";

 
export interface UseKeyboardInputProps {
  selectedCell: { row: number; col: number } | null;
  onNumberChange: (row: number, col: number, value: number) => void;
  isClueCell: (row: number, col: number) => boolean;
}

export function useKeyboardInput({
  selectedCell,
  onNumberChange,
  isClueCell,
}: UseKeyboardInputProps): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (!selectedCell) return;

      const { row, col } = selectedCell;

      // Check if selected cell is a clue (read-only)
      if (isClueCell(row, col)) return;

      // Number keys 1-9
      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        onNumberChange(row, col, parseInt(e.key, 10));
        return;
      }

      // Backspace, Delete, or 0 to clear
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        onNumberChange(row, col, 0);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCell, onNumberChange, isClueCell]);
}
