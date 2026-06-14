import { Router } from 'express'

const router = Router()

interface OpenLibraryDoc {
  title: string
  author_name?: string[]
  cover_i?: number
  first_sentence?: string[]
  subtitle?: string
}

router.get('/', async (req, res) => {
  console.log('[route] GET /api/v1/search')
  try {
    const { q } = req.query
    if (typeof q !== 'string' || !q.trim()) {
      return res.status(400).json({ error: 'Query parameter `q` is required' })
    }
    const url =
      'https://openlibrary.org/search.json?' +
      new URLSearchParams({ q, limit: '10' })
    const response = await fetch(url)
    if (!response.ok) {
      console.error('[route] Open Library error', await response.text())
      return res.status(502).json({ error: 'Failed to fetch search results' })
    }
    const data = await response.json()
    const results =
      data.docs?.map((doc: OpenLibraryDoc) => ({
        title: doc.title,
        author: doc.author_name?.join(', ') ?? 'Unknown author',
        cover_image: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : null,
        description: doc.first_sentence?.[0] ?? doc.subtitle ?? null,
      })) ?? []
    res.json({ q, results })
  } catch (error) {
    console.error('[route] GET /api/v1/search', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
