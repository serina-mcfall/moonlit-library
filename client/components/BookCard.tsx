import { Link } from 'react-router'
import type { Book } from '../../models/books'
import ManaBar from './ManaBar'

interface Props {
  book: Book
}

function BookCard({ book }: Props) {
  return (
    <Link to={`/books/${book.id}`}>
      <img
        src={book.cover_image ?? ''}
        alt={book.title}
        style={{ width: '120px', height: '180px', objectFit: 'cover' }}
      />
      <h3>{book.title}</h3>
      <p>by {book.author}</p>
      <ManaBar status={book.read_status} />
    </Link>
  )
}

export default BookCard
