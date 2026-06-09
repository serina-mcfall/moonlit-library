import { Router } from 'express'
import * as books from '../db/books'

const router = Router()

router.post('/', async (req, res) => {
  console.log('[route] POST /api/v1/books')
  try {
    if (
      !req.body?.title ||
      typeof req.body.title !== 'string' ||
      !req.body.title.trim()
    ) {
      return res.status(400).json({ error: 'Title is required' })
    }
    const newId = await books.add(req.body)
    res.status(201).json({ id: newId })
  } catch (err) {
    console.error('[route] error creating book', err)
    res.status(500).json({ error: 'Failed to create book' })
  }
})

router.get('/:id', async (req, res) => {
  console.log('[route] GET /api/v1/books/:id')
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id))
      return res.status(400).json({ error: 'Invalid id' })
    const book = await books.getById(id)
    if (!book) return res.status(404).json({ error: 'Book not found' })
    res.json(book)
  } catch (err) {
    console.error('[route] error fetching book', err)
    res.status(500).json({ error: 'Failed to fetch book' })
  }
})

router.patch('/:id', async (req, res) => {
  console.log('[route] PATCH /api/v1/books/:id')
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id))
      return res.status(400).json({ error: 'Invalid id' })
    const affected = await books.update(id, req.body)
    if (affected === 0) return res.status(404).json({ error: 'Book not found' })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[route] error updating book', err)
    res.status(500).json({ error: 'Failed to update book' })
  }
})

router.get('/', async (req, res) => {
  console.log('[route] GET /api/v1/books')
  try {
    const allBooks = await books.getAll()
    res.json(allBooks)
  } catch (err) {
    console.error('[route] error fetching books', err)
    res.status(500).json({ error: 'Failed to fetch books' })
  }
})

router.delete('/:id', async (req, res) => {
  console.log('[route] DELETE /api/v1/books/:id')
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id))
      return res.status(400).json({ error: 'Invalid id' })
    const deleted = await books.deleteById(id)
    if (deleted === 0) return res.status(404).json({ error: 'Book not found' })
    res.status(204).end()
  } catch (err) {
    console.error('[route] error deleting book', err)
    res.status(500).json({ error: 'Failed to delete book' })
  }
})

export default router
