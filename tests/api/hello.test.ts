// tests/api/hello.integration.test.ts
import request from 'supertest'
import { requestWithBypass } from '../utils/requestWithBypass'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const VERCEL_AUTH_COOKIE = process.env.VERCEL_AUTH_COOKIE
console.log('Using BASE_URL:', BASE_URL)

describe('/api/hello (integration)', () => {
  it('returns hello message', async () => {
    await requestWithBypass(BASE_URL, 'get', '/api/hello')
      .set('Cookie', `authorization=${VERCEL_AUTH_COOKIE}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ message: 'Hello from API' })
  })
})

