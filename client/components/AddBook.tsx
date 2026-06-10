import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { addBook } from '../apis/books'
import type { BookDraft } from '../../models/books'
import BookForm from './BookForm'
import { useState } from 'react'
import { searchBooks } from '../apis/search'
import SearchBar from './SearchBar'
import { SearchResult } from '../../models/search'
import { Link } from 'react-router'

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
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<BookDraft>(emptyBook)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: addBook,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      navigate(`/books/${result.id}`)
    },
  })

  async function handleSearch(term: string) {
    try {
      const searchResults = await searchBooks(term)
      setResults(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  function handleSelect(result: SearchResult) {
    setSelected({
      title: result.title,
      author: result.author,
      series: null,
      genre: null,
      read_status: null,
      cover_image: result.cover_image,
      notes: result.description,
    })
    setResults([])
  }

  return (
    <>
      <Link to="/">← Back to library</Link>
      <h2>Add a Book</h2>
      <SearchBar onSearch={handleSearch} />
      {results.length > 0 && (
        <ul>
          {results.map((result) => (
            <li key={result.title + result.author}>
              <button type="button" onClick={() => handleSelect(result)}>
                {result.title} by {result.author}
              </button>
            </li>
          ))}
        </ul>
      )}
      <BookForm
        key={selected.title}
        initialValues={selected}
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
