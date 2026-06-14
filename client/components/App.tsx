import { Routes, Route } from 'react-router'
import BooksList from './BooksList'
import AddBook from './AddBook'
import BookDetail from './BookDetail'
import EditBook from './EditBook'
import ReviewBook from './ReviewBook'

function App() {
  return (
    <>
      <header className="header">
        <h1>Moonlit Library</h1>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<BooksList />} />
          <Route path="/books/new" element={<AddBook />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/edit" element={<EditBook />} />
          <Route path="/books/:id/review" element={<ReviewBook />} />
        </Routes>
      </main>
    </>
  )
}

export default App
