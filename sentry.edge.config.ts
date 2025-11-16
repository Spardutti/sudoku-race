/**
 * Sentry Edge Runtime Configuration
 *
 * Initializes Sentry error tracking for Edge Runtime (Middleware, Edge API Routes).
 *
 * @see lib/monitoring/sentry.ts for initialization logic
 */

import { initSentry } from "./lib/monitoring/sentry";

// Initialize Sentry for edge runtime errors
initSentry();
