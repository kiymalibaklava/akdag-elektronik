'use client'

import React from 'react'
import Image from 'next/image'

interface BrandLogoProps {
  brand: string
  className?: string
  width?: number
  height?: number
}

const BRAND_MAP: Record<string, string> = {
  SOUNDCRAFT: '/brands/soundcraft-clean.webp',
  LD: '/brands/ld-systems-clean.webp',
  'LD SYSTEMS': '/brands/ld-systems-clean.webp',
  RCF: '/brands/rcf-clean.webp',
  ALTO: '/brands/alto-clean.webp',
  'ALTO PROFESSIONAL': '/brands/alto-clean.webp',
  'DB TECHNOLOGIES': '/brands/db-technologies-clean.webp',
  DBTECHNOLOGIES: '/brands/db-technologies-clean.webp',
  MACKIE: '/brands/mackie-clean.webp',
  'MARTIN AUDIO': '/brands/martin-audio-clean.webp',
  'MARTIN AUDIO LONDON': '/brands/martin-audio-clean.webp',
  AUDAC: '/brands/audac-clean.webp',
  'ALLEN & HEATH': '/brands/allen-heath-clean.webp',
  'ALLEN&HEATH': '/brands/allen-heath-clean.webp',
  'ALLEN AND HEATH': '/brands/allen-heath-clean.webp',
  SHURE: '/brands/shure-clean.webp',
  SENNHEISER: '/brands/sennheiser-clean.webp',
  YAMAHA: '/brands/yamaha-clean.webp',
  JBL: '/brands/jbl-clean.webp',
  BEHRINGER: '/brands/behringer-clean.webp',
}

export default function BrandLogo({ brand, className = '', width = 140, height = 38 }: BrandLogoProps) {
  const norm = (brand || '').toUpperCase().trim()
  const logoSrc = BRAND_MAP[norm]

  if (logoSrc) {
    return (
      <Image
        src={logoSrc}
        alt={`${brand} Logo`}
        width={width}
        height={height}
        className={`object-contain ${className}`}
        unoptimized
      />
    )
  }

  return (
    <span className={`font-display font-black text-sm tracking-widest uppercase text-slate-800 ${className}`}>
      {brand}
    </span>
  )
}
