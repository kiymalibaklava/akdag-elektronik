import { describe, it, expect } from 'vitest'
import { rateLimit } from './rate-limit'

describe('rateLimit', () => {
  it('allows up to limit then blocks', () => {
    const k = `burst-${Math.random()}`
    expect(rateLimit(k, 2, 60_000)).toBe(true)
    expect(rateLimit(k, 2, 60_000)).toBe(true)
    expect(rateLimit(k, 2, 60_000)).toBe(false)
  })

  it('isolates keys', () => {
    const a = `iso-a-${Math.random()}`
    const b = `iso-b-${Math.random()}`
    expect(rateLimit(a, 1, 60_000)).toBe(true)
    expect(rateLimit(b, 1, 60_000)).toBe(true)
  })
})
