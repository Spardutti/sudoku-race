import { render, screen, waitFor } from "@testing-library/react";
import { LeaderboardTable } from "../LeaderboardTable";
import { useLeaderboardQuery } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  useLeaderboardQuery: jest.fn(),
}));

describe("LeaderboardTable", () => {
  it("displays initial entries while loading", () => {
    (useLeaderboardQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <LeaderboardTable
        puzzleId="test-puzzle"
        puzzleNumber={1}
        initialEntries={[
          {
            rank: 1,
            username: "Alice",
            completion_time_seconds: 120,
            user_id: "user-1",
          },
        ]}
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("displays polled data when available", async () => {
    const polledData = [
      {
        rank: 1,
        username: "Bob",
        completion_time_seconds: 100,
        user_id: "user-2",
      },
    ];

    (useLeaderboardQuery as jest.Mock).mockReturnValue({
      data: polledData,
      isLoading: false,
    });

    render(
      <LeaderboardTable
        puzzleId="test-puzzle"
        puzzleNumber={1}
        initialEntries={[
          {
            rank: 1,
            username: "Alice",
            completion_time_seconds: 120,
            user_id: "user-1",
          },
        ]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  it("highlights personal rank when in top 100", () => {
    (useLeaderboardQuery as jest.Mock).mockReturnValue({
      data: [
        {
          rank: 1,
          username: "Alice",
          completion_time_seconds: 120,
          user_id: "user-1",
        },
      ],
      isLoading: false,
    });

    render(
      <LeaderboardTable
        puzzleId="test-puzzle"
        puzzleNumber={1}
        initialEntries={[]}
        currentUserId="user-1"
      />
    );

    const row = screen.getByText("Alice").closest("tr");
    expect(row).toHaveClass("bg-yellow-50");
    expect(row).toHaveClass("border-l-yellow-500");
    expect(row).toHaveAttribute("aria-current", "true");
  });

  it("displays trophy icon for top 3 ranks", () => {
    (useLeaderboardQuery as jest.Mock).mockReturnValue({
      data: [
        {
          rank: 1,
          username: "Gold",
          completion_time_seconds: 100,
          user_id: "user-1",
        },
        {
          rank: 2,
          username: "Silver",
          completion_time_seconds: 110,
          user_id: "user-2",
        },
        {
          rank: 3,
          username: "Bronze",
          completion_time_seconds: 120,
          user_id: "user-3",
        },
      ],
      isLoading: false,
    });

    render(
      <LeaderboardTable puzzleId="test-puzzle" puzzleNumber={1} initialEntries={[]} />
    );

    expect(screen.getByText("🥇")).toBeInTheDocument();
    expect(screen.getByText("🥈")).toBeInTheDocument();
    expect(screen.getByText("🥉")).toBeInTheDocument();
  });

  it("displays correct ranking and time", () => {
    (useLeaderboardQuery as jest.Mock).mockReturnValue({
      data: [
        {
          rank: 1,
          username: "Alice",
          completion_time_seconds: 125,
          user_id: "user-1",
        },
      ],
      isLoading: false,
    });

    render(
      <LeaderboardTable puzzleId="test-puzzle" puzzleNumber={1} initialEntries={[]} />
    );

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });

  it("polls when enabled", () => {
    (useLeaderboardQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(
      <LeaderboardTable puzzleId="test-puzzle" puzzleNumber={1} initialEntries={[]} />
    );

    expect(useLeaderboardQuery).toHaveBeenCalledWith({
      puzzleId: "test-puzzle",
      enabled: true,
    });
  });
});
