import connection from './connection.ts'

export function getAll() {
  console.log('[db] Fetching all books')
  return connection('books').select()
}