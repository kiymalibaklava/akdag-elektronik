import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isAuthorizedAdminOrSecret, verifyAdmin } from './admin-auth'

describe('admin-auth', () => {
  const originalEnv = process.env.REVALIDATION_SECRET

  beforeEach(() => {
    process.env.REVALIDATION_SECRET = 'test-secret-123'
  })

  afterEach(() => {
    process.env.REVALIDATION_SECRET = originalEnv
  })

  it('authorizes requests with correct x-revalidate-secret header', async () => {
    const req = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': 'test-secret-123'
      }
    })

    const authorized = await isAuthorizedAdminOrSecret(req)
    expect(authorized).toBe(true)
  })

  it('rejects requests with incorrect x-revalidate-secret header', async () => {
    const req = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': 'wrong-secret'
      }
    })

    const authorized = await isAuthorizedAdminOrSecret(req)
    expect(authorized).toBe(false)
  })

  it('rejects requests with missing Authorization header and no secret', async () => {
    delete process.env.REVALIDATION_SECRET
    const req = new Request('http://localhost/api/revalidate', {
      method: 'POST'
    })

    const authorized = await isAuthorizedAdminOrSecret(req)
    expect(authorized).toBe(false)
  })

  it('verifyAdmin returns null when Authorization header is missing', async () => {
    const req = new Request('http://localhost/api/scrape-image', {
      method: 'POST'
    })

    const user = await verifyAdmin(req)
    expect(user).toBeNull()
  })
})
