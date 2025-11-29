import { startTimer, submitCompletion } from "../puzzle";
import { createServerActionClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/get-current-user";

// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/auth/get-current-user");
jest.mock("@/lib/utils/logger");
jest.mock("@sentry/nextjs");

const mockCreateServerActionClient = createServerActionClient as jest.MockedFunction<
  typeof createServerActionClient
>;
const mockGetCurrentUserId = getCurrentUserId as jest.MockedFunction<
  typeof getCurrentUserId
>;

describe("Timer Server Actions", () => {
  const mockUserId = "user-123";
  const mockPuzzleId = "puzzle-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("startTimer", () => {
    it("sets started_at timestamp for new timer", async () => {
      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };

      mockCreateServerActionClient.mockResolvedValue(
        mockSupabase as unknown as Awaited<
          ReturnType<typeof createServerActionClient>
        >
      );

      const result = await startTimer(mockPuzzleId);

      expect(result.success).toBe(true);
      expect(result).toHaveProperty("data");
      if (result.success) {
        expect(result.data).toHaveProperty("startedAt");
        expect(typeof result.data.startedAt).toBe("string");
      }

      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          puzzle_id: mockPuzzleId,
          started_at: expect.any(String),
          is_complete: false,
          is_guest: false,
        }),
        {
          onConflict: "user_id,puzzle_id",
          ignoreDuplicates: false,
        }
      );
    });

    it("is idempotent - returns existing started_at if already set", async () => {
      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const existingStartedAt = "2025-11-28T10:00:00.000Z";

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest
          .fn()
          .mockResolvedValue({ data: { started_at: existingStartedAt } }),
        upsert: jest.fn(),
      };

      mockCreateServerActionClient.mockResolvedValue(
        mockSupabase as unknown as Awaited<
          ReturnType<typeof createServerActionClient>
        >
      );

      const result = await startTimer(mockPuzzleId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startedAt).toBe(existingStartedAt);
      }

      // Should NOT call upsert when timer already started
      expect(mockSupabase.upsert).not.toHaveBeenCalled();
    });

    it("returns error when user is not authenticated", async () => {
      mockGetCurrentUserId.mockResolvedValue(null);

      const result = await startTimer(mockPuzzleId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Unauthorized");
      }
    });

    it("handles database errors gracefully", async () => {
      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
        upsert: jest
          .fn()
          .mockResolvedValue({ error: { message: "Database error" } }),
      };

      mockCreateServerActionClient.mockResolvedValue(
        mockSupabase as unknown as Awaited<
          ReturnType<typeof createServerActionClient>
        >
      );

      const result = await startTimer(mockPuzzleId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Failed to start timer");
      }
    });
  });

  describe("submitCompletion", () => {
    const mockUserEntries = Array(9)
      .fill(null)
      .map(() => Array(9).fill(1));

    // Note: Detailed timing tests are covered by integration tests
    // These unit tests focus on error handling and basic flow

    it("returns error when user is not authenticated", async () => {
      mockGetCurrentUserId.mockResolvedValue(null);

      const result = await submitCompletion(mockPuzzleId, mockUserEntries);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Unauthorized");
      }
    });

    it("returns error when timer was not started", async () => {
      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      };

      mockCreateServerActionClient.mockResolvedValue(
        mockSupabase as unknown as Awaited<
          ReturnType<typeof createServerActionClient>
        >
      );

      const result = await submitCompletion(mockPuzzleId, mockUserEntries);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Timer not started");
      }
    });

    it("handles database errors gracefully", async () => {
      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { started_at: new Date().toISOString() },
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: "Database error" },
          }),
        }),
      };

      mockCreateServerActionClient.mockResolvedValue(
        mockSupabase as unknown as Awaited<
          ReturnType<typeof createServerActionClient>
        >
      );

      const result = await submitCompletion(mockPuzzleId, mockUserEntries);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Failed to submit completion");
      }
    });
  });
});
