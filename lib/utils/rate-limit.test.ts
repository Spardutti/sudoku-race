/**
 * Rate Limiter Unit Tests
 *
 * Tests LRU Cache-based rate limiting utility.
 * Target: 90%+ coverage (security-critical code requires high coverage).
 */

import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  // Note: Some tests use fake timers, others need real timers for LRU Cache TTL
  // LRU Cache's internal TTL mechanism doesn't respect Jest fake timers

  describe("AC1: Rate limiter allows requests under limit", () => {
    it("should allow 3 requests when limit is 3", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000, // 60 seconds
        uniqueTokenPerInterval: 500,
      });

      const token = "user-123";

      // All 3 requests should succeed
      await expect(limiter.check(3, token)).resolves.toBeUndefined();
      await expect(limiter.check(3, token)).resolves.toBeUndefined();
      await expect(limiter.check(3, token)).resolves.toBeUndefined();
    });

    it("should allow single request when limit is 1", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      await expect(limiter.check(1, "user-456")).resolves.toBeUndefined();
    });
  });

  describe("AC1: Rate limiter blocks requests over limit", () => {
    it("should reject 4th request when limit is 3", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      const token = "user-789";

      // First 3 succeed
      await limiter.check(3, token);
      await limiter.check(3, token);
      await limiter.check(3, token);

      // 4th should fail
      await expect(limiter.check(3, token)).rejects.toBeUndefined();
    });

    it("should reject 2nd request when limit is 1", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      const token = "user-999";

      await limiter.check(1, token);

      // 2nd should fail
      await expect(limiter.check(1, token)).rejects.toBeUndefined();
    });

    it("should reject excessive requests (10+)", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      const token = "user-abuser";

      // Exhaust limit
      await limiter.check(3, token);
      await limiter.check(3, token);
      await limiter.check(3, token);

      // All subsequent should fail
      await expect(limiter.check(3, token)).rejects.toBeUndefined();
      await expect(limiter.check(3, token)).rejects.toBeUndefined();
      await expect(limiter.check(3, token)).rejects.toBeUndefined();
    });
  });

  describe("AC1: Independent counters for different tokens", () => {
    it("should track separate limits for different users", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      // Exhaust limit for user-123
      await limiter.check(3, "user-123");
      await limiter.check(3, "user-123");
      await limiter.check(3, "user-123");
      await expect(limiter.check(3, "user-123")).rejects.toBeUndefined();

      // user-456 should still have full quota
      await expect(limiter.check(3, "user-456")).resolves.toBeUndefined();
      await expect(limiter.check(3, "user-456")).resolves.toBeUndefined();
      await expect(limiter.check(3, "user-456")).resolves.toBeUndefined();
    });

    it("should handle IP addresses as tokens", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      const ip1 = "192.168.1.1";
      const ip2 = "192.168.1.2";

      // Exhaust limit for IP1
      await limiter.check(3, ip1);
      await limiter.check(3, ip1);
      await limiter.check(3, ip1);
      await expect(limiter.check(3, ip1)).rejects.toBeUndefined();

      // IP2 should have independent limit
      await expect(limiter.check(3, ip2)).resolves.toBeUndefined();
    });
  });

  describe("AC1: Counter resets after interval expires", () => {
    it("should allow requests after TTL expires", async () => {
      // Use real timers for this test (LRU Cache TTL doesn't work with fake timers)
      const limiter = rateLimit({
        interval: 100, // 100ms for fast test
        uniqueTokenPerInterval: 500,
      });

      const token = "user-reset";

      // Exhaust limit
      await limiter.check(3, token);
      await limiter.check(3, token);
      await limiter.check(3, token);
      await expect(limiter.check(3, token)).rejects.toBeUndefined();

      // Wait for TTL to expire (110ms > 100ms interval)
      await new Promise((resolve) => setTimeout(resolve, 110));

      // Should succeed after interval expires
      await expect(limiter.check(3, token)).resolves.toBeUndefined();
    });

    it("should not reset before interval expires", async () => {
      const limiter = rateLimit({
        interval: 200, // 200ms
        uniqueTokenPerInterval: 500,
      });

      const token = "user-early";

      // Exhaust limit
      await limiter.check(3, token);
      await limiter.check(3, token);
      await limiter.check(3, token);

      // Wait only 50ms (not enough for 200ms interval)
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should still be rate limited
      await expect(limiter.check(3, token)).rejects.toBeUndefined();
    });
  });

  describe("AC1: LRU eviction with many tokens", () => {
    it("should handle 500+ tokens without memory issues", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      // Create 600 unique tokens (exceeds max)
      const promises = [];
      for (let i = 0; i < 600; i++) {
        promises.push(limiter.check(3, `user-${i}`));
      }

      // All should succeed (LRU evicts oldest)
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it("should evict oldest tokens when max is reached", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 10, // Small max for testing
      });

      // Add 15 tokens (exceeds max of 10)
      for (let i = 0; i < 15; i++) {
        await limiter.check(3, `user-${i}`);
      }

      // Oldest tokens should be evicted
      // Token 0-4 should have been evicted, so they get fresh quota
      await expect(limiter.check(3, "user-0")).resolves.toBeUndefined();
      await expect(limiter.check(3, "user-0")).resolves.toBeUndefined();
      await expect(limiter.check(3, "user-0")).resolves.toBeUndefined();
    });
  });

  describe("Configuration options", () => {
    it("should use default interval if not specified", async () => {
      const limiter = rateLimit({
        interval: 0, // Will use default
        uniqueTokenPerInterval: 500,
      });

      // Should still work with defaults
      await expect(limiter.check(3, "user-default")).resolves.toBeUndefined();
    });

    it("should use default uniqueTokenPerInterval if not specified", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 0, // Will use default
      });

      // Should still work with defaults
      await expect(limiter.check(3, "user-default")).resolves.toBeUndefined();
    });

    it("should work with custom intervals", async () => {
      // Use real timers for TTL testing
      const limiter = rateLimit({
        interval: 100, // 100ms
        uniqueTokenPerInterval: 500,
      });

      const token = "user-custom";

      // Exhaust limit
      await limiter.check(3, token);
      await limiter.check(3, token);
      await limiter.check(3, token);

      // Wait for interval to expire (110ms > 100ms)
      await new Promise((resolve) => setTimeout(resolve, 110));

      // Should reset after custom interval
      await expect(limiter.check(3, token)).resolves.toBeUndefined();
    });
  });

  describe("Edge cases", () => {
    it("should handle limit of 0 (blocks all requests)", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      // Limit of 0 means no requests allowed
      await expect(limiter.check(0, "user-zero")).rejects.toBeUndefined();
    });

    it("should handle empty token string", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      // Empty string is valid token
      await expect(limiter.check(3, "")).resolves.toBeUndefined();
    });

    it("should handle very long token strings", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      const longToken = "user-" + "x".repeat(1000);

      await expect(limiter.check(3, longToken)).resolves.toBeUndefined();
    });

    it("should handle concurrent requests for same token", async () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
      });

      const token = "user-concurrent";

      // Fire 5 concurrent requests
      const results = await Promise.allSettled([
        limiter.check(3, token),
        limiter.check(3, token),
        limiter.check(3, token),
        limiter.check(3, token),
        limiter.check(3, token),
      ]);

      // 3 should succeed, 2 should fail
      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      expect(fulfilled).toHaveLength(3);
      expect(rejected).toHaveLength(2);
    });
  });
});
