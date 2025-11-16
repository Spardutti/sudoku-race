/**
 * Rate Limiting Utility using LRU Cache
 *
 * Provides lightweight, in-memory rate limiting for Server Actions.
 * Uses LRU Cache with TTL for automatic cleanup after interval expires.
 *
 * @see docs/rate-limiting.md for usage guide and examples
 * @see docs/architecture.md (Rate Limiting & Abuse Prevention section)
 */

import { LRUCache } from "lru-cache";

/**
 * Rate limiter configuration options
 */
export type RateLimitOptions = {
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  interval: number;

  /**
   * Maximum unique tokens to track
   * Prevents unbounded memory growth
   * @default 500
   */
  uniqueTokenPerInterval: number;
};

/**
 * Create a rate limiter instance
 *
 * @param options - Configuration options
 * @returns Rate limiter with check() method
 *
 * @example
 * ```typescript
 * const limiter = rateLimit({
 *   interval: 60 * 1000, // 60 seconds
 *   uniqueTokenPerInterval: 500
 * })
 *
 * // In Server Action
 * try {
 *   await limiter.check(3, userId) // 3 requests per minute
 *   // Process request...
 * } catch {
 *   return { success: false, error: ABUSE_ERRORS.RATE_LIMIT_EXCEEDED }
 * }
 * ```
 */
export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    /**
     * Check if token is under rate limit
     *
     * @param limit - Maximum requests allowed in interval
     * @param token - Unique identifier (userId or IP address)
     * @returns Promise that resolves if under limit, rejects if exceeded
     *
     * @example
     * ```typescript
     * // Allow 3 submissions per minute per user
     * await limiter.check(3, userId)
     * ```
     */
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];

        // Initialize token in cache on first request
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }

        // Increment counter
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;

        // CRITICAL: Reject if limit exceeded, resolve otherwise
        // This prevents wasting server resources on malicious traffic
        return isRateLimited ? reject() : resolve();
      }),
  };
}
