import { signInWithGoogle, signInWithGithub, signInWithApple, signOut, deleteAccount } from "../auth";
import { createServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

jest.mock("@/lib/supabase/server");
jest.mock("@/lib/utils/logger");
jest.mock("@sentry/nextjs");

const mockCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;

describe("Auth Server Actions", () => {
  let mockSupabase: Partial<SupabaseClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
      } as unknown as SupabaseClient["auth"],
    };

    mockCreateServerClient.mockResolvedValue(mockSupabase as SupabaseClient);
  });

  describe("signInWithGoogle", () => {
    it("should return success with redirect URL on successful sign-in", async () => {
      const mockUrl = "https://accounts.google.com/oauth?redirect=...";
      (mockSupabase.auth!.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });

      const result = await signInWithGoogle();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.url).toBe(mockUrl);
      }
      expect(mockSupabase.auth!.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });

    it("should return error when OAuth provider returns error", async () => {
      (mockSupabase.auth!.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: {},
        error: new Error("OAuth provider error"),
      });

      const result = await signInWithGoogle();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Sign-in failed. Please try again.");
      }
    });

    it("should return error when OAuth provider returns no URL", async () => {
      (mockSupabase.auth!.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: null },
        error: null,
      });

      const result = await signInWithGoogle();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Sign-in failed. Please try again.");
      }
    });

    it("should handle unexpected errors", async () => {
      (mockSupabase.auth!.signInWithOAuth as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await signInWithGoogle();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Something went wrong. Please try again.");
      }
    });
  });

  describe("signInWithGithub", () => {
    it("should call OAuth with github provider", async () => {
      const mockUrl = "https://github.com/login/oauth?...";
      (mockSupabase.auth!.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });

      const result = await signInWithGithub();

      expect(result.success).toBe(true);
      expect(mockSupabase.auth!.signInWithOAuth).toHaveBeenCalledWith({
        provider: "github",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
  });

  describe("signInWithApple", () => {
    it("should call OAuth with apple provider", async () => {
      const mockUrl = "https://appleid.apple.com/auth?...";
      (mockSupabase.auth!.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });

      const result = await signInWithApple();

      expect(result.success).toBe(true);
      expect(mockSupabase.auth!.signInWithOAuth).toHaveBeenCalledWith({
        provider: "apple",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
    });
  });

  describe("signOut", () => {
    it("should return success on successful sign-out", async () => {
      (mockSupabase.auth!.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await signOut();

      expect(result.success).toBe(true);
      expect(mockSupabase.auth!.signOut).toHaveBeenCalled();
    });

    it("should return error when sign-out fails", async () => {
      (mockSupabase.auth!.signOut as jest.Mock).mockResolvedValue({
        error: new Error("Sign-out failed"),
      });

      const result = await signOut();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Sign-out failed. Please try again.");
      }
    });

    it("should handle unexpected errors during sign-out", async () => {
      (mockSupabase.auth!.signOut as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await signOut();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Something went wrong. Please try again.");
      }
    });
  });

  describe("deleteAccount", () => {
    let mockFrom: jest.Mock;
    let mockDelete: jest.Mock;
    let mockEq: jest.Mock;

    beforeEach(() => {
      mockEq = jest.fn().mockResolvedValue({ error: null });
      mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom = jest.fn().mockReturnValue({ delete: mockDelete });

      mockSupabase.from = mockFrom;
      (mockSupabase.auth!.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });
    });

    it("should delete all user data and sign out on success", async () => {
      const userId = "test-user-id";

      const result = await deleteAccount(userId);

      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("completions");
      expect(mockFrom).toHaveBeenCalledWith("leaderboards");
      expect(mockFrom).toHaveBeenCalledWith("streaks");
      expect(mockFrom).toHaveBeenCalledWith("users");
      expect(mockDelete).toHaveBeenCalledTimes(4);
      expect(mockEq).toHaveBeenCalledWith("user_id", userId);
      expect(mockSupabase.auth!.signOut).toHaveBeenCalled();
    });

    it("should return error when deletion fails", async () => {
      const userId = "test-user-id";
      mockEq.mockResolvedValue({ error: new Error("Delete failed") });

      const result = await deleteAccount(userId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Deletion failed. Contact support.");
      }
    });

    it("should continue deletion even if sign-out fails", async () => {
      const userId = "test-user-id";
      (mockSupabase.auth!.signOut as jest.Mock).mockResolvedValue({
        error: new Error("Sign-out failed"),
      });

      const result = await deleteAccount(userId);

      expect(result.success).toBe(true);
    });

    it("should retry operations on transient failures", async () => {
      const userId = "test-user-id";
      mockEq
        .mockRejectedValueOnce(new Error("Transient error"))
        .mockResolvedValue({ error: null });

      const result = await deleteAccount(userId);

      expect(result.success).toBe(true);
    });
  });
});
