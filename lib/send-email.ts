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

/**
 * Toplu e-posta gönderimi (Kampanya ve Duyurular için).
 * Resend Batch API kullanarak gönderir (Her istekte max 100 e-posta).
 */
export async function sendBulkEmail(toAddresses: string[], subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[sendBulkEmail] RESEND_API_KEY tanımlı değil, toplu gönderim atlandı.')
    return
  }

  // Resend Batch API max 100 e-posta destekler
  const CHUNK_SIZE = 100;
  
  for (let i = 0; i < toAddresses.length; i += CHUNK_SIZE) {
    const chunk = toAddresses.slice(i, i + CHUNK_SIZE)
    
    const payload = chunk.map(email => ({
      from: 'Akdağ Elektronik Kampanya <siparis@akdagelektronik.com>',
      to: email,
      subject,
      html,
    }))

    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error(`[sendBulkEmail] Resend Batch API hatası (Chunk ${i/CHUNK_SIZE + 1}):`, err)
      }
    } catch (error) {
      console.error(`[sendBulkEmail] İstek hatası (Chunk ${i/CHUNK_SIZE + 1}):`, error)
    }
  }
}
