const violationTimestamps = new Map<string, number[]>();

export function trackViolation(token: string): number {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  const timestamps = violationTimestamps.get(token) || [];
  const recentViolations = timestamps.filter((ts) => ts > oneHourAgo);

  recentViolations.push(now);
  violationTimestamps.set(token, recentViolations);

  if (violationTimestamps.size > 10000) {
    for (const [key, times] of violationTimestamps.entries()) {
      const recent = times.filter((ts) => ts > oneHourAgo);
      if (recent.length === 0) {
        violationTimestamps.delete(key);
      } else {
        violationTimestamps.set(key, recent);
      }
    }
  }

  return recentViolations.length;
}
