import { cache } from 'react'
import { createServerSupabaseClient } from './supabase-server'

/**
 * Ürün verisini ID'ye göre getirir ve aynı istek (request) içinde 
 * birden fazla kez çağrılırsa (generateMetadata vs Page) sonucu cache-ler.
 * Bu sayede veritabanına giden gereksiz istekleri (PostgREST calls) engeller.
 */
export const getProduct = cache(async (id: string) => {
  const supabase = await createServerSupabaseClient()
  return supabase.from('urunler').select('*').eq('id', id).single()
})
