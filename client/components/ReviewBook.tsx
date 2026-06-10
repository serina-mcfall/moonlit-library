import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { fetchOne, updateBook } from '../apis/books'
import type { Book } from '../../models/books.ts'
import MoonRating from './MoonRating'

interface ReviewFields {
  my_thoughts: string | null
  rating: number | null
  favorite_quote: string | null
  favorite_character: string | null
}

interface FormProps {
  book: Book
  onSubmit: (values: ReviewFields) => void
  isPending: boolean
  errorMessage?: string
}

function ReviewForm({ book, onSubmit, isPending, errorMessage }: FormProps) {
  const [fields, setFields] = useState<ReviewFields>({
    my_thoughts: book.my_thoughts,
    rating: book.rating,
    favorite_quote: book.favorite_quote,
    favorite_character: book.favorite_character,
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(fields)
  }

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <p role="alert">{errorMessage}</p>}

      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '8px' }}>Your rating</div>
        <MoonRating
          value={fields.rating}
          onChange={(rating) => setFields({ ...fields, rating })}
        />
      </div>

      <label>
        Your thoughts
        <textarea
          value={fields.my_thoughts ?? ''}
          onChange={(e) =>
            setFields({
              ...fields,
              my_thoughts: e.target.value || null,
            })
          }
          rows={4}
        />
      </label>

      <label>
        Favourite line
        <textarea
          value={fields.favorite_quote ?? ''}
          onChange={(e) =>
            setFields({
              ...fields,
              favorite_quote: e.target.value || null,
            })
          }
          rows={2}
        />
      </label>

      <label>
        Favourite character
        <input
          type="text"
          value={fields.favorite_character ?? ''}
          onChange={(e) =>
            setFields({
              ...fields,
              favorite_character: e.target.value || null,
            })
          }
        />
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save impressions'}
      </button>
    </form>
  )
}

function ReviewBook() {
  const { id } = useParams()
  const bookId = Number(id)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['books', bookId],
    queryFn: () => fetchOne(bookId),
    enabled: Number.isFinite(bookId),
  })

  const mutation = useMutation({
    mutationFn: (values: ReviewFields) => updateBook(bookId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['books', bookId] })
      navigate(`/books/${bookId}`)
    },
  })

  if (!Number.isFinite(bookId)) return <p role="alert">Invalid book id</p>
  if (isLoading) return <p role="status">Loading…</p>
  if (error) return <p role="alert">Failed to load book: {String(error)}</p>
  if (!data) return null

  return (
    <div className="form-page">
      <Link to={`/books/${bookId}`} className="page-back-link">
        ← Back to {data.title}
      </Link>
      <h2 className="page-heading" tabIndex={-1}>
        My Impressions of {data.title}
      </h2>
      <ReviewForm
        book={data}
        onSubmit={(values) => mutation.mutate(values)}
        isPending={mutation.isPending}
        errorMessage={
          mutation.error
            ? `Failed to save: ${String(mutation.error)}`
            : undefined
        }
      />
    </div>
  )
}

export default ReviewBook
