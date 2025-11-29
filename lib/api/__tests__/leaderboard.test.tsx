import { leaderboardKeys, useLeaderboardQuery } from "../leaderboard";
import { getLeaderboard } from "@/actions/leaderboard";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

jest.mock("@/actions/leaderboard");

describe("Leaderboard API", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("leaderboardKeys", () => {
    it("generates correct query key", () => {
      const { queryKey } = leaderboardKeys.list("puzzle-123");
      expect(queryKey).toEqual(["leaderboard", "list", "puzzle-123"]);
    });

    it("queryFn calls getLeaderboard", async () => {
      const mockData = [
        { rank: 1, username: "Alice", completion_time_seconds: 120 },
      ];
      (getLeaderboard as jest.Mock).mockResolvedValue({
        success: true,
        data: mockData,
      });

      const { queryFn } = leaderboardKeys.list("puzzle-123");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await queryFn({} as any);
      expect(result).toEqual(mockData);
    });

    it("throws error when getLeaderboard fails", async () => {
      (getLeaderboard as jest.Mock).mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const { queryFn } = leaderboardKeys.list("puzzle-123");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(queryFn({} as any)).rejects.toThrow("Database error");
    });
  });

  describe("useLeaderboardQuery", () => {
    it("fetches leaderboard data", async () => {
      const mockData = [
        { rank: 1, username: "Alice", completion_time_seconds: 120 },
      ];
      (getLeaderboard as jest.Mock).mockResolvedValue({
        success: true,
        data: mockData,
      });

      const { result } = renderHook(
        () => useLeaderboardQuery({ puzzleId: "test-puzzle" }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });

    it("does not fetch when disabled", () => {
      renderHook(
        () => useLeaderboardQuery({ puzzleId: "test", enabled: false }),
        { wrapper }
      );

      expect(getLeaderboard).not.toHaveBeenCalled();
    });

    it("handles errors correctly", async () => {
      (getLeaderboard as jest.Mock).mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const { result} = renderHook(
        () => useLeaderboardQuery({ puzzleId: "test-puzzle" }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });
  });
});
