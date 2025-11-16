/**
 * Sentry Server-Side Configuration
 *
 * Initializes Sentry error tracking for server-side errors:
 * - Server Actions
 * - API Routes
 * - Server Components
 *
 * @see lib/monitoring/sentry.ts for initialization logic
 */

import { initSentry } from "./lib/monitoring/sentry";

// Initialize Sentry for server-side errors
initSentry();
