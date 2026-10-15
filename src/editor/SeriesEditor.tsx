import type { License, RaceEvent, RaceLength } from '../types'
import { raceTimePresets } from '../data/catalog'
import { Combo, Field, Segmented, Slider } from './controls'

const licenses: { value: License; label: string }[] = [
  { value: 'R', label: 'R' },
  { value: 'D', label: 'D' },
  { value: 'C', label: 'C' },
  { value: 'B', label: 'B' },
  { value: 'A', label: 'A' },
  { value: 'Pro', label: 'Pro' },
]

const setups = ['Fixed', 'Open', 'Fixed/Open'] as const

const lengthRange = {
  minutes: { min: 5, max: 360, step: 5 },
  laps: { min: 1, max: 200, step: 1 },
}

interface Props {
  event: RaceEvent
  onChange: (patch: Partial<RaceEvent>) => void
}

export function SeriesEditor({ event, onChange }: Props) {
  const length: RaceLength = event.length ?? { value: 30, unit: 'minutes' }
  const range = lengthRange[length.unit]

  return (
    <div className="stack">
      <Field label="Series name">
        <input
          className="text"
          value={event.name}
          placeholder="e.g. Sports Car Challenge"
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Field>

      <Field label="License class">
        <Segmented
          label="License class"
          value={event.license}
          options={licenses.map((l) => ({
            ...l,
            className: `lic lic-${l.value.toLowerCase()}`,
            title: l.value === 'R' ? 'Rookie' : l.value === 'Pro' ? 'Pro' : `Class ${l.value}`,
          }))}
          onChange={(license) => onChange({ license })}
        />
      </Field>

      <Field label="Setup">
        <Segmented
          label="Setup"
          value={event.setup as (typeof setups)[number] | undefined}
          options={setups.map((s) => ({ value: s, label: s }))}
          onChange={(setup) => onChange({ setup })}
        />
      </Field>

      <Field label="Race times" hint="Pick one or type your own">
        <Combo
          label="Race times"
          value={event.raceTimes ?? ''}
          options={raceTimePresets}
          placeholder="e.g. Every 2 hours"
          onChange={(raceTimes) => onChange({ raceTimes })}
        />
      </Field>

      <Field label="Race length">
        <Segmented
          label="Length unit"
          value={length.unit}
          options={[
            { value: 'minutes', label: 'Minutes' },
            { value: 'laps', label: 'Laps' },
          ]}
          onChange={(unit) => {
            const r = lengthRange[unit]
            onChange({ length: { unit, value: Math.min(r.max, Math.max(r.min, length.value)) } })
          }}
        />
        <Slider
          label="Race length"
          value={length.value}
          {...range}
          suffix={length.unit === 'minutes' ? 'min' : 'laps'}
          onChange={(value) => onChange({ length: { ...length, value } })}
        />
      </Field>
    </div>
  )
}
