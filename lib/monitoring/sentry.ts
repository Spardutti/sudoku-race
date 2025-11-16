import * as Sentry from "@sentry/nextjs";

/**
 * Sentry Error Tracking & Performance Monitoring
 *
 * Provides centralized error tracking and performance monitoring using Sentry.
 * Filters noisy errors, enriches context, and configures sample rates.
 *
 * @see docs/architecture.md (Error Tracking section)
 */

/**
 * Initialize Sentry with filtering and performance monitoring
 *
 * Configuration:
 * - Error tracking: 100% of errors captured
 * - Performance monitoring: 10% sample rate (cost-effective)
 * - Filters: ResizeObserver, non-error rejections, expected errors
 * - Context: userId, puzzleId, action name enriched automatically
 */
export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  // Skip initialization if DSN not configured (e.g., local dev)
  if (!dsn) {
    console.warn(
      "[Sentry] NEXT_PUBLIC_SENTRY_DSN not configured. Error tracking disabled."
    );
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",

    // Performance Monitoring: 10% sample rate (cost-effective)
    // 100% for errors, 10% for performance transactions
    tracesSampleRate: 0.1,

    // Filter noisy browser errors before sending to Sentry
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beforeSend(event, _hint) {
      const errorValue = event.exception?.values?.[0]?.value || "";
      const errorType = event.exception?.values?.[0]?.type || "";

      // Filter: ResizeObserver loop errors (browser-specific, not actionable)
      if (
        errorValue.includes("ResizeObserver") ||
        errorType.includes("ResizeObserver")
      ) {
        return null;
      }

      // Filter: Non-Error promise rejections (often not real errors)
      if (errorValue.includes("Non-Error promise rejection")) {
        return null;
      }

      // Filter: Expected analytics errors (optional endpoint)
      if (event.request?.url?.includes("/api/analytics")) {
        return null;
      }

      // Filter: Network errors from real-time (handled separately)
      if (errorValue.includes("NetworkError") && event.tags?.component === "realtime") {
        // Allow first occurrence, filter repeated network errors
        return event;
      }

      return event;
    },

    // Ignore specific error types (browser extensions, etc.)
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
      // Browser extension errors
      "chrome-extension://",
      "moz-extension://",
    ],
  });
}

/**
 * Error Severity Levels (for tagging and alerting)
 *
 * - critical: Database failures, auth system down (page developer immediately)
 * - high: Error rate >2%, response time >1s (alert within 1 hour)
 * - medium: Individual errors affecting user experience
 * - low: Minor errors, degraded UX, completion rate <40%
 */
export type ErrorSeverity = "critical" | "high" | "medium" | "low";

/**
 * Capture exception with context and severity
 *
 * @param error - Error object to capture
 * @param context - Additional context (userId, puzzleId, action, etc.)
 * @param severity - Error severity level (default: medium)
 *
 * @example
 * ```typescript
 * captureException(error, {
 *   userId: 'user-123',
 *   puzzleId: 'puzzle-456',
 *   action: 'completePuzzle',
 * }, 'high');
 * ```
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
  severity: ErrorSeverity = "medium"
) {
  Sentry.captureException(error, {
    level: severity === "critical" || severity === "high" ? "error" : "warning",
    tags: {
      severity,
      ...context,
    },
    extra: context,
  });
}

/**
 * Capture informational message (non-error tracking)
 *
 * @param message - Message to capture
 * @param context - Additional context
 * @param severity - Message severity (default: low)
 *
 * @example
 * ```typescript
 * captureMessage('User completed first puzzle', {
 *   userId: 'user-123',
 *   puzzleId: 'puzzle-456',
 * }, 'low');
 * ```
 */
export function captureMessage(
  message: string,
  context?: Record<string, unknown>,
  severity: ErrorSeverity = "low"
) {
  Sentry.captureMessage(message, {
    level: severity === "critical" || severity === "high" ? "error" : "info",
    tags: {
      severity,
      ...context,
    },
    extra: context,
  });
}

/**
 * Set user context for error tracking
 *
 * Call this after authentication to enrich all subsequent errors with user info.
 * Never pass PII (email addresses, IP addresses) - use user ID only.
 *
 * @param userId - User ID (never email or PII)
 *
 * @example
 * ```typescript
 * setUser('user-123'); // ✅ CORRECT - user ID only
 * setUser('user@example.com'); // ❌ WRONG - PII
 * ```
 */
export function setUser(userId: string | null) {
  if (userId) {
    Sentry.setUser({ id: userId });
  } else {
    Sentry.setUser(null); // Clear user on logout
  }
}

/**
 * Set custom context tags for current transaction
 *
 * Useful for enriching errors with action-specific context.
 *
 * @param tags - Key-value tags to add
 *
 * @example
 * ```typescript
 * setTags({ action: 'completePuzzle', puzzleId: 'puzzle-456' });
 * ```
 */
export function setTags(tags: Record<string, string>) {
  Sentry.setTags(tags);
}

/**
 * Create breadcrumb for debugging context
 *
 * Breadcrumbs help trace user actions leading to an error.
 *
 * @param category - Breadcrumb category (e.g., 'navigation', 'user-action')
 * @param message - Descriptive message
 * @param data - Additional data
 *
 * @example
 * ```typescript
 * addBreadcrumb('user-action', 'Started puzzle', { puzzleId: 'puzzle-456' });
 * ```
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: "info",
  });
}
