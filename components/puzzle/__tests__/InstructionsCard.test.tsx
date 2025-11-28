import { render, screen, fireEvent } from "@testing-library/react";
import { InstructionsCard } from "../InstructionsCard";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("InstructionsCard", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("shows instructions on first visit", () => {
    render(<InstructionsCard />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("How to Play")).toBeInTheDocument();
  });

  it("does not show instructions if already seen", () => {
    localStorageMock.setItem("hasSeenInstructions", "true");
    render(<InstructionsCard />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays Sudoku rules", () => {
    render(<InstructionsCard />);
    expect(
      screen.getByText(/Fill the 9×9 grid so that each row, column, and 3×3 box/i)
    ).toBeInTheDocument();
  });

  it("provides mobile and desktop input instructions", () => {
    render(<InstructionsCard />);
    expect(screen.getByText(/Mobile:/i)).toBeInTheDocument();
    expect(screen.getByText(/Desktop:/i)).toBeInTheDocument();
  });

  it("sets localStorage when dismissed with button", () => {
    render(<InstructionsCard />);
    const gotItButton = screen.getByRole("button", { name: /got it/i });
    fireEvent.click(gotItButton);
    expect(localStorageMock.getItem("hasSeenInstructions")).toBe("true");
  });

  it("is dismissible with escape key", () => {
    render(<InstructionsCard />);
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    expect(localStorageMock.getItem("hasSeenInstructions")).toBe("true");
  });

  it("is accessible with proper ARIA attributes", () => {
    render(<InstructionsCard />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
