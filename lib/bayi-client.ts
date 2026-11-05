// lib/bayi-client.ts
// İstemci taraflı bayi yetki durumunu bellek ve sessionStorage üzerinde önbellekleyerek
// her render ve navigasyonda Supabase'e mükerrer 'bayiler' sorgusu gitmesini (Egress & Log Ingestion) engeller.

let memoryCache: { userId: string; isBayi: boolean; timestamp: number } | null = null
const CACHE_TTL_MS = 3 * 60 * 1000 // 3 dakika

export async function getBayiStatus(supabase: any, userId: string): Promise<boolean> {
  if (!userId) return false

  const now = Date.now()
  if (memoryCache && memoryCache.userId === userId && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.isBayi
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`akdag_bayi_${userId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (now - parsed.timestamp < CACHE_TTL_MS) {
          memoryCache = { userId, isBayi: parsed.isBayi, timestamp: parsed.timestamp }
          return parsed.isBayi
        }
      }
    } catch {}
  }

  try {
    const { data } = await supabase
      .from('bayiler')
      .select('onaylandi')
      .eq('user_id', userId)
      .maybeSingle()

    const isBayi = !!data?.onaylandi
    memoryCache = { userId, isBayi, timestamp: now }

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`akdag_bayi_${userId}`, JSON.stringify({ isBayi, timestamp: now }))
      } catch {}
    }

    return isBayi
  } catch {
    return false
  }
}

export function invalidateBayiCache(userId?: string) {
  memoryCache = null
  if (typeof window !== 'undefined') {
    try {
      if (userId) {
        sessionStorage.removeItem(`akdag_bayi_${userId}`)
      } else {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('akdag_bayi_')) sessionStorage.removeItem(key)
        })
      }
    } catch {}
  }
}
