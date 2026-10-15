import type { EventKind, PageFormat, Project, Race, RaceEvent, RaceLength, TimeOfDay } from './types'
import { defaultToggles } from './types'

let counter = 0
export function newId(prefix = 'id') {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

export function formatLength(length: RaceLength) {
  const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`
  if (length.unit === 'laps') return plural(length.value, 'lap')
  if (length.value >= 60 && length.value % 60 === 0) return plural(length.value / 60, 'hour')
  return plural(length.value, 'minute')
}

const formats: PageFormat[] = ['fit', 'wide', 'a4-portrait', 'a4-landscape', 'square', 'story']

function normalizeRace(input: unknown): Race {
  const raw = (input ?? {}) as Record<string, unknown> & {
    weather?: { timeOfDay?: TimeOfDay; tempC?: number; rainPct?: number }
  }
  // Before v2, time of day lived inside weather.
  const timeOfDay = (raw.timeOfDay as TimeOfDay | undefined) ?? raw.weather?.timeOfDay
  const weather =
    raw.weather && typeof raw.weather.tempC === 'number'
      ? { tempC: raw.weather.tempC, rainPct: raw.weather.rainPct ?? 0 }
      : undefined
  return {
    id: typeof raw.id === 'string' ? raw.id : newId('race'),
    track: typeof raw.track === 'string' ? raw.track : '',
    config: typeof raw.config === 'string' ? raw.config : undefined,
    date: typeof raw.date === 'string' ? raw.date : undefined,
    timeOfDay,
    weather,
    skip: raw.skip === true || raw.status === 'break' ? true : undefined,
  }
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

  return {
    id: typeof raw.id === 'string' ? raw.id : newId('event'),
    kind: (raw.kind as RaceEvent['kind']) ?? 'season',
    name: raw.name,
    license: raw.license as RaceEvent['license'],
    setup: raw.setup as string | undefined,
    raceTimes: raw.raceTimes as string | undefined,
    length,
    classes: Array.isArray(raw.classes) ? (raw.classes as RaceEvent['classes']) : [],
    races: Array.isArray(raw.races) ? raw.races.map(normalizeRace) : [],
  }
}

// Accepts a v2 project file, or a single season (v1 save or export).
export function normalizeProject(input: unknown): Project {
  if (!input || typeof input !== 'object') throw new Error('Not a poster file.')
  const raw = input as Record<string, unknown>
  if (!Array.isArray(raw.series)) {
    return { version: 2, series: [normalizeEvent(raw)], fields: { ...defaultToggles }, format: 'fit' }
  }
  if (raw.series.length === 0) throw new Error('The file has no series.')
  return {
    version: 2,
    series: raw.series.map(normalizeEvent),
    fields: { ...defaultToggles, ...(raw.fields as object | undefined) },
    format: formats.includes(raw.format as PageFormat) ? (raw.format as PageFormat) : 'fit',
  }
}

// Week labels count only the weeks a series actually races.
export function weekLabels(races: Race[]) {
  let n = 0
  return races.map((r) => (r.skip ? null : ++n))
}

const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

// What a race row is called: "Week 3" for seasons, "Round 3" for leagues,
// the date (or "Race") for special events.
export function raceLabel(kind: EventKind, n: number, total: number, date?: string) {
  if (kind === 'league') return `Round ${n}`
  if (kind === 'special') {
    if (date && !Number.isNaN(Date.parse(date))) return shortDate.format(new Date(date))
    return total > 1 ? `Race ${n}` : 'Race'
  }
  return `Week ${n}`
}
