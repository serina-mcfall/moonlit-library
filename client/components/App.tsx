import BooksList from "./BooksList"
import AddBook from "./AddBook"

function App() {
  return (
    <>
      <header className="header">
        <h1>Serinas Book Library</h1>
      </header>
      <main className="main"><BooksList /><AddBook/></main>
    </>
  )
}


export default App
