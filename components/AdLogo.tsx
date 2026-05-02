/**
 * AD logosu — Akdağ Elektronik markasından birebir SVG
 * Kırmızı: Pantone 485 C (#DA291C)
 * A harfi: üçgen/çatı formlu, D harfi: yuvarlak sağ kenar
 */
export default function AdLogo({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* A harfi — logodaki gibi çatı/üçgen formu */}
      <g fill="#DA291C">
        {/* Sol bacak A */}
        <polygon points="0,70 18,10 28,10 36,35 24,35 22,28 14,55" />
        {/* Sağ bacak A */}
        <polygon points="36,35 28,10 38,10 56,70 44,70 36,45 24,45 24,35" />
        {/* A köprüsü — sol bacakla birleşiyor zaten */}
      </g>

      {/* D harfi */}
      <g fill="#DA291C">
        {/* D gövdesi dikdörtgen kısım */}
        <rect x="62" y="10" width="12" height="60" />
        {/* D yay kısmı */}
        <path d="M74 10 Q100 10 100 40 Q100 70 74 70 L74 58 Q88 58 88 40 Q88 22 74 22 Z" />
      </g>
    </svg>
  )
}
