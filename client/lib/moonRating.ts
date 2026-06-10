export type MoonFillState = 'empty' | 'half' | 'full'

export function moonFill(
  rating: number | null,
  moonIndex: number,
): MoonFillState {
  const r = rating ?? 0
  const moonStart = moonIndex * 2
  if (r >= moonStart + 2) return 'full'
  if (r >= moonStart + 1) return 'half'
  return 'empty'
}

export function ratingLabel(rating: number | null): string {
  if (rating === null) return 'Not rated'
  if (rating === 0) return 'No moons'
  if (rating === 1) return 'Half a moon'

  const fullMoons = Math.floor(rating / 2)
  const hasHalf = rating % 2 === 1
  const moonsWord = fullMoons === 1 && !hasHalf ? 'moon' : 'moons'
  const numberWords = ['', 'One', 'Two', 'Three', 'Four', 'Five']
  const numberWord = numberWords[fullMoons]

  if (hasHalf) {
    return `${numberWord} and a half ${moonsWord}`
  }
  return `${numberWord} ${moonsWord}`
}
