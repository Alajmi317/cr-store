const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || cur.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (cur.count >= limit) {
    return { ok: false, remaining: 0 };
  }
  cur.count += 1;
  return { ok: true, remaining: limit - cur.count };
}
