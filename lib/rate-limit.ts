import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Strict rate limiter: 10 requests per 10 seconds
// Use for: auth endpoints, webhooks, sensitive operations
export const strictRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/strict",
});

// Moderate rate limiter: 30 requests per 10 seconds
// Use for: API routes, tRPC endpoints
export const moderateRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/moderate",
});

// Generous rate limiter: 60 requests per 10 seconds
// Use for: public pages, donation pages
export const generousRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/generous",
});

/**
 * Get the client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check common headers for IP address
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a default identifier
  return "unknown";
}

/**
 * Apply rate limiting to a request
 * @param request - The incoming request
 * @param limiter - The rate limiter to use
 * @returns Response if rate limited, null otherwise
 */
export async function applyRateLimit(
  request: Request,
  limiter: Ratelimit
): Promise<Response | null> {
  // Only enable rate limiting in production
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const ip = getClientIp(request);
  const { success, limit, reset, remaining } = await limiter.limit(ip);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);

    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "You have exceeded the rate limit. Please try again later.",
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  return null;
}
