'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: "Hangi bölgelere hizmet veriyorsunuz?",
    a: "Kayseri merkezli mağazamızdan tüm Türkiye'ye hızlı kargo ile ürün gönderimi yapmaktayız. Ayrıca okul, cami, fabrika ve konferans salonu gibi büyük ses sistemi projelerinde Türkiye'nin her yerine kurulum ve mühendislik hizmeti sunuyoruz."
  },
  {
    q: "Okul ve Cami ses sistemleri kurulumu yapıyor musunuz?",
    a: "Evet, Akdağ Elektronik olarak eğitim kurumları için Akustek akıllı okul saatleri ve anons sistemleri, ibadethaneler için ise akustik ölçümlü profesyonel cami ses sistemleri kurulumu yapıyoruz."
  },
  {
    q: "Toptan alım veya bayilere özel indirimleriniz var mı?",
    a: "Kesinlikle. Sitemizdeki 'Bayi Girişi' bölümünden bayi başvurusu yaparak, kurumsal alımlarınızda ve toptan siparişlerinizde size özel iskonto oranlarıyla online teklif oluşturabilir ve sipariş verebilirsiniz."
  },
  {
    q: "Projeler için ücretsiz keşif hizmetiniz var mı?",
    a: "Evet, özellikle fabrika, konferans salonu, kafe ve restoran gibi profesyonel ses sistemi gerektiren alanlar için uzman ekibimizle ücretsiz keşif yapıyor, mekanın akustiğine en uygun ürünleri belirliyoruz."
  },
  {
    q: "Satın aldığım ürünlerin garantisi var mı?",
    a: "Satışını yaptığımız tüm profesyonel ses, ışık ve görüntü sistemleri resmi distribütör ve firma garantisi altındadır. 50 yıllık tecrübemizle satış sonrası teknik destek hizmetimiz her zaman yanınızdadır."
  }
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  // Schema.org JSON-LD FAQ yapılandırması
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  }

  return (
    <section className="py-20 bg-[#141414] border-t border-white/5 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display font-black text-3xl md:text-5xl uppercase text-white mb-4">
            Sıkça Sorulan <span className="text-brand-red">Sorular</span>
          </h2>
          <div className="w-16 h-1 bg-brand-red mx-auto" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div 
                key={idx} 
                className={`border transition-colors duration-300 ${
                  isOpen ? 'border-brand-red/50 bg-[#1A1A1A]' : 'border-white/5 bg-[#0F0F0F] hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className={`font-display font-semibold text-lg ${isOpen ? 'text-brand-red' : 'text-white'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown 
                    className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-red' : ''}`} 
                  />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="p-6 pt-0 font-body text-white/60 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
