import { manaFromStatus } from '../lib/mana.ts'

interface Props {
  status: string | null
  size?: 'tile' | 'detail'
}

function ManaBar({ status, size = 'tile'}: Props) {
  const percent = manaFromStatus(status)
  const height = size === 'detail' ? 8 : 5
  const label = status ? `Reading progress: ${status}` : 'Reading progress: not started'

   return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{
        height: `${height}px`,
        background: 'var(--bg-raised)',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid var(--border-gold)',
      }}
  
    >
      <div
      style={{
         height: '100%',
          width: `${percent}%`,
          background: 'linear-gradient(90deg, var(--gold), var(--pink), var(--cyan))',
          boxShadow: '0 0 8px rgba(245, 168, 192, 0.7)',
          transition: 'width 0.3s ease',
      }}
      />
    </div>
   )
    
  
}

export default ManaBar