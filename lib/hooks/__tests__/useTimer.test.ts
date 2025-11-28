import { renderHook, act } from "@testing-library/react";
import { useTimer } from "../useTimer";
import { usePuzzleStore } from "@/lib/stores/puzzleStore";

// Mock timers
jest.useFakeTimers();

describe("useTimer Hook", () => {
  beforeEach(() => {
    // Reset Zustand store before each test
    usePuzzleStore.setState({
      elapsedTime: 0,
      isCompleted: false,
      puzzleId: null,
      puzzle: null,
      userEntries: Array(9)
        .fill(null)
        .map(() => Array(9).fill(0)),
      selectedCell: null,
    });

    // Reset timers
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("Auto-Start Behavior", () => {
    it("starts timer automatically on mount when puzzle not completed", () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.isRunning).toBe(true);
    });

    it("does not start timer if puzzle is already completed", () => {
      usePuzzleStore.setState({ isCompleted: true });

      const { result } = renderHook(() => useTimer());

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("Timer Incrementing", () => {
    it("increments elapsed time every second", () => {
      renderHook(() => useTimer());

      expect(usePuzzleStore.getState().elapsedTime).toBe(0);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(1);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(2);
    });

    it("increments time correctly over multiple seconds", () => {
      renderHook(() => useTimer());

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(5);
    });

    it("does not increment when puzzle is completed", () => {
      renderHook(() => useTimer());

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(2);

      // Complete the puzzle
      act(() => {
        usePuzzleStore.setState({ isCompleted: true });
      });

      // Advance more time
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should still be 2 (stopped when completed)
      expect(usePuzzleStore.getState().elapsedTime).toBe(2);
    });
  });

  describe("Page Visibility API", () => {
    it("pauses timer when document becomes hidden", () => {
      const { result } = renderHook(() => useTimer());

      // Timer running
      expect(result.current.isRunning).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(2);

      // Simulate tab hidden
      act(() => {
        Object.defineProperty(document, "visibilityState", {
          writable: true,
          configurable: true,
          value: "hidden",
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });

      // Timer should be paused
      expect(result.current.isRunning).toBe(false);

      // Time should not advance while hidden
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(2);
    });

    it("resumes timer when document becomes visible again", () => {
      const { result } = renderHook(() => useTimer());

      // Pause the timer
      act(() => {
        Object.defineProperty(document, "visibilityState", {
          writable: true,
          configurable: true,
          value: "hidden",
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });

      expect(result.current.isRunning).toBe(false);

      // Resume the timer
      act(() => {
        Object.defineProperty(document, "visibilityState", {
          writable: true,
          configurable: true,
          value: "visible",
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });

      expect(result.current.isRunning).toBe(true);

      // Time should advance again
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(2);
    });

    it("does not resume timer if puzzle is completed", () => {
      const { result } = renderHook(() => useTimer());

      // Complete puzzle
      act(() => {
        usePuzzleStore.setState({ isCompleted: true });
      });

      // Timer should stop
      expect(result.current.isRunning).toBe(false);

      // Try to resume via visibility change
      act(() => {
        Object.defineProperty(document, "visibilityState", {
          writable: true,
          configurable: true,
          value: "visible",
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });

      // Should remain stopped
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("Manual Controls", () => {
    it("allows manual pause", () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isRunning).toBe(false);

      // Timer should not increment
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(0);
    });

    it("allows manual resume", () => {
      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.pause();
      });

      expect(result.current.isRunning).toBe(false);

      act(() => {
        result.current.resume();
      });

      expect(result.current.isRunning).toBe(true);

      // Timer should increment again
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(2);
    });

    it("resets timer to 0", () => {
      renderHook(() => useTimer());

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(5);

      const { result } = renderHook(() => useTimer());

      act(() => {
        result.current.reset();
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("Cleanup", () => {
    it("cleans up interval on unmount", () => {
      const { unmount } = renderHook(() => useTimer());

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(usePuzzleStore.getState().elapsedTime).toBe(2);

      // Unmount hook
      unmount();

      // Advance time after unmount
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Time should not have advanced after unmount
      expect(usePuzzleStore.getState().elapsedTime).toBe(2);
    });

    it("removes visibility change listener on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        "removeEventListener"
      );

      const { unmount } = renderHook(() => useTimer());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "visibilitychange",
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
