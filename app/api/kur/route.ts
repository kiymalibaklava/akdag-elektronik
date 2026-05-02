import { NextResponse } from 'next/server'

export const revalidate = 300 // 5 dakikada bir yenile

export async function GET() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      next: { revalidate: 300 },
    })
    const data = await res.json()

    const usdTry = data.rates?.TRY || 0
    const eurTry = usdTry / (data.rates?.EUR || 1)

    return NextResponse.json({
      USD: parseFloat(usdTry.toFixed(2)),
      EUR: parseFloat(eurTry.toFixed(2)),
      guncelleme: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({
      USD: 32.50, EUR: 35.20,
      guncelleme: null, fallback: true,
    })
  }
}
