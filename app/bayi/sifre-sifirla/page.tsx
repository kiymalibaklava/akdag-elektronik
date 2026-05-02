'use client'

import { useState, useRef } from 'react'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SifreSifirla() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/sifre-sifirla', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        redirectTo: `${window.location.origin}/bayi/sifrele`,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Bir hata oluştu.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="font-display font-black text-2xl uppercase text-white mb-3">E-posta Gönderildi</h1>
          <p className="font-body text-white/40 text-sm leading-relaxed mb-6">
            <strong className="text-white">{email}</strong> adresine şifre sıfırlama bağlantısı gönderildi.
            Gelen kutunuzu kontrol edin.
          </p>
          <Link href="/bayi" className="btn-outline text-sm inline-flex">
            <ArrowLeft size={14} />
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="w-8 h-px bg-brand-red" />
            <span className="font-display font-semibold text-xs tracking-[0.3em] uppercase text-brand-red">Akdağ Elektronik</span>
            <div className="w-8 h-px bg-brand-red" />
          </div>
          <h1 className="font-display font-black text-3xl uppercase text-white">Şifremi Unuttum</h1>
          <p className="font-body text-white/30 text-sm mt-2">
            E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <div className="bg-[#141414] border border-white/8 p-8 space-y-5"
          style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}>

          <div>
            <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark pl-10"
                placeholder="firma@email.com"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                autoComplete="email"
              />
            </div>
          </div>

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/30 p-3 text-brand-red text-sm font-body">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email}
            className="btn-primary w-full justify-center text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Mail size={14} />}
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </button>

          <div className="text-center pt-2">
            <Link href="/bayi" className="font-body text-white/30 hover:text-brand-red text-xs transition-colors flex items-center justify-center gap-1">
              <ArrowLeft size={11} />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
