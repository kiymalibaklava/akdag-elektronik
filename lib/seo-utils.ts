import { permanentRedirect } from 'next/navigation'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://akdagelektronik.com.tr'

/**
 * Ensures the URL is absolute, uses https, and has no trailing slash (unless root).
 * Strips all query parameters from the canonical path to prevent duplicate indexation.
 */
export function buildCanonicalUrl(path: string): string {
  let baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL
  if (baseUrl.startsWith('http://')) {
    baseUrl = baseUrl.replace('http://', 'https://')
  }

  const cleanPathWithNoQuery = path.split('?')[0]
  const normalizedPath = cleanPathWithNoQuery.startsWith('/') ? cleanPathWithNoQuery : '/' + cleanPathWithNoQuery
  
  const finalPath = normalizedPath.endsWith('/') && normalizedPath.length > 1 
    ? normalizedPath.slice(0, -1) 
    : normalizedPath

  return baseUrl + finalPath
}

export function isUUID(slug: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
}

export function enforceSlugRedirect(currentSlug: string, properSlug: string | null, basePath: string = '/urun') {
  if (isUUID(currentSlug) && properSlug) {
    permanentRedirect(basePath + '/' + properSlug)
  }
}