import { useQuery } from "@tanstack/react-query";
import { fetchAllBooks } from "../apis/books"

function BooksList() {
  const { data, isLoading, error} = useQuery({
    queryKey: ['books'],
    queryFn: fetchAllBooks
  })

  if (isLoading) return <p role="status">Loading…</p>
  if (error) return <p role="alert">Something went wrong: {String(error)}</p>
  if (!data) return null

  return (
    <ul>
      {data.map((book) => (
        <li key={book.id}>{book.title} — {book.author}</li>
      ))}
    </ul>
  )
}

export default BooksList