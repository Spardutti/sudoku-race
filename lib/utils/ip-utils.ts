/**
 * IP Address Utilities
 *
 * Extracts client IP addresses from request headers for rate limiting.
 * Used as fallback identifier for unauthenticated (guest) users.
 *
 * @see docs/rate-limiting.md for privacy considerations
 * @see docs/architecture.md (Rate Limiting & Abuse Prevention section)
 */

/**
 * Extract client IP address from request headers
 *
 * Checks headers in priority order:
 * 1. x-forwarded-for (proxy/CDN, takes first IP)
 * 2. x-real-ip (alternative proxy header)
 * 3. Fallback to 'unknown' if no headers present
 *
 * @param request - Request object with headers
 * @returns Client IP address or 'unknown'
 *
 * @example
 * ```typescript
 * // In Server Action or API Route
 * import { headers } from 'next/headers'
 *
 * const headersList = headers()
 * const request = { headers: headersList }
 * const ip = getClientIP(request)
 *
 * // Use IP as rate limit token for guests
 * await limiter.check(3, userId || ip)
 * ```
 *
 * @remarks
 * Privacy Consideration:
 * - IP addresses are used transiently for rate limiting only
 * - NOT stored in database (ephemeral, in-memory only)
 * - Logs containing IPs should be anonymized after 30 days (GDPR compliance)
 *
 * Shared IP Limitation:
 * - Users behind same NAT/proxy share rate limit (acceptable for MVP)
 * - Corporate networks may have 100+ users on same IP
 * - Encourages authentication for better experience
 */
export function getClientIP(request: { headers: Headers }): string {
  // Check x-forwarded-for (most common proxy header)
  // Format: "client, proxy1, proxy2" - take first IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0];
  }

  // Check x-real-ip (alternative proxy header)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback if no headers available
  // This can happen in local development or certain deployment configurations
  return "unknown";
}

/**
 * Validate if IP address is in valid format
 *
 * @param ip - IP address string
 * @returns true if valid IPv4 or IPv6 format
 *
 * @example
 * ```typescript
 * isValidIP('192.168.1.1') // true
 * isValidIP('2001:0db8::1') // true
 * isValidIP('unknown') // false
 * ```
 */
export function isValidIP(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 pattern (simplified)
  const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}
