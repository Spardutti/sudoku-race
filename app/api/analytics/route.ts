import { NextRequest, NextResponse } from "next/server";

/**
 * Analytics API Endpoint
 *
 * Receives Web Vitals and custom performance metrics from the client.
 * In production, this can forward metrics to your analytics platform.
 *
 * For now, this is a placeholder that logs metrics to console (development)
 * or silently accepts them (production). Vercel Analytics automatically
 * collects Core Web Vitals, so this endpoint is optional.
 *
 * @see lib/monitoring/web-vitals.tsx
 */
export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // Log metrics in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: metric.url,
      });
    }

    // In production, you could forward metrics to:
    // - Vercel Analytics API (automatic)
    // - Custom analytics database
    // - Third-party analytics service (Mixpanel, Amplitude, etc.)

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Don't let analytics errors break the user experience
    // Silently fail and return 200 to avoid client-side retries
    console.error("[Analytics] Error processing metric:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
