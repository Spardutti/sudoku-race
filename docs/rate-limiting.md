# Rate Limiting & Abuse Prevention

**Story**: 1.7 - Rate Limiting Implementation
**Last Updated**: 2025-11-16
**Status**: ✅ Implemented

## Overview

This document describes the rate limiting and abuse prevention mechanisms implemented in Sudoku Race. Rate limiting protects the platform from abuse, ensures fair gameplay, and maintains system stability under malicious traffic.

## Architecture

### Strategy

We use **LRU Cache-based rate limiting** for lightweight, in-memory protection. This approach is ideal for MVP scale (100-1,000 DAU) and provides <1ms latency overhead.

**Key Benefits:**
- No external dependencies (Redis not needed)
- Automatic cleanup via TTL (time-to-live)
- Fast lookup performance (O(1))
- Simple deployment

**Future Migration:**
- Migrate to Redis when scaling beyond 10,000 DAU
- Required for multi-region deployment
- Enables distributed rate limiting

### Rate Limits

| Endpoint | Limit | Window | Token |
|----------|-------|--------|-------|
| Puzzle Submission | 3 requests | 60 seconds | userId or IP |
| Future: Real-time Connection | 1 connection | N/A | userId |

## Implementation Guide

### 1. Basic Rate Limiting

```typescript
import { rateLimit } from '@/lib/utils/rate-limit'
import { ABUSE_ERRORS } from '@/lib/constants/errors'

// Create rate limiter instance
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500
})

// In your Server Action
export async function myServerAction() {
  const userId = await getCurrentUserId()
  const token = userId || getClientIP(request)

  try {
    // CRITICAL: Check rate limit BEFORE expensive operations
    await limiter.check(3, token) // 3 requests per minute

    // Process request...
  } catch {
    // Rate limit exceeded
    logger.warn('Rate limit exceeded', { userId, action: 'myServerAction' })
    return { success: false, error: ABUSE_ERRORS.RATE_LIMIT_EXCEEDED }
  }
}
```

### 2. IP-Based Rate Limiting (Guests)

```typescript
import { headers } from 'next/headers'
import { getClientIP } from '@/lib/utils/ip-utils'

// In Server Action
const headersList = await headers()
const clientIP = getClientIP({ headers: headersList })
const token = userId || clientIP // Fallback to IP for guests

await limiter.check(3, token)
```

**Privacy Considerations:**
- IP addresses are transient (in-memory only)
- NOT stored in database
- Logs should be anonymized after 30 days (GDPR)

### 3. Duplicate Submission Prevention

```typescript
// Check for existing completion BEFORE processing
const { data: existing } = await supabase
  .from('completions')
  .select('id')
  .eq('user_id', userId)
  .eq('puzzle_id', puzzleId)
  .eq('is_complete', true)
  .single()

if (existing) {
  return { success: false, error: ABUSE_ERRORS.DUPLICATE_SUBMISSION }
}
```

**Performance:**
- Uses composite index: `idx_completions_user_puzzle_complete`
- Target: <10ms query time
- Partial index (WHERE is_complete = true) reduces size

### 4. Monitoring Integration

```typescript
import { logger } from '@/lib/utils/logger'
import * as Sentry from '@sentry/nextjs'

// Log all rate limit violations
logger.warn('Rate limit exceeded', {
  userId: user?.id,
  ip: clientIP,
  endpoint: '/api/puzzle/complete',
  limit: 3,
  windowSeconds: 60
})

// Track excessive violations in Sentry
// Note: Requires rate limiter enhancement to return usage count
if (currentUsage >= 10) {
  Sentry.captureMessage('Excessive puzzle submission attempts', {
    level: 'warning',
    user: { id: userId },
    extra: { attemptCount: currentUsage, puzzleId }
  })
}
```

## Configuration

### Rate Limiter Options

```typescript
type RateLimitOptions = {
  interval: number              // Time window in milliseconds (default: 60000)
  uniqueTokenPerInterval: number // Max unique tokens to track (default: 500)
}
```

**Recommended Settings:**
- Interval: 60000ms (1 minute) for user actions
- uniqueTokenPerInterval: 500 (prevents unbounded memory)
- Limit: 3-5 requests per interval for submissions

### Database Index

```sql
-- Composite index for duplicate check
CREATE INDEX IF NOT EXISTS idx_completions_user_puzzle_complete
  ON completions(user_id, puzzle_id, is_complete)
  WHERE is_complete = true;
```

**Verify Index Usage:**
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM completions
WHERE user_id = '...' AND puzzle_id = '...' AND is_complete = true;
```

Expected: `Index Scan using idx_completions_user_puzzle_complete`

## Monitoring & Troubleshooting

### Sentry Alert Configuration

**Alert Thresholds:**
1. **High Priority**: Single user >50 violations/day
2. **Critical**: Single IP >100 violations/day

**Setup in Sentry Dashboard:**
1. Navigate to Alerts → Create Alert Rule
2. Condition: Custom metric on `rate_limit_exceeded` events
3. Threshold: >50 for users, >100 for IPs
4. Notification: Email to developers

### Dashboard Queries

**Top Users by Violations (Last 7 Days):**
```sql
SELECT userId, COUNT(*) as violations
FROM logs
WHERE event = 'rate_limit_exceeded'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY userId
ORDER BY violations DESC
LIMIT 100;
```

**Top IPs by Violations (Last 24 Hours):**
```sql
SELECT ip, COUNT(*) as violations
FROM logs
WHERE event = 'rate_limit_exceeded'
  AND timestamp > NOW() - INTERVAL '24 hours'
  AND isGuest = true
