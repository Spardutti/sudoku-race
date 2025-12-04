import { startTimer, submitCompletion } from "../puzzle";
import { createServerActionClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { submissionLimiter } from "@/lib/abuse-prevention/rate-limiters";
import { getClientIP } from "@/lib/utils/ip-utils";
import { headers } from "next/headers";
import { updateStreak } from "../streak";

// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/auth/get-current-user");
jest.mock("@/lib/utils/logger");
jest.mock("@sentry/nextjs");
jest.mock("@/lib/abuse-prevention/rate-limiters");
jest.mock("@/lib/utils/ip-utils");
jest.mock("next/headers");
jest.mock("../streak");

const mockCreateServerActionClient = createServerActionClient as jest.MockedFunction<
  typeof createServerActionClient
>;
const mockGetCurrentUserId = getCurrentUserId as jest.MockedFunction<
  typeof getCurrentUserId
>;
const mockSubmissionLimiter = submissionLimiter as jest.Mocked<typeof submissionLimiter>;
const mockGetClientIP = getClientIP as jest.MockedFunction<typeof getClientIP>;
const mockHeaders = headers as jest.MockedFunction<typeof headers>;

describe("Timer Server Actions", () => {
  const mockUserId = "user-123";
  const mockPuzzleId = "puzzle-456";

  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers() as unknown as ReturnType<typeof headers>);
    mockGetClientIP.mockReturnValue("127.0.0.1");
    mockSubmissionLimiter.check = jest.fn().mockResolvedValue(undefined);
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

      const startedAt = new Date(Date.now() - 150 * 1000).toISOString();

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { started_at: startedAt },
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: { message: "Database error" },
            }),
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

    it("rejects completion when time is less than 60 seconds (AC2)", async () => {
      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        writable: true,
        configurable: true,
      });

      const startedAt = new Date(Date.now() - 30 * 1000).toISOString();

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { started_at: startedAt },
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
        expect(result.error).toContain("Minimum time: 1 minute");
      }

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it("flags completion when time is less than 120 seconds (AC3)", async () => {
      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const startedAt = new Date(Date.now() - 90 * 1000).toISOString();

      const mockSupabase = {
        from: jest.fn().mockImplementation((table: string) => {
          if (table === "completions") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              maybeSingle: jest.fn().mockResolvedValue({
                data: { started_at: startedAt },
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ error: null }),
                }),
              }),
            };
          } else if (table === "leaderboards") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              lt: jest.fn().mockResolvedValue({ count: 5 }),
              upsert: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return mockSupabase;
        }),
      };

      mockCreateServerActionClient.mockResolvedValue(
        mockSupabase as unknown as Awaited<
          ReturnType<typeof createServerActionClient>
        >
      );

      const result = await submitCompletion(mockPuzzleId, mockUserEntries);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.flagged).toBe(true);
        expect(result.data.completionTime).toBeGreaterThanOrEqual(60);
        expect(result.data.completionTime).toBeLessThan(120);
      }
    });

    it("does not flag completion when time is 120 seconds or more (AC3)", async () => {
      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const startedAt = new Date(Date.now() - 150 * 1000).toISOString();

      const mockSupabase = {
        from: jest.fn().mockImplementation((table: string) => {
          if (table === "completions") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              maybeSingle: jest.fn().mockResolvedValue({
                data: { started_at: startedAt },
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  eq: jest.fn().mockResolvedValue({ error: null }),
                }),
              }),
            };
          } else if (table === "leaderboards") {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              lt: jest.fn().mockResolvedValue({ count: 10 }),
              upsert: jest.fn().mockResolvedValue({ error: null }),
            };
          }
          return mockSupabase;
        }),
      };

      mockCreateServerActionClient.mockResolvedValue(
        mockSupabase as unknown as Awaited<
          ReturnType<typeof createServerActionClient>
        >
      );

      const result = await submitCompletion(mockPuzzleId, mockUserEntries);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.flagged).toBe(false);
        expect(result.data.completionTime).toBeGreaterThanOrEqual(120);
      }
    });

    it("rejects completion when rate limit exceeded (AC4)", async () => {
      mockGetCurrentUserId.mockResolvedValue(mockUserId);
      mockSubmissionLimiter.check = jest.fn().mockRejectedValue(new Error("Rate limit exceeded"));

      const result = await submitCompletion(mockPuzzleId, mockUserEntries);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Too many attempts");
      }

      expect(mockSubmissionLimiter.check).toHaveBeenCalledWith(3, mockUserId);
    });

    it("should update user streak after successful completion", async () => {
      const mockUserId = "user-123";
      const mockPuzzleId = "puzzle-456";
      const mockUserEntries = Array(9).fill(Array(9).fill(5));

      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { started_at: new Date(Date.now() - 120000).toISOString() },
        }),
        single: jest.fn(),
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };

      mockCreateServerActionClient.mockResolvedValue(mockSupabase as never);

      const mockStreakData = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletionDate: "2025-12-03",
        freezeAvailable: true,
        lastFreezeResetDate: null,
        freezeWasUsed: false,
        streakWasReset: false,
      };

      (updateStreak as jest.MockedFunction<typeof updateStreak>).mockResolvedValue({
        success: true,
        data: mockStreakData,
      } as never);

      const result = await submitCompletion(mockPuzzleId, mockUserEntries);

      expect(result.success).toBe(true);
      expect(updateStreak).toHaveBeenCalledWith(mockUserId);
      if (result.success) {
        expect(result.data.streakData).toEqual(mockStreakData);
      }
    });

    it("should not fail completion if streak update fails", async () => {
      const mockUserId = "user-123";
      const mockPuzzleId = "puzzle-456";
      const mockUserEntries = Array(9).fill(Array(9).fill(5));

      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { started_at: new Date(Date.now() - 120000).toISOString() },
        }),
        single: jest.fn(),
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };

      mockCreateServerActionClient.mockResolvedValue(mockSupabase as never);

      (updateStreak as jest.MockedFunction<typeof updateStreak>).mockResolvedValue({
        success: false,
        error: "Streak update failed",
      });

      const result = await submitCompletion(mockPuzzleId, mockUserEntries);

      expect(result.success).toBe(true);
      expect(updateStreak).toHaveBeenCalledWith(mockUserId);
      if (result.success) {
        expect(result.data.streakData).toBeUndefined();
      }
    });
  });
});
