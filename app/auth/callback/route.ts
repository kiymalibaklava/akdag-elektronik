import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase PKCE auth callback handler.
 *
 * Supabase şifre sıfırlama ve davet e-postalarındaki linkler buraya gelir.
 * ?code parametresini oturuma çevirir, sonra hedef sayfaya yönlendirir.
 *
 * Supabase Dashboard → Authentication → URL Configuration kısmına
 * bu URL'yi eklemeyi unutmayın:
 *   https://www.akdagelektronik.com/auth/callback
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/bayi/sifrele'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options } as any)
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: '', ...options } as any)
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[auth/callback] exchangeCodeForSession hatası:', error.message)
  }

  // Hata durumunda şifre sıfırlama sayfasına hata parametresiyle yönlendir
  return NextResponse.redirect(
    `${origin}/bayi/sifrele?error=gecersiz_link`
  )
}
