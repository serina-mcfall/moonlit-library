export function distinct(values: Array<string | null | undefined>): string[] {
  const cleaned = values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))

  return [...new Set(cleaned)].sort((a, b) => a.localeCompare(b))
}
