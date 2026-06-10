export interface Book {
  id: number
  title: string
  author: string | null
  series: string | null
  genre: string | null
  read_status: string | null
  cover_image: string | null
  notes: string | null
  my_thoughts: string | null
  rating: number | null
  favorite_quote: string | null
  favorite_character: string | null
}

export type BookDraft = Omit<Book, 'id'>
