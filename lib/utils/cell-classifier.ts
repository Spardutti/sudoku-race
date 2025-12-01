import type { SolvePath } from "@/lib/types/solve-path";

export type CellClassification = "clue" | "first-fill" | "corrected" | null;

export function classifyCell(
  row: number,
  col: number,
  puzzle: number[][],
  solvePath: SolvePath
): CellClassification {
  if (puzzle[row][col] !== 0) {
    return "clue";
  }

  const entries = solvePath.filter((e) => e.row === row && e.col === col);

  if (entries.length === 0) {
    return null;
  }

  if (entries.length === 1) {
    return "first-fill";
  }

  return "corrected";
}
