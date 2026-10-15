import type { RaceEvent, RaceLength } from './types'

let counter = 0
export function newId(prefix = 'id') {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

export function formatLength(length: RaceLength) {
  const unit = length.value === 1 ? length.unit.slice(0, -1) : length.unit
  return `${length.value} ${unit}`
}

// Accepts saved or imported data from older versions (e.g. length as "30 minutes")
// and returns a complete RaceEvent. Throws if the basics are missing.
export function normalizeEvent(input: unknown): RaceEvent {
  if (!input || typeof input !== 'object') throw new Error('Not a season file.')
  const raw = input as Record<string, unknown>
  if (typeof raw.name !== 'string') throw new Error('The season needs a "name".')

  let length = raw.length as RaceLength | string | undefined
  if (typeof length === 'string') {
    const match = length.match(/(\d+)\s*(lap|min)/i)
    length = match
      ? { value: Number(match[1]), unit: match[2].toLowerCase() === 'lap' ? 'laps' : 'minutes' }
      : undefined
  }

  const races = Array.isArray(raw.races) ? (raw.races as RaceEvent['races']) : []
  return {
    ...(raw as unknown as RaceEvent),
    id: typeof raw.id === 'string' ? raw.id : newId('event'),
    kind: (raw.kind as RaceEvent['kind']) ?? 'season',
    length,
    classes: Array.isArray(raw.classes) ? (raw.classes as RaceEvent['classes']) : [],
    races: races.map((r) => ({ ...r, id: r.id ?? newId('race') })),
  }
}
