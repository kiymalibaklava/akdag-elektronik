'use client'

import { useState } from 'react'
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Props {
  onSuccess: () => void
}

export default function AdminLoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError('E-posta veya şifre hatalı.')
      } else if (err.message.includes('Email not confirmed')) {
        setError('E-posta doğrulanmamış.')
      } else {
        setError(`Hata: ${err.message}`)
      }
      setLoading(false)
      return
    }

    onSuccess()
  }

  const handleReset = async () => {
    if (!email) { setError('E-posta adresinizi girin.'); return }
    setResetLoading(true)
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
    setResetLoading(false)

    if (!res.ok) {
      setError(data.error || 'Bir hata oluştu.')
      return
    }

    setResetSent(true)
  }

  if (resetMode) {
    return (
      <div className="space-y-5">
        {resetSent ? (
          <div className="bg-green-500/10 border border-green-500/20 p-4 text-center">
            <div className="text-green-400 font-display font-bold text-sm uppercase tracking-widest mb-1">Gönderildi!</div>
            <p className="font-body text-white/40 text-xs">
              {email} adresine sıfırlama bağlantısı gönderildi.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark"
                placeholder="admin@akdagelektronik.com"
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="bg-brand-red/10 border border-brand-red/30 p-3 text-brand-red text-sm font-body">
                {error}
              </div>
            )}

            <button
              onClick={handleReset}
              disabled={resetLoading || !email}
              className="btn-primary w-full justify-center text-sm disabled:opacity-40"
            >
              {resetLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Mail size={14} />
              }
              {resetLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
            </button>
          </>
        )}

        <button
          onClick={() => { setResetMode(false); setResetSent(false); setError('') }}
          className="w-full text-center font-body text-white/25 hover:text-white text-xs transition-colors pt-1"
        >
          ← Giriş sayfasına dön
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40 block mb-2">
          E-posta
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-dark"
          placeholder="admin@akdagelektronik.com"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          autoComplete="email"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-display font-semibold text-xs tracking-widest uppercase text-white/40">
            Şifre
          </label>
          <button
            onClick={() => { setResetMode(true); setError('') }}
            className="font-body text-white/25 hover:text-brand-red text-xs transition-colors"
          >
            Şifremi unuttum
          </button>
        </div>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-dark pr-12"
            placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-brand-red/10 border border-brand-red/30 p-3 text-brand-red text-sm font-body">
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading || !email || !password}
        className="btn-primary w-full justify-center text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <LogIn size={15} />
        }
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>
    </div>
  )
}
