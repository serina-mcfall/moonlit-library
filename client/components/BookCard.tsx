import { Link } from 'react-router'
import type { Book } from '../../models/books'

interface Props {
  book: Book
}

function BookCard({ book }: Props) {
  return (
    <Link to={`/books/${book.id}`}>
      <h3>{book.title}</h3>
      <p>by {book.author}</p>
    </Link>
  )
}

export default BookCard
