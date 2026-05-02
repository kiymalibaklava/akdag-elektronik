'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global hata:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-brand-red/10 border border-brand-red/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-brand-red" />
        </div>
        <h1 className="font-display font-black text-3xl uppercase text-white tracking-tight mb-3">
          Bir Hata Oluştu
        </h1>
        <p className="font-body text-white/40 text-sm leading-relaxed mb-8">
          Beklenmeyen bir hata meydana geldi. Sayfayı yenilemeyi deneyin.
          {error.digest && (
            <span className="block mt-2 text-white/20 text-xs font-mono">
              Hata kodu: {error.digest}
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary text-sm">
            <RefreshCw size={14} />
            Tekrar Dene
          </button>
          <a href="/" className="btn-outline text-sm">
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  )
}
