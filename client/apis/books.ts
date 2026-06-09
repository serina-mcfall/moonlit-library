
import request from 'superagent'
import type { Book, BookDraft } from '../../models/books.ts'


export async function fetchAllBooks(): Promise<Book[]> {
 console.log('[api] fetching /api/v1/books')
  const response = await request.get('/api/v1/books')
  console.log('[api] got', response.body.length, 'books')
  return response.body
}

export async function addBook(book: BookDraft): Promise<{ id: number }> {
  console.log('[api] adding /api/v1/books')
  const response = await request.post('/api/v1/books').send(book)
  return response.body
}

