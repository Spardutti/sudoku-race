/**
 * HeaderWithAuth Component Integration Tests
 *
 * Tests the server wrapper component that fetches auth state
 * and renders Header with appropriate user data.
 */

import { render, screen } from "@testing-library/react";
import { HeaderWithAuth } from "../HeaderWithAuth";
import { getCurrentUserId } from "@/lib/auth/get-current-user";
import { createServerClient } from "@/lib/supabase/server";

// Mock dependencies
jest.mock("@/lib/auth/get-current-user");
jest.mock("@/lib/supabase/server");
jest.mock("../Header", () => ({
  Header: ({ userId, username }: { userId: string | null; username: string | null }) => (
    <header data-testid="mock-header" data-user-id={userId || ""} data-username={username || ""}>
      {userId ? `Logged in as ${username}` : "Guest"}
    </header>
  ),
}));

const mockGetCurrentUserId = getCurrentUserId as jest.MockedFunction<typeof getCurrentUserId>;
const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;

describe("HeaderWithAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Guest State", () => {
    it("renders Header with null userId and username when user not authenticated", async () => {
      mockGetCurrentUserId.mockResolvedValue(null);

      const { container } = render(await HeaderWithAuth());

      const header = screen.getByTestId("mock-header");
      expect(header).toHaveAttribute("data-user-id", "");
      expect(header).toHaveAttribute("data-username", "");
      expect(header).toHaveTextContent("Guest");
    });
  });

  describe("Authenticated State", () => {
    it("renders Header with userId and username when user authenticated", async () => {
      const mockUserId = "user-123";
      const mockUsername = "testuser";

      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockSupabaseClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { username: mockUsername },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateServerClient.mockResolvedValue(mockSupabaseClient as any);

      const { container } = render(await HeaderWithAuth());

      const header = screen.getByTestId("mock-header");
      expect(header).toHaveAttribute("data-user-id", mockUserId);
      expect(header).toHaveAttribute("data-username", mockUsername);
      expect(header).toHaveTextContent(`Logged in as ${mockUsername}`);
    });

    it("handles null username from database gracefully", async () => {
      const mockUserId = "user-456";

      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockSupabaseClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { username: null },
                error: null,
              }),
            }),
          }),
        }),
      };

      mockCreateServerClient.mockResolvedValue(mockSupabaseClient as any);

      const { container } = render(await HeaderWithAuth());

      const header = screen.getByTestId("mock-header");
      expect(header).toHaveAttribute("data-user-id", mockUserId);
      expect(header).toHaveAttribute("data-username", "");
    });

    it("handles database query errors gracefully", async () => {
      const mockUserId = "user-789";

      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockSupabaseClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Database error" },
              }),
            }),
          }),
        }),
      };

      mockCreateServerClient.mockResolvedValue(mockSupabaseClient as any);

      const { container } = render(await HeaderWithAuth());

      const header = screen.getByTestId("mock-header");
      expect(header).toHaveAttribute("data-user-id", mockUserId);
      expect(header).toHaveAttribute("data-username", "");
    });
  });

  describe("Database Integration", () => {
    it("queries users table with correct userId", async () => {
      const mockUserId = "user-abc";
      mockGetCurrentUserId.mockResolvedValue(mockUserId);

      const mockEq = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { username: "testuser" },
          error: null,
        }),
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockSupabaseClient = {
        from: mockFrom,
      };

      mockCreateServerClient.mockResolvedValue(mockSupabaseClient as any);

      render(await HeaderWithAuth());

      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(mockSelect).toHaveBeenCalledWith("username");
      expect(mockEq).toHaveBeenCalledWith("id", mockUserId);
    });
  });
});
