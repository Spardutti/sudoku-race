import { render, screen } from "@testing-library/react";
import { LeaderboardHeader } from "../LeaderboardHeader";

describe("LeaderboardHeader", () => {
  it("renders with correct title format", () => {
    render(
      <LeaderboardHeader
        puzzleDate="2025-12-01"
        puzzleNumber={20251201}
        totalCompletions={42}
      />
    );

    expect(
      screen.getByRole("heading", { level: 1 })
    ).toHaveTextContent("Daily Leaderboard - December 1, 2025 #20251201");
  });

  it("renders total completions with singular 'player'", () => {
    render(
      <LeaderboardHeader
        puzzleDate="2025-12-01"
        puzzleNumber={20251201}
        totalCompletions={1}
      />
    );

    expect(screen.getByText(/1 player completed/i)).toBeInTheDocument();
  });

  it("renders total completions with plural 'players'", () => {
    render(
      <LeaderboardHeader
        puzzleDate="2025-12-01"
        puzzleNumber={20251201}
        totalCompletions={42}
      />
    );

    expect(screen.getByText(/42 players completed/i)).toBeInTheDocument();
  });

  it("formats date correctly", () => {
    render(
      <LeaderboardHeader
        puzzleDate="2025-01-15"
        puzzleNumber={20250115}
        totalCompletions={10}
      />
    );

    expect(screen.getByText(/January 15, 2025/i)).toBeInTheDocument();
  });
});
