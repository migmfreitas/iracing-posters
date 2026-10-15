import { useState } from 'react'
import type { EventKind, Race, TimeOfDay, Weather } from '../types'
import { tracks } from '../data/catalog'
import { newId, raceLabel, weekLabels } from '../normalize'
import { TimeOfDayIcon } from '../posters/icons'
import { Combo, Field, IconButton, Segmented, Slider } from './controls'

const trackNames = Object.keys(tracks).sort((a, b) => a.localeCompare(b))
const timesOfDay: TimeOfDay[] = ['morning', 'day', 'evening', 'night']
const defaultWeather: Weather = { tempC: 20, rainPct: 0 }

interface Props {
  kind: EventKind
  races: Race[]
  onChange: (races: Race[]) => void
}

function WeekCard({
  race,
  label,
  index,
  count,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: {
  race: Race
  label: string
  index: number
  count: number
  onChange: (race: Race) => void
  onMove: (delta: number) => void
  onDuplicate: () => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(!race.track && !race.skip)
  const weather = race.weather ?? defaultWeather
  const setWeather = (patch: Partial<Weather>) => onChange({ ...race, weather: { ...weather, ...patch } })

  return (
    <details
      className={`item-card week-card${race.skip ? ' skipped' : ''}`}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        <span className="week-num">{label}</span>
        {race.skip ? (
          <span className="week-sum muted">No race</span>
        ) : (
          <>
            <span className="week-sum">
              <span>{race.track || 'Choose a track'}</span>
              {race.config && <small>{race.config}</small>}
            </span>
            <span className="week-meta">
              {race.timeOfDay && <TimeOfDayIcon value={race.timeOfDay} />}
              {race.weather && `${race.weather.tempC}º · ${race.weather.rainPct}%`}
            </span>
          </>
        )}
      </summary>

      <div className="stack">
        <Segmented
          label="Race or blank"
          value={race.skip ? 'skip' : 'race'}
          options={[
            { value: 'race', label: 'Race' },
            { value: 'skip', label: 'Blank' },
          ]}
          onChange={(v) => onChange({ ...race, skip: v === 'skip' ? true : undefined })}
        />

        {!race.skip && (
          <>
            <Field label="Track">
              <Combo
                label="Track"
                value={race.track}
                options={trackNames}
                placeholder="Start typing a track"
                onChange={(track) =>
                  onChange({ ...race, track, config: tracks[track]?.length === 1 ? tracks[track][0] : race.config })
                }
              />
            </Field>
            <Field label="Layout">
              <Combo
                label="Layout"
                value={race.config ?? ''}
                options={tracks[race.track] ?? []}
                placeholder={tracks[race.track] ? 'Pick a layout' : 'e.g. Grand Prix'}
                onChange={(config) => onChange({ ...race, config })}
              />
            </Field>
            <Field label="Date" hint="Optional">
              <input
                className="text"
                type="date"
                aria-label="Date"
                value={race.date ?? ''}
                onChange={(e) => onChange({ ...race, date: e.target.value || undefined })}
              />
            </Field>
            <Field label="Time of day" hint="When the race starts">
              <Segmented
                label="Time of day"
                value={race.timeOfDay}
                options={timesOfDay.map((t) => ({
                  value: t,
                  title: t,
                  label: (
                    <span className="tod">
                      <TimeOfDayIcon value={t} />
                      {t[0].toUpperCase() + t.slice(1)}
                    </span>
                  ),
                }))}
                onChange={(timeOfDay) => onChange({ ...race, timeOfDay })}
              />
            </Field>
            <fieldset className="subgroup">
              <legend>Weather forecast</legend>
              <Field label="Temperature">
                <Slider
                  label="Temperature"
                  value={weather.tempC}
                  min={-10}
                  max={45}
                  suffix="ºC"
                  onChange={(tempC) => setWeather({ tempC })}
                />
              </Field>
              <Field label="Rain chance">
                <Slider
                  label="Rain chance"
                  value={weather.rainPct}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(rainPct) => setWeather({ rainPct })}
                />
              </Field>
            </fieldset>
          </>
        )}

        <div className="item-actions">
          <IconButton label="Move up" onClick={() => onMove(-1)} disabled={index === 0}>
            ↑
          </IconButton>
          <IconButton label="Move down" onClick={() => onMove(1)} disabled={index === count - 1}>
            ↓
          </IconButton>
          <button type="button" onClick={onDuplicate}>
            Duplicate
          </button>
          <button type="button" className="danger" onClick={onRemove}>
            Remove
          </button>
        </div>
      </div>
    </details>
  )
}

export function WeeksEditor({ kind, races, onChange }: Props) {
  const numbers = weekLabels(races)
  const total = numbers.filter((n) => n !== null).length
  const word = kind === 'special' ? 'race' : kind === 'league' ? 'round' : 'week'
  function move(i: number, delta: number) {
    const next = [...races]
    const [item] = next.splice(i, 1)
    next.splice(i + delta, 0, item)
    onChange(next)
  }

  return (
    <div className="stack">
      {races.map((race, i) => (
        <WeekCard
          key={race.id}
          race={race}
          label={race.skip ? 'Blank' : raceLabel(kind, numbers[i] ?? 0, total, race.date)}
          index={i}
          count={races.length}
          onChange={(next) => onChange(races.map((r, j) => (j === i ? next : r)))}
          onMove={(d) => move(i, d)}
          onDuplicate={() => {
            const next = [...races]
            next.splice(i + 1, 0, { ...race, id: newId('race') })
            onChange(next)
          }}
          onRemove={() => onChange(races.filter((_, j) => j !== i))}
        />
      ))}
      <div className="inline">
        <button
          type="button"
          className="add"
          onClick={() =>
            onChange([...races, { id: newId('race'), track: '', timeOfDay: 'day', weather: { ...defaultWeather } }])
          }
        >
          + Add {word}
        </button>
        <button
          type="button"
          className="add"
          onClick={() => onChange([...races, { id: newId('race'), track: '', skip: true }])}
        >
          + Add blank {word}
        </button>
      </div>
    </div>
  )
}
