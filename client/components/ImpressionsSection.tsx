import { Link } from 'react-router'
import type { Book } from '../../models/books.ts'
import MoonRating from './MoonRating'

interface Props {
  book: Book
}

function ImpressionsSection({ book }: Props) {
  const hasAnyImpression =
    book.my_thoughts !== null ||
    book.rating !== null ||
    book.favorite_quote !== null ||
    book.favorite_character !== null

  if (!hasAnyImpression) {
    return (
      <section className="divider-section">
        <p>
          <Link to={`/books/${book.id}/review`}>+ Write impressions</Link>
        </p>
      </section>
    )
  }

  return (
    <section className="impressions">
      <h2 className="section-label">My Impressions</h2>

      {book.rating !== null && (
        <div className="impressions-field">
          <p className="impressions-field-label">Your rating</p>
          <MoonRating value={book.rating} />
        </div>
      )}

      {book.my_thoughts && (
        <div className="impressions-field">
          <p className="impressions-field-label">Your thoughts</p>
          <p style={{ fontStyle: 'italic', margin: 0 }}>{book.my_thoughts}</p>
        </div>
      )}

      {book.favorite_quote && (
        <div className="impressions-field">
          <p className="impressions-field-label">Favourite line</p>
          <blockquote className="impressions-quote">
            &ldquo;{book.favorite_quote}&rdquo;
            {book.favorite_character && (
              <span className="impressions-quote-attribution">
                — {book.favorite_character}
              </span>
            )}
          </blockquote>
        </div>
      )}

      {book.favorite_character && !book.favorite_quote && (
        <div className="impressions-field">
          <p className="impressions-field-label">Favourite character</p>
          <p style={{ color: 'var(--gold)', margin: 0 }}>
            {book.favorite_character}
          </p>
        </div>
      )}

      <p className="impressions-edit">
        <Link to={`/books/${book.id}/review`}>Edit impressions</Link>
      </p>
    </section>
  )
}

export default ImpressionsSection
