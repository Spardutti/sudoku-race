import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
import "./globals.css";
import { HeaderWithAuth } from "@/components/layout/HeaderWithAuth";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/react";
import { WebVitalsReporter } from "@/lib/monitoring/web-vitals";
import { SITE_URL, SOCIAL_MEDIA } from "@/lib/config";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallInstructions } from "@/components/pwa/IOSInstallInstructions";
import { VisitTracker } from "@/components/pwa/VisitTracker";
import { OfflineBadge } from "@/components/pwa/OfflineBadge";

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: true,
});

/**
 * Site Metadata Configuration
 * Complete SEO metadata including OpenGraph, Twitter cards, and structured data
 * @see docs/seo.md for detailed configuration guide
 */

export const metadata: Metadata = {
  // Metadata base URL for resolving relative URLs in OG images
  metadataBase: new URL(SITE_URL),

  // PWA application name
  applicationName: "Sudoku Race",

  // Basic metadata
  title: {
    default: "Sudoku Race - Pure Daily Sudoku Challenge",
    template: "%s | Sudoku Race",
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
  authors: [{ name: "Sudoku Race Team" }],
  creator: "Sudoku Race",
  publisher: "Sudoku Race",

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
    siteName: "Sudoku Race",
    title: "Sudoku Race - Pure Daily Sudoku Challenge",
    description:
      "One authentic Sudoku puzzle daily. No hints, pure challenge, real competition.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sudoku Race - Daily Sudoku puzzle with emoji grid showing solving progress",
      },
    ],
  },

  // Twitter card metadata
  twitter: {
    card: "summary_large_image",
    site: SOCIAL_MEDIA.twitter.site,
    creator: SOCIAL_MEDIA.twitter.handle,
    title: "Sudoku Race",
    description: "One authentic Sudoku puzzle daily. Pure challenge, real competition.",
    images: [
      {
        url: "/og-image.png",
        alt: "Sudoku Race - Daily Sudoku puzzle with emoji grid showing solving progress",
      },
    ],
  },

  // Favicon auto-detected from app/favicon.ico (Next.js 13+ convention)
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
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

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  // Organization structured data (JSON-LD) for search engines
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sudoku Race",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Daily Sudoku puzzle platform with global leaderboards",
    sameAs: [
      `https://twitter.com/${SOCIAL_MEDIA.twitter.handle.replace("@", "")}`,
      SOCIAL_MEDIA.github,
    ],
  };

  return (
    <html lang={locale}>
      <head>
        <meta name="google-site-verification" content="AFAhu4aIjlPkdOiIvc2KMBGeByoqiO8kDagm1X1GO90" />
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
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <HeaderWithAuth />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <Analytics />
            <WebVitalsReporter />
            <VisitTracker />
            <OfflineBadge />
            <InstallPrompt />
            <IOSInstallInstructions />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
