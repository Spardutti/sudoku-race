import { getCurrentUserId } from "../get-current-user";
import { createServerClient } from "@/lib/supabase/server";

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
    } as any);

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
    } as any);

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
    } as any);

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
    } as any);

    await getCurrentUserId();

    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });
});
