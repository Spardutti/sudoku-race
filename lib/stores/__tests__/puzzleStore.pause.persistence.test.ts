import { act, renderHook } from "@testing-library/react";
import { usePuzzleStore } from "../puzzleStore";

describe("usePuzzleStore - Pause Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      usePuzzleStore.getState().resetPuzzle();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Persistence", () => {
    it("persists isStarted, isPaused, and pausedAt to localStorage", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
        result.current.pausePuzzle();
      });

      const storedData = localStorage.getItem("sudoku-race-puzzle-state");
      expect(storedData).toBeTruthy();

      const parsed = JSON.parse(storedData!);
      expect(parsed.state.isStarted).toBe(true);
      expect(parsed.state.isPaused).toBe(true);
      expect(parsed.state.pausedAt).toBeTruthy();
    });

    it("restores pause state from localStorage", () => {
      const pausedTimestamp = Date.now();
      const savedState = {
        state: {
          puzzleId: "test-puzzle",
          userEntries: Array(9)
            .fill(null)
            .map(() => Array(9).fill(0)),
          isStarted: true,
          isPaused: true,
          pausedAt: pausedTimestamp,
          elapsedTime: 60,
        },
        version: 0,
      };

      localStorage.setItem(
        "sudoku-race-puzzle-state",
        JSON.stringify(savedState)
      );

      renderHook(() => usePuzzleStore());

      act(() => {});

      const stored = localStorage.getItem("sudoku-race-puzzle-state");
      const parsed = JSON.parse(stored!);
      expect(parsed.state.isStarted).toBe(true);
      expect(parsed.state.isPaused).toBe(true);
      expect(parsed.state.pausedAt).toBe(pausedTimestamp);
    });

    it("persists isStarted on resume", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
        result.current.pausePuzzle();
        result.current.resumePuzzle();
      });

      const storedData = localStorage.getItem("sudoku-race-puzzle-state");
      const parsed = JSON.parse(storedData!);

      expect(parsed.state.isStarted).toBe(true);
      expect(parsed.state.isPaused).toBe(false);
      expect(parsed.state.pausedAt).toBeNull();
    });
  });
});
