
import type { Book,  BookDraft } from '../../models/books'
import db from './connection.ts'

export async function add(book: BookDraft): Promise<number> {
  const [{ id }] = await db('books').insert(book).returning('id')
  return id
}

export function getAll(): Promise<Book[]> {
  console.log('[db] Fetching all books')
  return db('books').select()
}

export function getById(id: number): Promise<Book | undefined> {
  console.log('[db] Fetching books by Id')
  return db('books').where({ id }).first()
}

export function update(id: number, partial: Partial<BookDraft>): Promise<number> {
  console.log('[db] Update Book')
  return db('books').where({ id }).update(partial)
}

export function deleteById(id: number): Promise<number> {
  console.log('[db] Delete Book')
  return db('books').where({ id }).delete()
  
}