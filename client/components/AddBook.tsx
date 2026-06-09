import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { addBook } from '../apis/books'
import type { BookDraft } from '../../models/books'
import BookForm from './BookForm'

const emptyBook: BookDraft = {
  title: '',
  author: null,
  series: null,
  genre: null,
  read_status: null,
  cover_image: null,
  notes: null,
}

function AddBook() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: addBook,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      navigate(`/books/${result.id}`)
    },
  })

  return (
    <>
      <h2>Add a Book</h2>
      <BookForm
        initialValues={emptyBook}
        onSubmit={(values) => mutation.mutate(values)}
        isPending={mutation.isPending}
        errorMessage={
          mutation.error
            ? `Failed to add: ${String(mutation.error)}`
            : undefined
        }
        submitLabel="Add to library"
        pendingLabel="Adding…"
      />
    </>
  )
}

export default AddBook
