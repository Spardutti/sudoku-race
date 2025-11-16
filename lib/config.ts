/**
 * Application Configuration
 * Centralized configuration constants used throughout the application
 *
 * @module lib/config
 */

/**
 * Get the base URL for the application
 * Used for generating absolute URLs, sitemaps, and metadata
 *
 * Reads from NEXT_PUBLIC_SITE_URL environment variable
 * Falls back to localhost:3000 for local development
 *
 * Note: This is a getter function to support testing where env vars change.
 * In production, the value is constant.
 *
 * @example
 * ```typescript
 * import { getSiteURL } from "@/lib/config";
 *
 * const absoluteUrl = `${getSiteURL()}/about`;
 * ```
 */
export function getSiteURL(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/**
 * Base URL for the application (constant)
 * Use getSiteURL() in tests or when env vars might change
 */
export const SITE_URL = getSiteURL();

/**
 * Social Media Handles
 * Centralized social media account identifiers
 *
 * TODO: Update these with actual account handles once created
 */
export const SOCIAL_MEDIA = {
  twitter: {
    handle: "@sudokudaily", // TODO: Verify this handle exists
    site: "@sudokudaily",
  },
  github: "https://github.com/sudoku-daily", // TODO: Verify this org exists
} as const;
