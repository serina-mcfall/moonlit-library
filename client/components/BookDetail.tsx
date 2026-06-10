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
      <Link to="/" className="page-back-link">
        ← Back to library
      </Link>

      <div className="detail-grid">
        {data.cover_image ? (
          <img
            src={data.cover_image}
            alt={`Cover of ${data.title}`}
            className="detail-cover"
          />
        ) : (
          <div className="detail-cover-placeholder" />
        )}

        <div>
          {(data.genre || data.series) && (
            <p className="detail-meta-label">
              {[data.genre, data.series].filter(Boolean).join(' · ')}
            </p>
          )}
          <h1 className="detail-title" tabIndex={-1}>
            {data.title}
          </h1>
          {data.author && <p className="detail-author">by {data.author}</p>}

          <ManaBar status={data.read_status} size="detail" />
          {data.read_status && (
            <p className="detail-status">{data.read_status}</p>
          )}
        </div>
      </div>

      {data.notes && (
        <section className="divider-section">
          <h2 className="section-label">Notes</h2>
          <p>{data.notes}</p>
        </section>
      )}
      <ImpressionsSection book={data} />

      <div className="action-bar">
        <Link to={`/books/${bookId}/edit`} className="button-link">
          Edit Book
        </Link>
        <button onClick={handleDelete}>Delete Book</button>
      </div>
    </article>
  )
}

export default BookDetail
