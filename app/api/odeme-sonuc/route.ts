import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const durum = url.searchParams.get('durum') || 'basarili'
  let merchant_oid = ''

  try {
    const formData = await req.formData()
    merchant_oid = (formData.get('merchant_oid') as string) || ''
  } catch {
    // Boş gövde veya farklı form formatı durumunda sessizce devam et
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.akdagelektronik.com').replace(/\/+$/, '')
  const redirectUrl = durum === 'basarili'
    ? `${siteUrl}/odeme/basarili${merchant_oid ? `?merchant_oid=${encodeURIComponent(merchant_oid)}` : ''}`
    : `${siteUrl}/odeme/hata`

  // 303 See Other ile tarayıcının POST isteğini GET isteğine çevirerek sayfaya gitmesini sağlar
  return NextResponse.redirect(redirectUrl, 303)
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const durum = url.searchParams.get('durum') || 'basarili'
  const merchant_oid = url.searchParams.get('merchant_oid') || ''

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.akdagelektronik.com').replace(/\/+$/, '')
  const redirectUrl = durum === 'basarili'
    ? `${siteUrl}/odeme/basarili${merchant_oid ? `?merchant_oid=${encodeURIComponent(merchant_oid)}` : ''}`
    : `${siteUrl}/odeme/hata`

  return NextResponse.redirect(redirectUrl, 303)
}
