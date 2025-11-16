/**
 * Tests for SEO Metadata Utilities
 *
 * @see lib/utils/metadata.ts
 */

import {
  generateMetadata,
  getAbsoluteURL,
  generateJSONLD,
  generateOGImage,
  type SEOMetadata,
} from "./metadata";

describe("metadata utilities", () => {
  // Store original env var
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    // Restore original env var
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  describe("generateMetadata", () => {
    it("should generate basic metadata with title and description", () => {
      const options: SEOMetadata = {
        title: "Test Page",
        description: "Test description",
      };

      const result = generateMetadata(options);

      expect(result.title).toBe("Test Page");
      expect(result.description).toBe("Test description");
      expect(result.openGraph).toMatchObject({
        title: "Test Page",
        description: "Test description",
      });
      expect(result.twitter).toMatchObject({
        card: "summary_large_image",
        title: "Test Page",
        description: "Test description",
      });
    });

    it("should include canonical URL when canonicalPath is provided", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

      const options: SEOMetadata = {
        title: "Test Page",
        description: "Test description",
        canonicalPath: "/about",
      };

      const result = generateMetadata(options);

      expect(result.alternates?.canonical).toBe("https://example.com/about");
    });

    it("should handle full URL in canonicalPath", () => {
      const options: SEOMetadata = {
        title: "Test Page",
        description: "Test description",
        canonicalPath: "https://custom-domain.com/page",
      };

      const result = generateMetadata(options);

      expect(result.alternates?.canonical).toBe("https://custom-domain.com/page");
    });

    it("should omit alternates when canonicalPath is not provided", () => {
      const options: SEOMetadata = {
        title: "Test Page",
        description: "Test description",
      };

      const result = generateMetadata(options);

      expect(result.alternates).toBeUndefined();
    });

    it("should include OpenGraph image when provided", () => {
      const options: SEOMetadata = {
        title: "Test Page",
        description: "Test description",
        ogImage: "/images/og.png",
      };

      const result = generateMetadata(options);

      expect(result.openGraph?.images).toEqual(["/images/og.png"]);
    });

    it("should include Twitter card image when provided", () => {
      const options: SEOMetadata = {
        title: "Test Page",
        description: "Test description",
        twitterCard: "/images/twitter.png",
      };

      const result = generateMetadata(options);

      expect(result.twitter?.images).toEqual(["/images/twitter.png"]);
    });

    it("should include keywords when provided", () => {
      const options: SEOMetadata = {
        title: "Test Page",
        description: "Test description",
        keywords: ["test", "page", "seo"],
      };

      const result = generateMetadata(options);

      expect(result.keywords).toEqual(["test", "page", "seo"]);
    });

    it("should include robots directives when provided", () => {
      const options: SEOMetadata = {
        title: "Test Page",
        description: "Test description",
        robots: { index: false, follow: true },
      };

      const result = generateMetadata(options);

      expect(result.robots).toEqual({ index: false, follow: true });
    });

    it("should handle all options together", () => {
      const options: SEOMetadata = {
        title: "Complete Page",
        description: "Complete description",
        ogImage: "/og.png",
        twitterCard: "/twitter.png",
        keywords: ["complete", "test"],
        robots: { index: true, follow: false },
      };

      const result = generateMetadata(options);

      expect(result).toMatchObject({
        title: "Complete Page",
        description: "Complete description",
        keywords: ["complete", "test"],
        robots: { index: true, follow: false },
      });
      expect(result.openGraph?.images).toEqual(["/og.png"]);
      expect(result.twitter?.images).toEqual(["/twitter.png"]);
    });

    it("should omit images when not provided", () => {
      const options: SEOMetadata = {
        title: "Test Page",
        description: "Test description",
      };

      const result = generateMetadata(options);

      expect(result.openGraph?.images).toBeUndefined();
      expect(result.twitter?.images).toBeUndefined();
    });
  });

  describe("getAbsoluteURL", () => {
    it("should convert relative path to absolute URL using env var", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

      const result = getAbsoluteURL("/about");

      expect(result).toBe("https://example.com/about");
    });

    it("should handle paths without leading slash", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

      const result = getAbsoluteURL("about");

      expect(result).toBe("https://example.com/about");
    });

    it("should handle baseURL with trailing slash", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";

      const result = getAbsoluteURL("/about");

      expect(result).toBe("https://example.com/about");
    });

    it("should fall back to localhost when env var not set", () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;

      const result = getAbsoluteURL("/about");

      expect(result).toBe("http://localhost:3000/about");
    });

    it("should handle nested paths", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

      const result = getAbsoluteURL("/blog/posts/first");

      expect(result).toBe("https://example.com/blog/posts/first");
    });

    it("should handle paths with query parameters", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

      const result = getAbsoluteURL("/search?q=test");

      expect(result).toBe("https://example.com/search?q=test");
    });

    it("should handle paths with hash fragments", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

      const result = getAbsoluteURL("/page#section");

      expect(result).toBe("https://example.com/page#section");
    });

    it("should validate generated URLs", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

      expect(() => getAbsoluteURL("/valid-path")).not.toThrow();
    });

    it("should throw error for invalid URLs", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "not-a-valid-url";

      expect(() => getAbsoluteURL("/path")).toThrow("Invalid URL generated");
    });
  });

  describe("generateJSONLD", () => {
    it("should generate valid Organization schema", () => {
      const data = {
        name: "Test Org",
        url: "https://example.com",
        logo: "https://example.com/logo.png",
      };

      const result = generateJSONLD("Organization", data);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Test Org",
        url: "https://example.com",
        logo: "https://example.com/logo.png",
      });
    });

    it("should generate valid WebPage schema", () => {
      const data = {
        name: "Test Page",
        description: "Test description",
        url: "https://example.com/page",
      };

      const result = generateJSONLD("WebPage", data);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Test Page",
        description: "Test description",
        url: "https://example.com/page",
      });
    });

    it("should handle nested objects", () => {
      const data = {
        name: "Article",
        author: {
          "@type": "Person",
          name: "John Doe",
        },
      };

      const result = generateJSONLD("Article", data);
      const parsed = JSON.parse(result);

      expect(parsed.author).toEqual({
        "@type": "Person",
        name: "John Doe",
      });
    });

    it("should handle arrays", () => {
      const data = {
        name: "Test",
        sameAs: [
          "https://twitter.com/test",
          "https://github.com/test",
        ],
      };

      const result = generateJSONLD("Organization", data);
      const parsed = JSON.parse(result);

      expect(parsed.sameAs).toEqual([
        "https://twitter.com/test",
        "https://github.com/test",
      ]);
    });

    it("should handle special characters in strings", () => {
      const data = {
        name: 'Test "Org" & Company',
        description: "Test's description with <special> characters",
      };

      const result = generateJSONLD("Organization", data);
      const parsed = JSON.parse(result);

      expect(parsed.name).toBe('Test "Org" & Company');
      expect(parsed.description).toBe("Test's description with <special> characters");
    });

    it("should return valid JSON string", () => {
      const data = {
        name: "Test",
        value: 123,
        active: true,
        nullable: null,
      };

      const result = generateJSONLD("Thing", data);

      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe("generateOGImage", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    });

    it("should generate OG image with default dimensions", () => {
      const result = generateOGImage("/og-image.png");

      expect(result).toEqual({
        url: "https://example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sudoku Daily",
      });
    });

    it("should accept custom dimensions", () => {
      const result = generateOGImage("/og-image.png", {
        width: 800,
        height: 600,
      });

      expect(result).toMatchObject({
        width: 800,
        height: 600,
      });
    });

    it("should accept custom alt text", () => {
      const result = generateOGImage("/og-image.png", {
        alt: "Custom Alt Text",
      });

      expect(result.alt).toBe("Custom Alt Text");
    });

    it("should accept all custom options", () => {
      const result = generateOGImage("/og-image.png", {
        width: 1000,
        height: 500,
        alt: "Complete Custom Image",
      });

      expect(result).toEqual({
        url: "https://example.com/og-image.png",
        width: 1000,
        height: 500,
        alt: "Complete Custom Image",
      });
    });

    it("should convert relative URL to absolute", () => {
      const result = generateOGImage("/images/og.png");

      expect(result.url).toBe("https://example.com/images/og.png");
    });

    it("should handle URL without leading slash", () => {
      const result = generateOGImage("images/og.png");

      expect(result.url).toBe("https://example.com/images/og.png");
    });
  });

  describe("edge cases", () => {
    it("should handle empty strings gracefully", () => {
      const options: SEOMetadata = {
        title: "",
        description: "",
      };

      const result = generateMetadata(options);

      expect(result.title).toBe("");
      expect(result.description).toBe("");
    });

    it("should handle very long strings", () => {
      const longString = "a".repeat(1000);
      const options: SEOMetadata = {
        title: longString,
        description: longString,
      };

      const result = generateMetadata(options);

      expect(result.title).toBe(longString);
      expect(result.description).toBe(longString);
    });

    it("should handle special characters in metadata", () => {
      const options: SEOMetadata = {
        title: "Title with <script>alert('xss')</script>",
        description: 'Description with "quotes" & ampersands',
      };

      const result = generateMetadata(options);

      expect(result.title).toContain("<script>");
      expect(result.description).toContain('"quotes"');
    });

    it("should handle unicode characters", () => {
      const options: SEOMetadata = {
        title: "日本語タイトル",
        description: "Описание на русском",
      };

      const result = generateMetadata(options);

      expect(result.title).toBe("日本語タイトル");
      expect(result.description).toBe("Описание на русском");
    });
  });
});
