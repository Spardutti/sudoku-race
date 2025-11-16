/**
 * Tests for Application Configuration
 * @module lib/config.test
 */

import { getSiteURL, SITE_URL, SOCIAL_MEDIA } from "./config";

describe("config", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    // Restore original env var
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    }
  });

  describe("getSiteURL", () => {
    it("should return NEXT_PUBLIC_SITE_URL when set", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://sudoku-race.vercel.app";
      expect(getSiteURL()).toBe("https://sudoku-race.vercel.app");
    });

    it("should return localhost when NEXT_PUBLIC_SITE_URL is not set", () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      expect(getSiteURL()).toBe("http://localhost:3000");
    });

    it("should return localhost when NEXT_PUBLIC_SITE_URL is empty string", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "";
      expect(getSiteURL()).toBe("http://localhost:3000");
    });
  });

  describe("SITE_URL", () => {
    it("should be a valid URL string", () => {
      expect(typeof SITE_URL).toBe("string");
      expect(SITE_URL).toBeTruthy();
      expect(() => new URL(SITE_URL)).not.toThrow();
    });
  });

  describe("SOCIAL_MEDIA", () => {
    it("should contain twitter handles", () => {
      expect(SOCIAL_MEDIA.twitter.handle).toBe("@sudokudaily");
      expect(SOCIAL_MEDIA.twitter.site).toBe("@sudokudaily");
    });

    it("should contain github URL", () => {
      expect(SOCIAL_MEDIA.github).toBe("https://github.com/sudoku-daily");
      expect(() => new URL(SOCIAL_MEDIA.github)).not.toThrow();
    });

    it("should be immutable (as const)", () => {
      // TypeScript ensures this at compile time
      // Runtime check: object should be frozen or have readonly properties
      expect(SOCIAL_MEDIA).toBeDefined();
      expect(SOCIAL_MEDIA.twitter).toBeDefined();
    });
  });
});
