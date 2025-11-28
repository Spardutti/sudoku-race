import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
import "./globals.css";
import { HeaderWithAuth } from "@/components/layout/HeaderWithAuth";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/react";
import { WebVitalsReporter } from "@/lib/monitoring/web-vitals";
import { SITE_URL, SOCIAL_MEDIA } from "@/lib/config";
import { Toaster } from "@/components/ui/sonner";

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

/**
 * Site Metadata Configuration
 * Complete SEO metadata including OpenGraph, Twitter cards, and structured data
 * @see docs/seo.md for detailed configuration guide
 */

export const metadata: Metadata = {
  // Metadata base URL for resolving relative URLs in OG images
  metadataBase: new URL(SITE_URL),

  // Basic metadata
  title: {
    default: "Sudoku Daily - Pure Daily Sudoku Challenge",
    template: "%s | Sudoku Daily",
  },
  description:
    "One authentic Sudoku puzzle daily. No hints, pure challenge, real competition. Compete on global leaderboards and track your solving streak.",
  keywords: [
    "sudoku",
    "daily sudoku",
    "sudoku puzzle",
    "sudoku online",
    "daily puzzle",
    "brain game",
    "logic puzzle",
    "sudoku leaderboard",
    "competitive sudoku",
    "puzzle game",
  ],
  authors: [{ name: "Sudoku Daily Team" }],
  creator: "Sudoku Daily",
  publisher: "Sudoku Daily",

  // SEO directives
  robots: {
    index: true,
    follow: true,
  },

  // OpenGraph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Sudoku Daily",
    title: "Sudoku Daily - Pure Daily Sudoku Challenge",
    description:
      "One authentic Sudoku puzzle daily. No hints, pure challenge, real competition.",
    images: [
      {
        url: "/og-image.jpg",
        width: 945,
        height: 630,
        alt: "Sudoku Daily - Daily Puzzle Challenge",
      },
    ],
  },

  // Twitter card metadata
  twitter: {
    card: "summary_large_image",
    site: SOCIAL_MEDIA.twitter.site,
    creator: SOCIAL_MEDIA.twitter.handle,
    title: "Sudoku Daily",
    description: "One authentic Sudoku puzzle daily. Pure challenge, real competition.",
    images: ["/twitter-card.jpg"],
  },

  // Favicon auto-detected from app/favicon.ico (Next.js 13+ convention)
  // Apple touch icon (optional - add app/apple-icon.png when ready)
};

/**
 * Viewport Configuration
 * Separated from metadata as per Next.js 16 API
 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  themeColor: "#000000", // Black - newspaper aesthetic
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization structured data (JSON-LD) for search engines
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sudoku Daily",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Daily Sudoku puzzle platform with global leaderboards",
    sameAs: [
      `https://twitter.com/${SOCIAL_MEDIA.twitter.handle.replace("@", "")}`,
      SOCIAL_MEDIA.github,
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${merriweather.variable} ${inter.variable} font-sans antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <HeaderWithAuth />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
        <Analytics />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
