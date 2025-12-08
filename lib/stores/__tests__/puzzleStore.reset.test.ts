import { act, renderHook } from "@testing-library/react";
import { usePuzzleStore } from "../puzzleStore";

describe("puzzleStore - Reset Logic", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      usePuzzleStore.getState().resetPuzzle();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("resetPuzzle", () => {
    it("clears all state fields", () => {
      const { result } = renderHook(() => usePuzzleStore());
      const testPuzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
      ];

      act(() => {
        result.current.setPuzzle("puzzle-2025-12-07", testPuzzle);
        result.current.updateCell(0, 2, 4);
        result.current.setElapsedTime(120);
      });

      expect(result.current.puzzleId).toBe("puzzle-2025-12-07");
      expect(result.current.userEntries[0][2]).toBe(4);
      expect(result.current.elapsedTime).toBe(120);

      act(() => {
        result.current.resetPuzzle();
      });

      expect(result.current.puzzleId).toBeNull();
      expect(result.current.puzzle).toBeNull();
      expect(result.current.userEntries).toEqual(
        Array(9)
          .fill(null)
          .map(() => Array(9).fill(0))
      );
      expect(result.current.selectedCell).toBeNull();
      expect(result.current.elapsedTime).toBe(0);
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.completionTime).toBeNull();
      expect(result.current.solvePath).toEqual([]);
      expect(result.current.noteMode).toBe(false);
      expect(result.current.pencilMarks).toEqual({});
      expect(result.current.isStarted).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.pausedAt).toBeNull();
    });

    it("clears localStorage and persists reset state", () => {
      const { result } = renderHook(() => usePuzzleStore());
      const testPuzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
      ];

      act(() => {
        result.current.setPuzzle("puzzle-2025-12-07", testPuzzle);
        result.current.updateCell(0, 2, 4);
      });

      const storedBefore = localStorage.getItem("sudoku-race-puzzle-state");
      expect(storedBefore).toBeTruthy();
      const parsedBefore = JSON.parse(storedBefore!);
      expect(parsedBefore.state.puzzleId).toBe("puzzle-2025-12-07");
      expect(parsedBefore.state.userEntries[0][2]).toBe(4);

      act(() => {
        result.current.resetPuzzle();
      });

      const storedAfter = localStorage.getItem("sudoku-race-puzzle-state");
      expect(storedAfter).toBeTruthy();
      const parsedAfter = JSON.parse(storedAfter!);
      expect(parsedAfter.state.puzzleId).toBeNull();
      expect(parsedAfter.state.userEntries).toEqual(
        Array(9)
          .fill(null)
          .map(() => Array(9).fill(0))
      );
      expect(parsedAfter.state.elapsedTime).toBe(0);
    });
  });

  describe("setPuzzle with different puzzle ID", () => {
    it("performs full reset when puzzle ID changes", () => {
      const { result } = renderHook(() => usePuzzleStore());
      const puzzle1 = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
      ];

      const puzzle2 = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ];

      act(() => {
        result.current.setPuzzle("puzzle-2025-12-07", puzzle1);
        result.current.updateCell(0, 2, 4);
        result.current.setElapsedTime(180);
      });

      expect(result.current.puzzleId).toBe("puzzle-2025-12-07");
      expect(result.current.userEntries[0][2]).toBe(4);
      expect(result.current.elapsedTime).toBe(180);

      act(() => {
        result.current.setPuzzle("puzzle-2025-12-08", puzzle2);
      });

      expect(result.current.puzzleId).toBe("puzzle-2025-12-08");
      expect(result.current.puzzle).toEqual(puzzle2);
      expect(result.current.userEntries).toEqual(
        Array(9)
          .fill(null)
          .map(() => Array(9).fill(0))
      );
      expect(result.current.elapsedTime).toBe(0);
      expect(result.current.isStarted).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });

    it("preserves state when same puzzle ID", () => {
      const { result } = renderHook(() => usePuzzleStore());
      const testPuzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
      ];

      act(() => {
        result.current.setPuzzle("puzzle-2025-12-07", testPuzzle);
        result.current.updateCell(0, 2, 4);
        result.current.setElapsedTime(240);
      });

      const userEntriesBefore = result.current.userEntries;
      const elapsedTimeBefore = result.current.elapsedTime;

      act(() => {
        result.current.setPuzzle("puzzle-2025-12-07", testPuzzle);
      });

      expect(result.current.puzzleId).toBe("puzzle-2025-12-07");
      expect(result.current.userEntries).toBe(userEntriesBefore);
      expect(result.current.elapsedTime).toBe(elapsedTimeBefore);
    });
  });
});
