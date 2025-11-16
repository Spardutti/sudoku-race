import type { Metadata } from "next";
import { getSiteURL } from "@/lib/config";

/**
 * SEO Metadata Utilities
 *
 * Helper functions for generating SEO metadata, structured data,
 * and absolute URLs for Next.js applications.
 *
 * @module lib/utils/metadata
 * @see docs/seo.md for usage examples
 */

/**
 * SEO Metadata Options
 * Simplified interface for common metadata configurations
 */
export interface SEOMetadata {
  /** Page title (will use template from root layout) */
  title: string;
  /** Meta description for search engines */
  description: string;
  /** Canonical URL path (e.g., "/about" or full URL) */
  canonicalPath?: string;
  /** OpenGraph image URL (relative or absolute) */
  ogImage?: string;
  /** Twitter card image URL (relative or absolute) */
  twitterCard?: string;
  /** SEO keywords (optional) */
  keywords?: string[];
  /** Robots directives (default: index=true, follow=true) */
  robots?: { index: boolean; follow: boolean };
}

/**
 * OpenGraph Image Options
 * Configuration for social media preview images
 */
export interface OGImageOptions {
  /** Image URL */
  url: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Alt text for accessibility */
  alt: string;
}

/**
 * Generate comprehensive metadata object from simplified options
 *
 * @param options - SEO metadata options
 * @returns Next.js Metadata object
 *
 * @example
 * ```typescript
 * export const metadata = generateMetadata({
 *   title: "About Us",
 *   description: "Learn about our mission",
 *   canonicalPath: "/about",
 *   ogImage: "/images/about-og.png"
 * });
 * ```
 */
export function generateMetadata(options: SEOMetadata): Metadata {
  return {
    title: options.title,
    description: options.description,
    alternates: options.canonicalPath
      ? {
          canonical: options.canonicalPath.startsWith("http")
            ? options.canonicalPath
            : getAbsoluteURL(options.canonicalPath),
        }
      : undefined,
    openGraph: {
      title: options.title,
      description: options.description,
      images: options.ogImage ? [options.ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: options.twitterCard ? [options.twitterCard] : undefined,
    },
    keywords: options.keywords,
    robots: options.robots,
  };
}

/**
 * Convert relative path to absolute URL
 *
 * Uses getSiteURL() (from NEXT_PUBLIC_SITE_URL environment variable).
 * Falls back to localhost:3000 in development.
 *
 * @param path - Relative or absolute path
 * @returns Absolute URL
 * @throws Error if the generated URL is invalid
 *
 * @example
 * ```typescript
 * getAbsoluteURL("/about") // => "https://sudoku-daily.vercel.app/about"
 * getAbsoluteURL("/images/og.png") // => "https://sudoku-daily.vercel.app/images/og.png"
 * ```
 */
export function getAbsoluteURL(path: string): string {
  const siteURL = getSiteURL();

  // Remove trailing slash from baseURL if present
  const normalizedBase = siteURL.endsWith("/")
    ? siteURL.slice(0, -1)
    : siteURL;

  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const result = `${normalizedBase}${normalizedPath}`;

  // Validate the generated URL
  try {
    new URL(result);
    return result;
  } catch {
    throw new Error(`Invalid URL generated: ${result}`);
  }
}

/**
 * Generate JSON-LD structured data script
 *
 * Creates properly formatted JSON-LD for schema.org structured data.
 * Output is safe for dangerouslySetInnerHTML.
 *
 * @param type - Schema.org type (e.g., "Organization", "WebPage", "Article")
 * @param data - Schema data object
 * @returns JSON string ready for script tag injection
 *
 * @example
 * ```typescript
 * const schema = generateJSONLD("Article", {
 *   headline: "How to Solve Sudoku",
 *   author: { "@type": "Person", name: "Jane Doe" },
 *   datePublished: "2024-01-01"
 * });
 * ```
 */
export function generateJSONLD(type: string, data: Record<string, unknown>): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return JSON.stringify(schema);
}

/**
 * Generate OpenGraph image configuration
 *
 * Helper for creating properly formatted OG image objects.
 *
 * @param url - Image URL (relative or absolute)
 * @param options - Optional width, height, alt text
 * @returns OpenGraph image object
 *
 * @example
 * ```typescript
 * const ogImage = generateOGImage("/og-image.png", {
 *   width: 1200,
 *   height: 630,
 *   alt: "Sudoku Daily - Daily Puzzle"
 * });
 * ```
 */
export function generateOGImage(
  url: string,
  options?: Partial<Omit<OGImageOptions, "url">>
): OGImageOptions {
  return {
    url: getAbsoluteURL(url),
    width: options?.width || 1200,
    height: options?.height || 630,
    alt: options?.alt || "Sudoku Daily",
  };
}
