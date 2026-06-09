import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addBook } from '../apis/books'
import type { BookDraft } from '../../models/books'

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
  const [form, setForm] = useState<BookDraft>(emptyBook)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      setForm(emptyBook)
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) return
    mutation.mutate(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add a Book</h2>

      {mutation.error && (
        <p role="alert">Failed to add: {String(mutation.error)}</p>
      )}

      <label>
        Title *
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </label>

      <label>
        Author
        <input
          type="text"
          value={form.author ?? ''}
          onChange={(e) => setForm({ ...form, author: e.target.value || null })}
        />
      </label>

      <label>
        Series
        <input
          type="text"
          value={form.series ?? ''}
          onChange={(e) => setForm({ ...form, series: e.target.value || null })}
        />
      </label>

      <label>
        Genre
        <input
          type="text"
          value={form.genre ?? ''}
          onChange={(e) => setForm({ ...form, genre: e.target.value || null })}
        />
      </label>

      <label>
        Read status
        <select
          value={form.read_status ?? ''}
          onChange={(e) => setForm({ ...form, read_status: e.target.value || null })}
        >
          <option value="">— choose —</option>
          <option value="not started">Not started</option>
          <option value="just started">Just started</option>
          <option value="reading">Reading</option>
          <option value="nearly finished">Nearly finished</option>
          <option value="finished">Finished</option>
        </select>
      </label>

      <label>
        Cover image URL
        <input
          type="url"
          value={form.cover_image ?? ''}
          onChange={(e) => setForm({ ...form, cover_image: e.target.value || null })}
        />
      </label>

      <label>
        Notes
        <textarea
          value={form.notes ?? ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
          rows={3}
        />
      </label>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Adding…' : 'Add to library'}
      </button>
    </form>
  )
}

export default AddBook
