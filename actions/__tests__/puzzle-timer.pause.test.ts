import { pauseTimer, resumeTimer } from "../puzzle-timer";
import { createServerActionClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/get-current-user";

jest.mock("@/lib/supabase/server");
jest.mock("@/lib/auth/get-current-user");

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
};

describe("pauseTimer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createServerActionClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("returns error when user is not authenticated", async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue(null);

    const result = await pauseTimer("puzzle-123");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });

  it("appends pause event to timer_events array", async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue("user-123");

    mockSupabase.maybeSingle.mockResolvedValue({
      data: {
        timer_events: [
          { type: "start", timestamp: "2025-12-04T10:00:00Z" },
        ],
      },
    });

    mockSupabase.eq.mockReturnValueOnce({
      ...mockSupabase,
      update: jest.fn().mockResolvedValue({ error: null }),
    });

    const result = await pauseTimer("puzzle-123");

    expect(result.success).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith("completions");
    expect(mockSupabase.update).toHaveBeenCalled();
  });

  it("initializes timer_events if null", async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue("user-123");

    mockSupabase.maybeSingle.mockResolvedValue({
      data: {
        timer_events: null,
      },
    });

    const result = await pauseTimer("puzzle-123");

    expect(result.success).toBe(true);
  });

  it("returns error when completion record not found", async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue("user-123");

    mockSupabase.maybeSingle.mockResolvedValue({
      data: null,
    });

    const result = await pauseTimer("puzzle-123");

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });
});

describe("resumeTimer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createServerActionClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("returns error when user is not authenticated", async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue(null);

    const result = await resumeTimer("puzzle-123");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });

  it("appends resume event to timer_events array", async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue("user-123");

    mockSupabase.maybeSingle.mockResolvedValue({
      data: {
        timer_events: [
          { type: "start", timestamp: "2025-12-04T10:00:00Z" },
          { type: "pause", timestamp: "2025-12-04T10:05:00Z" },
        ],
      },
    });

    mockSupabase.eq.mockReturnValueOnce({
      ...mockSupabase,
      update: jest.fn().mockResolvedValue({ error: null }),
    });

    const result = await resumeTimer("puzzle-123");

    expect(result.success).toBe(true);
  });

  it("returns error when completion record not found", async () => {
    (getCurrentUserId as jest.Mock).mockResolvedValue("user-123");

    mockSupabase.maybeSingle.mockResolvedValue({
      data: null,
    });

    const result = await resumeTimer("puzzle-123");

    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });
});
