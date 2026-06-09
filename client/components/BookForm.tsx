import { useState, type FormEvent } from 'react'
import type { BookDraft } from '../../models/books'

interface Props {
  initialValues: BookDraft
  onSubmit: (values: BookDraft) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
}

function BookForm({
  initialValues,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel,
  pendingLabel,
}: Props) {
  const [form, setForm] = useState<BookDraft>(initialValues)

  function handelSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handelSubmit}>
      {errorMessage && <p role="alert">{errorMessage}</p>}

      <label>
        Title *
        <input
          type="text"
          required
          aria-required="true"
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
          onChange={(e) =>
            setForm({ ...form, read_status: e.target.value || null })
          }
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
          onChange={(e) =>
            setForm({ ...form, cover_image: e.target.value || null })
          }
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

      <button type="submit" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  )
}

export default BookForm
