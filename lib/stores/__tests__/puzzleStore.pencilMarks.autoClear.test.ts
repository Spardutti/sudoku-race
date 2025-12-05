import { renderHook, act } from "@testing-library/react";
import { usePuzzleStore } from "../puzzleStore";

describe("PuzzleStore - Pencil Marks Auto-Clear", () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePuzzleStore());
    act(() => {
      result.current.resetPuzzle();
    });
  });

  describe("auto-clear same row", () => {
    it("auto-clears number from same row when placing", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 1, 5);
        result.current.addPencilMark(0, 2, 5);
        result.current.addPencilMark(0, 3, 5);
        result.current.updateCell(0, 0, 5);
      });

      expect(result.current.pencilMarks["0-1"] || []).not.toContain(5);
      expect(result.current.pencilMarks["0-2"] || []).not.toContain(5);
      expect(result.current.pencilMarks["0-3"] || []).not.toContain(5);
    });

    it("auto-clears from all 9 cells in row", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        for (let col = 1; col < 9; col++) {
          result.current.addPencilMark(5, col, 7);
        }
        result.current.updateCell(5, 0, 7);
      });

      for (let col = 1; col < 9; col++) {
        expect(result.current.pencilMarks[`5-${col}`] || []).not.toContain(7);
      }
    });
  });

  describe("auto-clear same column", () => {
    it("auto-clears number from same column when placing", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(1, 0, 5);
        result.current.addPencilMark(2, 0, 5);
        result.current.addPencilMark(3, 0, 5);
        result.current.updateCell(0, 0, 5);
      });

      expect(result.current.pencilMarks["1-0"] || []).not.toContain(5);
      expect(result.current.pencilMarks["2-0"] || []).not.toContain(5);
      expect(result.current.pencilMarks["3-0"] || []).not.toContain(5);
    });

    it("auto-clears from all 9 cells in column", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        for (let row = 1; row < 9; row++) {
          result.current.addPencilMark(row, 4, 7);
        }
        result.current.updateCell(0, 4, 7);
      });

      for (let row = 1; row < 9; row++) {
        expect(result.current.pencilMarks[`${row}-4`] || []).not.toContain(7);
      }
    });
  });

  describe("auto-clear same 3x3 box", () => {
    it("auto-clears number from same 3x3 box when placing (top-left box)", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 1, 5);
        result.current.addPencilMark(1, 0, 5);
        result.current.addPencilMark(1, 1, 5);
        result.current.addPencilMark(2, 2, 5);
        result.current.updateCell(0, 0, 5);
      });

      expect(result.current.pencilMarks["0-1"] || []).not.toContain(5);
      expect(result.current.pencilMarks["1-0"] || []).not.toContain(5);
      expect(result.current.pencilMarks["1-1"] || []).not.toContain(5);
      expect(result.current.pencilMarks["2-2"] || []).not.toContain(5);
    });

    it("auto-clears from center box (rows 3-5, cols 3-5)", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(3, 3, 9);
        result.current.addPencilMark(4, 4, 9);
        result.current.addPencilMark(5, 5, 9);
        result.current.updateCell(3, 4, 9);
      });

      expect(result.current.pencilMarks["3-3"] || []).not.toContain(9);
      expect(result.current.pencilMarks["4-4"] || []).not.toContain(9);
      expect(result.current.pencilMarks["5-5"] || []).not.toContain(9);
    });

    it("auto-clears from bottom-right box (rows 6-8, cols 6-8)", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(6, 7, 3);
        result.current.addPencilMark(7, 8, 3);
        result.current.addPencilMark(8, 6, 3);
        result.current.updateCell(6, 6, 3);
      });

      expect(result.current.pencilMarks["6-7"] || []).not.toContain(3);
      expect(result.current.pencilMarks["7-8"] || []).not.toContain(3);
      expect(result.current.pencilMarks["8-6"] || []).not.toContain(3);
    });
  });

  describe("auto-clear preserves other numbers", () => {
    it("preserves other numbers when auto-clearing", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 1, 3);
        result.current.addPencilMark(0, 1, 5);
        result.current.addPencilMark(0, 1, 7);
        result.current.updateCell(0, 0, 5);
      });

      const marks = result.current.pencilMarks["0-1"];
      expect(marks).toContain(3);
      expect(marks).not.toContain(5);
      expect(marks).toContain(7);
    });

    it("does not affect cells outside row/col/box", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(5, 5, 4);
        result.current.updateCell(0, 0, 4);
      });

      expect(result.current.pencilMarks["5-5"]).toContain(4);
    });
  });

  describe("performance", () => {
    it("auto-clears in under 50ms", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        for (let i = 0; i < 9; i++) {
          result.current.addPencilMark(0, i, 5);
          result.current.addPencilMark(i, 0, 5);
        }
      });

      const start = performance.now();
      act(() => {
        result.current.updateCell(0, 0, 5);
      });
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });
});
