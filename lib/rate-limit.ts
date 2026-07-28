import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// If Upstash env vars are not configured, rate limiting is skipped (logged
// as a warning) rather than crashing the request — useful for local dev.
const redisConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit = redisConfigured
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "nutrition-intake",
    })
  : null;

export async function checkRateLimit(identifier: string) {
  if (!ratelimit) {
    console.warn("[rate-limit] Upstash not configured — skipping rate limit check");
    return { success: true, remaining: 999 };
  }
  const result = await ratelimit.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
