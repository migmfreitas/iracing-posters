export type EventKind = 'special' | 'season' | 'league'
export type License = 'R' | 'D' | 'C' | 'B' | 'A' | 'Pro'
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night'

export interface CarClass {
  name: string
  cars: string[]
}

export interface Weather {
  timeOfDay: TimeOfDay
  tempC: number
  rainPct: number
}

export interface Race {
  id: string
  round?: number
  date?: string // ISO date, optional
  track: string
  config?: string
  weather?: Weather
  status?: 'scheduled' | 'tba' | 'break'
}

export interface RaceEvent {
  id: string
  kind: EventKind
  name: string
  license?: License
  setup?: string // e.g. "Fixed", "Open", "Fixed/Open"
  raceTimes?: string // repeat rule, e.g. "Every 2 hours"
  length?: string // e.g. "30 minutes"
  classes: CarClass[]
  races: Race[]
}

export interface FieldToggles {
  license: boolean
  setup: boolean
  raceTimes: boolean
  length: boolean
  cars: boolean
  weather: boolean
}

export const defaultToggles: FieldToggles = {
  license: true,
  setup: true,
  raceTimes: true,
  length: true,
  cars: true,
  weather: true,
}
