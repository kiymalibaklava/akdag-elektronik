/**
 * Merkezi e-posta gönderici yardımcı modülü.
 * Tüm API route'ları bu fonksiyonu kullanır.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[sendEmail] RESEND_API_KEY tanımlı değil, e-posta atlandı.')
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Akdağ Elektronik <siparis@akdagelektronik.com>',
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[sendEmail] Resend API hatası:', err)
  }
}
