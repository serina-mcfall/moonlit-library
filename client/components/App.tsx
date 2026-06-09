import { Routes, Route } from 'react-router'
import BooksList from './BooksList'
import AddBook from './AddBook'
import BookDetail from './BookDetail'
import EditBook from './EditBook'

function App() {
  return (
    <>
      <header className="header">
        <h1>Serinas Book Library</h1>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<BooksList />} />
          <Route path="/books/new" element={<AddBook />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/edit" element={<EditBook />} />
        </Routes>
      </main>
    </>
  )
}

export default App
