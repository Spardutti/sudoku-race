import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/**
 * Sitemap Configuration
 * Auto-generated XML sitemap for search engine crawling
 * Accessible at /sitemap.xml
 *
 * TODO: Make this dynamic when adding blog posts, puzzle archives, etc.
 * For now, only includes static pages.
 *
 * @see docs/seo.md for sitemap configuration details
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
  ];
}
