import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { fetchOne } from '../apis/books'

 function EditBook() {
  const { id } = useParams()
  const bookId = Number(id)

  const { data, isLoading, error } = useQuery({
    queryKey: ['books', bookId],
    queryFn: ()=> fetchOne(bookId),
    enabled: Number.isFinite(bookId),

  })
  if (!Number.isFinite(bookId)) return <p role="alert">Invalid book id</p>
  if (isLoading) return <p role="status">Loading...</p>
  if (error) return <p role='alert'>Failed to Load book: {String(error)}</p>
  if (!data) return null

  return (
    <article>
    <p>
    <Link to="/">← Back to library</Link>
    </p>
    <h2>Edit {data.title}</h2>
    </article>
  )
}

export default EditBook

  
 