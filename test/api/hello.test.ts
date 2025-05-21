// tests/api/hello.integration.test.ts
import request from 'supertest'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

describe('/api/hello (integration)', () => {
  it('returns hello message', async () => {
    await request(BASE_URL)
      .get('/api/hello')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ message: 'Hello from API' })
  })
})
