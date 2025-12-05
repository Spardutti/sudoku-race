import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteModeToggle } from "../NoteModeToggle";

describe("NoteModeToggle", () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  describe("Rendering", () => {
    it("renders toggle button with pencil icon", () => {
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button", { name: /note mode/i });
      expect(button).toBeInTheDocument();
    });

    it("shows inactive state when noteMode is false", () => {
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button", { name: /note mode/i });
      expect(button).not.toHaveClass("bg-gray-200");
    });

    it("shows active state when noteMode is true", () => {
      render(<NoteModeToggle noteMode={true} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button", { name: /note mode/i });
      expect(button).toHaveClass("bg-gray-200");
    });

    it("has correct ARIA label", () => {
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAccessibleName(/note mode/i);
    });

    it("is keyboard focusable", () => {
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:ring-2");
    });
  });

  describe("Interactions", () => {
    it("calls onToggle when clicked", async () => {
      const user = userEvent.setup();
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("toggles between active and inactive states", async () => {
      const { rerender } = render(
        <NoteModeToggle noteMode={false} onToggle={mockOnToggle} />
      );

      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("bg-gray-200");

      rerender(<NoteModeToggle noteMode={true} onToggle={mockOnToggle} />);
      expect(button).toHaveClass("bg-gray-200");
    });

    it("can be activated via keyboard (Enter)", async () => {
      const user = userEvent.setup();
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("can be activated via keyboard (Space)", async () => {
      const user = userEvent.setup();
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard(" ");

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe("Visual Design", () => {
    it("has border styling", () => {
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("border-2", "border-black");
    });

    it("applies active background color when note mode is on", () => {
      render(<NoteModeToggle noteMode={true} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gray-200");
    });

    it("has minimum tap target size for mobile", () => {
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("min-w-[44px]", "min-h-[44px]");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA role", () => {
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("is keyboard accessible", () => {
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      expect(button.tabIndex).toBe(0);
    });

    it("has visible focus indicator", () => {
      render(<NoteModeToggle noteMode={false} onToggle={mockOnToggle} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:ring-2");
    });
  });
});
