/**
 * Simple, efficient sliding-window rate limiter for Next.js Route Handlers.
 * In-memory storage with automatic garbage collection of expired timestamps.
 */

const hitStore = new Map();
let lastCleanup = Date.now();

// Periodic cleanup of stale entries every 5 minutes
function cleanup(windowMs) {
  const now = Date.now();
  if (now - lastCleanup < 60000) return; // run at most once per minute
  lastCleanup = now;

  for (const [key, timestamps] of hitStore.entries()) {
    const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);
    if (validTimestamps.length === 0) {
      hitStore.delete(key);
    } else {
      hitStore.set(key, validTimestamps);
    }
  }
}

/**
 * Check if a request exceeds rate limits.
 * @param {string} identifier - Unique client identifier (e.g. IP address or user ID)
 * @param {Object} options
 * @param {number} options.limit - Max allowed requests within window
 * @param {number} options.windowMs - Time window in milliseconds (default: 60,000 = 1 minute)
 * @returns {{ success: boolean, limit: number, remaining: number, reset: number }}
 */
export function rateLimit(identifier, { limit = 10, windowMs = 60000 } = {}) {
  cleanup(windowMs);

  const now = Date.now();
  const timestamps = hitStore.get(identifier) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil((resetTime - now) / 1000),
    };
  }

  validTimestamps.push(now);
  hitStore.set(identifier, validTimestamps);

  return {
    success: true,
    limit,
    remaining: limit - validTimestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}

/**
 * Helper to extract client IP from Next.js request headers
 * @param {Request} req
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}
