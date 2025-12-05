import { renderHook, act } from "@testing-library/react";
import { usePuzzleStore } from "../puzzleStore";

describe("PuzzleStore - Pencil Marks Basic Operations", () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePuzzleStore());
    act(() => {
      result.current.resetPuzzle();
    });
  });

  describe("noteMode state", () => {
    it("defaults to false (normal mode)", () => {
      const { result } = renderHook(() => usePuzzleStore());
      expect(result.current.noteMode).toBe(false);
    });

    it("toggles note mode on", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.toggleNoteMode();
      });

      expect(result.current.noteMode).toBe(true);
    });

    it("toggles note mode off", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.toggleNoteMode();
        result.current.toggleNoteMode();
      });

      expect(result.current.noteMode).toBe(false);
    });
  });

  describe("pencilMarks state", () => {
    it("defaults to empty object", () => {
      const { result } = renderHook(() => usePuzzleStore());
      expect(result.current.pencilMarks).toEqual({});
    });

    it("adds pencil mark to cell", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 5);
      });

      expect(result.current.pencilMarks["0-0"]).toContain(5);
    });

    it("adds multiple pencil marks to same cell", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 1);
        result.current.addPencilMark(0, 0, 2);
        result.current.addPencilMark(0, 0, 3);
      });

      const marks = result.current.pencilMarks["0-0"];
      expect(marks).toContain(1);
      expect(marks).toContain(2);
      expect(marks).toContain(3);
      expect(marks?.length).toBe(3);
    });

    it("prevents duplicate pencil marks", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 5);
        result.current.addPencilMark(0, 0, 5);
      });

      expect(result.current.pencilMarks["0-0"]?.length).toBe(1);
    });

    it("removes pencil mark from cell (toggle behavior)", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 5);
        result.current.removePencilMark(0, 0, 5);
      });

      expect(result.current.pencilMarks["0-0"] || []).not.toContain(5);
    });

    it("preserves other marks when removing one", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 1);
        result.current.addPencilMark(0, 0, 2);
        result.current.addPencilMark(0, 0, 3);
        result.current.removePencilMark(0, 0, 2);
      });

      const marks = result.current.pencilMarks["0-0"];
      expect(marks).toContain(1);
      expect(marks).not.toContain(2);
      expect(marks).toContain(3);
    });

    it("clears all pencil marks from cell", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 1);
        result.current.addPencilMark(0, 0, 2);
        result.current.addPencilMark(0, 0, 3);
        result.current.clearCellPencilMarks(0, 0);
      });

      expect(result.current.pencilMarks["0-0"]).toBeUndefined();
    });
  });

  describe("updateCell integration with pencilMarks", () => {
    it("clears pencil marks when placing number in normal mode", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 1);
        result.current.addPencilMark(0, 0, 2);
        result.current.updateCell(0, 0, 5);
      });

      expect(result.current.pencilMarks["0-0"]).toBeUndefined();
      expect(result.current.userEntries[0][0]).toBe(5);
    });

    it("clears cell pencil marks when clearing cell (value 0)", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 1);
        result.current.updateCell(0, 0, 0);
      });

      expect(result.current.pencilMarks["0-0"]).toBeUndefined();
    });
  });

  describe("resetPuzzle integration", () => {
    it("clears all pencil marks on reset", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.addPencilMark(0, 0, 1);
        result.current.addPencilMark(1, 1, 2);
        result.current.resetPuzzle();
      });

      expect(result.current.pencilMarks).toEqual({});
    });

    it("resets note mode to false on reset", () => {
      const { result } = renderHook(() => usePuzzleStore());

      act(() => {
        result.current.toggleNoteMode();
        result.current.resetPuzzle();
      });

      expect(result.current.noteMode).toBe(false);
    });
  });
});
