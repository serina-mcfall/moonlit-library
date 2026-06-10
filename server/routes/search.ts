import { Router } from 'express'

const router = Router()

interface GoogleBooksVolume {
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    imageLinks?: {
      thumbnail?: string
    }
  }
}

router.get('/', async (req, res) => {
  console.log('[route] GET /api/v1/search')
  try {
    const { q } = req.query
    if (typeof q !== 'string' || !q.trim()) {
      return res.status(400).json({ error: 'Query parameter `q` is required' })
    }
    const url =
      'https://www.googleapis.com/books/v1/volumes?' +
      new URLSearchParams({ q, key: process.env.GOOGLE_BOOKS_API_KEY ?? '' })
    const response = await fetch(url)
    if (!response.ok) {
      console.error('[route] Google Books API error', await response.text())
      return res.status(502).json({ error: 'Failed to fetch search results' })
    }
    const data = await response.json()
    const results =
      data.items?.map((item: GoogleBooksVolume) => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.join(', ') ?? 'Unknown author',
        cover_image: item.volumeInfo.imageLinks?.thumbnail ?? null,
        description: item.volumeInfo.description ?? null,
      })) ?? []
    res.json({ q, results })
  } catch (error) {
    console.error('[route] GET /api/v1/search', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
