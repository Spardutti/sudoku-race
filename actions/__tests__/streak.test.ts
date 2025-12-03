import { updateStreak } from "../streak";
import { logger } from "@/lib/utils/logger";
import { createServerActionClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server");
jest.mock("@/lib/utils/logger");

const mockCreateServerActionClient = createServerActionClient as jest.MockedFunction<
  typeof createServerActionClient
>;

describe("updateStreak", () => {
  const userId = "test-user-123";

  let mockRpc: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockRpc = jest.fn();
    const mockSupabase = {
      rpc: mockRpc,
    };
    mockCreateServerActionClient.mockResolvedValue(mockSupabase as unknown);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should call RPC with correct parameters", async () => {
    jest.setSystemTime(new Date("2025-12-03T12:00:00Z"));
    mockRpc.mockResolvedValue({
      data: [
        {
          current_streak: 5,
          longest_streak: 10,
          last_completion_date: "2025-12-03",
          freeze_available: true,
          last_freeze_reset_date: null,
        },
      ],
      error: null,
    });

    const result = await updateStreak(userId);

    expect(result.success).toBe(true);
    expect(result.data?.currentStreak).toBe(5);
    expect(result.data?.longestStreak).toBe(10);
    expect(mockRpc).toHaveBeenCalledWith("update_user_streak", {
      p_user_id: userId,
      p_today: "2025-12-03",
    });
  });

  it("should validate userId before calling RPC", async () => {
    const result = await updateStreak("");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid user ID");
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("should handle RPC errors gracefully", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const result = await updateStreak(userId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update streak");
    expect(logger.error).toHaveBeenCalled();
  });

  it("should handle empty data response", async () => {
    mockRpc.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await updateStreak(userId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to update streak");
  });

  it("should handle null lastFreezeResetDate", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          current_streak: 3,
          longest_streak: 5,
          last_completion_date: "2025-12-03",
          freeze_available: false,
          last_freeze_reset_date: null,
        },
      ],
      error: null,
    });

    const result = await updateStreak(userId);

    expect(result.success).toBe(true);
    expect(result.data?.lastFreezeResetDate).toBeNull();
  });
});
