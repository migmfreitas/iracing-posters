export type EventKind = 'special' | 'season' | 'league'
export type License = 'R' | 'D' | 'C' | 'B' | 'A' | 'Pro'
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night'

export interface CarClass {
  name: string
  cars: string[]
}

export interface RaceLength {
  value: number
  unit: 'minutes' | 'laps'
}

// Forecast for the race; can change from session to session.
export interface Weather {
  tempC: number
  rainPct: number
}

export interface Race {
  id: string
  date?: string // ISO date, optional
  track: string
  config?: string
  timeOfDay?: TimeOfDay // fixed start time of day
  weather?: Weather
  skip?: boolean // series has no race this week
}

export interface RaceEvent {
  id: string
  kind: EventKind
  name: string
  license?: License
  setup?: string // e.g. "Fixed", "Open", "Fixed/Open"
  raceTimes?: string // e.g. "Every 2 hours"; may span several lines
  length?: RaceLength
  classes: CarClass[]
  races: Race[] // one entry per season week, in order
}

export interface FieldToggles {
  license: boolean
  setup: boolean
  raceTimes: boolean
  length: boolean
  cars: boolean
  timeOfDay: boolean
  weather: boolean
}

export const defaultToggles: FieldToggles = {
  license: true,
  setup: true,
  raceTimes: true,
  length: true,
  cars: true,
  timeOfDay: true,
  weather: true,
}

export type PageFormat = 'fit' | 'wide' | 'a4-portrait' | 'a4-landscape' | 'square' | 'story'

// Everything on one poster: one or more series shown side by side.
export interface Project {
  version: 2
  series: RaceEvent[]
  fields: FieldToggles
  format: PageFormat
}
