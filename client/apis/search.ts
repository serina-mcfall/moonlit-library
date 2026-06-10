import request from 'superagent'

export async function searchBooks(query: string) {
  const response = await request.get('/api/v1/search').query({ q: query })
  if (!response.ok) {
    throw new Error('Failed to fetch search results')
  }
  return response.body.results as {
    title: string
    author: string
    cover_image: string | null
  }[]
}
