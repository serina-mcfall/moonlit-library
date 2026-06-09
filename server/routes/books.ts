import { Router } from 'express'
import { getAll } from '../db/books'

const router = Router()

router.get('/', async (req, res) => {
  console.log('[route] GET /api/v1/books')
  const books = await getAll()
  res.json(books)

})

export default router