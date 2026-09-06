import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-ip'

export const revalidate = 300

// Son başarılı kur verisini hafızada tutarak harici API kesintilerinde
// eski statik kurlar yerine en güncel bilinen kurları döndürürüz.
let lastSuccessfulRates: { USD: number; EUR: number; guncelleme: string } | null = null

async function fetchFromOpenErApi(): Promise<{ USD: number; EUR: number } | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const usdTry = data.rates?.TRY || 0
    const eurTry = usdTry / (data.rates?.EUR || 1)
    if (usdTry > 0 && eurTry > 0) {
      return {
        USD: parseFloat(usdTry.toFixed(2)),
        EUR: parseFloat(eurTry.toFixed(2)),
      }
    }
  } catch {}
  return null
}

async function fetchFromTruncgil(): Promise<{ USD: number; EUR: number } | null> {
  try {
    const res = await fetch('https://finans.truncgil.com/v3/today.json', {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const usdStr = data.USD?.Selling?.replace(',', '.')
    const eurStr = data.EUR?.Selling?.replace(',', '.')
    const usd = parseFloat(usdStr)
    const eur = parseFloat(eurStr)
    if (usd > 0 && eur > 0) {
      return {
        USD: parseFloat(usd.toFixed(2)),
        EUR: parseFloat(eur.toFixed(2)),
      }
    }
  } catch {}
  return null
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!(await rateLimit(`kur:${ip}`, 90, 60_000))) {
    return NextResponse.json({ error: 'Çok fazla istek' }, { status: 429 })
  }

  // 1. Birincil kaynak (Open Exchange Rate API - hızlı ve küresel)
  let liveRates = await fetchFromOpenErApi()

  // 2. İkincil yedek kaynak (Truncgil - Türkiye finans piyasaları)
  if (!liveRates) {
    liveRates = await fetchFromTruncgil()
  }

  if (liveRates) {
    const rates = {
      USD: liveRates.USD,
      EUR: liveRates.EUR,
      guncelleme: new Date().toISOString(),
    }
    lastSuccessfulRates = rates

    return NextResponse.json(
      rates,
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
        },
      }
    )
  }

  // 3. Her iki servis de anlık ulaşılamazsa hafızadaki son başarılı kurları veya güncel yedek kurları döndür
  const fallbackRates = lastSuccessfulRates || {
    USD: 48.40,
    EUR: 56.20,
    guncelleme: new Date().toISOString(),
  }

  return NextResponse.json(
    { ...fallbackRates, fallback: true },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30' } }
  )
}
