import { useState, type FormEvent } from 'react'

interface Props {
  onSearch: (query: string) => void
}

function SearchBar({ onSearch }: Props) {
  const [term, setTerm] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(term)
  }
  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}
    >
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search books..."
      />
      <button type="submit">Search</button>
    </form>
  )
}

export default SearchBar
