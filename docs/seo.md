# SEO Foundation Documentation

## Overview

This document describes the SEO (Search Engine Optimization) and social sharing implementation for Sudoku Daily. The implementation uses Next.js 16's built-in Metadata API to provide comprehensive search engine optimization, social media previews, and structured data for rich search results.

**Key Features:**
- Comprehensive metadata configuration (title, description, keywords)
- OpenGraph tags for social media sharing (Facebook, LinkedIn)
- Twitter card optimization for tweet embeds
- Structured data (JSON-LD) for rich search results
- Auto-generated sitemap for search engine crawling
- Robots.txt for crawler management
- Reusable SEO utilities for consistent implementation

**Benefits:**
- **Organic Discovery**: Professional presentation in search engine results
- **Social Sharing**: Attractive previews when sharing on social media
- **Brand Consistency**: Newspaper aesthetic across all touchpoints
- **Developer Experience**: Type-safe metadata configuration with Next.js

---

## Architecture

### Next.js Metadata API

Sudoku Daily uses Next.js 16's built-in Metadata API for all SEO configuration. This approach provides:

- **Type Safety**: Full TypeScript support for metadata objects
- **SSR Support**: Metadata rendered server-side for optimal SEO
- **Automatic Deduplication**: No duplicate meta tags
- **File-based Generation**: Sitemap and robots.txt auto-generated

### Metadata Hierarchy

```
Root Layout (app/layout.tsx)
├── Default metadata (title template, description, OG tags)
├── Organization schema (JSON-LD)
└── Global settings (viewport, theme color, icons)

Page-Specific Overrides
├── app/page.tsx → "Today's Puzzle"
├── app/leaderboard/page.tsx → "Global Leaderboard"
└── app/profile/page.tsx → "Your Profile" (noindex)

Auto-Generated Files
├── app/sitemap.ts → /sitemap.xml
└── app/robots.ts → /robots.txt
```

### Structured Data Strategy

We implement two schema.org types:

1. **Organization** (Root Layout)
   - Establishes brand identity
   - Links social media profiles
   - Provides logo and description

2. **WebPage** (Home Page)
   - Describes daily puzzle page
   - Enhances search result presentation
   - Foundation for future Article schemas

---

## Implementation Guide

### 1. Root Metadata Configuration

The root layout (`app/layout.tsx`) defines default metadata for all pages:

```typescript
// app/layout.tsx
import type { Metadata } from "next";

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Sudoku Daily - Pure Daily Sudoku Challenge",
    template: "%s | Sudoku Daily", // Used by child pages
  },
  description: "One authentic Sudoku puzzle daily. No hints, pure challenge, real competition.",
  keywords: ["sudoku", "daily sudoku", "puzzle game"],

  // OpenGraph for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteURL,
    siteName: "Sudoku Daily",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Sudoku Daily"
    }]
  },

  // Twitter cards
  twitter: {
    card: "summary_large_image",
    site: "@sudokudaily",
    images: ["/twitter-card.png"]
  }
};
```

### 2. Page-Specific Metadata

Individual pages override root metadata as needed:

```typescript
// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Puzzle", // Uses template: "Today's Puzzle | Sudoku Daily"
  description: "Solve today's medium-difficulty Sudoku puzzle...",
  openGraph: {
    title: "Today's Sudoku Puzzle | Sudoku Daily",
    description: "Challenge yourself with today's puzzle..."
  }
};
```

**Private Pages:**

```typescript
// app/profile/page.tsx
export const metadata: Metadata = {
  title: "Your Profile",
  robots: {
    index: false, // Don't index private pages
    follow: true
  }
};
```

### 3. Structured Data (JSON-LD)

Add schema.org structured data in component body:

```typescript
export default function RootLayout({ children }) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sudoku Daily",
    url: siteURL,
    logo: `${siteURL}/logo.png`,
    description: "Daily Sudoku puzzle platform",
    sameAs: [
      "https://twitter.com/sudokudaily",
      "https://github.com/sudoku-daily"
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 4. Sitemap Generation

Create `app/sitemap.ts` for automatic sitemap generation:

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return [
    {
      url: siteURL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${siteURL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8
    }
  ];
}
```

**Accessible at:** `/sitemap.xml`

