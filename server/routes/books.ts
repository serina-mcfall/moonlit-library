import { Router } from 'express'
import { getAll } from '../db/books'

const router = Router()

router.get('/', async (req, res) => {
  const books = await getAll()
  res.json(books)

})

export default getAll 