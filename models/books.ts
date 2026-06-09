export interface Book {
  id: number
  title: string
  author: string | null
  series: string | null
  genre: string | null
  read_status: string | null
  cover_image: string | null
  notes: string | null
}

export type BookDraft = Omit<Book, 'id'>
