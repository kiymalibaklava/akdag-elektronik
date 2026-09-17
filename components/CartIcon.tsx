'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { getCartCount } from '@/lib/cart'

import { createClient } from '@/lib/supabase'

export default function CartIcon() {
  const [count, setCount] = useState(0)
  const [isBayi, setIsBayi] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        supabase
          .from('bayiler')
          .select('onaylandi')
          .eq('user_id', session.user.id)
          .maybeSingle()
          .then(({ data }: any) => {
            setIsBayi(!!data?.onaylandi)
          })
      } else {
        setIsBayi(false)
      }
    })

    setCount(getCartCount())
    const handler = () => setCount(getCartCount())
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  if (!isBayi) return null

  return (
    <Link href="/sepet" aria-label="Sepetim" className="relative flex items-center gap-1.5 text-white/50 hover:text-white transition-colors duration-200">
      <ShoppingCart size={18} />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-red text-white text-[9px] font-bold flex items-center justify-center rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
