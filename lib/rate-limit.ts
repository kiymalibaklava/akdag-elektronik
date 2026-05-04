type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 50_000

function pruneIfNeeded() {
  if (buckets.size <= MAX_BUCKETS) return
  const now = Date.now()
  buckets.forEach((b, k) => {
    if (now > b.resetAt) buckets.delete(k)
  })
}

/** Sliding window: limit istek sayısı windowMs içinde. true = izin var. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  pruneIfNeeded()
  let b = buckets.get(key)
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs }
    buckets.set(key, b)
  }
  b.count += 1
  return b.count <= limit
}
