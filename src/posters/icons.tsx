import type { TimeOfDay } from '../types'

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Sun() {
  return (
    <g {...stroke}>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2.5v1.5M10 16v1.5M2.5 10H4M16 10h1.5M4.7 4.7l1 1M14.3 14.3l1 1M4.7 15.3l1-1M14.3 5.7l1-1" />
    </g>
  )
}

function Horizon({ stars }: { stars?: boolean }) {
  return (
    <g {...stroke}>
      <path d="M6.5 13a3.5 3.5 0 0 1 7 0" />
      <path d="M10 6.5V8M4.5 9l1 1M15.5 9l-1 1M2.5 13h15M5 16h10" />
      {stars && <path d="M15.5 3.5v2M14.5 4.5h2" />}
    </g>
  )
}

function Moon() {
  return (
    <g {...stroke}>
      <path d="M15.5 12.5A6 6 0 0 1 7.5 4.5a6 6 0 1 0 8 8Z" />
    </g>
  )
}

export function TimeOfDayIcon({ value }: { value: TimeOfDay }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-label={value}>
      {value === 'day' ? (
        <Sun />
      ) : value === 'night' ? (
        <Moon />
      ) : (
        <Horizon stars={value === 'evening'} />
      )}
    </svg>
  )
}

export function RainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-label="rain chance">
      <path {...stroke} d="M10 3c2.8 3.4 4.5 6 4.5 8.3a4.5 4.5 0 0 1-9 0C5.5 9 7.2 6.4 10 3Z" />
    </svg>
  )
}
