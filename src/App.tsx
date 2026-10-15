import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { get, set } from 'idb-keyval'
import { SeasonPoster } from './posters/SeasonPoster'
import { sampleSeason } from './data/sampleSeason'
import { normalizeEvent } from './normalize'
import { SeriesEditor } from './editor/SeriesEditor'
import { ClassesEditor } from './editor/ClassesEditor'
import { WeeksEditor } from './editor/WeeksEditor'
import { defaultToggles, type FieldToggles, type RaceEvent } from './types'
import './App.css'
import './editor/editor.css'

const STORAGE_KEY = 'current-event'

const fieldLabels: Record<keyof FieldToggles, string> = {
  license: 'License class',
  setup: 'Setup',
  raceTimes: 'Race times',
  length: 'Race length',
  cars: 'Cars and classes',
  weather: 'Weather',
}

const blankSeason: RaceEvent = {
  id: 'new-season',
  kind: 'season',
  name: 'New season',
  classes: [],
  races: [],
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'poster'
}

function download(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

export default function App() {
  const [event, setEvent] = useState<RaceEvent>(sampleSeason)
  const [fields, setFields] = useState<FieldToggles>(defaultToggles)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  useEffect(() => {
    get(STORAGE_KEY)
      .then((saved) => {
        if (saved) setEvent(normalizeEvent(saved))
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true
      })
  }, [])

  useEffect(() => {
    if (loaded.current) set(STORAGE_KEY, event).catch(() => {})
  }, [event])

  const update = (patch: Partial<RaceEvent>) => setEvent((e) => ({ ...e, ...patch }))

  async function exportPng() {
    if (!posterRef.current) return
    setExporting(true)
    try {
      await document.fonts.ready
      const url = await toPng(posterRef.current, { pixelRatio: 2 })
      download(url, `${slug(event.name)}.png`)
    } finally {
      setExporting(false)
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(event, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    download(url, `${slug(event.name)}.json`)
    URL.revokeObjectURL(url)
  }

  async function importJson(file: File) {
    try {
      setEvent(normalizeEvent(JSON.parse(await file.text())))
      setError(null)
    } catch (e) {
      setError(`Couldn't read that file: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  function startOver(next: RaceEvent) {
    if (window.confirm('Replace the current season? Export it first if you want to keep it.')) {
      setEvent(structuredClone(next))
    }
  }

  return (
    <div className="app">
      <aside className="panel">
        <header>
          <h1>iRacing Posters</h1>
          <p>Fill in the season, choose what to show, download the poster.</p>
        </header>

        <details className="section" open>
          <summary>Series</summary>
          <SeriesEditor event={event} onChange={update} />
        </details>

        <details className="section" open>
          <summary>
            Cars and classes <span className="count">{event.classes.length}</span>
          </summary>
          <ClassesEditor classes={event.classes} onChange={(classes) => update({ classes })} />
        </details>

        <details className="section" open>
          <summary>
            Weeks <span className="count">{event.races.length}</span>
          </summary>
          <WeeksEditor races={event.races} onChange={(races) => update({ races })} />
        </details>

        <details className="section">
          <summary>Show on poster</summary>
          <div className="toggles">
            {(Object.keys(fieldLabels) as (keyof FieldToggles)[]).map((key) => (
              <label key={key} className="check">
                <input
                  type="checkbox"
                  checked={fields[key]}
                  onChange={(e) => setFields({ ...fields, [key]: e.target.checked })}
                />
                {fieldLabels[key]}
              </label>
            ))}
          </div>
        </details>

        <details className="section">
          <summary>Save and share</summary>
          <div className="actions">
            <button onClick={exportJson}>Export season file</button>
            <label className="button">
              Import season file
              <input
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => {
                  if (e.target.files?.[0]) importJson(e.target.files[0])
                  e.target.value = ''
                }}
              />
            </label>
            <button onClick={() => startOver(blankSeason)}>Start a blank season</button>
            <button onClick={() => startOver(sampleSeason)}>Load the sample</button>
          </div>
          {error && <p className="error">{error}</p>}
        </details>
      </aside>

      <main className="stage">
        <div className="stage-bar">
          <button className="primary" onClick={exportPng} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Download PNG'}
          </button>
        </div>
        <SeasonPoster ref={posterRef} event={event} fields={fields} />
      </main>
    </div>
  )
}
