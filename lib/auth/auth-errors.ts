export const AUTH_ERRORS = {
  AUTH_CANCELLED: "Sign-in cancelled",
  AUTH_FAILED: "Sign-in failed. Please try again.",
  INVALID_LINK: "Invalid sign-in link. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  SERVER_ERROR: "Something went wrong. Please try again later.",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERRORS;

export function getAuthErrorMessage(errorCode: string | null): string | null {
  if (!errorCode) return null;

  const code = errorCode.toUpperCase() as AuthErrorCode;
  return AUTH_ERRORS[code] || AUTH_ERRORS.AUTH_FAILED;
}
