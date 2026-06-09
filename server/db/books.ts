import connection from './connection.ts'

export function getAll() {
  return connection('books').select()
}