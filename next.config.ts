import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: false,
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",
              "worker-src 'self'",
              "manifest-src 'self'",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

// Wrap Next.js config with Serwist, Next Intl, and Sentry
export default withSentryConfig(
  withSerwist(withNextIntl(nextConfig)),
  {
    // Sentry build-time configuration options
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Suppress Sentry CLI output during build (reduce noise)
    silent: !process.env.CI,

    // Upload source maps for better error stack traces (only in production)
    widenClientFileUpload: true,
    disableLogger: true,
  }
);
