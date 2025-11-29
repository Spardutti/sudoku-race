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
        initialEntries={[]}
        currentUserId="user-1"
      />
    );

    const row = screen.getByText("Alice").closest("tr");
    expect(row).toHaveClass("bg-blue-50");
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
      <LeaderboardTable puzzleId="test-puzzle" initialEntries={[]} />
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
      <LeaderboardTable puzzleId="test-puzzle" initialEntries={[]} />
    );

    expect(useLeaderboardQuery).toHaveBeenCalledWith({
      puzzleId: "test-puzzle",
      enabled: true,
    });
  });
});
