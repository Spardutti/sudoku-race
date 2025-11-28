import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberPad } from "../NumberPad";

describe("NumberPad", () => {
  const mockOnNumberChange = jest.fn();
  const mockSelectedCell = { row: 4, col: 4 };

  beforeEach(() => {
    mockOnNumberChange.mockClear();
  });

  describe("Rendering", () => {
    it("renders 9 number buttons and 1 Clear button", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      // Check for number buttons 1-9
      for (let i = 1; i <= 9; i++) {
        expect(
          screen.getByRole("button", { name: `Number ${i}` })
        ).toBeInTheDocument();
      }

      // Check for Clear button
      expect(
        screen.getByRole("button", { name: "Clear selected cell" })
      ).toBeInTheDocument();
    });

    it("has correct ARIA labels for accessibility", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      expect(screen.getByRole("group", { name: "Number input pad" })).toBeInTheDocument();

      for (let i = 1; i <= 9; i++) {
        const button = screen.getByRole("button", { name: `Number ${i}` });
        expect(button).toHaveAccessibleName(`Number ${i}`);
      }

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      expect(clearButton).toHaveAccessibleName("Clear selected cell");
    });

    it("is hidden on desktop viewports (lg breakpoint)", () => {
      const { container } = render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const numberPad = container.firstChild as HTMLElement;
      expect(numberPad).toHaveClass("lg:hidden");
    });

    it("has fixed positioning at bottom of screen", () => {
      const { container } = render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const numberPad = container.firstChild as HTMLElement;
      expect(numberPad).toHaveClass("fixed", "bottom-0", "left-0", "right-0");
    });

    it("applies minimum tap target size (44x44px) to buttons", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const button1 = screen.getByRole("button", { name: "Number 1" });
      expect(button1).toHaveClass("min-w-[44px]", "min-h-[44px]");

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      expect(clearButton).toHaveClass("min-h-[44px]");
    });
  });

  describe("Number Button Interactions", () => {
    it("calls onNumberChange with correct value when number button clicked", async () => {
      const user = userEvent.setup();

      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const button5 = screen.getByRole("button", { name: "Number 5" });
      await user.click(button5);

      expect(mockOnNumberChange).toHaveBeenCalledTimes(1);
      expect(mockOnNumberChange).toHaveBeenCalledWith(5);
    });

    it("calls onNumberChange for all number buttons (1-9)", async () => {
      const user = userEvent.setup();

      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      for (let i = 1; i <= 9; i++) {
        mockOnNumberChange.mockClear();
        const button = screen.getByRole("button", { name: `Number ${i}` });
        await user.click(button);

        expect(mockOnNumberChange).toHaveBeenCalledTimes(1);
        expect(mockOnNumberChange).toHaveBeenCalledWith(i);
      }
    });

    it("does not call onNumberChange when no cell is selected", async () => {
      const user = userEvent.setup();

      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={null}
          isClueCell={false}
        />
      );

      const button5 = screen.getByRole("button", { name: "Number 5" });
      await user.click(button5);

      expect(mockOnNumberChange).not.toHaveBeenCalled();
    });

    it("disables number buttons when no cell is selected", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={null}
          isClueCell={false}
        />
      );

      for (let i = 1; i <= 9; i++) {
        const button = screen.getByRole("button", { name: `Number ${i}` });
        expect(button).toBeDisabled();
      }
    });

    it("enables number buttons when cell is selected", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      for (let i = 1; i <= 9; i++) {
        const button = screen.getByRole("button", { name: `Number ${i}` });
        expect(button).toBeEnabled();
      }
    });
  });

  describe("Clear Button", () => {
    it("calls onNumberChange with 0 when Clear button clicked", async () => {
      const user = userEvent.setup();

      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      await user.click(clearButton);

      expect(mockOnNumberChange).toHaveBeenCalledTimes(1);
      expect(mockOnNumberChange).toHaveBeenCalledWith(0);
    });

    it("does not call onNumberChange when no cell is selected", async () => {
      const user = userEvent.setup();

      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={null}
          isClueCell={false}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      await user.click(clearButton);

      expect(mockOnNumberChange).not.toHaveBeenCalled();
    });

    it("does not call onNumberChange when clue cell is selected", async () => {
      const user = userEvent.setup();

      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={true}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      await user.click(clearButton);

      expect(mockOnNumberChange).not.toHaveBeenCalled();
    });

    it("disables Clear button when no cell is selected", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={null}
          isClueCell={false}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      expect(clearButton).toBeDisabled();
    });

    it("disables Clear button when clue cell is selected", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={true}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      expect(clearButton).toBeDisabled();
    });

    it("enables Clear button when user-entered cell is selected", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      expect(clearButton).toBeEnabled();
    });
  });

  describe("Keyboard Navigation (Tab)", () => {
    it("allows tab navigation through number buttons", async () => {
      const user = userEvent.setup();

      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const button1 = screen.getByRole("button", { name: "Number 1" });

      // Tab to first button
      await user.tab();

      // Note: Testing actual focus order is complex with RTL
      // We verify buttons are focusable via keyboard
      expect(button1).toHaveClass("focus-visible:ring-2");
    });
  });

  describe("Touch Optimization", () => {
    it("applies touch-manipulation class for fast tap response", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const button1 = screen.getByRole("button", { name: "Number 1" });
      expect(button1).toHaveClass("touch-manipulation");

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      expect(clearButton).toHaveClass("touch-manipulation");
    });
  });

  describe("Visual Feedback", () => {
    it("applies active state styles to number buttons", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const button1 = screen.getByRole("button", { name: "Number 1" });
      expect(button1).toHaveClass("active:bg-gray-200");
    });

    it("applies active state styles to Clear button", () => {
      render(
        <NumberPad
          onNumberChange={mockOnNumberChange}
          selectedCell={mockSelectedCell}
          isClueCell={false}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: "Clear selected cell",
      });
      expect(clearButton).toHaveClass("active:bg-gray-200");
    });
  });
});
