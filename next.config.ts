import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  reactCompiler: true,
};

// Wrap Next.js config with Sentry for error tracking and performance monitoring
export default withSentryConfig(
  withNextIntl(nextConfig),
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
