import { useState } from 'react'
import { seriesTemplates } from './data/sampleSeason'
import { tracks } from './data/catalog'
import { newId } from './normalize'
import { Combo, Field, Slider } from './editor/controls'
import { defaultToggles, type Project, type RaceEvent } from './types'
import './StartScreen.css'

type Choice = 'series' | 'league' | 'event'

const trackNames = Object.keys(tracks).sort((a, b) => a.localeCompare(b))

const choices: { id: Choice; title: string; text: string }[] = [
  {
    id: 'series',
    title: 'Calendar for an iRacing series',
    text: 'Start from a ready-made series and adjust it, or put several series side by side.',
  },
  {
    id: 'league',
    title: 'Custom calendar for a league',
    text: 'Your own league or community championship, with as many weeks as you need.',
  },
  {
    id: 'event',
    title: 'Poster for an event',
    text: 'A single race: a special event or one round of a league.',
  },
]

function fromTemplate(t: RaceEvent): RaceEvent {
  const copy = structuredClone(t)
  return { ...copy, id: newId('event'), races: copy.races.map((r) => ({ ...r, id: newId('race') })) }
}

function project(series: RaceEvent[], format: Project['format']): Project {
  return { version: 2, series, fields: { ...defaultToggles }, format }
}

interface Props {
  hasSaved: boolean
  onContinue: () => void
  onStart: (project: Project) => void
}

export function StartScreen({ hasSaved, onContinue, onStart }: Props) {
  const [choice, setChoice] = useState<Choice | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [leagueName, setLeagueName] = useState('')
  const [weeks, setWeeks] = useState(8)
  const [eventName, setEventName] = useState('')
  const [eventTrack, setEventTrack] = useState('')
  const [eventDate, setEventDate] = useState('')

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  function startSeries(blank: boolean) {
    const chosen = seriesTemplates.filter((t) => picked.includes(t.id))
    const series = blank || chosen.length === 0
      ? [{ id: newId('event'), kind: 'season' as const, name: 'New series', classes: [], races: [] }]
      : chosen.map(fromTemplate)
    onStart(project(series, series.length > 1 ? 'wide' : 'fit'))
  }

  function startLeague() {
    onStart(
      project(
        [
          {
            id: newId('event'),
            kind: 'league',
            name: leagueName.trim() || 'My league',
            classes: [],
            races: Array.from({ length: weeks }, () => ({
              id: newId('race'),
              track: '',
              timeOfDay: 'day' as const,
              weather: { tempC: 20, rainPct: 0 },
            })),
          },
        ],
        'fit',
      ),
    )
  }

  function startEvent() {
    onStart(
      project(
        [
          {
            id: newId('event'),
            kind: 'special',
            name: eventName.trim() || 'Special event',
            classes: [],
            races: [
              {
                id: newId('race'),
                track: eventTrack,
                config: tracks[eventTrack]?.length === 1 ? tracks[eventTrack][0] : undefined,
                date: eventDate || undefined,
                timeOfDay: 'day',
                weather: { tempC: 20, rainPct: 0 },
              },
            ],
          },
        ],
        'fit',
      ),
    )
  }

  return (
    <div className="start">
      <header className="start-head">
        <h1>iRacing Posters</h1>
        <p>What would you like to make?</p>
      </header>

      <div className="start-choices" role="radiogroup" aria-label="Poster type">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={choice === c.id}
            className={`start-choice${choice === c.id ? ' on' : ''}`}
            onClick={() => setChoice(c.id)}
          >
            <strong>{c.title}</strong>
            <span>{c.text}</span>
          </button>
        ))}
      </div>

      {choice === 'series' && (
        <section className="start-step">
          <h2>Pick one or more series</h2>
          <p className="muted">Each one becomes a column on the poster. You can change everything afterwards.</p>
          <div className="templates">
            {seriesTemplates.map((t) => (
              <label key={t.id} className={`template${picked.includes(t.id) ? ' on' : ''}`}>
                <input type="checkbox" checked={picked.includes(t.id)} onChange={() => toggle(t.id)} />
                <span className="template-name">{t.name}</span>
                <span className="template-meta">
                  {[t.classes.map((c) => c.name).join(', '), `${t.races.filter((r) => !r.skip).length} races`]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </label>
            ))}
          </div>
          <div className="start-actions">
            <button className="primary" disabled={picked.length === 0} onClick={() => startSeries(false)}>
              {picked.length > 1 ? `Continue with ${picked.length} series` : 'Continue'}
            </button>
            <button onClick={() => startSeries(true)}>Start with a blank series</button>
          </div>
        </section>
      )}

      {choice === 'league' && (
        <section className="start-step stack">
          <h2>Your league</h2>
          <Field label="League name">
            <input
              className="text"
              value={leagueName}
              placeholder="e.g. Sunday Night GT3"
              onChange={(e) => setLeagueName(e.target.value)}
            />
          </Field>
          <Field label="Number of rounds" hint="You can add or remove rounds later">
            <Slider label="Number of rounds" value={weeks} min={1} max={20} suffix="" onChange={setWeeks} />
          </Field>
          <div className="start-actions">
            <button className="primary" onClick={startLeague}>
              Continue
            </button>
          </div>
        </section>
      )}

      {choice === 'event' && (
        <section className="start-step stack">
          <h2>Your event</h2>
          <Field label="Event name">
            <input
              className="text"
              value={eventName}
              placeholder="e.g. Daytona 24"
              onChange={(e) => setEventName(e.target.value)}
            />
          </Field>
          <Field label="Track">
            <Combo
              label="Track"
              value={eventTrack}
              options={trackNames}
              placeholder="Start typing a track"
              onChange={setEventTrack}
            />
          </Field>
          <Field label="Date" hint="Optional">
            <input className="text" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </Field>
          <div className="start-actions">
            <button className="primary" onClick={startEvent}>
              Continue
            </button>
          </div>
        </section>
      )}

      {hasSaved && (
        <p className="start-continue">
          <button className="link" onClick={onContinue}>
            Continue your last poster →
          </button>
        </p>
      )}
    </div>
  )
}
