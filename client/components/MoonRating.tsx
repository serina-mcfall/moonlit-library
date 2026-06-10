import { useRef, type KeyboardEvent, type MouseEvent } from 'react'
import { moonFill, ratingLabel, type MoonFillState } from '../lib/moonRating.ts'

interface Props {
  value: number | null
  onChange?: (rating: number) => void
}

const MOON_COUNT = 5

function Moon({
  state,
  selected,
  isFocusable,
  onClickLeft,
  onClickRight,
  onKeyDown,
  moonIndex,
}: {
  state: MoonFillState
  selected: boolean
  isFocusable: boolean
  onClickLeft?: (e: MouseEvent) => void
  onClickRight?: (e: MouseEvent) => void
  onKeyDown?: (e: KeyboardEvent) => void
  moonIndex: number
}) {
  const interactive = !!onClickLeft

  const baseStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    position: 'relative',
    cursor: interactive ? 'pointer' : 'default',
    boxShadow: state !== 'empty' ? '0 0 8px rgba(245, 232, 200, 0.6)' : 'none',
    background:
      state === 'full'
        ? 'radial-gradient(circle, #f5e8c8, #e0c080)'
        : state === 'half'
          ? 'linear-gradient(90deg, #e0c080 50%, #1a2547 50%)'
          : '#1a2547',
    border: state === 'empty' ? '1px solid rgba(240, 200, 150, 0.3)' : 'none',
    outline: 'none',
  }

  const containerProps = interactive
    ? {
        role: 'radio',
        'aria-checked': selected,
        tabIndex: isFocusable ? 0 : -1,
        onKeyDown,
        'aria-label': `Moon ${moonIndex + 1}`,
      }
    : {}

  if (interactive) {
    return (
      <div style={baseStyle} {...containerProps}>
        <div
          onClick={onClickLeft}
          style={{
            position: 'absolute',
            inset: 0,
            width: '50%',
          }}
          aria-hidden="true"
        />
        <div
          onClick={onClickRight}
          style={{
            position: 'absolute',
            inset: 0,
            left: '50%',
            width: '50%',
          }}
          aria-hidden="true"
        />
      </div>
    )
  }
  return <div style={baseStyle} />
}

function MoonRating({ value, onChange }: Props) {
  const groupRef = useRef<HTMLDivElement>(null)
  const interactive = !!onChange

  function setRating(newValue: number) {
    if (onChange) onChange(Math.max(0, Math.min(10, newValue)))
  }

  function handleKey(e: KeyboardEvent) {
    const r = value ?? 0
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      setRating(r + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      setRating(r - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setRating(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setRating(10)
    }
  }

  const focusedMoonIndex =
    value === null || value === 0
      ? 0
      : Math.min(MOON_COUNT - 1, Math.floor((value - 1) / 2))

  const moons = []
  for (let i = 0; i < MOON_COUNT; i++) {
    const state = moonFill(value, i)
    moons.push(
      <Moon
        key={i}
        state={state}
        selected={state !== 'empty'}
        isFocusable={i === focusedMoonIndex}
        moonIndex={i}
        onClickLeft={interactive ? () => setRating(i * 2 + 1) : undefined}
        onClickRight={interactive ? () => setRating(i * 2 + 2) : undefined}
        onKeyDown={interactive ? handleKey : undefined}
      />,
    )
  }

  const label = ratingLabel(value)

  if (interactive) {
    return (
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={`Rating: ${label}`}
        style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
      >
        {moons}
        <span
          style={{
            marginLeft: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {label}
        </span>
      </div>
    )
  }

  return (
    <div
      aria-label={`Rating: ${label}`}
      style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
    >
      {moons}
      <span
        style={{
          marginLeft: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default MoonRating
