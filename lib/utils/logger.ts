import { captureException, captureMessage } from "@/lib/monitoring/sentry";

/**
 * Structured Logging System
 *
 * Provides JSON-formatted logging with context enrichment for development and production.
 * Logs are output to console (development) and Vercel Logs (production).
 *
 * @see docs/architecture.md (Logging Strategy section)
 */

/**
 * Log level enumeration
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Log context interface
 *
 * Contains additional metadata to enrich log entries.
 * IMPORTANT: Never include PII (email addresses, IP addresses, passwords).
 */
export interface LogContext {
  userId?: string; // Use user ID, NEVER email
  puzzleId?: string;
  action?: string;
  duration?: number;
  error?: Error;
  [key: string]: unknown;
}

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
}

/**
 * Sanitize log context to remove PII
 *
 * Removes email addresses, IP addresses, and other sensitive data.
 *
 * @param context - Raw log context
 * @returns Sanitized context safe for logging
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;

  const sanitized = { ...context };

  // Remove common PII fields
  const piiFields = ["email", "emailAddress", "ip", "ipAddress", "password", "token", "secret"];
  piiFields.forEach((field) => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });

  // Sanitize error objects (remove sensitive stack traces in production)
  if (sanitized.error && typeof sanitized.error === "object") {
    const error = sanitized.error as Error;
    sanitized.error = {
      name: error.name,
      message: error.message,
      // Include stack trace only in development
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    } as unknown as Error;
  }

  return sanitized;
}

/**
 * Format and output log entry
 *
 * Outputs JSON-formatted logs for easy parsing and searching.
 * In development, also outputs human-readable format.
 *
 * @param entry - Log entry to output
 */
function outputLog(entry: LogEntry): void {
  const sanitizedEntry = {
    ...entry,
    context: sanitizeContext(entry.context),
  };

  // JSON output for production (Vercel Logs, CloudWatch, etc.)
  const jsonLog = JSON.stringify(sanitizedEntry);

  // Console output based on log level
  switch (entry.level) {
    case "debug":
      console.debug(jsonLog);
      break;
    case "info":
      console.log(jsonLog);
      break;
    case "warn":
      console.warn(jsonLog);
      break;
    case "error":
      console.error(jsonLog);
      break;
  }

  // In development, also output human-readable format
  if (process.env.NODE_ENV === "development") {
    const emoji = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
    };
    console.log(
      `${emoji[entry.level]} [${entry.level.toUpperCase()}] ${entry.message}`,
      entry.context || ""
    );
  }
}

/**
 * Structured Logger
 *
 * Provides consistent logging interface across the application.
 */
export const logger = {
  /**
   * Debug-level logging
   *
   * Use for detailed troubleshooting information.
   * Only logged in development (not in production).
   *
   * @param message - Log message
   * @param context - Additional context
   *
   * @example
   * ```typescript
   * logger.debug('Fetching puzzle data', { puzzleId: 'puzzle-456' });
   * ```
   */
  debug(message: string, context?: LogContext): void {
    // Skip debug logs in production
    if (process.env.NODE_ENV === "production") return;

    outputLog({
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  },

  /**
   * Info-level logging
   *
   * Use for general informational messages (e.g., user actions, system events).
   *
   * @param message - Log message
   * @param context - Additional context
   *
   * @example
   * ```typescript
   * logger.info('Puzzle completed', {
   *   userId: 'user-123',
   *   puzzleId: 'puzzle-456',
   *   duration: 325
   * });
   * ```
   */
  info(message: string, context?: LogContext): void {
    outputLog({
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  },

  /**
   * Warning-level logging
   *
   * Use for potentially problematic situations that don't prevent normal operation.
   *
   * @param message - Log message
   * @param context - Additional context
   *
   * @example
   * ```typescript
   * logger.warn('Slow query detected', {
   *   action: 'getLeaderboard',
   *   duration: 2500
   * });
   * ```
   */
  warn(message: string, context?: LogContext): void {
    outputLog({
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      context,
    });

    // Send warnings to Sentry for monitoring
    captureMessage(message, context, "low");
  },

  /**
   * Error-level logging
   *
   * Use for errors that prevent normal operation.
   * Automatically sends errors to Sentry for tracking.
   *
   * @param message - Error message
   * @param error - Error object
   * @param context - Additional context
   *
   * @example
   * ```typescript
   * try {
   *   await completePuzzle(puzzleId);
   * } catch (error) {
   *   logger.error('Failed to complete puzzle', error as Error, {
   *     userId: 'user-123',
   *     puzzleId: 'puzzle-456',
   *     action: 'completePuzzle'
   *   });
   * }
   * ```
   */
  error(message: string, error: Error, context?: LogContext): void {
    const enrichedContext = {
      ...context,
      error,
      errorName: error.name,
      errorMessage: error.message,
    };

    outputLog({
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      context: enrichedContext,
    });

    // Send errors to Sentry for tracking and alerting
    captureException(error, enrichedContext, "medium");
  },
};

/**
 * Example usage patterns
 *
 * @example Logging user actions:
 * ```typescript
 * logger.info('User started puzzle', {
 *   userId: 'user-123',
 *   puzzleId: 'puzzle-456',
 *   action: 'startPuzzle'
 * });
 * ```
 *
 * @example Logging performance:
 * ```typescript
 * const start = performance.now();
 * await fetchLeaderboard();
 * const duration = performance.now() - start;
 *
 * logger.info('Leaderboard fetched', {
 *   action: 'fetchLeaderboard',
 *   duration: Math.round(duration)
 * });
 * ```
 *
 * @example Logging errors:
 * ```typescript
 * try {
 *   await savePuzzleProgress(data);
 * } catch (error) {
 *   logger.error('Failed to save progress', error as Error, {
 *     userId: 'user-123',
 *     puzzleId: 'puzzle-456'
 *   });
 *   throw error; // Re-throw if needed
 * }
 * ```
 *
 * @example What NOT to log (PII):
 * ```typescript
 * // ❌ WRONG - Logs email (PII)
 * logger.info('User logged in', { email: 'user@example.com' });
 *
 * // ✅ CORRECT - Logs user ID only
 * logger.info('User logged in', { userId: 'user-123' });
 * ```
 */
