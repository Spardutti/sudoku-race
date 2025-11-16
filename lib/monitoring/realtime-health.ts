import { RealtimeChannel } from "@supabase/supabase-js";
import { logger } from "@/lib/utils/logger";
import { captureException } from "@/lib/monitoring/sentry";

/**
 * Real-Time Connection Health Monitoring
 *
 * Monitors Supabase real-time connection health, logs events, and tracks metrics.
 * Helps identify connection issues, latency problems, and disconnection patterns.
 *
 * @see docs/architecture.md (Real-Time Connection Health section)
 */

/**
 * Connection health metrics
 */
interface ConnectionMetrics {
  totalAttempts: number;
  successfulConnections: number;
  failedConnections: number;
  disconnections: number;
  averageLatency: number;
  lastConnectionTime?: number;
}

// Global metrics tracking
const metrics: ConnectionMetrics = {
  totalAttempts: 0,
  successfulConnections: 0,
  failedConnections: 0,
  disconnections: 0,
  averageLatency: 0,
};

// Latency samples for averaging
const latencySamples: number[] = [];

/**
 * Calculate connection success rate
 *
 * @returns Success rate as percentage (0-100)
 */
export function getConnectionSuccessRate(): number {
  if (metrics.totalAttempts === 0) return 100; // No attempts yet
  return (metrics.successfulConnections / metrics.totalAttempts) * 100;
}

/**
 * Get current connection metrics
 *
 * @returns Current connection health metrics
 */
export function getConnectionMetrics(): ConnectionMetrics {
  return { ...metrics };
}

/**
 * Track connection latency
 *
 * @param latency - Latency in milliseconds
 */
function trackLatency(latency: number): void {
  latencySamples.push(latency);

  // Keep only last 100 samples
  if (latencySamples.length > 100) {
    latencySamples.shift();
  }

  // Calculate average
  const sum = latencySamples.reduce((acc, val) => acc + val, 0);
  metrics.averageLatency = Math.round(sum / latencySamples.length);
}

/**
 * Monitor real-time channel health
 *
 * Attaches event listeners to Supabase real-time channel for connection monitoring.
 * Logs connection events, tracks metrics, and captures errors to Sentry.
 *
 * @param channel - Supabase real-time channel to monitor
 * @param channelName - Human-readable channel name (e.g., 'leaderboard')
 *
 * @example
 * ```typescript
 * const channel = supabase.channel('leaderboard');
 * monitorRealtimeHealth(channel, 'leaderboard');
 * channel.on('postgres_changes', { ... }, callback).subscribe();
 * ```
 */
export function monitorRealtimeHealth(
  channel: RealtimeChannel,
  channelName: string = "default"
): void {
  const connectionStartTime = Date.now();
  metrics.totalAttempts++;

  // Monitor successful connection
  channel.on("system", { event: "connected" }, () => {
    const latency = Date.now() - connectionStartTime;
    metrics.successfulConnections++;
    metrics.lastConnectionTime = Date.now();
    trackLatency(latency);

    logger.info("Real-time connection established", {
      action: "realtime-connected",
      channel: channelName,
      latency,
      successRate: getConnectionSuccessRate().toFixed(1),
    });
  });

  // Monitor connection errors
  channel.on("system", { event: "error" }, (error: { message: string }) => {
    metrics.failedConnections++;

    logger.error("Real-time connection error", new Error(error.message), {
      action: "realtime-error",
      channel: channelName,
      successRate: getConnectionSuccessRate().toFixed(1),
    });

    // Capture in Sentry with real-time tag
    captureException(
      new Error(`Real-time connection error: ${error.message}`),
      {
        channel: channelName,
        component: "realtime",
        successRate: getConnectionSuccessRate(),
      },
      "high"
    );
  });

  // Monitor channel errors (CHANNEL_ERROR event)
  channel.on("system", { event: "CHANNEL_ERROR" }, (error: unknown) => {
    metrics.failedConnections++;

    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : "Unknown channel error";

    logger.error("Real-time channel error", new Error(errorMessage), {
      action: "channel-error",
      channel: channelName,
    });

    captureException(
      new Error(`Channel error: ${errorMessage}`),
      {
        channel: channelName,
        component: "realtime",
      },
      "medium"
    );
  });

  // Monitor disconnections
  channel.on("system", { event: "disconnected" }, () => {
    metrics.disconnections++;

    logger.warn("Real-time connection disconnected", {
      action: "realtime-disconnected",
      channel: channelName,
      disconnections: metrics.disconnections,
    });
  });

  // Log connection attempt
  logger.debug("Monitoring real-time connection", {
    action: "realtime-monitor-start",
    channel: channelName,
  });
}

/**
 * Create health check for real-time connection
 *
 * Useful for periodic health monitoring and alerting.
 *
 * @returns Health status with metrics
 */
export function checkRealtimeHealth(): {
  healthy: boolean;
  metrics: ConnectionMetrics;
  issues: string[];
} {
  const issues: string[] = [];
  const successRate = getConnectionSuccessRate();

  // Check success rate (target >95%)
  if (successRate < 95) {
    issues.push(`Low connection success rate: ${successRate.toFixed(1)}%`);
  }

  // Check average latency (target <1000ms)
  if (metrics.averageLatency > 1000) {
    issues.push(`High average latency: ${metrics.averageLatency}ms`);
  }

  // Check for excessive disconnections
  if (metrics.disconnections > 10) {
    issues.push(`High disconnection count: ${metrics.disconnections}`);
  }

  const healthy = issues.length === 0;

  if (!healthy) {
    logger.warn("Real-time health check failed", {
      action: "realtime-health-check",
      successRate: successRate.toFixed(1),
      averageLatency: metrics.averageLatency,
      issues,
    });
  }

  return {
    healthy,
    metrics: getConnectionMetrics(),
    issues,
  };
}

/**
 * Reset connection metrics
 *
 * Useful for testing or after deployment.
 */
export function resetConnectionMetrics(): void {
  metrics.totalAttempts = 0;
  metrics.successfulConnections = 0;
  metrics.failedConnections = 0;
  metrics.disconnections = 0;
  metrics.averageLatency = 0;
  metrics.lastConnectionTime = undefined;
  latencySamples.length = 0;

  logger.info("Connection metrics reset", {
    action: "metrics-reset",
  });
}
