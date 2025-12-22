// Simple in-memory rate limiter for API protection
// In production, consider using Redis for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

// Default configurations for different route types
export const RATE_LIMIT_CONFIGS = {
  // Strict limit for auth endpoints (prevent brute force)
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },   // 5 requests per 15 minutes

  // Standard API rate limit
  api: { windowMs: 60 * 1000, maxRequests: 100 },       // 100 requests per minute

  // Higher limit for read operations
  read: { windowMs: 60 * 1000, maxRequests: 200 },      // 200 requests per minute

  // Lower limit for write operations
  write: { windowMs: 60 * 1000, maxRequests: 30 },      // 30 requests per minute

  // Very high limit for public endpoints
  public: { windowMs: 60 * 1000, maxRequests: 300 },    // 300 requests per minute

  // Limit for cron endpoints
  cron: { windowMs: 60 * 1000, maxRequests: 10 },       // 10 requests per minute
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;  // Seconds until reset
  limit: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param type - The type of rate limit to apply
 * @returns RateLimitResult with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[type];
  const now = Date.now();
  const key = `${type}:${identifier}`;

  let entry = rateLimitStore.get(key);

  // Create new entry if none exists or if window has passed
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetIn = Math.ceil((entry.resetTime - now) / 1000);

  return {
    success: entry.count <= config.maxRequests,
    remaining,
    resetIn,
    limit: config.maxRequests,
  };
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header for proxied requests, falls back to connection info
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from proxy headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Get the first IP in the chain (original client)
    return forwarded.split(',')[0].trim();
  }

  // Fallback to x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Ultimate fallback
  return 'unknown';
}

/**
 * Rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetIn.toString(),
  };
}
