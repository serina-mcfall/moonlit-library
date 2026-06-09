import { Routes, Route } from 'react-router'
import BooksList from "./BooksList"
import AddBook from "./AddBook"

function App() {
  return (
    <>
      <header className="header">
        <h1>Serinas Book Library</h1>
      </header>
      <main className="main">
        <Routes>
          <Route path='/' element={<BooksList/>}/>
          <Route path='/books/new' element={<AddBook/>}/>
       </Routes>
      </main>
    </>
  )
}


export default App
