import "server-only";

/**
 * Simple per-key sliding-window throttle, kept in memory.
 *
 * Limits: the map lives in a single server instance. On serverless (Vercel),
 * each lambda instance has its own map and loses it on cold start, so the
 * effective limit is "`max` requests per `windowMs` per key per instance".
 * This protects a quota (Finnhub, the database) against one client hammering
 * an action, not against a distributed attack. A shared store (e.g. Upstash
 * Redis, or the Mongo buckets of `lib/auth/rate-limit.ts`) is needed for that.
 */
export function createThrottle({ windowMs, max }: { windowMs: number; max: number }) {
  const requestLog = new Map<string, number[]>();

  /** Counts one request for `key`; `true` when it is over the limit. */
  return function isThrottled(key: string): boolean {
    const now = Date.now();
    const recent = (requestLog.get(key) ?? []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      requestLog.set(key, recent);
      return true;
    }

    recent.push(now);
    requestLog.set(key, recent);

    // Keep the map bounded: drop keys with no request in the current window.
    if (requestLog.size > 1_000) {
      for (const [id, times] of requestLog) {
        if (times.every((t) => now - t >= windowMs)) requestLog.delete(id);
      }
    }

    return false;
  };
}
