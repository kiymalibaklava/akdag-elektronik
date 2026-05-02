'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { getCartCount } from '@/lib/cart'

export default function CartIcon() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(getCartCount())
    const handler = () => setCount(getCartCount())
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  return (
    <Link href="/sepet" className="relative flex items-center gap-1.5 text-white/50 hover:text-white transition-colors duration-200">
      <ShoppingCart size={18} />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-red text-white text-[9px] font-bold flex items-center justify-center rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
