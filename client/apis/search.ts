import request from 'superagent'
import type { SearchResult } from '../../models/search'

export async function searchBooks(query: string) {
  const response = await request.get('/api/v1/search').query({ q: query })
  if (!response.ok) {
    throw new Error('Failed to fetch search results')
  }
  return response.body.results as SearchResult[]
}
