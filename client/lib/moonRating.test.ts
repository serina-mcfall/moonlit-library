import { describe, it, expect } from 'vitest'
import { moonFill, ratingLabel } from './moonRating.ts'

describe('moonFill', () => {
  it('returns "empty" for all moons when rating is 0', () => {
    expect(moonFill(0, 0)).toBe('empty')
    expect(moonFill(0, 4)).toBe('empty')
  })

  it('returns "full" for filled moons', () => {
    // rating 6 = 3 full moons → moons 0, 1, 2 are full
    expect(moonFill(6, 0)).toBe('full')
    expect(moonFill(6, 1)).toBe('full')
    expect(moonFill(6, 2)).toBe('full')
  })

  it('returns "half" for a half-filled moon', () => {
    // rating 5 = 2 full + 1 half → moons 0,1 full, moon 2 half
    expect(moonFill(5, 0)).toBe('full')
    expect(moonFill(5, 1)).toBe('full')
    expect(moonFill(5, 2)).toBe('half')
    expect(moonFill(5, 3)).toBe('empty')
  })

  it('returns "empty" for moons beyond the rating', () => {
    expect(moonFill(2, 1)).toBe('empty')
    expect(moonFill(2, 4)).toBe('empty')
  })

  it('handles rating 10 — all five moons full', () => {
    for (let i = 0; i < 5; i++) {
      expect(moonFill(10, i)).toBe('full')
    }
  })

  it('handles rating 1 — first moon half only', () => {
    expect(moonFill(1, 0)).toBe('half')
    expect(moonFill(1, 1)).toBe('empty')
  })

  it('treats null rating as 0', () => {
    expect(moonFill(null, 0)).toBe('empty')
    expect(moonFill(null, 4)).toBe('empty')
  })
})

describe('ratingLabel', () => {
  it('formats whole-moon ratings without "and a half"', () => {
    expect(ratingLabel(0)).toBe('No moons')
    expect(ratingLabel(2)).toBe('One moon')
    expect(ratingLabel(10)).toBe('Five moons')
  })

  it('formats half-moon ratings with "and a half"', () => {
    expect(ratingLabel(1)).toBe('Half a moon')
    expect(ratingLabel(3)).toBe('One and a half moons')
    expect(ratingLabel(9)).toBe('Four and a half moons')
  })

  it('treats null as no rating set', () => {
    expect(ratingLabel(null)).toBe('Not rated')
  })
})
