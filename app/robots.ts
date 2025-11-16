import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/**
 * Robots.txt Configuration
 * Defines crawling rules for search engine bots
 * Accessible at /robots.txt
 *
 * @see docs/seo.md for robots.txt configuration details
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/auth/", "/api/"], // Block private and API routes
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
