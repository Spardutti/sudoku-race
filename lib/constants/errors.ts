/**
 * Error Categories and Message Templates
 *
 * Defines error categories and user-friendly error messages.
 * Never expose stack traces or technical details to users.
 *
 * @see docs/architecture.md (Error Handling Patterns section)
 */

/**
 * Error category types
 */
export type ErrorCategory = "user" | "network" | "server" | "validation";

/**
 * Error category definitions
 *
 * Each category has a specific user experience and handling strategy.
 */
export const ERROR_CATEGORIES = {
  /**
   * User Errors - Incorrect user input or actions
   *
   * UX: Show encouraging, actionable messages
   * Severity: Low (expected behavior)
   * Examples: Incorrect puzzle solution, invalid move
   */
  user: {
    title: "Not quite right",
    defaultMessage: "Not quite right. Keep trying!",
    tone: "encouraging",
  },

  /**
   * Network Errors - Connection or communication failures
   *
   * UX: Show retry-focused messages with action button
   * Severity: Medium (temporary, retry possible)
   * Examples: API timeout, real-time disconnection, Supabase connection lost
   */
  network: {
    title: "Connection Issue",
    defaultMessage: "Connection lost. Retrying...",
    tone: "retry-focused",
  },

  /**
   * Server Errors - Internal server failures
   *
   * UX: Show generic messages, log details for developer
   * Severity: High (unexpected, needs investigation)
   * Examples: Database error, unhandled exception, Server Action crash
   */
  server: {
    title: "Something Went Wrong",
    defaultMessage: "Something went wrong. Please try again.",
    tone: "generic",
  },

  /**
   * Validation Errors - Input validation failures
   *
   * UX: Silent or inline feedback, no toast/modal
   * Severity: Low (expected, handled gracefully)
   * Examples: Invalid form input, missing required field
   */
  validation: {
    title: "Invalid Input",
    defaultMessage: "Please check your input and try again.",
    tone: "instructional",
  },
} as const;

/**
 * User Error Messages
 *
 * Encouraging messages for incorrect user actions.
 */
export const USER_ERRORS = {
  INCORRECT_SOLUTION: "Not quite right. Keep trying!",
  INVALID_MOVE: "That move isn't allowed. Try a different number.",
  PUZZLE_ALREADY_COMPLETED: "You've already completed this puzzle!",
  NO_MOVES_TO_UNDO: "No moves to undo.",
} as const;

/**
 * Network Error Messages
 *
 * Retry-focused messages for connection issues.
 */
export const NETWORK_ERRORS = {
  CONNECTION_LOST: "Connection lost. Retrying...",
  TIMEOUT: "Request timed out. Please try again.",
  OFFLINE: "You're offline. Check your connection.",
  REALTIME_DISCONNECTED: "Live updates paused. Reconnecting...",
  API_UNREACHABLE: "Can't reach server. Retrying...",
} as const;

/**
 * Server Error Messages
 *
 * Generic messages for internal failures (never expose stack traces).
 */
export const SERVER_ERRORS = {
  INTERNAL_ERROR: "Something went wrong. Please try again.",
  DATABASE_ERROR: "Unable to save your progress. Please try again.",
  AUTH_ERROR: "Authentication failed. Please sign in again.",
  RATE_LIMIT: "Too many requests. Please wait a moment.",
  NOT_FOUND: "Puzzle not found.",
} as const;

/**
 * Validation Error Messages
 *
 * Instructional messages for invalid input.
 */
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: "This field is required.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_FORMAT: "Invalid format. Please check your input.",
  OUT_OF_RANGE: "Value must be between 1 and 9.",
} as const;

/**
 * Get user-friendly error message by category
 *
 * @param category - Error category
 * @param specificMessage - Specific message (optional)
 * @returns User-friendly error message
 *
 * @example
 * ```typescript
 * const message = getErrorMessage('network', NETWORK_ERRORS.CONNECTION_LOST)
 * toast.error(message) // "Connection lost. Retrying..."
 * ```
 */
export function getErrorMessage(
  category: ErrorCategory,
  specificMessage?: string
): string {
  return specificMessage || ERROR_CATEGORIES[category].defaultMessage;
}

/**
 * Determine error category from Error object
 *
 * Useful for automatic error categorization.
 *
 * @param error - Error object
 * @returns Error category
 *
 * @example
 * ```typescript
 * try {
 *   await fetchData()
 * } catch (error) {
 *   const category = categorizeError(error as Error)
 *   const message = getErrorMessage(category)
 *   toast.error(message)
 * }
 * ```
 */
export function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();

  // Network errors
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("connection") ||
    message.includes("offline")
  ) {
    return "network";
  }

  // Validation errors
  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required") ||
    message.includes("format")
  ) {
    return "validation";
  }

  // User errors
  if (
    message.includes("incorrect") ||
    message.includes("wrong") ||
    message.includes("not allowed")
  ) {
    return "user";
  }

  // Default to server error for unrecognized errors
  return "server";
}

/**
 * Error handling utilities
 */

/**
 * Check if error should be shown to user
 *
 * Some errors (validation, expected failures) should be handled silently.
 *
 * @param category - Error category
 * @returns true if error should be shown to user
 */
export function shouldShowError(category: ErrorCategory): boolean {
  // Validation errors are usually shown inline, not as toast/modal
  return category !== "validation";
}

/**
 * Check if error should trigger retry logic
 *
 * Network errors should typically trigger automatic retry.
 *
 * @param category - Error category
 * @returns true if error should trigger retry
 */
export function shouldRetry(category: ErrorCategory): boolean {
  return category === "network";
}
