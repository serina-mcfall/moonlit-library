import { useQuery } from '@tanstack/react-query'
import { fetchAllBooks } from '../apis/books'
import { Link } from 'react-router'

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
    <div>
      <Link to="/books/new">
        <button type="button">+ Add a book</button>
      </Link>
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
    </div>
  )
}

export default BooksList
