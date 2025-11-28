import { parseLocalStorageData, type LocalStorageState } from "../migrate-guest-data";

describe("parseLocalStorageData", () => {
  it("should return null for null input", () => {
    const result = parseLocalStorageData(null);
    expect(result).toBeNull();
  });

  it("should return null for empty string", () => {
    const result = parseLocalStorageData("");
    expect(result).toBeNull();
  });

  it("should parse valid localStorage JSON", () => {
    const validJson = JSON.stringify({
      state: {
        puzzleId: "test-123",
        completedPuzzles: [
          {
            puzzleId: "puzzle-1",
            completionTime: 300,
            completedAt: "2025-11-28T10:00:00Z",
          },
        ],
        currentPuzzle: {
          puzzleId: "puzzle-2",
          userEntries: [[1, 2, 3]],
          elapsedTime: 120,
        },
      },
    });

    const result = parseLocalStorageData(validJson);

    expect(result).not.toBeNull();
    expect(result?.state?.completedPuzzles).toHaveLength(1);
    expect(result?.state?.completedPuzzles?.[0].puzzleId).toBe("puzzle-1");
    expect(result?.state?.currentPuzzle?.puzzleId).toBe("puzzle-2");
  });

  it("should handle malformed JSON gracefully", () => {
    const malformedJson = "{ invalid json }";
    const result = parseLocalStorageData(malformedJson);
    expect(result).toBeNull();
  });

  it("should handle JSON with missing state field", () => {
    const jsonWithoutState = JSON.stringify({
      someOtherField: "value",
    });

    const result = parseLocalStorageData(jsonWithoutState);

    expect(result).not.toBeNull();
    expect(result?.state).toBeUndefined();
  });

  it("should handle empty completedPuzzles array", () => {
    const emptyCompletions = JSON.stringify({
      state: {
        completedPuzzles: [],
        currentPuzzle: null,
      },
    });

    const result = parseLocalStorageData(emptyCompletions);

    expect(result).not.toBeNull();
    expect(result?.state?.completedPuzzles).toEqual([]);
  });

  it("should handle multiple completed puzzles", () => {
    const multipleCompletions = JSON.stringify({
      state: {
        completedPuzzles: [
          {
            puzzleId: "puzzle-1",
            completionTime: 300,
            completedAt: "2025-11-28T10:00:00Z",
          },
          {
            puzzleId: "puzzle-2",
            completionTime: 450,
            completedAt: "2025-11-28T11:00:00Z",
          },
          {
            puzzleId: "puzzle-3",
            completionTime: 600,
            completedAt: "2025-11-28T12:00:00Z",
          },
        ],
      },
    });

    const result = parseLocalStorageData(multipleCompletions);

    expect(result).not.toBeNull();
    expect(result?.state?.completedPuzzles).toHaveLength(3);
  });

  it("should preserve solve path data", () => {
    const withSolvePath = JSON.stringify({
      state: {
        completedPuzzles: [
          {
            puzzleId: "puzzle-1",
            completionTime: 300,
            completedAt: "2025-11-28T10:00:00Z",
            solvePath: [
              { row: 0, col: 0, value: 5, timestamp: 1000 },
              { row: 0, col: 1, value: 3, timestamp: 2000 },
            ],
          },
        ],
      },
    });

    const result = parseLocalStorageData(withSolvePath);

    expect(result).not.toBeNull();
    expect(result?.state?.completedPuzzles?.[0].solvePath).toBeDefined();
    expect(Array.isArray(result?.state?.completedPuzzles?.[0].solvePath)).toBe(true);
  });
});

describe("localStorage data structure validation", () => {
  it("should match expected completedPuzzles structure", () => {
    const data: LocalStorageState = {
      state: {
        completedPuzzles: [
          {
            puzzleId: "abc123",
            completionTime: 456,
            solvePath: [],
            completedAt: "2025-11-28T10:00:00Z",
          },
        ],
      },
    };

    expect(data.state?.completedPuzzles?.[0]).toHaveProperty("puzzleId");
    expect(data.state?.completedPuzzles?.[0]).toHaveProperty("completionTime");
    expect(data.state?.completedPuzzles?.[0]).toHaveProperty("completedAt");
  });

  it("should match expected currentPuzzle structure", () => {
    const data: LocalStorageState = {
      state: {
        currentPuzzle: {
          puzzleId: "abc123",
          userEntries: Array(9).fill(Array(9).fill(0)),
          elapsedTime: 120,
        },
      },
    };

    expect(data.state?.currentPuzzle).toHaveProperty("puzzleId");
    expect(data.state?.currentPuzzle).toHaveProperty("userEntries");
    expect(data.state?.currentPuzzle).toHaveProperty("elapsedTime");
  });
});
