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
  my_thoughts: null,
  rating: null,
  favorite_quote: null,
  favorite_character: null,
}

function AddBook() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [feedback, setFeedback] = useState('')
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
    setResults([])
    setFeedback(`Searching for "${term}"…`)
    try {
      const searchResults = await searchBooks(term)
      setResults(searchResults)
      setFeedback(
        searchResults.length === 0
          ? `No results for "${term}". Try a different title, or fill the form manually.`
          : `Found ${searchResults.length} result${searchResults.length === 1 ? '' : 's'} for "${term}". Select one to autofill the form, or keep typing manually.`,
      )
    } catch (error) {
      console.error('Search failed:', error)
      setFeedback(
        `Search failed — please try again or fill the form manually.`,
      )
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
      my_thoughts: null,
      rating: null,
      favorite_quote: null,
      favorite_character: null,
    })
    setResults([])
    setFeedback(`Form filled with "${result.title}". Adjust any fields below before adding.`)
  }

  return (
    <div className="form-page">
      <Link to="/" className="page-back-link">
        ← Back to library
      </Link>
      <h2 className="page-heading">Add a Book</h2>
      <div className="search-block">
        <SearchBar onSearch={handleSearch} />
        {feedback && (
          <p role="status" aria-live="polite" className="search-feedback">
            {feedback}
          </p>
        )}
        {results.length > 0 && (
          <ul className="search-results" aria-label="Search results">
            {results.map((result) => (
              <li key={result.title + result.author}>
                <button type="button" onClick={() => handleSelect(result)}>
                  {result.title} by {result.author}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
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
    </div>
  )
}

export default AddBook
