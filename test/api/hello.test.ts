// tests/api/hello.integration.test.ts
import request from 'supertest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
console.log('Using BASE_URL:', BASE_URL)

describe('/api/hello (integration)', () => {
  it('returns hello message', async () => {
    await request(BASE_URL)
      .get('/api/hello')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ message: 'Hello from API' })
  })
})
