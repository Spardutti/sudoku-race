/**
 * Puzzle Server Actions Unit Tests (Story 2.1)
 *
 * Tests getPuzzleToday() and validatePuzzle() server actions.
 * Verifies puzzle retrieval, solution validation, and security constraints.
 *
 * @see docs/stories/2-1-daily-puzzle-system-data-management.md (Task 7)
 * @see docs/tech-spec-epic-2.md (Sections 2.2, 2.8)
 */

import { getPuzzleToday, validatePuzzle } from "@/actions/puzzle";

// Mock Supabase server client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
};

jest.mock("@/lib/supabase/server", () => ({
  createServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Mock logger to prevent console output during tests
jest.mock("@/lib/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock rate limiter
jest.mock("@/lib/utils/rate-limit", () => ({
  rateLimit: jest.fn(() => ({
    check: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock headers and IP utils
jest.mock("next/headers", () => ({
  headers: jest.fn(() => Promise.resolve(new Map())),
}));

jest.mock("@/lib/utils/ip-utils", () => ({
  getClientIP: jest.fn(() => "127.0.0.1"),
}));

describe("getPuzzleToday()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AC2: Puzzle Retrieval - Success Cases", () => {
    it("should fetch today's puzzle successfully", async () => {
      const mockPuzzleData = {
        id: "puzzle-123",
        puzzle_date: "2025-11-16",
        puzzle_data: Array(9).fill(Array(9).fill(0)),
        difficulty: "medium",
        solution: Array(9).fill(Array(9).fill(5)), // Should NOT be returned
      };

      // Mock Supabase query chain
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockPuzzleData,
        error: null,
      });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const result = await getPuzzleToday();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("puzzle-123");
        expect(result.data.puzzle_date).toBe("2025-11-16");
        expect(result.data.difficulty).toBe("medium");
        expect(result.data.puzzle_data).toBeDefined();
      }

      // Verify Supabase query structure
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("puzzles");
      expect(mockSelect).toHaveBeenCalledWith(
        "id, puzzle_date, puzzle_data, difficulty"
      );
    });

    it("should calculate UTC date correctly", async () => {
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "No puzzle found" },
      });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq,
          single: mockSingle,
        }),
      });

      await getPuzzleToday();

      // Verify UTC date format (YYYY-MM-DD)
      const expectedDate = new Date().toISOString().split("T")[0];
      expect(mockEq).toHaveBeenCalledWith("puzzle_date", expectedDate);
    });

    it("should NEVER return solution field (security critical)", async () => {
      const mockPuzzleData = {
        id: "puzzle-456",
        puzzle_date: "2025-11-16",
        puzzle_data: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
        difficulty: "medium",
      };

      const mockSelect = jest.fn().mockReturnThis();
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPuzzleData,
          error: null,
        }),
      });

      const result = await getPuzzleToday();

      // Verify SELECT query does NOT include 'solution' field
      expect(mockSelect).toHaveBeenCalledWith(
        expect.not.stringContaining("solution")
      );

      // Verify returned data does not contain solution
      if (result.success) {
        expect(result.data).not.toHaveProperty("solution");
      }
    });
  });

  describe("AC2: Puzzle Retrieval - Error Cases", () => {
    it("should handle puzzle not found error", async () => {
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "No rows found" },
            }),
          }),
        }),
      });

      const result = await getPuzzleToday();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("not available");
      }
    });

    it("should handle database connection error", async () => {
      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockRejectedValue(new Error("Database connection failed")),
          }),
        }),
      });

      const result = await getPuzzleToday();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Failed to load");
      }
    });
  });
});

