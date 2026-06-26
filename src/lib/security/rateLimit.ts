const cache = new Map<string, { count: number; resetTime: number }>();

/**
 * Basic in-memory rate limiting for Next.js Server Components / API Routes
 * @param ip Client IP Address
 * @param limit Max allowed requests within window
 * @param windowMs Time window in milliseconds (default: 1 minute)
 * @returns boolean true if request is allowed, false if rate limited
 */
export function rateLimit(ip: string, limit = 60, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const record = cache.get(ip);

  // Clean up cache periodically if it gets too large
  if (cache.size > 5000) {
    for (const [key, val] of cache.entries()) {
      if (now > val.resetTime) {
        cache.delete(key);
      }
    }
  }

  if (!record) {
    cache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    cache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  record.count += 1;
  if (record.count > limit) {
    return false;
  }

  return true;
}
