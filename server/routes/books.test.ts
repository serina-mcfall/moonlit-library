import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import server from '../server.ts'
import db from '../db/connection.ts'

beforeEach(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
  await db.seed.run()
})

describe('GET /api/v1/books', () => {

  it('returns 200 with the seeded books', async () => {
    const res = await request(server).get('/api/v1/books')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(5)
  })

})

describe('GET /api/v1/books/:id', () => {

  it('returns 200 with one book for a valid id', async () => {
    const res = await request(server).get('/api/v1/books/1')
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('The Poppy War')
  })

  it('returns 404 when id does not exist', async () => {
    const res = await request(server).get('/api/v1/books/999')
    expect(res.status).toBe(404)
  })

  it('returns 400 for non-numeric id', async () => {
    const res = await request(server).get('/api/v1/books/cat')
    expect(res.status).toBe(400)
  })

})

describe('POST /api/v1/books', () => {

  it('returns 201 with the new id', async () => {
    const res = await request(server)
      .post('/api/v1/books')
      .send({ title: 'New', author: 'Tester' })
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it('returns 400 when title is missing', async () => {
    const res = await request(server).post('/api/v1/books').send({ author: 'X' })
    expect(res.status).toBe(400)
  })

})

describe('PATCH /api/v1/books/:id', () => {

  it('returns 200 and persists the change', async () => {
    const res = await request(server)
      .patch('/api/v1/books/1')
      .send({ read_status: 'finished' })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)

    // Verify by fetching it back
    const check = await request(server).get('/api/v1/books/1')
    expect(check.body.read_status).toBe('finished')
  })

  it('returns 404 when id does not exist', async () => {
    const res = await request(server)
      .patch('/api/v1/books/999')
      .send({ read_status: 'finished' })
    expect(res.status).toBe(404)
  })

})

describe('DELETE /api/v1/books/:id', () => {

  it('returns 204 and removes the book', async () => {
    const res = await request(server).delete('/api/v1/books/1')
    expect(res.status).toBe(204)

    // Verify it's gone
    const check = await request(server).get('/api/v1/books/1')
    expect(check.status).toBe(404)
  })

  it('returns 404 when id does not exist', async () => {
    const res = await request(server).delete('/api/v1/books/999')
    expect(res.status).toBe(404)
  })

})



