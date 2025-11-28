import { render, screen } from "@testing-library/react";
import { PuzzleHeader } from "../PuzzleHeader";

describe("PuzzleHeader", () => {
  it("renders title correctly", () => {
    render(<PuzzleHeader puzzleDate="2025-11-28" />);
    expect(screen.getByRole("heading", { name: "Today's Puzzle" })).toBeInTheDocument();
  });

  it("formats date correctly", () => {
    render(<PuzzleHeader puzzleDate="2025-11-28" />);
    expect(screen.getByText("November 28, 2025")).toBeInTheDocument();
  });

  it("displays puzzle number when provided", () => {
    render(<PuzzleHeader puzzleDate="2025-11-28" puzzleNumber={42} />);
    expect(screen.getByText("#42")).toBeInTheDocument();
  });

  it("omits puzzle number when not provided", () => {
    render(<PuzzleHeader puzzleDate="2025-11-28" />);
    expect(screen.queryByText(/#\d+/)).not.toBeInTheDocument();
  });

  it("uses semantic time element with correct dateTime", () => {
    render(<PuzzleHeader puzzleDate="2025-11-28" />);
    const timeElement = screen.getByText("November 28, 2025");
    expect(timeElement.tagName).toBe("TIME");
    expect(timeElement).toHaveAttribute("dateTime", "2025-11-28");
  });

  it("applies responsive classes for mobile and desktop", () => {
    const { container } = render(<PuzzleHeader puzzleDate="2025-11-28" puzzleNumber={1} />);
    const headerContainer = container.querySelector("div");
    expect(headerContainer).toHaveClass("flex-col", "sm:flex-row");
  });
});
