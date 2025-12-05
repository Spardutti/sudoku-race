import { renderHook, act } from "@testing-library/react";
import { usePuzzleStore } from "../puzzleStore";

describe("PuzzleStore - Pencil Marks Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    const { result } = renderHook(() => usePuzzleStore());
    act(() => {
      result.current.resetPuzzle();
    });
  });

  describe("localStorage persistence", () => {
    it("includes pencilMarks in persisted state", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 1);
        result.current.addPencilMark(0, 0, 2);
      });

      const stored = localStorage.getItem("sudoku-race-puzzle-state");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.pencilMarks).toBeDefined();
      expect(parsed.state.pencilMarks["0-0"]).toBeDefined();
    });

    it("includes noteMode in persisted state", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.toggleNoteMode();
      });

      const stored = localStorage.getItem("sudoku-race-puzzle-state");
      const parsed = JSON.parse(stored!);
      expect(parsed.state.noteMode).toBe(true);
    });

    it("restores pencilMarks after refresh simulation", () => {
      const { result: result1 } = renderHook(() => usePuzzleStore());

      act(() => {
        result1.current.addPencilMark(0, 0, 5);
        result1.current.addPencilMark(1, 1, 7);
      });

      const { result: result2 } = renderHook(() => usePuzzleStore());
      expect(result2.current.pencilMarks["0-0"]).toContain(5);
      expect(result2.current.pencilMarks["1-1"]).toContain(7);
    });

    it("restores noteMode after refresh simulation", () => {
      const { result: result1 } = renderHook(() => usePuzzleStore());

      act(() => {
        result1.current.toggleNoteMode();
      });

      const { result: result2 } = renderHook(() => usePuzzleStore());
      expect(result2.current.noteMode).toBe(true);
    });

    it("persists multiple pencil marks per cell", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(2, 3, 1);
        result.current.addPencilMark(2, 3, 4);
        result.current.addPencilMark(2, 3, 9);
      });

      const { result: result2 } = renderHook(() => usePuzzleStore());
      const marks = result2.current.pencilMarks["2-3"];
      expect(marks).toContain(1);
      expect(marks).toContain(4);
      expect(marks).toContain(9);
    });

    it("clears persisted pencilMarks on resetPuzzle", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 1);
        result.current.resetPuzzle();
      });

      const stored = localStorage.getItem("sudoku-race-puzzle-state");
      const parsed = JSON.parse(stored!);
      expect(parsed.state.pencilMarks).toEqual({});
    });
  });

  describe("puzzle switching", () => {
    const mockPuzzle = Array(9)
      .fill(null)
      .map(() => Array(9).fill(0));

    it("clears pencil marks when loading a new puzzle (different puzzleId)", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.setPuzzle("puzzle-a", mockPuzzle);
        result.current.addPencilMark(0, 0, 5);
        result.current.addPencilMark(1, 1, 7);
      });

      expect(result.current.pencilMarks).toEqual({
        "0-0": [5],
        "1-1": [7],
      });

      act(() => {
        result.current.setPuzzle("puzzle-b", mockPuzzle);
      });

      expect(result.current.pencilMarks).toEqual({});
      expect(result.current.noteMode).toBe(false);
    });

    it("clears noteMode when loading a new puzzle", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.setPuzzle("puzzle-a", mockPuzzle);
        result.current.toggleNoteMode();
      });

      expect(result.current.noteMode).toBe(true);

      act(() => {
        result.current.setPuzzle("puzzle-b", mockPuzzle);
      });

      expect(result.current.noteMode).toBe(false);
    });

    it("prevents pencil marks from previous puzzle appearing on new puzzle", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.setPuzzle("2024-12-04", mockPuzzle);
        result.current.addPencilMark(0, 0, 1);
        result.current.addPencilMark(0, 0, 2);
        result.current.addPencilMark(2, 2, 9);
      });

      const marksFromPuzzle1 = { ...result.current.pencilMarks };
      expect(Object.keys(marksFromPuzzle1).length).toBe(2);

      act(() => {
        result.current.setPuzzle("2024-12-05", mockPuzzle);
      });

      expect(result.current.pencilMarks).toEqual({});
      expect(result.current.puzzleId).toBe("2024-12-05");
    });
  });
});
