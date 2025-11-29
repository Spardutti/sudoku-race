import { render, screen } from "@testing-library/react";
import { LeaderboardTable } from "../LeaderboardTable";
import type { LeaderboardEntry, PersonalRank } from "@/actions/leaderboard";

describe("LeaderboardTable", () => {
  const mockEntries: LeaderboardEntry[] = [
    { rank: 1, username: "Alice", completion_time_seconds: 120 },
    { rank: 2, username: "Bob", completion_time_seconds: 150 },
    { rank: 3, username: "Charlie", completion_time_seconds: 180 },
  ];

  it("renders leaderboard table with entries", () => {
    render(<LeaderboardTable entries={mockEntries} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("displays rank, username, and time columns", () => {
    render(<LeaderboardTable entries={mockEntries} />);

    expect(screen.getByText("Rank")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });

  it("formats time correctly (MM:SS)", () => {
    render(<LeaderboardTable entries={mockEntries} />);

    expect(screen.getByText("02:00")).toBeInTheDocument();
    expect(screen.getByText("02:30")).toBeInTheDocument();
    expect(screen.getByText("03:00")).toBeInTheDocument();
  });

  it("highlights personal rank when inside top 100", () => {
    const personalRank: PersonalRank = {
      rank: 2,
      completion_time_seconds: 150,
    };

    const { container } = render(
      <LeaderboardTable entries={mockEntries} personalRank={personalRank} />
    );

    const rows = container.querySelectorAll("tbody tr");
    expect(rows[1]).toHaveClass("bg-blue-50");
    expect(rows[1]).toHaveClass("font-bold");
  });

  it("does not highlight rows when personal rank is outside top 100", () => {
    const personalRank: PersonalRank = {
      rank: 150,
      completion_time_seconds: 300,
    };

    const { container } = render(
      <LeaderboardTable entries={mockEntries} personalRank={personalRank} />
    );

    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).not.toHaveClass("bg-blue-50");
    expect(rows[1]).not.toHaveClass("bg-blue-50");
  });

  it("applies zebra striping to rows", () => {
    const { container } = render(<LeaderboardTable entries={mockEntries} />);

    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveClass("bg-white");
    expect(rows[1]).toHaveClass("bg-gray-50");
    expect(rows[2]).toHaveClass("bg-white");
  });

  it("displays rank with # prefix", () => {
    render(<LeaderboardTable entries={mockEntries} />);

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
  });

  it("renders aria-label for accessibility", () => {
    render(<LeaderboardTable entries={mockEntries} />);

    const table = screen.getByLabelText("Daily leaderboard");
    expect(table).toBeInTheDocument();
  });
});
