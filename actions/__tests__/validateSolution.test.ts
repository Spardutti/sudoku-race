import { validateSolution } from "../puzzle";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { validationLimiter } from "@/lib/abuse-prevention/rate-limiters";
import { headers } from "next/headers";

jest.mock("@/lib/supabase/server");
jest.mock("@/lib/auth/get-current-user");
jest.mock("@/lib/abuse-prevention/rate-limiters");
jest.mock("@/lib/utils/logger");
jest.mock("@sentry/nextjs");
jest.mock("next/headers");

const mockCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;
const mockGetCurrentUserId = getCurrentUserId as jest.MockedFunction<
  typeof getCurrentUserId
>;
const mockValidationLimiter = validationLimiter as jest.Mocked<
  typeof validationLimiter
>;
const mockHeaders = headers as jest.MockedFunction<typeof headers>;

describe("validateSolution", () => {
  const mockPuzzleId = "puzzle-123";
  const validSolution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  const invalidSudoku = [
    [1, 1, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUserId.mockResolvedValue("user-123");
    mockHeaders.mockResolvedValue(new Headers());
    mockValidationLimiter.check.mockResolvedValue(undefined);
  });

  it("validates correct Sudoku solution", async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { solution: validSolution },
        error: null,
      }),
    };

    mockCreateServerClient.mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof createServerClient>>
    );

    const result = await validateSolution(mockPuzzleId, validSolution);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isValid).toBe(true);
    }
  });

  it("rejects invalid Sudoku (duplicate in row)", async () => {
    const result = await validateSolution(mockPuzzleId, invalidSudoku);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isValid).toBe(false);
    }
  });

  it("rejects solution that doesn't match stored solution", async () => {
    const differentSolution = [
      [9, 3, 4, 6, 7, 8, 5, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ];

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { solution: validSolution },
        error: null,
      }),
    };

    mockCreateServerClient.mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof createServerClient>>
    );

    const result = await validateSolution(mockPuzzleId, differentSolution);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isValid).toBe(false);
    }
  });

  it("returns error for invalid grid format", async () => {
    const invalidGrid = [[1, 2, 3]];

    const result = await validateSolution(
      mockPuzzleId,
      invalidGrid as number[][]
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Invalid solution format");
    }
  });

  it("respects rate limiting", async () => {
    mockValidationLimiter.check.mockRejectedValue(new Error("Rate limit"));

    const result = await validateSolution(mockPuzzleId, validSolution);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Too many attempts");
    }
  });
});
