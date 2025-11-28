import { renderHook, waitFor } from "@testing-library/react";
import { useAuthState } from "../useAuthState";
import { createBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

jest.mock("@/lib/supabase/client");
jest.mock("@sentry/nextjs");
jest.mock("@/lib/utils/logger");

const mockCreateBrowserClient = createBrowserClient as jest.MockedFunction<
  typeof createBrowserClient
>;

describe("useAuthState", () => {
  const mockUser: User = {
    id: "test-user-id",
    email: "test@example.com",
    user_metadata: { full_name: "Test User" },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };

  let mockSubscription: { unsubscribe: jest.Mock };
  let mockAuthStateChangeCallback: (
    event: string,
    session: { user: User } | null
  ) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscription = { unsubscribe: jest.fn() };

    mockCreateBrowserClient.mockReturnValue({
      auth: {
        onAuthStateChange: jest.fn((callback) => {
          mockAuthStateChangeCallback = callback;
          return { data: { subscription: mockSubscription } };
        }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
    } as never);
  });

  it("should initialize with null user when no initialUser provided", () => {
    const { result } = renderHook(() => useAuthState());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should initialize with initialUser when provided (SSR handoff)", () => {
    const { result } = renderHook(() => useAuthState({ initialUser: mockUser }));

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("should update user state on auth state change (login)", async () => {
    const { result } = renderHook(() => useAuthState());

    expect(result.current.user).toBeNull();

    mockAuthStateChangeCallback("SIGNED_IN", { user: mockUser });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should update user state on auth state change (logout)", async () => {
    const { result } = renderHook(() => useAuthState({ initialUser: mockUser }));

    expect(result.current.isAuthenticated).toBe(true);

    mockAuthStateChangeCallback("SIGNED_OUT", null);

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it("should handle session refresh event", async () => {
    const updatedUser = { ...mockUser, email: "updated@example.com" };

    mockCreateBrowserClient.mockReturnValue({
      auth: {
        onAuthStateChange: jest.fn((callback) => {
          mockAuthStateChangeCallback = callback;
          return { data: { subscription: mockSubscription } };
        }),
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: updatedUser } }
        }),
      },
    } as never);

    const { result } = renderHook(() => useAuthState({ initialUser: mockUser }));

    mockAuthStateChangeCallback("TOKEN_REFRESHED", { user: updatedUser });

    await waitFor(() => {
      expect(result.current.user).toEqual(updatedUser);
    });
  });

  it("should cleanup subscription on unmount", () => {
    const { unmount } = renderHook(() => useAuthState());

    unmount();

    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it("should gracefully handle auth session errors", async () => {
    const mockError = new Error("Session fetch failed");
    mockCreateBrowserClient.mockReturnValue({
      auth: {
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: mockSubscription },
        })),
        getSession: jest.fn().mockRejectedValue(mockError),
      },
    } as never);

    const { result } = renderHook(() => useAuthState());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
