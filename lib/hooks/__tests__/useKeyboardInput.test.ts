import { renderHook } from "@testing-library/react";
import { useKeyboardInput } from "../useKeyboardInput";

describe("useKeyboardInput", () => {
  const mockOnNumberChange = jest.fn();
  const mockIsClueCell = jest.fn();
  const mockSelectedCell = { row: 4, col: 4 };

  beforeEach(() => {
    mockOnNumberChange.mockClear();
    mockIsClueCell.mockClear();
    mockIsClueCell.mockReturnValue(false); // Default: not a clue cell
  });

  afterEach(() => {
    // Clean up any remaining event listeners
    jest.clearAllMocks();
  });

  describe("Number Key Input (1-9)", () => {
    it("calls onNumberChange with correct value when number key pressed", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const event = new KeyboardEvent("keydown", { key: "5" });
      document.dispatchEvent(event);

      expect(mockIsClueCell).toHaveBeenCalledWith(4, 4);
      expect(mockOnNumberChange).toHaveBeenCalledTimes(1);
      expect(mockOnNumberChange).toHaveBeenCalledWith(4, 4, 5);
    });

    it("handles all number keys 1-9", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      for (let i = 1; i <= 9; i++) {
        mockOnNumberChange.mockClear();
        mockIsClueCell.mockClear();

        const event = new KeyboardEvent("keydown", { key: i.toString() });
        document.dispatchEvent(event);

        expect(mockOnNumberChange).toHaveBeenCalledWith(4, 4, i);
      }
    });

    it("prevents default behavior for number keys", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const event = new KeyboardEvent("keydown", { key: "5" });
      const preventDefaultSpy = jest.spyOn(event, "preventDefault");

      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("does not call onNumberChange when no cell is selected", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: null,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const event = new KeyboardEvent("keydown", { key: "5" });
      document.dispatchEvent(event);

      expect(mockOnNumberChange).not.toHaveBeenCalled();
    });

    it("does not call onNumberChange when clue cell is selected", () => {
      mockIsClueCell.mockReturnValue(true);

      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const event = new KeyboardEvent("keydown", { key: "5" });
      document.dispatchEvent(event);

      expect(mockIsClueCell).toHaveBeenCalledWith(4, 4);
      expect(mockOnNumberChange).not.toHaveBeenCalled();
    });
  });

  describe("Clear Keys (Backspace, Delete, 0)", () => {
    it("calls onNumberChange with 0 when Backspace pressed", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const event = new KeyboardEvent("keydown", { key: "Backspace" });
      document.dispatchEvent(event);

      expect(mockOnNumberChange).toHaveBeenCalledWith(4, 4, 0);
    });

    it("calls onNumberChange with 0 when Delete pressed", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const event = new KeyboardEvent("keydown", { key: "Delete" });
      document.dispatchEvent(event);

      expect(mockOnNumberChange).toHaveBeenCalledWith(4, 4, 0);
    });

    it('calls onNumberChange with 0 when "0" key pressed', () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const event = new KeyboardEvent("keydown", { key: "0" });
      document.dispatchEvent(event);

      expect(mockOnNumberChange).toHaveBeenCalledWith(4, 4, 0);
    });

    it("prevents default behavior for clear keys", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const backspaceEvent = new KeyboardEvent("keydown", { key: "Backspace" });
      const backspacePreventDefaultSpy = jest.spyOn(
        backspaceEvent,
        "preventDefault"
      );
      document.dispatchEvent(backspaceEvent);
      expect(backspacePreventDefaultSpy).toHaveBeenCalled();

      const deleteEvent = new KeyboardEvent("keydown", { key: "Delete" });
      const deletePreventDefaultSpy = jest.spyOn(deleteEvent, "preventDefault");
      document.dispatchEvent(deleteEvent);
      expect(deletePreventDefaultSpy).toHaveBeenCalled();

      const zeroEvent = new KeyboardEvent("keydown", { key: "0" });
      const zeroPreventDefaultSpy = jest.spyOn(zeroEvent, "preventDefault");
      document.dispatchEvent(zeroEvent);
      expect(zeroPreventDefaultSpy).toHaveBeenCalled();
    });

    it("does not call onNumberChange when clue cell is selected", () => {
      mockIsClueCell.mockReturnValue(true);

      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const event = new KeyboardEvent("keydown", { key: "Backspace" });
      document.dispatchEvent(event);

      expect(mockOnNumberChange).not.toHaveBeenCalled();
    });
  });

  describe("Invalid Keys", () => {
    it("ignores letter keys", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const event = new KeyboardEvent("keydown", { key: "a" });
      document.dispatchEvent(event);

      expect(mockOnNumberChange).not.toHaveBeenCalled();
    });

    it("ignores special character keys", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const keys = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"];

      keys.forEach((key) => {
        mockOnNumberChange.mockClear();
        const event = new KeyboardEvent("keydown", { key });
        document.dispatchEvent(event);
        expect(mockOnNumberChange).not.toHaveBeenCalled();
      });
    });

    it("ignores arrow keys (handled by grid component)", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

      arrowKeys.forEach((key) => {
        mockOnNumberChange.mockClear();
        const event = new KeyboardEvent("keydown", { key });
        document.dispatchEvent(event);
        expect(mockOnNumberChange).not.toHaveBeenCalled();
      });
    });

    it("ignores modifier keys (Shift, Control, Alt, Meta)", () => {
      renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      const modifierKeys = ["Shift", "Control", "Alt", "Meta"];

      modifierKeys.forEach((key) => {
        mockOnNumberChange.mockClear();
        const event = new KeyboardEvent("keydown", { key });
        document.dispatchEvent(event);
        expect(mockOnNumberChange).not.toHaveBeenCalled();
      });
    });
  });

  describe("Event Listener Cleanup", () => {
    it("removes event listener on unmount", () => {
      const { unmount } = renderHook(() =>
        useKeyboardInput({
          selectedCell: mockSelectedCell,
          onNumberChange: mockOnNumberChange,
          isClueCell: mockIsClueCell,
        })
      );

      // Verify listener works before unmount
      const event1 = new KeyboardEvent("keydown", { key: "5" });
      document.dispatchEvent(event1);
      expect(mockOnNumberChange).toHaveBeenCalledTimes(1);

      // Unmount hook
      unmount();
      mockOnNumberChange.mockClear();

      // Verify listener is removed after unmount
      const event2 = new KeyboardEvent("keydown", { key: "5" });
      document.dispatchEvent(event2);
      expect(mockOnNumberChange).not.toHaveBeenCalled();
    });
  });

  describe("Dynamic Props Updates", () => {
    it("respects updated selectedCell value", () => {
      const { rerender } = renderHook(
        ({ selectedCell }) =>
          useKeyboardInput({
            selectedCell,
            onNumberChange: mockOnNumberChange,
            isClueCell: mockIsClueCell,
          }),
        {
          initialProps: { selectedCell: mockSelectedCell },
        }
      );

      // Input works with initial selected cell
      const event1 = new KeyboardEvent("keydown", { key: "5" });
      document.dispatchEvent(event1);
      expect(mockOnNumberChange).toHaveBeenCalledWith(4, 4, 5);

      mockOnNumberChange.mockClear();

      // Update selected cell
      const newSelectedCell = { row: 2, col: 3 };
      rerender({ selectedCell: newSelectedCell });

      // Input works with new selected cell
      const event2 = new KeyboardEvent("keydown", { key: "7" });
      document.dispatchEvent(event2);
      expect(mockOnNumberChange).toHaveBeenCalledWith(2, 3, 7);
    });

    it("respects updated isClueCell function", () => {
      const newIsClueCell = jest.fn().mockReturnValue(true);

      const { rerender } = renderHook(
        ({ isClueCell }) =>
          useKeyboardInput({
            selectedCell: mockSelectedCell,
            onNumberChange: mockOnNumberChange,
            isClueCell,
          }),
        {
          initialProps: { isClueCell: mockIsClueCell },
        }
      );

      // Input works initially
      const event1 = new KeyboardEvent("keydown", { key: "5" });
      document.dispatchEvent(event1);
      expect(mockOnNumberChange).toHaveBeenCalledTimes(1);

      mockOnNumberChange.mockClear();

      // Update isClueCell to return true (clue cell selected)
      rerender({ isClueCell: newIsClueCell });

      // Input should now be blocked
      const event2 = new KeyboardEvent("keydown", { key: "7" });
      document.dispatchEvent(event2);
      expect(mockOnNumberChange).not.toHaveBeenCalled();
    });
  });
});
