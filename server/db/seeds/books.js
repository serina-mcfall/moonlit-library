/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('books').del()
  await knex('books').insert([
    {
      title: 'The Poppy War',
      author: 'R.F. Kuang',
      series: 'The Poppy War Trilogy',
      genre: 'Fantasy',
      read_status: 'just started',
      cover_image: 'https://covers.openlibrary.org/b/id/10613239-M.jpg',
      notes: 'A gripping tale of war and politics.',
    },

    {
      title: 'When the Moon Hatched',
      author: 'Sarah A Parker',
      series: 'Moonfall',
      genre: 'Fantasy',
      read_status: 'not started',
      cover_image: 'https://covers.openlibrary.org/b/id/15161976-M.jpg',
      notes: 'A beautifully illustrated story about the moon and its secrets.',
    },

    {
      title: 'A Magic Steeped in Poison',
      author: 'Judy I. Lin',
      series: 'The Book of Tea',
      genre: 'Fantasy',
      read_status: 'not started',
      cover_image: 'https://covers.openlibrary.org/b/id/12614828-M.jpg',
      notes: 'A dark and enchanting tale of magic and intrigue.',
    },

    {
      title: 'Daughter of the Drowned Empire',
      author: 'Frankie Diane Mallis',
      series: 'Drowned Empire',
      genre: 'Fantasy',
      read_status: 'not started',
      cover_image: '/bookCovers/daughter-of-the-drowned-empire.webp',
      notes: 'A thrilling adventure set in a world of water and mystery.',
    },

    {
      title: 'The Hurricane Wars',
      author: 'Thea Guazou',
      series: 'The Hurricane Wars',
      genre: 'Fantasy',
      read_status: 'not started',
      cover_image: '/bookCovers/hurricane-wars.webp',
      notes:
        'An exquisite fantasy brimming with unforgettable characters, sizzling enemies-to-lovers romance, and richly drawn worlds, The Hurricane Wars marks the breathtaking debut of an extraordinary new writer ',
    },

    {
      title: 'Dark Star Burning, Ash Falls White',
      author: 'Amelie Wen Zhao',
      series: 'Song of the Last Kingdom',
      genre: 'Fantasy',
      read_status: 'not started',
      cover_image: '/bookCovers/dark-star-burning.webp',
      notes:
        'The epic sequel to Song of Silver, Flame Like Night. A fast-paced, riveting YA fantasy inspired by the mythology and folklore of ancient China',
    },

    {
      title: 'My Summer in Seoul',
      author: 'Rachel Van Dyken',
      series: 'null',
      genre: 'Young Adult',
      read_status: 'not started',
      cover_image: '/bookCovers/my-summer-in-seoul.webp',
      notes: 'Its not all K-dramas and happily ever afters.',
    },

    {
      title: 'Song of Silver, Flame Like Night',
      author: 'Amelie Wen Zhao',
      series: 'Song of the Last Kingdom',
      genre: 'Fantasy',
      read_status: 'not started',
      cover_image: '/bookCovers/song-of-silver.webp',
      notes:
        'In a fallen kingdom, one girl carries the key to discovering the secrets of her nation’s past—and unleashing the demons that sleep at its heart. An epic fantasy series inspired by the mythology and folklore of ancient China.',
    },
  ])
}
