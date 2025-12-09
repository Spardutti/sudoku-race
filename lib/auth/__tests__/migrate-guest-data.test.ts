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

  it("should parse valid localStorage JSON with completed puzzle", () => {
    const validJson = JSON.stringify({
      state: {
        puzzleId: "puzzle-1",
        userEntries: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
        elapsedTime: 300,
        isCompleted: true,
        completionTime: 300,
        solvePath: [{ row: 0, col: 0, value: 5 }],
      },
    });

    const result = parseLocalStorageData(validJson);

    expect(result).not.toBeNull();
    expect(result?.state?.puzzleId).toBe("puzzle-1");
    expect(result?.state?.isCompleted).toBe(true);
    expect(result?.state?.completionTime).toBe(300);
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

  it("should handle in-progress puzzle", () => {
    const inProgressJson = JSON.stringify({
      state: {
        puzzleId: "puzzle-2",
        userEntries: [[1, 2, 3, 0, 0, 0, 0, 0, 0]],
        elapsedTime: 120,
        isCompleted: false,
      },
    });

    const result = parseLocalStorageData(inProgressJson);

    expect(result).not.toBeNull();
    expect(result?.state?.puzzleId).toBe("puzzle-2");
    expect(result?.state?.isCompleted).toBe(false);
  });

  it("should handle puzzle with pencil marks and selected cell", () => {
    const withExtraFields = JSON.stringify({
      state: {
        puzzleId: "puzzle-3",
        userEntries: [[1, 2, 3, 0, 0, 0, 0, 0, 0]],
        elapsedTime: 120,
        isCompleted: false,
        pencilMarks: { "0-3": [4, 5, 6] },
        selectedCell: { row: 0, col: 3 },
        isPaused: false,
      },
    });

    const result = parseLocalStorageData(withExtraFields);

    expect(result).not.toBeNull();
    expect(result?.state?.pencilMarks).toEqual({ "0-3": [4, 5, 6] });
    expect(result?.state?.selectedCell).toEqual({ row: 0, col: 3 });
  });

  it("should preserve solve path data", () => {
    const withSolvePath = JSON.stringify({
      state: {
        puzzleId: "puzzle-1",
        userEntries: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
        elapsedTime: 300,
        isCompleted: true,
        completionTime: 300,
        solvePath: [
          { row: 0, col: 0, value: 5, timestamp: 1000 },
          { row: 0, col: 1, value: 3, timestamp: 2000 },
        ],
      },
    });

    const result = parseLocalStorageData(withSolvePath);

    expect(result).not.toBeNull();
    expect(result?.state?.solvePath).toBeDefined();
    expect(Array.isArray(result?.state?.solvePath)).toBe(true);
    expect(result?.state?.solvePath).toHaveLength(2);
  });
});

describe("localStorage data structure validation", () => {
  it("should match expected completed puzzle structure", () => {
    const data: LocalStorageState = {
      state: {
        puzzleId: "abc123",
        userEntries: Array(9).fill(Array(9).fill(0)),
        elapsedTime: 456,
        isCompleted: true,
        completionTime: 456,
        solvePath: [],
      },
    };

    expect(data.state).toHaveProperty("puzzleId");
    expect(data.state).toHaveProperty("completionTime");
    expect(data.state).toHaveProperty("isCompleted");
    expect(data.state?.isCompleted).toBe(true);
  });

  it("should match expected in-progress puzzle structure", () => {
    const data: LocalStorageState = {
      state: {
        puzzleId: "abc123",
        userEntries: Array(9).fill(Array(9).fill(0)),
        elapsedTime: 120,
        isCompleted: false,
        pencilMarks: { "0-0": [1, 2, 3] },
        selectedCell: { row: 0, col: 0 },
      },
    };

    expect(data.state).toHaveProperty("puzzleId");
    expect(data.state).toHaveProperty("userEntries");
    expect(data.state).toHaveProperty("elapsedTime");
    expect(data.state).toHaveProperty("pencilMarks");
    expect(data.state).toHaveProperty("selectedCell");
  });
});
