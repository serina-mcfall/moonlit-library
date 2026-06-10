import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteBook, fetchOne } from '../apis/books'
import ManaBar from './ManaBar'
import ImpressionsSection from './ImpressionsSection'

function BookDetail() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams()
  const bookId = Number(id)

  const { data, isLoading, error } = useQuery({
    queryKey: ['books', bookId],
    queryFn: () => fetchOne(bookId),
    enabled: Number.isFinite(bookId),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      navigate('/')
    },
  })

  function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this book? This action cannot be undone.',
    )
    if (confirmed) {
      deleteMutation.mutate()
    }
  }

  if (!Number.isFinite(bookId)) return <p role="alert">Invalid book id</p>
  if (isLoading) return <p role="status">Loading…</p>
  if (error) return <p role="alert">Failed to load book: {String(error)}</p>
  if (!data) return null

  return (
    <article>
      <p>
        <Link to="/">← Back to library</Link>
      </p>
      <p>
        <Link to={`/books/${bookId}/edit`}>Edit Book</Link>
      </p>

      <button onClick={handleDelete}>Delete Book</button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          gap: '24px',
        }}
      >
        {data.cover_image ? (
          <img
            src={data.cover_image}
            alt={`Cover of ${data.title}`}
            style={{
              width: '120px',
              borderRadius: '3px',
              boxShadow:
                '0 0 22px rgba(245, 168, 192, 0.35), 0 6px 14px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-gold)',
            }}
          />
        ) : (
          <div
            style={{
              width: '120px',
              aspectRatio: '2 / 3',
              background:
                'linear-gradient(135deg, var(--bg-raised), var(--bg-mid))',
              borderRadius: '3px',
              border: '1px solid var(--border-gold)',
            }}
          />
        )}

        <div>
          {(data.genre || data.series) && (
            <p
              style={{
                fontSize: '11px',
                color: 'var(--gold-warm)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: 0,
                fontFamily: 'var(--font-display)',
              }}
            >
              {[data.genre, data.series].filter(Boolean).join(' · ')}
            </p>
          )}
          <h1 tabIndex={-1} style={{ marginTop: '6px' }}>
            {data.title}
          </h1>
          {data.author && (
            <p style={{ color: 'var(--gold)', margin: '0 0 16px' }}>
              by {data.author}
            </p>
          )}

          <ManaBar status={data.read_status} size="detail" />
          {data.read_status && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '6px',
              }}
            >
              {data.read_status}
            </p>
          )}
        </div>
      </div>

      {data.notes && (
        <section
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-gold)',
          }}
        >
          <h2
            style={{
              fontSize: '11px',
              color: 'var(--gold-warm)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Notes
          </h2>
          <p>{data.notes}</p>
        </section>
      )}
      <ImpressionsSection book={data} />
    </article>
  )
}

export default BookDetail
