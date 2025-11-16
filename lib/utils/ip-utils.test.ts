/**
 * IP Utilities Unit Tests
 *
 * Tests IP address extraction from request headers for guest rate limiting.
 */

import { getClientIP, isValidIP } from "./ip-utils";

describe("getClientIP", () => {
  describe("AC4: IP extraction from headers", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.100");

      const ip = getClientIP({ headers });

      expect(ip).toBe("192.168.1.100");
    });

    it("should extract first IP from x-forwarded-for with multiple IPs", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.100, 10.0.0.1, 172.16.0.1");

      const ip = getClientIP({ headers });

      // Should take the first IP (client)
      expect(ip).toBe("192.168.1.100");
    });

    it("should handle x-forwarded-for with spaces", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "  192.168.1.100  ,  10.0.0.1  ");

      const ip = getClientIP({ headers });

      // Should trim spaces
      expect(ip).toBe("192.168.1.100");
    });

    it("should extract IP from x-real-ip header", () => {
      const headers = new Headers();
      headers.set("x-real-ip", "192.168.1.200");

      const ip = getClientIP({ headers });

      expect(ip).toBe("192.168.1.200");
    });

    it("should prioritize x-forwarded-for over x-real-ip", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.100");
      headers.set("x-real-ip", "192.168.1.200");

      const ip = getClientIP({ headers });

      // x-forwarded-for should be checked first
      expect(ip).toBe("192.168.1.100");
    });

    it("should fallback to 'unknown' when no headers present", () => {
      const headers = new Headers();

      const ip = getClientIP({ headers });

      expect(ip).toBe("unknown");
    });

    it("should handle IPv6 addresses", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "2001:0db8:85a3::8a2e:0370:7334");

      const ip = getClientIP({ headers });

      expect(ip).toBe("2001:0db8:85a3::8a2e:0370:7334");
    });

    it("should handle localhost IP", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "127.0.0.1");

      const ip = getClientIP({ headers });

      expect(ip).toBe("127.0.0.1");
    });

    it("should fallback to unknown for empty x-forwarded-for", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "");

      const ip = getClientIP({ headers });

      // Empty header should fallback to unknown (safer than empty string)
      expect(ip).toBe("unknown");
    });
  });
});

describe("isValidIP", () => {
  describe("IPv4 validation", () => {
    it("should validate standard IPv4 address", () => {
      expect(isValidIP("192.168.1.1")).toBe(true);
      expect(isValidIP("10.0.0.1")).toBe(true);
      expect(isValidIP("172.16.0.1")).toBe(true);
      expect(isValidIP("8.8.8.8")).toBe(true);
    });

    it("should validate IPv4 edge cases", () => {
      expect(isValidIP("0.0.0.0")).toBe(true);
      expect(isValidIP("255.255.255.255")).toBe(true);
      expect(isValidIP("127.0.0.1")).toBe(true);
    });

    it("should reject invalid IPv4 addresses", () => {
      expect(isValidIP("256.1.1.1")).toBe(false); // Out of range
      expect(isValidIP("192.168.1")).toBe(false); // Incomplete
      expect(isValidIP("192.168.1.1.1")).toBe(false); // Too many octets
      expect(isValidIP("192.168.-1.1")).toBe(false); // Negative
    });
  });

  describe("IPv6 validation", () => {
    it("should validate standard IPv6 address", () => {
      expect(isValidIP("2001:0db8:0000:0000:0000:0000:0000:0001")).toBe(true);
      expect(isValidIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
    });

    it("should reject invalid formats", () => {
      expect(isValidIP("unknown")).toBe(false);
      expect(isValidIP("not-an-ip")).toBe(false);
      expect(isValidIP("")).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle special strings", () => {
      expect(isValidIP("unknown")).toBe(false);
      expect(isValidIP("localhost")).toBe(false);
      expect(isValidIP("null")).toBe(false);
      expect(isValidIP("undefined")).toBe(false);
    });
  });
});
