/**
 * Sentry Client-Side Configuration
 *
 * Initializes Sentry error tracking for client-side JavaScript errors.
 * Automatically imported by Next.js when @sentry/nextjs is installed.
 *
 * @see lib/monitoring/sentry.ts for initialization logic
 */

import { initSentry } from "./lib/monitoring/sentry";

// Initialize Sentry for client-side errors
initSentry();
