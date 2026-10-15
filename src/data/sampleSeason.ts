import type { Project, Race, RaceEvent, TimeOfDay } from '../types'
import { defaultToggles } from '../types'
import { carClasses } from './catalog'

// Mirrors the "GT4 Schedule - 2025 S4" Figma frame: four series side by side.

type Row = [track: string, config: string | undefined, tod: TimeOfDay, tempC: number, rainPct: number] | null

function races(prefix: string, rows: Row[]): Race[] {
  return rows.map((row, i) =>
    row
      ? {
          id: `${prefix}-w${i + 1}`,
          track: row[0],
          config: row[1],
          timeOfDay: row[2],
          weather: { tempC: row[3], rainPct: row[4] },
        }
      : { id: `${prefix}-w${i + 1}`, track: '', skip: true },
  )
}

const gt4 = { name: 'GT4', cars: [...carClasses.GT4] }
const imsaTimes = 'Saturday → 04:00 · 15:00 (GMT)\nSunday → 00:00 · 20:00 (GMT)'

const gt4Challenge: RaceEvent = {
  id: 'gt4-challenge',
  kind: 'season',
  name: 'GT4 Challenge',
  license: 'D',
  setup: 'Fixed',
  raceTimes: 'Every 2 hours',
  length: { value: 20, unit: 'minutes' },
  classes: [gt4],
  races: races('gt4', [
    ['Charlotte Motor Speedway', 'Roval 2025', 'morning', 22, 0],
    ['Indianapolis Motor Speedway', 'Road Course', 'day', 22, 0],
    ['Autódromo Hermanos Rodríguez', 'Grand Prix', 'day', 28, 0],
    ['Road Atlanta', 'Full Course', 'evening', 21, 26],
    ['Nürburgring Nordschleife', 'Industriefahrten', 'day', 18, 0],
    ['Autódromo José Carlos Pace', 'Grand Prix', 'day', 26, 0],
    ['Brands Hatch Circuit', 'Grand Prix', 'day', 19, 0],
    ['Red Bull Ring', 'Grand Prix', 'day', 18, 33],
    ['Hungaroring', undefined, 'morning', 18, 0],
    ['Circuit Zandvoort', 'Grand Prix', 'day', 19, 0],
    ['Circuit des 24 Heures du Mans', '24 Heures du Mans', 'day', 19, 0],
    ['Hockenheimring Baden-Württemberg', 'Grand Prix', 'morning', 19, 0],
  ]),
}

export const sampleSeason: RaceEvent = {
  id: 'sample-sports-car-challenge',
  kind: 'season',
  name: 'Sports Car Challenge',
  license: 'C',
  setup: 'Fixed/Open',
  raceTimes: 'Every 2 hours',
  length: { value: 30, unit: 'minutes' },
  classes: [{ name: 'LMP3', cars: ['Ligier JS P320'] }, gt4],
  races: races('scc', [
    ['Charlotte Motor Speedway', 'Roval 2025', 'morning', 19, 0],
    ['Indianapolis Motor Speedway', 'Road Course', 'day', 22, 0],
    ['Autódromo Hermanos Rodríguez', 'Grand Prix', 'day', 21, 27],
    ['Road Atlanta', 'Full Course', 'evening', 24, 0],
    ['Nürburgring Nordschleife', 'Industriefahrten', 'day', 19, 0],
    ['Autódromo José Carlos Pace', 'Grand Prix', 'day', 21, 0],
    ['Brands Hatch Circuit', 'Grand Prix', 'day', 19, 0],
    ['Red Bull Ring', 'Grand Prix', 'day', 19, 0],
    ['Hungaroring', undefined, 'morning', 19, 0],
    ['Circuit Zandvoort', 'Grand Prix', 'day', 19, 0],
    ['Circuit des 24 Heures du Mans', '24 Heures du Mans', 'day', 19, 30],
    ['Hockenheimring Baden-Württemberg', 'Grand Prix', 'evening', 23, 0],
  ]),
}

