import { render, screen } from "@testing-library/react";
import { LeaderboardSkeleton } from "../LeaderboardSkeleton";

describe("LeaderboardSkeleton", () => {
  it("renders table structure", () => {
    render(<LeaderboardSkeleton />);

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(<LeaderboardSkeleton />);

    expect(screen.getByText("Rank")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });

  it("renders 10 skeleton rows", () => {
    const { container } = render(<LeaderboardSkeleton />);

    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(10);
  });

  it("applies zebra striping to skeleton rows", () => {
    const { container } = render(<LeaderboardSkeleton />);

    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveClass("bg-white");
    expect(rows[1]).toHaveClass("bg-gray-50");
    expect(rows[2]).toHaveClass("bg-white");
  });

  it("has animate-pulse class on shimmer elements", () => {
    const { container } = render(<LeaderboardSkeleton />);

    const shimmerElements = container.querySelectorAll(".animate-pulse");
    expect(shimmerElements.length).toBeGreaterThan(0);
  });
});
