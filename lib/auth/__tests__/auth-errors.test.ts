import { AUTH_ERRORS, getAuthErrorMessage } from "../auth-errors";

describe("Auth Error Utilities", () => {
  describe("AUTH_ERRORS constants", () => {
    it("should have all required error messages", () => {
      expect(AUTH_ERRORS.AUTH_CANCELLED).toBe("Sign-in cancelled");
      expect(AUTH_ERRORS.AUTH_FAILED).toBe("Sign-in failed. Please try again.");
      expect(AUTH_ERRORS.INVALID_LINK).toBe("Invalid sign-in link. Please try again.");
      expect(AUTH_ERRORS.NETWORK_ERROR).toBe(
        "Network error. Please check your connection and try again."
      );
      expect(AUTH_ERRORS.SERVER_ERROR).toBe("Something went wrong. Please try again later.");
    });
  });

  describe("getAuthErrorMessage", () => {
    it("should return correct message for valid error code", () => {
      expect(getAuthErrorMessage("auth_cancelled")).toBe("Sign-in cancelled");
      expect(getAuthErrorMessage("AUTH_CANCELLED")).toBe("Sign-in cancelled");
      expect(getAuthErrorMessage("auth_failed")).toBe("Sign-in failed. Please try again.");
      expect(getAuthErrorMessage("invalid_link")).toBe("Invalid sign-in link. Please try again.");
      expect(getAuthErrorMessage("network_error")).toBe(
        "Network error. Please check your connection and try again."
      );
      expect(getAuthErrorMessage("server_error")).toBe(
        "Something went wrong. Please try again later."
      );
    });

    it("should return null for null input", () => {
      expect(getAuthErrorMessage(null)).toBe(null);
    });

    it("should return default message for unknown error code", () => {
      expect(getAuthErrorMessage("unknown_error")).toBe("Sign-in failed. Please try again.");
      expect(getAuthErrorMessage("invalid_code")).toBe("Sign-in failed. Please try again.");
    });

    it("should be case-insensitive", () => {
      expect(getAuthErrorMessage("auth_CANCELLED")).toBe("Sign-in cancelled");
      expect(getAuthErrorMessage("INVALID_link")).toBe("Invalid sign-in link. Please try again.");
    });
  });
});
