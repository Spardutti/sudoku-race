import { getCurrentUserId } from "../get-current-user";
import { createServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

jest.mock("@/lib/supabase/server");

describe("getCurrentUserId", () => {
  const mockCreateServerClient = createServerClient as jest.MockedFunction<
    typeof createServerClient
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user ID when user is authenticated", async () => {
    const mockUser = { id: "user-123" };
    mockCreateServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as unknown as SupabaseClient);

    const result = await getCurrentUserId();

    expect(result).toBe("user-123");
  });

  it("should return null when user is not authenticated", async () => {
    mockCreateServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    } as unknown as SupabaseClient);

    const result = await getCurrentUserId();

    expect(result).toBeNull();
  });

  it("should return null when getUser returns undefined user", async () => {
    mockCreateServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: undefined },
          error: null,
        }),
      },
    } as unknown as SupabaseClient);

    const result = await getCurrentUserId();

    expect(result).toBeNull();
  });

  it("should use getUser not getSession (anti-spoofing)", async () => {
    const mockGetUser = jest.fn().mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    mockCreateServerClient.mockResolvedValue({
      auth: {
        getUser: mockGetUser,
      },
    } as unknown as SupabaseClient);

    await getCurrentUserId();

    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });
});
