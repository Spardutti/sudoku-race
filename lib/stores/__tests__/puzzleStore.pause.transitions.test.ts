import { act, renderHook } from "@testing-library/react";
import { usePuzzleStore } from "../puzzleStore";

describe("usePuzzleStore - Pause State Transitions", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      usePuzzleStore.getState().resetPuzzle();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("State Transitions", () => {
    it("supports NOT_STARTED → ACTIVE transition", () => {
      const { result } = renderHook(() => usePuzzleStore());

      expect(result.current.isStarted).toBe(false);
      expect(result.current.isPaused).toBe(false);

      act(() => {
        result.current.startPuzzle();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it("supports ACTIVE → PAUSED → ACTIVE cycle", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.isPaused).toBe(false);

      act(() => {
        result.current.pausePuzzle();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.resumePuzzle();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it("supports multiple pause/resume cycles", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
      });

      for (let i = 0; i < 3; i++) {
        act(() => {
          result.current.pausePuzzle();
        });
        expect(result.current.isPaused).toBe(true);

        act(() => {
          result.current.resumePuzzle();
        });
        expect(result.current.isPaused).toBe(false);
      }
    });
  });

  describe("resetPuzzle", () => {
    it("resets pause state to initial values", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
        result.current.pausePuzzle();
        result.current.resetPuzzle();
      });

      expect(result.current.isStarted).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.pausedAt).toBeNull();
    });
  });

  describe("setPuzzle", () => {
    it("resets pause state when setting new puzzle", () => {
      const { result } = renderHook(() => usePuzzleStore());
      const puzzle = Array(9)
        .fill(null)
        .map(() => Array(9).fill(0));

      act(() => {
        result.current.startPuzzle();
        result.current.pausePuzzle();
        result.current.setPuzzle("new-puzzle", puzzle);
      });

      expect(result.current.isStarted).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.pausedAt).toBeNull();
    });
  });
});
