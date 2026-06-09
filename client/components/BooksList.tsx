import { useQuery } from '@tanstack/react-query'
import { fetchAllBooks } from '../apis/books'

import BookCard from './BookCard'

function BooksList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: fetchAllBooks,
  })

  if (isLoading) return <p role="status">Loading…</p>
  if (error) return <p role="alert">Something went wrong: {String(error)}</p>
  if (!data) return null

  return (
    <div
      style={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      }}
    >
      {data.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}

export default BooksList
