import { generateEmojiGrid, cellTypeToEmoji } from "../emoji-grid";
import type { SolvePath } from "@/lib/types/solve-path";

describe("cellTypeToEmoji", () => {
  test("converts clue to white square", () => {
    expect(cellTypeToEmoji("clue")).toBe("⬜");
  });

  test("converts first-fill to green square", () => {
    expect(cellTypeToEmoji("first-fill")).toBe("🟩");
  });

  test("converts corrected to yellow square", () => {
    expect(cellTypeToEmoji("corrected")).toBe("🟨");
  });

  test("converts null to green square (fallback)", () => {
    expect(cellTypeToEmoji(null)).toBe("🟩");
  });
});

describe("generateEmojiGrid", () => {
  const createEmptyGrid = (): number[][] => {
    return Array(9)
      .fill(null)
      .map(() => Array(9).fill(0));
  };

  const createPuzzleWithClues = (): number[][] => {
    const puzzle = createEmptyGrid();
    puzzle[0][0] = 5;
    puzzle[0][1] = 3;
    puzzle[0][2] = 7;
    puzzle[1][0] = 6;
    puzzle[2][0] = 4;
    return puzzle;
  };

  describe("Standard Cases", () => {
    test("perfect solve (no corrections) generates all green/white", () => {
      const puzzle = createPuzzleWithClues();
      const solvePath: SolvePath = [
        {
          row: 0,
          col: 3,
          value: 1,
          timestamp: Date.now(),
          isCorrection: false,
        },
        {
          row: 0,
          col: 4,
          value: 2,
          timestamp: Date.now(),
          isCorrection: false,
        },
      ];

      const result = generateEmojiGrid(puzzle, solvePath);
      const lines = result.split("\n");

      expect(lines[0]).toMatch(/[⬜🟩]/);
      expect(lines[0]).not.toContain("🟨");
      expect(result).toContain("⬜");
      expect(result).toContain("🟩");
    });

    test("mixed corrections shows correct green/yellow/white distribution", () => {
      const puzzle = createPuzzleWithClues();
      const now = Date.now();
      const solvePath: SolvePath = [
        {
          row: 0,
          col: 3,
          value: 1,
          timestamp: now,
          isCorrection: false,
        },
        {
          row: 0,
          col: 4,
          value: 2,
          timestamp: now + 100,
          isCorrection: false,
        },
        {
          row: 0,
          col: 4,
          value: 8,
          timestamp: now + 200,
          isCorrection: true,
        },
      ];

      const result = generateEmojiGrid(puzzle, solvePath);

      expect(result).toContain("⬜");
      expect(result).toContain("🟩");
      expect(result).toContain("🟨");
    });

    test("heavy corrections shows many yellow squares", () => {
      const puzzle = createEmptyGrid();
      const now = Date.now();
      const solvePath: SolvePath = [];

      for (let i = 0; i < 20; i++) {
        solvePath.push({
          row: 0,
          col: 0,
          value: (i % 9) + 1,
          timestamp: now + i * 100,
          isCorrection: i > 0,
        });
        solvePath.push({
          row: 1,
          col: 1,
          value: (i % 9) + 1,
          timestamp: now + i * 100,
          isCorrection: i > 0,
        });
      }

      const result = generateEmojiGrid(puzzle, solvePath);
      const yellowCount = (result.match(/🟨/g) || []).length;

      expect(yellowCount).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    test("empty solve path defaults to all green", () => {
      const puzzle = createEmptyGrid();
      const solvePath: SolvePath = [];

      const result = generateEmojiGrid(puzzle, solvePath);
      const lines = result.split("\n");

      expect(lines[0]).toBe("🟩🟩🟩🟩🟩🟩🟩🟩🟩");
      expect(result).not.toContain("🟨");
      expect(result).not.toContain("⬜");
    });

    test("partial solve path handles missing cells as green", () => {
      const puzzle = createEmptyGrid();
      const solvePath: SolvePath = [
        {
          row: 0,
          col: 0,
          value: 5,
          timestamp: Date.now(),
          isCorrection: false,
        },
      ];

      const result = generateEmojiGrid(puzzle, solvePath);

      expect(result).toContain("🟩");
      expect(result).not.toContain("🟨");
    });

    test("auto-solve path (all first-fills) generates all green", () => {
      const puzzle = createEmptyGrid();
      const now = Date.now();
      const solvePath: SolvePath = [];

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          solvePath.push({
            row,
            col,
            value: ((row + col) % 9) + 1,
            timestamp: now + row * 9 + col,
            isCorrection: false,
          });
        }
      }

      const result = generateEmojiGrid(puzzle, solvePath);
      const yellowCount = (result.match(/🟨/g) || []).length;

      expect(yellowCount).toBe(0);
      expect(result).toContain("🟩");
    });
  });

  describe("Validation", () => {
    test("output has 9 lines with 9 emojis each", () => {
      const puzzle = createEmptyGrid();
      const solvePath: SolvePath = [];

      const result = generateEmojiGrid(puzzle, solvePath);
      const lines = result.split("\n");

      expect(lines).toHaveLength(9);
      lines.forEach((line) => {
        const emojiCount = Array.from(line).length;
        expect(emojiCount).toBe(9);
      });
    });

    test("each line has exactly 9 emojis (using Array.from)", () => {
      const puzzle = createEmptyGrid();
      const solvePath: SolvePath = [];

      const result = generateEmojiGrid(puzzle, solvePath);
      const lines = result.split("\n");

      expect(lines).toHaveLength(9);
      lines.forEach((line) => {
        const emojis = Array.from(line);
        expect(emojis.length).toBe(9);
      });
    });

    test("only valid emojis (⬜, 🟩, 🟨)", () => {
      const puzzle = createPuzzleWithClues();
      const now = Date.now();
      const solvePath: SolvePath = [
        {
          row: 0,
          col: 3,
          value: 1,
          timestamp: now,
          isCorrection: false,
        },
        {
          row: 0,
          col: 4,
          value: 2,
          timestamp: now + 100,
          isCorrection: false,
        },
        {
          row: 0,
          col: 4,
          value: 8,
          timestamp: now + 200,
          isCorrection: true,
        },
      ];

      const result = generateEmojiGrid(puzzle, solvePath);
      const validPattern = /^[⬜🟩🟨\n]+$/;

      expect(validPattern.test(result)).toBe(true);
    });

    test("preserves Sudoku 3x3 subgrid structure visually", () => {
      const puzzle = createEmptyGrid();
      const solvePath: SolvePath = [];

      const result = generateEmojiGrid(puzzle, solvePath);
      const lines = result.split("\n");

      expect(lines).toHaveLength(9);
      expect(Array.from(lines[0]).length).toBe(9);
      expect(Array.from(lines[8]).length).toBe(9);
    });
  });

  describe("Error Cases", () => {
    test("invalid puzzle structure (not 9x9) throws descriptive error", () => {
      const invalidPuzzle = [[1, 2, 3]];
      const solvePath: SolvePath = [];

      expect(() => generateEmojiGrid(invalidPuzzle, solvePath)).toThrow(
        "Invalid puzzle structure: must be 9x9 array"
      );
    });

    test("null puzzle throws error", () => {
      const solvePath: SolvePath = [];

      expect(() =>
        generateEmojiGrid(null as unknown as number[][], solvePath)
      ).toThrow("Invalid puzzle structure: must be 9x9 array");
    });

    test("undefined puzzle throws error", () => {
      const solvePath: SolvePath = [];

      expect(() =>
        generateEmojiGrid(undefined as unknown as number[][], solvePath)
      ).toThrow("Invalid puzzle structure: must be 9x9 array");
    });

    test("puzzle with wrong row count throws error", () => {
      const puzzle = Array(8)
        .fill(null)
        .map(() => Array(9).fill(0));
      const solvePath: SolvePath = [];

      expect(() => generateEmojiGrid(puzzle, solvePath)).toThrow(
        "Invalid puzzle structure: must be 9x9 array"
      );
    });

    test("puzzle with wrong column count throws error", () => {
      const puzzle = Array(9)
        .fill(null)
        .map(() => Array(8).fill(0));
      const solvePath: SolvePath = [];

      expect(() => generateEmojiGrid(puzzle, solvePath)).toThrow(
        "Invalid puzzle structure: must be 9x9 array"
      );
    });

    test("null solvePath throws TypeError", () => {
      const puzzle = createEmptyGrid();

      expect(() =>
        generateEmojiGrid(puzzle, null as unknown as SolvePath)
      ).toThrow("Invalid solvePath: must be array");
    });

    test("undefined solvePath throws TypeError", () => {
      const puzzle = createEmptyGrid();

      expect(() =>
        generateEmojiGrid(puzzle, undefined as unknown as SolvePath)
      ).toThrow("Invalid solvePath: must be array");
    });

    test("non-array solvePath throws TypeError", () => {
      const puzzle = createEmptyGrid();

      expect(() =>
        generateEmojiGrid(puzzle, {} as unknown as SolvePath)
      ).toThrow("Invalid solvePath: must be array");
    });
  });

  describe("Performance", () => {
    test("generates grid in <10ms (p99) for typical solve path", () => {
      const puzzle = createEmptyGrid();
      const now = Date.now();
      const solvePath: SolvePath = [];

      for (let i = 0; i < 100; i++) {
        solvePath.push({
          row: Math.floor(i / 11),
          col: i % 9,
          value: (i % 9) + 1,
          timestamp: now + i,
          isCorrection: i % 10 === 0,
        });
      }

      const times: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const start = performance.now();
        generateEmojiGrid(puzzle, solvePath);
        const end = performance.now();
        times.push(end - start);
      }

      times.sort((a, b) => a - b);
      const p99 = times[Math.floor(times.length * 0.99)];

      expect(p99).toBeLessThan(10);
    });

    test("generates grid in <10ms (p99) for extreme solve path", () => {
      const puzzle = createEmptyGrid();
      const now = Date.now();
      const solvePath: SolvePath = [];

      for (let i = 0; i < 300; i++) {
        solvePath.push({
          row: Math.floor(i / 33),
          col: i % 9,
          value: (i % 9) + 1,
          timestamp: now + i,
          isCorrection: i % 3 === 0,
        });
      }

      const times: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const start = performance.now();
        generateEmojiGrid(puzzle, solvePath);
        const end = performance.now();
        times.push(end - start);
      }

      times.sort((a, b) => a - b);
      const p99 = times[Math.floor(times.length * 0.99)];

      expect(p99).toBeLessThan(10);
    });
  });
});
