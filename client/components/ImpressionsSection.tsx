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
      <section
        style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-gold)',
        }}
      >
        <p>
          <Link to={`/books/${book.id}/review`}>+ Write impressions</Link>
        </p>
      </section>
    )
  }

  return (
    <section
      style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-gold)',
        background: 'rgba(245, 168, 192, 0.04)',
        padding: '20px 16px',
        borderRadius: '4px',
      }}
    >
      <h2
        style={{
          fontSize: '11px',
          color: 'var(--gold-warm)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: '0 0 12px',
        }}
      >
        My Impressions
      </h2>

      {book.rating !== null && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
            Your rating
          </div>
          <MoonRating value={book.rating} />
        </div>
      )}

      {book.my_thoughts && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
            Your thoughts
          </div>
          <p style={{ fontStyle: 'italic', margin: 0 }}>{book.my_thoughts}</p>
        </div>
      )}

      {book.favorite_quote && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
            Favourite line
          </div>
          <blockquote
            style={{
              margin: 0,
              borderLeft: '2px solid var(--pink)',
              paddingLeft: '12px',
              fontStyle: 'italic',
            }}
          >
            "{book.favorite_quote}"
            {book.favorite_character && (
              <span
                style={{
                  display: 'block',
                  marginTop: '4px',
                  color: 'var(--gold)',
                  fontStyle: 'normal',
                }}
              >
                — {book.favorite_character}
              </span>
            )}
          </blockquote>
        </div>
      )}

      {book.favorite_character && !book.favorite_quote && (
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '6px',
            }}
          >
            Favourite character
          </div>
          <p style={{ color: 'var(--gold)', margin: 0 }}>
            {book.favorite_character}
          </p>
        </div>
      )}

      <p style={{ marginTop: '16px', marginBottom: 0 }}>
        <Link to={`/books/${book.id}/review`}>Edit impressions</Link>
      </p>
    </section>
  )
}

export default ImpressionsSection