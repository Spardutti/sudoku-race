import { render, screen } from "@testing-library/react";
import { StatsDisplay } from "../StatsDisplay";
import { NextIntlClientProvider } from "next-intl";

const messages = {
  profile: {
    stats: "Statistics",
    easyStats: "Easy Stats",
    mediumStats: "Medium Stats",
    combinedStats: "Combined Stats",
    totalSolved: "Total Solved",
    totalPuzzlesSolved: "Total Sudokus Solved",
    averageTime: "Average Time",
    bestTime: "Best Time",
    currentStreak: "Current Streak",
    perfectDayStreak: "Perfect Day Streak",
    longestStreak: "Longest Streak",
    completeFirstPuzzle: "Complete your first sudoku to see your stats!",
  },
};

describe("StatsDisplay", () => {
  const mockEasyStats = {
    totalSolved: 10,
    averageTime: 300,
    bestTime: 180,
  };

  const mockMediumStats = {
    totalSolved: 5,
    averageTime: 600,
    bestTime: 420,
  };

  const mockCombinedStats = {
    totalPuzzles: 15,
  };

  const mockStreak = {
    currentStreak: 7,
    longestStreak: 12,
    perfectDayStreak: 3,
  };

  it("should show empty state when no puzzles completed", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StatsDisplay
          easyStats={{ totalSolved: 0, averageTime: null, bestTime: null }}
          mediumStats={{ totalSolved: 0, averageTime: null, bestTime: null }}
          combinedStats={{ totalPuzzles: 0 }}
          streak={null}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Complete your first sudoku to see your stats!")).toBeInTheDocument();
  });

  it("should render side-by-side difficulty stats", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StatsDisplay
          easyStats={mockEasyStats}
          mediumStats={mockMediumStats}
          combinedStats={mockCombinedStats}
          streak={mockStreak}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("Easy Stats")).toBeInTheDocument();
    expect(screen.getByText("Medium Stats")).toBeInTheDocument();
    expect(screen.getByText("Combined Stats")).toBeInTheDocument();
  });

  it("should display easy stats correctly", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StatsDisplay
          easyStats={mockEasyStats}
          mediumStats={mockMediumStats}
          combinedStats={mockCombinedStats}
          streak={mockStreak}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5:00")).toBeInTheDocument();
    expect(screen.getByText("3:00")).toBeInTheDocument();
  });

  it("should display medium stats correctly", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StatsDisplay
          easyStats={mockEasyStats}
          mediumStats={mockMediumStats}
          combinedStats={mockCombinedStats}
          streak={mockStreak}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("7:00")).toBeInTheDocument();
  });

  it("should display combined stats correctly", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StatsDisplay
          easyStats={mockEasyStats}
          mediumStats={mockMediumStats}
          combinedStats={mockCombinedStats}
          streak={mockStreak}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("should handle null times with em dash", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StatsDisplay
          easyStats={{ totalSolved: 1, averageTime: null, bestTime: null }}
          mediumStats={{ totalSolved: 0, averageTime: null, bestTime: null }}
          combinedStats={{ totalPuzzles: 1 }}
          streak={mockStreak}
        />
      </NextIntlClientProvider>
    );

    const emDashes = screen.getAllByText("—");
    expect(emDashes.length).toBeGreaterThan(0);
  });

  it("should handle null streak data", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StatsDisplay
          easyStats={mockEasyStats}
          mediumStats={mockMediumStats}
          combinedStats={mockCombinedStats}
          streak={null}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should use responsive grid layout", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StatsDisplay
          easyStats={mockEasyStats}
          mediumStats={mockMediumStats}
          combinedStats={mockCombinedStats}
          streak={mockStreak}
        />
      </NextIntlClientProvider>
    );

    const difficultyGrid = container.querySelector(".grid-cols-1.md\\:grid-cols-2");
    expect(difficultyGrid).toBeInTheDocument();
  });
});
