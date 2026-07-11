// Lightweight in-memory sliding-window limiter. Dampens abuse spikes per
// serverless instance. For strict cross-instance limits use Upstash/Supabase.
type Bucket = { count: number; reset: number };
const store = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = store.get(key);
  if (!b || now > b.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

/** Prune expired buckets occasionally to bound memory. */
export function sweep() {
  const now = Date.now();
  if (store.size < 5000) return;
  for (const [k, b] of store) if (now > b.reset) store.delete(k);
}
