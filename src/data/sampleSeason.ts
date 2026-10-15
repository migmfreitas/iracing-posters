import type { RaceEvent } from '../types'

// Mirrors the "iRacing Series 2026 S1" Figma frame.
export const sampleSeason: RaceEvent = {
  id: 'sample-sports-car-challenge',
  kind: 'season',
  name: 'Sports Car Challenge',
  license: 'C',
  setup: 'Fixed/Open',
  raceTimes: 'Every 2 hours',
  length: { value: 30, unit: 'minutes' },
  classes: [
    { name: 'LMP3', cars: ['Ligier JS P320'] },
    {
      name: 'GT4',
      cars: [
        'Aston Martin Vantage GT4',
        'BMW M4 G82 GT4 EVO',
        'Ford Mustang GT4',
        'McLaren 570S GT4',
        'Mercedes-AMG GT4',
        'Porsche 718 Cayman GT4 Clubsport MR',
      ],
    },
  ],
  races: [
    { id: 'w1', round: 1, track: 'Charlotte Motor Speedway', config: 'Roval 2025', weather: { timeOfDay: 'morning', tempC: 19, rainPct: 0 } },
    { id: 'w2', round: 2, track: 'Indianapolis Motor Speedway', config: 'Road Course', weather: { timeOfDay: 'day', tempC: 22, rainPct: 0 } },
    { id: 'w3', round: 3, track: 'Autódromo Hermanos Rodríguez', config: 'Grand Prix', weather: { timeOfDay: 'day', tempC: 21, rainPct: 27 } },
    { id: 'w4', round: 4, track: 'Road Atlanta', config: 'Full Course', weather: { timeOfDay: 'evening', tempC: 24, rainPct: 0 } },
    { id: 'w5', round: 5, track: 'Nürburgring Nordschleife', config: 'Industriefahrten', weather: { timeOfDay: 'day', tempC: 19, rainPct: 0 } },
    { id: 'w6', round: 6, track: 'Autódromo José Carlos Pace', config: 'Grand Prix', weather: { timeOfDay: 'day', tempC: 21, rainPct: 0 } },
    { id: 'w7', round: 7, track: 'Brands Hatch Circuit', config: 'Grand Prix', weather: { timeOfDay: 'day', tempC: 19, rainPct: 0 } },
    { id: 'w8', round: 8, track: 'Red Bull Ring', config: 'Grand Prix', weather: { timeOfDay: 'day', tempC: 19, rainPct: 0 } },
    { id: 'w9', round: 9, track: 'Hungaroring', weather: { timeOfDay: 'morning', tempC: 19, rainPct: 0 } },
    { id: 'w10', round: 10, track: 'Circuit Zandvoort', config: 'Grand Prix', weather: { timeOfDay: 'day', tempC: 19, rainPct: 0 } },
    { id: 'w11', round: 11, track: 'Circuit des 24 Heures du Mans', config: '24 Heures du Mans', weather: { timeOfDay: 'day', tempC: 19, rainPct: 30 } },
    { id: 'w12', round: 12, track: 'Hockenheimring Baden-Württemberg', config: 'Grand Prix', weather: { timeOfDay: 'evening', tempC: 23, rainPct: 0 } },
  ],
}