describe("validatePuzzle()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock auth.getUser to return null (guest user) by default
    mockSupabaseClient.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    });
  });

  describe("AC3: Solution Validation - Correct Solutions", () => {
    it("should return correct: true for matching solution", async () => {
      const storedSolution = [
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

      const userSolution = JSON.parse(JSON.stringify(storedSolution)); // Deep copy

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { solution: storedSolution },
              error: null,
            }),
          }),
        }),
      });

      const result = await validatePuzzle("puzzle-123", userSolution);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.correct).toBe(true);
      }
    });
  });

  describe("AC3: Solution Validation - Incorrect Solutions", () => {
    it("should return correct: false for incorrect solution", async () => {
      const storedSolution = Array(9)
        .fill(null)
        .map(() => Array(9).fill(5));

      const userSolution = Array(9)
        .fill(null)
        .map(() => Array(9).fill(3)); // Different values

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { solution: storedSolution },
              error: null,
            }),
          }),
        }),
      });

      const result = await validatePuzzle("puzzle-456", userSolution);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.correct).toBe(false);
      }
    });

    it("should NOT reveal correct answer when solution is wrong", async () => {
      const storedSolution = Array(9)
        .fill(null)
        .map(() => Array(9).fill(9));
      const userSolution = Array(9)
        .fill(null)
        .map(() => Array(9).fill(1));

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { solution: storedSolution },
              error: null,
            }),
          }),
        }),
      });

      const result = await validatePuzzle("puzzle-789", userSolution);

      // Verify response only contains { correct: false }, no solution data
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ correct: false });
        expect(result.data).not.toHaveProperty("solution");
        expect(result.data).not.toHaveProperty("correctSolution");
      }
    });
  });

  describe("AC3: Solution Validation - Invalid Grid Structure", () => {
    it("should reject grid with wrong dimensions (8x9)", async () => {
      const invalidGrid = Array(8)
        .fill(null)
        .map(() => Array(9).fill(5)); // Only 8 rows

      const result = await validatePuzzle("puzzle-123", invalidGrid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid solution format");
      }
    });

    it("should reject grid with incomplete rows", async () => {
      const invalidGrid = Array(9)
        .fill(null)
        .map((_, i) => Array(i === 0 ? 8 : 9).fill(5)); // First row has only 8 cells

      const result = await validatePuzzle("puzzle-456", invalidGrid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid solution format");
      }
    });

    it("should reject grid with values outside 1-9 range", async () => {
      const invalidGrid = Array(9)
        .fill(null)
        .map(() => Array(9).fill(0)); // 0 is invalid

      const result = await validatePuzzle("puzzle-789", invalidGrid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid solution format");
      }
    });

    it("should reject grid with value 10 (out of range)", async () => {
      const invalidGrid = Array(9)
        .fill(null)
        .map(() => Array(9).fill(10)); // 10 is invalid

      const result = await validatePuzzle("puzzle-999", invalidGrid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid solution format");
      }
    });

    it("should reject empty grid (0 values)", async () => {
      const emptyGrid = Array(9)
        .fill(null)
        .map(() => Array(9).fill(0));

      const result = await validatePuzzle("puzzle-empty", emptyGrid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid solution format");
      }
    });
  });

  describe("AC3: Solution Validation - Database Errors", () => {
    it("should handle puzzle not found error", async () => {
      const validGrid = Array(9)
        .fill(null)
        .map(() => Array(9).fill(5));

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Puzzle not found" },
            }),
          }),
        }),
      });

      const result = await validatePuzzle("nonexistent-puzzle", validGrid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Puzzle not found");
      }
    });

    it("should handle database connection error", async () => {
      const validGrid = Array(9)
        .fill(null)
        .map(() => Array(9).fill(5));

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest
              .fn()
              .mockRejectedValue(new Error("Database connection failed")),
          }),
        }),
      });

      const result = await validatePuzzle("puzzle-error", validGrid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Failed to validate");
      }
    });
  });

  describe("AC3: Solution Validation - Deep Equality", () => {
    it("should use deep equality (not reference equality)", async () => {
      const storedSolution = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8],
      ];

      // Create a new array with same values (different reference)
      const userSolution = storedSolution.map((row) => [...row]);

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { solution: storedSolution },
              error: null,
            }),
          }),
        }),
      });

      const result = await validatePuzzle("puzzle-deep", userSolution);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.correct).toBe(true);
      }
    });

    it("should detect single cell difference", async () => {
      const storedSolution = Array(9)
        .fill(null)
        .map(() => Array(9).fill(5));

      const userSolution = storedSolution.map((row) => [...row]);
      userSolution[4][4] = 6; // Change center cell

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { solution: storedSolution },
              error: null,
            }),
          }),
        }),
      });

      const result = await validatePuzzle("puzzle-diff", userSolution);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.correct).toBe(false);
      }
    });
  });
});

/**
 * Grid Validation Helper Tests
 *
 * These tests verify the isValidGrid() helper function's logic.
 * The function is tested indirectly through validatePuzzle() since it's not exported.
 */
describe("Grid Validation Logic (via validatePuzzle)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock auth.getUser to return null (guest user) by default
    mockSupabaseClient.auth.getUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    });
  });

  it("should accept valid 9x9 grid with values 1-9", async () => {
    const validGrid = [
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

    (mockSupabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { solution: validGrid },
            error: null,
          }),
        }),
      }),
    });

    const result = await validatePuzzle("puzzle-valid", validGrid);

    // Should not fail validation
    expect(result.success).toBe(true);
  });

  it("should reject 10x9 grid (too many rows)", async () => {
    const invalidGrid = Array(10)
      .fill(null)
      .map(() => Array(9).fill(5));

    const result = await validatePuzzle("puzzle-10x9", invalidGrid);

    expect(result.success).toBe(false);
  });

  it("should reject 9x10 grid (too many columns)", async () => {
    const invalidGrid = Array(9)
      .fill(null)
      .map(() => Array(10).fill(5));

    const result = await validatePuzzle("puzzle-9x10", invalidGrid);

    expect(result.success).toBe(false);
  });

  it("should reject grid with negative values", async () => {
    const invalidGrid = Array(9)
      .fill(null)
      .map(() => Array(9).fill(-1));

    const result = await validatePuzzle("puzzle-negative", invalidGrid);

    expect(result.success).toBe(false);
  });
});
