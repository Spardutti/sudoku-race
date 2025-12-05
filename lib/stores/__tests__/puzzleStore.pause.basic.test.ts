import { act, renderHook } from "@testing-library/react";
import { usePuzzleStore } from "../puzzleStore";

describe("usePuzzleStore - Pause Basic Actions", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => {
      usePuzzleStore.getState().resetPuzzle();
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Initial State", () => {
    it("initializes with isStarted=false, isPaused=false, pausedAt=null", () => {
      const { result } = renderHook(() => usePuzzleStore());

      expect(result.current.isStarted).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.pausedAt).toBeNull();
    });
  });

  describe("startPuzzle", () => {
    it("sets isStarted to true", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it("does not change isPaused state", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
      });

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe("pausePuzzle", () => {
    it("sets isPaused to true and records pausedAt timestamp", () => {
      const { result } = renderHook(() => usePuzzleStore());
      const beforePause = Date.now();

      act(() => {
        result.current.startPuzzle();
        result.current.pausePuzzle();
      });

      expect(result.current.isPaused).toBe(true);
      expect(result.current.pausedAt).toBeGreaterThanOrEqual(beforePause);
      expect(result.current.pausedAt).toBeLessThanOrEqual(Date.now());
    });

    it("does not change isStarted state", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
        result.current.pausePuzzle();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.isPaused).toBe(true);
    });

    it("can pause before starting (edge case)", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.pausePuzzle();
      });

      expect(result.current.isPaused).toBe(true);
      expect(result.current.pausedAt).toBeTruthy();
    });
  });

  describe("resumePuzzle", () => {
    it("sets isPaused to false and clears pausedAt", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
        result.current.pausePuzzle();
        result.current.resumePuzzle();
      });

      expect(result.current.isPaused).toBe(false);
      expect(result.current.pausedAt).toBeNull();
    });

    it("does not change isStarted state", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
        result.current.pausePuzzle();
        result.current.resumePuzzle();
      });

      expect(result.current.isStarted).toBe(true);
      expect(result.current.isPaused).toBe(false);
    });

    it("can resume without pausing first (idempotent)", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.startPuzzle();
        result.current.resumePuzzle();
      });

      expect(result.current.isPaused).toBe(false);
      expect(result.current.pausedAt).toBeNull();
    });
  });
});
