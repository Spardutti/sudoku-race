import { classifyCell } from "../cell-classifier";
import type { SolvePath } from "@/lib/types/solve-path";

describe("classifyCell", () => {
  const createEmptyGrid = (): number[][] => {
    return Array(9)
      .fill(null)
      .map(() => Array(9).fill(0));
  };

  const createPuzzle = (): number[][] => {
    const puzzle = createEmptyGrid();
    puzzle[0][0] = 5;
    puzzle[1][1] = 3;
    return puzzle;
  };

  test("classifies pre-filled cell as clue", () => {
    const puzzle = createPuzzle();
    const solvePath: SolvePath = [];

    const result = classifyCell(0, 0, puzzle, solvePath);

    expect(result).toBe("clue");
  });

  test("returns null for unfilled cell", () => {
    const puzzle = createEmptyGrid();
    const solvePath: SolvePath = [];

    const result = classifyCell(0, 0, puzzle, solvePath);

    expect(result).toBe(null);
  });

  test("classifies single entry as first-fill", () => {
    const puzzle = createEmptyGrid();
    const solvePath: SolvePath = [
      {
        row: 2,
        col: 3,
        value: 7,
        timestamp: Date.now(),
        isCorrection: false,
      },
    ];

    const result = classifyCell(2, 3, puzzle, solvePath);

    expect(result).toBe("first-fill");
  });

  test("classifies multiple entries as corrected", () => {
    const puzzle = createEmptyGrid();
    const now = Date.now();
    const solvePath: SolvePath = [
      {
        row: 4,
        col: 5,
        value: 2,
        timestamp: now,
        isCorrection: false,
      },
      {
        row: 4,
        col: 5,
        value: 8,
        timestamp: now + 1000,
        isCorrection: true,
      },
    ];

    const result = classifyCell(4, 5, puzzle, solvePath);

    expect(result).toBe("corrected");
  });

  test("handles multiple corrections", () => {
    const puzzle = createEmptyGrid();
    const now = Date.now();
    const solvePath: SolvePath = [
      {
        row: 7,
        col: 8,
        value: 1,
        timestamp: now,
        isCorrection: false,
      },
      {
        row: 7,
        col: 8,
        value: 3,
        timestamp: now + 500,
        isCorrection: true,
      },
      {
        row: 7,
        col: 8,
        value: 9,
        timestamp: now + 1500,
        isCorrection: true,
      },
    ];

    const result = classifyCell(7, 8, puzzle, solvePath);

    expect(result).toBe("corrected");
  });

  test("ignores entries from other cells", () => {
    const puzzle = createEmptyGrid();
    const solvePath: SolvePath = [
      {
        row: 1,
        col: 1,
        value: 5,
        timestamp: Date.now(),
        isCorrection: false,
      },
      {
        row: 2,
        col: 2,
        value: 6,
        timestamp: Date.now(),
        isCorrection: false,
      },
    ];

    const result = classifyCell(3, 3, puzzle, solvePath);

    expect(result).toBe(null);
  });
});
