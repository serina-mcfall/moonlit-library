import { Link } from 'react-router'
import type { Book } from '../../models/books'
import ManaBar from './ManaBar'

interface Props {
  book: Book
}

function BookCard({ book }: Props) {
  return (
    <Link to={`/books/${book.id}`} className="book-card-link">
      <article className="book-card">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={`Cover of ${book.title}`}
            className="book-card-cover"
          />
        ) : (
          <div className="book-card-cover-placeholder" />
        )}
        <h3 className="book-card-title">{book.title}</h3>
        {book.author && <p className="book-card-author">by {book.author}</p>}
        <div className="book-card-mana">
          <ManaBar status={book.read_status} />
        </div>
      </article>
    </Link>
  )
}

export default BookCard
