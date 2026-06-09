import { describe, it, expect } from "vitest";
import { manaFromStatus } from './mana'


describe('manaFromStatus', () => {
  it ('returns 100 for not started variants', () => {
    expect(manaFromStatus('not started')).toBe(100)
    expect(manaFromStatus('not_stared')).toBe(100)
    expect(manaFromStatus('untouched')).toBe(100)
  })
  it('returns 90 for just started', () => {
    expect(manaFromStatus('just started')).toBe(90)
    expect(manaFromStatus('just_started')).toBe(90)
  })

  it('returns 50 for reading', () => {
    expect(manaFromStatus('reading')).toBe(50)
    expect(manaFromStatus('in progress')).toBe(50)
  })

  it('returns 10 for nearly finished', () => {
    expect(manaFromStatus('nearly finished')).toBe(10)
    expect(manaFromStatus('almost done')).toBe(10)
  })

  it('returns 0 for finished variants', () => {
    expect(manaFromStatus('finished')).toBe(0)
    expect(manaFromStatus('read')).toBe(0)
    expect(manaFromStatus('done')).toBe(0)
  })

  it('returns 100 for unknown or null status', () => {
    expect(manaFromStatus(null)).toBe(100)
    expect(manaFromStatus('')).toBe(100)
    expect(manaFromStatus('Unknown Value')).toBe(100)
  })

  it('is case-insensitive', () => {
    expect(manaFromStatus('FINISHED')).toBe(0)
    expect(manaFromStatus('Reading')).toBe(50)
  })

})