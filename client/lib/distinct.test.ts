import { describe, it, expect } from 'vitest'
import { distinct } from './distinct'

describe('distinct', () => {
  it('dedupes and sorts alphabetically', () => {
    expect(distinct(['Brandon', 'Andy', 'Andy'])).toEqual(['Andy', 'Brandon'])
  })

  it('drops null, undefined, empty and whitespace-only values', () => {
    expect(distinct(['Fantasy', null, undefined, '', '  '])).toEqual([
      'Fantasy',
    ])
  })

  it('trims surounding whitespace before deduping', () => {
    expect(distinct(['R.F. Kuang', ' R.F. Kuang '])).toEqual(['R.F. Kuang'])
  })

  it('returns an empty array for no usable values', () => {
    expect(distinct([null, undefined, ''])).toEqual([])
  })
})
