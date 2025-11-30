import { logShareEvent } from "../share";
import { createServerActionClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server", () => ({
  createServerActionClient: jest.fn(),
}));

describe("share actions", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => mockSupabase),
      insert: jest.fn(() => mockSupabase),
    };

    (createServerActionClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("logShareEvent", () => {
    const validParams = {
      puzzleId: "test-puzzle-id",
      channel: "twitter" as const,
      rankAtShare: 23,
    };

    it("successfully logs share event for authenticated user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSupabase.insert.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await logShareEvent(validParams);

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("share_events");
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: "user-123",
        puzzle_id: "test-puzzle-id",
        channel: "twitter",
        rank_at_share: 23,
      });
    });

    it("returns error when user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Not authenticated"),
      });

      const result = await logShareEvent(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not authenticated");
      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    it("returns error when database insert fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSupabase.insert.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      const result = await logShareEvent(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to log share event");
    });

    it("handles all channel types correctly", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSupabase.insert.mockResolvedValue({
        data: null,
        error: null,
      });

      const channels = ["twitter", "whatsapp", "clipboard"] as const;

      for (const channel of channels) {
        await logShareEvent({ ...validParams, channel });

        expect(mockSupabase.insert).toHaveBeenCalledWith(
          expect.objectContaining({ channel })
        );
      }
    });

    it("handles unexpected errors", async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error("Unexpected error"));

      const result = await logShareEvent(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe("An unexpected error occurred");
    });
  });
});
