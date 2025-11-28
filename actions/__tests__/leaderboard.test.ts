import { getHypotheticalRank } from "../leaderboard";
import { createServerClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server");

describe("getHypotheticalRank", () => {
  const mockCreateServerClient = createServerClient as jest.MockedFunction<
    typeof createServerClient
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return rank 1 when no completions exist", async () => {
    mockCreateServerClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            lt: jest.fn().mockResolvedValue({
              count: 0,
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const result = await getHypotheticalRank("puzzle-123", 300);

    expect(result).toEqual({ success: true, data: 1 });
  });

  it("should return correct rank when faster completions exist", async () => {
    mockCreateServerClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            lt: jest.fn().mockResolvedValue({
              count: 346,
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const result = await getHypotheticalRank("puzzle-123", 300);

    expect(result).toEqual({ success: true, data: 347 });
  });

  it("should handle database errors gracefully", async () => {
    mockCreateServerClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            lt: jest.fn().mockResolvedValue({
              count: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const result = await getHypotheticalRank("puzzle-123", 300);

    expect(result).toEqual({
      success: false,
      error: "Failed to calculate rank",
    });
  });

  it("should handle null count as 0", async () => {
    mockCreateServerClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            lt: jest.fn().mockResolvedValue({
              count: null,
              error: null,
            }),
          }),
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const result = await getHypotheticalRank("puzzle-123", 300);

    expect(result).toEqual({ success: true, data: 1 });
  });

  it("should query leaderboard with correct parameters", async () => {
    const mockLt = jest.fn().mockResolvedValue({ count: 10, error: null });
    const mockEq = jest.fn().mockReturnValue({ lt: mockLt });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    mockCreateServerClient.mockResolvedValue({
      from: mockFrom,
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    await getHypotheticalRank("puzzle-456", 250);

    expect(mockFrom).toHaveBeenCalledWith("leaderboards");
    expect(mockSelect).toHaveBeenCalledWith("*", {
      count: "exact",
      head: true,
    });
    expect(mockEq).toHaveBeenCalledWith("puzzle_id", "puzzle-456");
    expect(mockLt).toHaveBeenCalledWith("completion_time_seconds", 250);
  });

  it("should handle unexpected errors", async () => {
    mockCreateServerClient.mockRejectedValue(new Error("Network error"));

    const result = await getHypotheticalRank("puzzle-123", 300);

    expect(result).toEqual({
      success: false,
      error: "An unexpected error occurred",
    });
  });
});
