import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { fetchOne, updateBook } from '../apis/books'
import type { BookDraft } from '../../models/books'
import BookForm from './BookForm'

function EditBook() {
  const { id } = useParams()
  const bookId = Number(id)
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['books', bookId],
    queryFn: () => fetchOne(bookId),
    enabled: Number.isFinite(bookId),
  })
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (values: BookDraft) => updateBook(bookId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', bookId] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      navigate(`/books/${bookId}`)
    },
  })
  if (!Number.isFinite(bookId)) return <p role="alert">Invalid book id</p>
  if (isLoading) return <p role="status">Loading...</p>
  if (error) return <p role="alert">Failed to Load book: {String(error)}</p>
  if (!data) return null

  return (
    <div className="form-page">
      <Link to={`/books/${bookId}`} className="page-back-link">
        ← Back to {data.title}
      </Link>
      <h2 className="page-heading">Edit Book</h2>
      <BookForm
        initialValues={data}
        onSubmit={(values) => mutation.mutate(values)}
        isPending={mutation.isPending}
        errorMessage={
          mutation.error
            ? `Failed to edit: ${String(mutation.error)}`
            : undefined
        }
        submitLabel="Update Book"
        pendingLabel="Updating…"
      />
    </div>
  )
}

export default EditBook
