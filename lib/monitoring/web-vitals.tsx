"use client";

import { useEffect } from "react";
import { onCLS, onLCP, onFCP, onTTFB, onINP, Metric } from "web-vitals";

/**
 * Web Vitals Performance Monitoring
 *
 * Tracks Core Web Vitals and custom performance metrics using the web-vitals library.
 * Automatically sends metrics to Vercel Analytics (if deployed) or custom analytics endpoint.
 *
 * @see docs/architecture.md (Performance Monitoring section)
 */

/**
 * Custom metric interface for analytics
 * Simpler than Metric from web-vitals for custom business metrics
 */
interface CustomMetric {
  name: string;
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  id?: string;
  [key: string]: unknown;
}

/**
 * Send performance metric to analytics endpoint
 *
 * Uses navigator.sendBeacon for reliability (works even during page unload).
 * Falls back to fetch if sendBeacon is not available.
 *
 * @param metric - Web Vitals metric or custom metric object
 */
function sendToAnalytics(metric: Metric | CustomMetric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id || crypto.randomUUID(),
    url: window.location.href,
    timestamp: Date.now(),
  });

  // Use sendBeacon for reliability (non-blocking, works during page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", body);
  } else {
    // Fallback to fetch (may not complete if page is unloading)
    fetch("/api/analytics", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch((error) => {
      // Silently fail - don't let analytics errors break user experience
      console.debug("[Web Vitals] Failed to send metric:", error);
    });
  }
}

/**
 * Web Vitals Reporter Component
 *
 * Client-side component that registers Web Vitals callbacks on mount.
 * Tracks Core Web Vitals: LCP, FID/INP, CLS, FCP, TTFB.
 *
 * Add to root layout:
 * ```tsx
 * <WebVitalsReporter />
 * ```
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Core Web Vitals (CWV)
    onCLS(sendToAnalytics); // Cumulative Layout Shift - target <0.1
    onINP(sendToAnalytics); // Interaction to Next Paint - target <200ms (replaced FID)
    onLCP(sendToAnalytics); // Largest Contentful Paint - target <2.5s

    // Other important metrics
    onFCP(sendToAnalytics); // First Contentful Paint
    onTTFB(sendToAnalytics); // Time to First Byte
  }, []);

  // No UI rendering - this is a monitoring-only component
  return null;
}

/**
 * Custom Performance Metrics
 *
 * Track business-specific performance metrics beyond Core Web Vitals.
 */

/**
 * Track puzzle completion time
 *
 * @param time - Time in seconds to complete puzzle
 * @param puzzleId - Puzzle identifier
 *
 * @example
 * ```typescript
 * trackPuzzleCompletion(325, 'puzzle-456'); // 325 seconds = 5:25
 * ```
 */
export function trackPuzzleCompletion(time: number, puzzleId: string) {
  const metric: CustomMetric = {
    name: "puzzle_completion_time",
    value: time * 1000, // Convert to milliseconds for consistency with Web Vitals
    rating: "good",
    puzzleId,
  };

  sendToAnalytics(metric);

  // Also log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Metrics] Puzzle completed in ${time}s (${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")})`
    );
  }
}

/**
 * Track leaderboard load time
 *
 * @param duration - Time in milliseconds to load leaderboard data
 *
 * @example
 * ```typescript
 * const start = performance.now();
 * await fetchLeaderboard();
 * trackLeaderboardLoad(performance.now() - start);
 * ```
 */
export function trackLeaderboardLoad(duration: number) {
  const metric: CustomMetric = {
    name: "leaderboard_load_time",
    value: duration,
    rating: duration < 500 ? "good" : duration < 1000 ? "needs-improvement" : "poor",
  };

  sendToAnalytics(metric);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Metrics] Leaderboard loaded in ${duration.toFixed(0)}ms`);
  }
}

/**
 * Track real-time update latency
 *
 * Measures time from server event to UI update (real-time connection performance).
 *
 * @param latency - Latency in milliseconds
 *
 * @example
 * ```typescript
 * const eventTime = new Date(event.timestamp).getTime();
 * const receivedTime = Date.now();
 * trackRealtimeLatency(receivedTime - eventTime);
 * ```
 */
export function trackRealtimeLatency(latency: number) {
  const metric: CustomMetric = {
    name: "realtime_update_latency",
    value: latency,
    rating: latency < 1000 ? "good" : latency < 2000 ? "needs-improvement" : "poor",
  };

  sendToAnalytics(metric);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Metrics] Real-time update latency: ${latency.toFixed(0)}ms`);
  }
}

/**
 * Track custom event (generic)
 *
 * For tracking custom business events beyond standard metrics.
 *
 * @param name - Event name (use snake_case convention)
 * @param value - Numeric value (optional)
 * @param metadata - Additional metadata (optional)
 *
 * @example
 * ```typescript
 * trackCustomEvent('user_shared_result', 1, { puzzleId: 'puzzle-456' });
 * ```
 */
export function trackCustomEvent(
  name: string,
  value?: number,
  metadata?: Record<string, unknown>
) {
  const metric: CustomMetric = {
    name,
    value: value ?? 1,
    rating: "good",
    ...metadata,
  };

  sendToAnalytics(metric);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Metrics] Custom event: ${name}`, value, metadata);
  }
}