### 5. Robots.txt Configuration

Create `app/robots.ts` for crawler directives:

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/auth/"]
    },
    sitemap: `${siteURL}/sitemap.xml`
  };
}
```

**Accessible at:** `/robots.txt`

### 6. SEO Utilities

Use helper functions from `lib/utils/metadata.ts`:

```typescript
import { generateMetadata, getAbsoluteURL, generateOGImage } from "@/lib/utils/metadata";

// Simplified metadata generation
export const metadata = generateMetadata({
  title: "About Us",
  description: "Learn about our mission",
  ogImage: "/about-og.png",
  keywords: ["about", "team"]
});

// Convert relative to absolute URLs
const absoluteURL = getAbsoluteURL("/leaderboard");
// => "https://sudoku-daily.vercel.app/leaderboard"

// Generate OG image configuration
const ogImage = generateOGImage("/og-image.png", {
  width: 1200,
  height: 630,
  alt: "Custom alt text"
});
```

---

## Social Media Images

### Image Specifications

| Image Type | Dimensions | Format | Max Size | Location |
|------------|-----------|--------|----------|----------|
| OpenGraph | 1200x630px | PNG/JPG | 200KB | `/public/og-image.png` |
| Twitter Card | 1200x600px | PNG/JPG | 200KB | `/public/twitter-card.png` |
| Favicon | 32x32, 16x16 | ICO | - | `/public/favicon.ico` |
| Apple Icon | 180x180px | PNG | - | `/public/apple-icon.png` |
| Logo | 512x512px | PNG | - | `/public/logo.png` |

### Design Guidelines

All images should follow the **newspaper aesthetic**:
- **Colors**: Black (#000000), white (#FFFFFF), blue accent (#1a73e8)
- **Typography**: Merriweather (serif) for headlines, Inter (sans) for body
- **Style**: Clean, minimal, high-contrast
- **Branding**: Include "Sudoku Daily" title prominently

### Creating Images

**Option 1: Design Tools**
- Use Figma, Canva, or Photoshop
- Start with newspaper layout template
- Export at exact dimensions (1200x630 for OG)
- Optimize with ImageOptim or TinyPNG

**Option 2: Code-Based Generation** (Future Enhancement)
```typescript
// app/api/og/route.tsx (Epic 5 - Dynamic OG Images)
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  return new ImageResponse(
    (
      <div style={{
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <h1 style={{ fontSize: 60, fontFamily: "Merriweather" }}>
          Sudoku Daily
        </h1>
        <p style={{ fontSize: 30 }}>Today's Puzzle</p>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
```

---

## Testing & Validation

### Validation Tools

1. **Google Rich Results Test**
   - URL: https://search.google.com/test/rich-results
   - Tests: Structured data validation
   - Expected: No errors, Organization and WebPage schemas detected

2. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Tests: OpenGraph tags, image preview
   - Expected: Correct title, description, 1200x630 image

3. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Tests: Twitter card metadata, image preview
   - Expected: summary_large_image card with correct content

4. **Google Lighthouse**
   - Run: `npm run build && npm start`, then audit in Chrome DevTools
   - Tests: SEO audit score
   - Expected: Score ≥95

### Testing Checklist

**Local Development:**
- [ ] View page source (`Ctrl+U`) and verify `<meta>` tags in `<head>`
- [ ] Check title format: "Page Title | Sudoku Daily"
- [ ] Verify OpenGraph tags: `og:title`, `og:description`, `og:image`
- [ ] Verify Twitter tags: `twitter:card`, `twitter:title`, `twitter:image`
- [ ] Check JSON-LD script in `<head>`
- [ ] Access `/sitemap.xml` and verify XML format
- [ ] Access `/robots.txt` and verify content

**Production Deployment:**
- [ ] Run Google Rich Results Test with production URL
- [ ] Test Facebook sharing with actual share dialog
- [ ] Test Twitter sharing with actual tweet composer
- [ ] Submit sitemap to Google Search Console
- [ ] Verify favicon in browser tabs (Chrome, Safari, Firefox)
- [ ] Test "Add to Home Screen" on iOS (Apple icon)

### Manual Testing Commands

```bash
# Build and test locally
npm run build
npm start

# View sitemap
curl http://localhost:3000/sitemap.xml

# View robots.txt
curl http://localhost:3000/robots.txt

# Run Lighthouse SEO audit
npx lighthouse http://localhost:3000 --only-categories=seo --view
```

---

## Environment Variables

### Required Variables

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Production (Vercel):**
```bash
NEXT_PUBLIC_SITE_URL=https://sudoku-daily.vercel.app
```

**Important:** Update this variable in Vercel dashboard before deployment to ensure correct absolute URLs in metadata.

---

## Troubleshooting

### Issue: Social media preview not showing

**Symptoms:**
- Sharing on Facebook/Twitter shows generic preview
- No image appears in share preview

**Solutions:**
1. Verify images exist in `/public/` directory
2. Check image URLs are absolute (not relative)
3. Clear social media cache:
   - Facebook: Use Sharing Debugger "Scrape Again" button
   - Twitter: Wait 7 days or use new URL with query param
4. Verify image dimensions (1200x630 for OG)
5. Check image file size (<200KB recommended)

### Issue: Title template not working

**Symptoms:**
- Page titles don't include "| Sudoku Daily" suffix
- Title shows template string literally

**Solutions:**
1. Ensure root layout exports `title.template`
2. Child pages should export `title: "Page Title"` (string, not object)
3. Check for typos in template syntax (`%s` placeholder)

### Issue: Robots.txt not accessible

**Symptoms:**
- `/robots.txt` returns 404
- Search Console shows "robots.txt not found"

**Solutions:**
1. Verify `app/robots.ts` exists
2. Check file exports `default function robots()`
3. Rebuild application (`npm run build`)
4. Clear browser cache and retry

### Issue: Structured data not detected

**Symptoms:**
- Google Rich Results Test shows no structured data
- Schema.org errors in Search Console

**Solutions:**
1. Verify JSON-LD script in page source
2. Check JSON syntax with validator (jsonlint.com)
3. Ensure `@context` and `@type` are present
4. Validate schema with Google Rich Results Test
5. Check for React hydration errors (console warnings)

### Issue: Sitemap empty or missing pages

**Symptoms:**
- `/sitemap.xml` shows only homepage
- New pages not appearing in sitemap

**Solutions:**
1. Update `app/sitemap.ts` with new routes
2. Rebuild application
3. Verify `NEXT_PUBLIC_SITE_URL` is set correctly
4. Check route priorities and change frequencies

---

## Future Enhancements

### Planned for Epic 5 (Viral Social Mechanics)

**Dynamic OpenGraph Images:**
- Generate unique OG images per puzzle completion
- Include puzzle date, completion time, emoji grid
- Use Next.js `ImageResponse` API for server-side rendering

**Enhanced Metadata:**
- Per-puzzle metadata (difficulty, date, theme)
- User-specific share URLs with custom previews
- Leaderboard position in share images

### Post-MVP Features

**Multi-language SEO:**
- Internationalization (i18n) support
- Language-specific metadata and hreflang tags
- Localized structured data

**Advanced Structured Data:**
- FAQ schema for help pages
- Breadcrumb navigation schema
- Review/Rating schema for puzzles

**Progressive Web App:**
- Web app manifest for installability
- Offline-first metadata caching
- App-like experience on mobile

---

## References

### Official Documentation
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [OpenGraph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central - SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

### Validation Tools
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Design Resources
- [OpenGraph Image Templates](https://www.opengraph.xyz/)
- [Favicon Generator](https://favicon.io/)
- [ImageOptim](https://imageoptim.com/) - Image compression
- [TinyPNG](https://tinypng.com/) - PNG/JPG optimization

---

## Changelog

### Story 1.8 (2024-01-16)
- ✅ Initial SEO foundation implementation
- ✅ Root metadata configuration with OpenGraph and Twitter cards
- ✅ Page-specific metadata for home, leaderboard, profile
- ✅ Organization and WebPage structured data (JSON-LD)
- ✅ Auto-generated sitemap and robots.txt
- ✅ SEO utility functions with TypeScript types
- ✅ Comprehensive documentation and testing guide
- 📝 Note: Social media images (OG, Twitter, favicon) require manual creation

### Future Updates
- Epic 5: Dynamic OG image generation
- Post-MVP: Multi-language SEO, advanced schemas
