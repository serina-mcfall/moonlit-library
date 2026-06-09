export function manaFromStatus(status: string | null): number {
  if (!status) return(100)
  const normalised = status.toLowerCase().trim()
  
  if (['not started', 'not_started', 'untouched'].includes(normalised)) return(100)
  if (['just started', 'just_started'].includes(normalised)) return 90
  if (['reading', 'in progress'].includes(normalised)) return 50
  if (['nearly finished', 'almost done'].includes(normalised)) return 10
  if (['finished', 'read', 'done'].includes(normalised)) return 0
  
  return 100
}