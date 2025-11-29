import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders empty state message", () => {
    render(<EmptyState />);

    expect(
      screen.getByText(/Be the first to complete today's puzzle!/i)
    ).toBeInTheDocument();
  });

  it("displays link to puzzle page", () => {
    render(<EmptyState />);

    const link = screen.getByRole("link", { name: /Start Today's Puzzle/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/puzzle");
  });
});
