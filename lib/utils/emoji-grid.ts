// Emoji Grid Generation for Sudoku Race
// Converts solve path → 9×9 emoji grid for Wordle-style sharing
// ⬜ = pre-filled clue, 🟩 = first-fill (correct), 🟨 = corrected cell

import { classifyCell } from "./cell-classifier";
import type { CellClassification } from "./cell-classifier";
import type { SolvePath } from "@/lib/types/solve-path";

export function cellTypeToEmoji(cellType: CellClassification): string {
  switch (cellType) {
    case "clue":
      return "⬜";
    case "first-fill":
      return "🟩";
    case "corrected":
      return "🟨";
    case null:
      return "🟩";
  }
}

export function generateEmojiGrid(
  puzzle: number[][],
  solvePath: SolvePath
): string {
  if (
    !puzzle ||
    puzzle.length !== 9 ||
    puzzle.some((row) => row.length !== 9)
  ) {
    const error = new Error("Invalid puzzle structure: must be 9x9 array");
    console.error("[emoji-grid] Validation failed:", { puzzle });
    throw error;
  }

  if (!Array.isArray(solvePath)) {
    const error = new TypeError("Invalid solvePath: must be array");
    console.error("[emoji-grid] Validation failed:", { solvePath });
    throw error;
  }

  const grid: string[][] = Array(9)
    .fill(null)
    .map(() => Array(9).fill(""));

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cellType = classifyCell(row, col, puzzle, solvePath);
      grid[row][col] = cellTypeToEmoji(cellType);
    }
  }

  return grid.map((row) => row.join("")).join("\n");
}
