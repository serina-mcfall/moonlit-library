
import request from 'superagent'
import type { Book } from '../../models/books.ts'


export async function fetchAllBooks(): Promise<Book[]> {
 console.log('[api] fetching /api/v1/books')
  const response = await request.get('/api/v1/books')
  console.log('[api] got', response.body.length, 'books')
  return response.body
}