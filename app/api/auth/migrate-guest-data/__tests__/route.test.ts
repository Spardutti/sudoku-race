/**
 * Integration tests for guest data migration API route
 *
 * Tests the POST /api/auth/migrate-guest-data endpoint
 *
 * @jest-environment node
 */

import { POST } from "../route";
import { NextRequest } from "next/server";
import { createServerActionClient } from "@/lib/supabase/server";
import {
  migrateGuestCompletions,
  parseLocalStorageData,
} from "@/lib/auth/migrate-guest-data";

jest.mock("@/lib/supabase/server");
jest.mock("@/lib/utils/logger");
jest.mock("@sentry/nextjs");
jest.mock("@/lib/auth/migrate-guest-data");

describe("POST /api/auth/migrate-guest-data", () => {
  const mockUser = {
    id: "test-user-123",
    email: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when user is not authenticated", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };

    (createServerActionClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest("http://localhost:3000/api/auth/migrate-guest-data", {
      method: "POST",
      body: JSON.stringify({ localStorageData: "{}" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Not authenticated");
  });

  it("should return empty result when no localStorage data provided", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };

    (createServerActionClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = new NextRequest("http://localhost:3000/api/auth/migrate-guest-data", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual({
      completedCount: 0,
      inProgressCount: 0,
      highestRank: null,
    });
  });

  it("should handle malformed JSON gracefully", async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };

    (createServerActionClient as jest.Mock).mockResolvedValue(mockSupabase);
    (parseLocalStorageData as jest.Mock).mockReturnValue(null);
    (migrateGuestCompletions as jest.Mock).mockResolvedValue({
      success: true,
      data: { completedCount: 0, inProgressCount: 0, highestRank: null },
    });

    const request = new NextRequest("http://localhost:3000/api/auth/migrate-guest-data", {
      method: "POST",
      body: JSON.stringify({ localStorageData: "{ invalid json }" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.completedCount).toBe(0);
  });
});