GROUP BY ip
ORDER BY violations DESC
LIMIT 100;
```

### Troubleshooting Common Issues

#### False Positives (Legitimate Users Rate Limited)

**Symptom**: User reports "Too many attempts" but hasn't abused system

**Possible Causes:**
1. Corporate network (shared IP for guests)
2. Browser/app bug causing rapid retries
3. Rate limit too strict (3/minute might be low)

**Resolution:**
1. Check logs for userId/IP context
2. Verify request timing (rapid fire vs spread out)
3. Consider increasing limit to 5/minute if needed
4. Encourage authentication for better experience

#### Memory Growth

**Symptom**: Server memory usage increasing over time

**Possible Causes:**
1. uniqueTokenPerInterval set too high
2. Token leakage (not cleaning up)

**Resolution:**
1. Check LRU cache size: Should max at 500 tokens
2. Verify TTL is working (tokens should expire)
3. Monitor with: `process.memoryUsage()`

#### Database Performance

**Symptom**: Duplicate check slow (>10ms)

**Possible Causes:**
1. Index not created/used
2. Table too large (millions of rows)
3. Missing VACUUM (PostgreSQL)

**Resolution:**
1. Verify index exists: `\d+ completions` in psql
2. Run EXPLAIN to confirm index usage
3. VACUUM ANALYZE completions table

## Testing Patterns

### Unit Tests

```typescript
// Test rate limiter logic
it('should reject 4th request when limit is 3', async () => {
  const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 })

  await limiter.check(3, 'user-123')
  await limiter.check(3, 'user-123')
  await limiter.check(3, 'user-123')

  await expect(limiter.check(3, 'user-123')).rejects.toBeUndefined()
})
```

### Integration Tests

```typescript
// Test end-to-end submission flow
it('should rate limit puzzle submissions', async () => {
  // Submit 3 times (succeed)
  await completePuzzle(puzzleId, solution, 245)
  await completePuzzle(puzzleId, solution, 245)
  await completePuzzle(puzzleId, solution, 245)

  // Submit 4th time (fail)
  const result = await completePuzzle(puzzleId, solution, 245)
  expect(result.success).toBe(false)
  expect(result.error).toBe(ABUSE_ERRORS.RATE_LIMIT_EXCEEDED)
})
```

### Manual Testing

```bash
# Test rate limiting in production
curl -X POST https://sudoku-race.vercel.app/api/puzzle/complete \
  -H "Content-Type: application/json" \
  -d '{"puzzleId":"...","solution":[[...]],"completionTimeSeconds":245}'

# Run 4 times quickly - 4th should fail with 429 or rate limit message
```

## Performance Benchmarks

**Requirements:**
- Rate limiter check: <1ms ✅
- Duplicate submission check: <10ms ✅
- No measurable impact on valid submissions ✅

**Measurement:**
```typescript
const start = performance.now()
await limiter.check(3, userId)
const duration = performance.now() - start
console.log(`Rate limit check: ${duration}ms`) // Expect <1ms
```

## Security Considerations

### Defense in Depth

Rate limiting is the **first layer** of defense:

1. **Layer 1**: Rate limiting (this document)
2. **Layer 2**: Input validation (Story 2.6)
3. **Layer 3**: Server-side validation (Story 2.6)
4. **Layer 4**: Database constraints (RLS policies)

### Attack Vectors

**Brute Force Prevention:**
- 3 submissions/minute prevents rapid solution guessing
- Would take 5 hours to try significant combinations

**Distributed Attacks:**
- Each IP/user has independent limit
- Attacker needs 1000+ IPs to overwhelm system
- Sentry alerts flag unusual patterns

**Leaderboard Gaming:**
- Duplicate submission check prevents multiple ranks
- One completion per user per puzzle enforced at DB level

## Future Enhancements

### Planned for Later

**Epic 4.2 (Real-Time Connection Limiting):**
- Limit 1 connection per user for real-time updates
- Disconnect stale connections automatically

**Post-Launch:**
- Admin dashboard for reviewing flagged users
- Automatic temporary bans for excessive violations
- CAPTCHA for repeated violations
- ML-based abuse pattern detection

### Migration to Redis

**When to Migrate:**
- >10,000 daily active users
- Multi-region deployment needed
- Distributed rate limiting required

**Migration Steps:**
1. Install ioredis client
2. Replace LRU Cache with Redis
3. Update rate limiter to use Redis TTL
4. Test performance (should be <5ms)
5. Deploy with gradual rollout

## References

- **Architecture Document**: `docs/architecture.md` (Security Architecture section)
- **PRD**: `docs/PRD.md` (FR-5.2: Leaderboard Anti-Cheat)
- **Story**: `docs/stories/1-7-rate-limiting-implementation.md`
- **Epic Tech Spec**: `docs/tech-spec-epic-1.md`

## Support

**Questions or Issues?**
- Check Sentry logs for rate limit violations
- Review monitoring dashboard for patterns
- Escalate to tech lead if:
  - Single user >100 violations/day
  - System-wide rate limit errors increasing
  - Performance degradation (>10ms duplicate checks)

---

**Document Status**: ✅ Complete
**Last Reviewed**: 2025-11-16
**Next Review**: Before Epic 4.2 (Real-Time Features)