const imsaEndurance: RaceEvent = {
  id: 'imsa-endurance',
  kind: 'season',
  name: 'IMSA Sportscar Endurance Challenge',
  license: 'C',
  setup: 'Open',
  raceTimes: imsaTimes,
  length: { value: 120, unit: 'minutes' },
  classes: [{ name: 'LMP3', cars: ['Ligier JS P320'] }, gt4],
  races: races('imsa-e', [
    ['Charlotte Motor Speedway', 'Roval 2025', 'morning', 20, 0],
    null,
    ['Autódromo Hermanos Rodríguez', 'Grand Prix', 'day', 22, 26],
    null,
    ['Nürburgring Nordschleife', 'Industriefahrten', 'day', 20, 0],
    null,
    ['Brands Hatch Circuit', 'Grand Prix', 'day', 19, 34],
    null,
    ['Hungaroring', undefined, 'morning', 19, 0],
    null,
    ['Circuit des 24 Heures du Mans', '24 Heures du Mans', 'day', 19, 0],
    null,
  ]),
}

const imsaPilot: RaceEvent = {
  id: 'imsa-pilot',
  kind: 'season',
  name: 'IMSA Michelin Pilot Challenge',
  license: 'C',
  setup: 'Open',
  raceTimes: imsaTimes,
  length: { value: 120, unit: 'minutes' },
  classes: [gt4, { name: 'TCR', cars: [...carClasses.TCR] }],
  races: races('imsa-p', [
    null,
    ['Indianapolis Motor Speedway', 'Road Course', 'day', 20, 0],
    null,
    ['Road America', 'Full Course', 'evening', 19, 31],
    null,
    ['Autódromo José Carlos Pace', 'Grand Prix', 'day', 22, 0],
    null,
    ['Red Bull Ring', 'Grand Prix', 'day', 20, 0],
    null,
    ['Circuit Zandvoort', 'Grand Prix', 'day', 19, 0],
    null,
    ['Hockenheimring Baden-Württemberg', 'Grand Prix', 'evening', 19, 34],
  ]),
}

export const sampleProject: Project = {
  version: 2,
  series: [gt4Challenge, sampleSeason, imsaEndurance, imsaPilot],
  fields: { ...defaultToggles },
  format: 'wide',
}

const productionCarChallenge: RaceEvent = {
  id: 'production-car-challenge',
  kind: 'season',
  name: 'Production Car Challenge',
  license: 'R',
  setup: 'Fixed',
  raceTimes: 'Every hour at :30',
  length: { value: 25, unit: 'minutes' },
  classes: [{ name: 'Production', cars: ['Global Mazda MX-5 Cup', 'BMW M2 Racing (G87)', 'Toyota GR86', 'Renault Clio'] }],
  races: races('pcc', [
    ['Hockenheimring Baden-Württemberg', 'Outer', 'morning', 20, 0],
    ['Autodromo Nazionale Monza', 'GP without first chicane', 'day', 25, 0],
    ['Snetterton Circuit', '300', 'day', 19, 30],
    ['Motorsport Arena Oschersleben', 'Grand Prix', 'morning', 19, 0],
    ['Silverstone Circuit', 'International', 'day', 20, 0],
    ['Nürburgring Grand-Prix-Strecke', 'Kurzanbindung w/out Arena', 'day', 19, 0],
    ['Circuito de Navarra', 'Speed Circuit', 'day', 19, 0],
    ['Sonoma Raceway', 'Cup Long', 'day', 23, 0],
    ['Circuit des 24 Heures du Mans', 'Historic', 'morning', 20, 0],
    ['Summit Point Raceway', 'Summit Point Raceway', 'day', 19, 24],
    ['Watkins Glen International', 'Classic Boot', 'evening', 19, 0],
    ['Oulton Park Circuit', 'Island Historic', 'day', 19, 0],
  ]),
}

// iRacing series people can start from on the start screen.
export const seriesTemplates: RaceEvent[] = [
  gt4Challenge,
  sampleSeason,
  imsaEndurance,
  imsaPilot,
  productionCarChallenge,
]
