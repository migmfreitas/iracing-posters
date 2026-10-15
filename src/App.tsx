import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { get, set } from 'idb-keyval'
import { SeasonPoster } from './posters/SeasonPoster'
import { sampleSeason } from './data/sampleSeason'
import { defaultToggles, type FieldToggles, type RaceEvent } from './types'
import './App.css'

const STORAGE_KEY = 'current-event'

const fieldLabels: Record<keyof FieldToggles, string> = {
  license: 'License class',
  setup: 'Setup',
  raceTimes: 'Race times',
  length: 'Race length',
  cars: 'Cars and classes',
  weather: 'Weather',
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
  const [draft, setDraft] = useState(() => JSON.stringify(sampleSeason, null, 2))
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    get<RaceEvent>(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          setEvent(saved)
          setDraft(JSON.stringify(saved, null, 2))
        }
      })
      .catch(() => {})
  }, [])

  function applyDraft(text: string) {
    setDraft(text)
    try {
      const parsed = JSON.parse(text) as RaceEvent
      if (!parsed.name || !Array.isArray(parsed.races) || !Array.isArray(parsed.classes)) {
        throw new Error('Needs "name", "classes" and "races".')
      }
      setEvent(parsed)
      setError(null)
      set(STORAGE_KEY, parsed).catch(() => {})
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

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
    applyDraft(await file.text())
  }

  return (
    <div className="app">
      <aside className="panel">
        <header>
          <h1>iRacing Posters</h1>
          <p>Edit the season, choose what to show, download the poster.</p>
        </header>

        <fieldset>
          <legend>Show on poster</legend>
          {(Object.keys(fieldLabels) as (keyof FieldToggles)[]).map((key) => (
            <label key={key} className="toggle">
              <input
                type="checkbox"
                checked={fields[key]}
                onChange={(e) => setFields({ ...fields, [key]: e.target.checked })}
              />
              {fieldLabels[key]}
            </label>
          ))}
        </fieldset>

        <div className="actions">
          <button className="primary" onClick={exportPng} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Download PNG'}
          </button>
          <button onClick={exportJson}>Export JSON</button>
          <label className="button">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
            />
          </label>
          <button onClick={() => applyDraft(JSON.stringify(sampleSeason, null, 2))}>
            Reset to sample
          </button>
        </div>

        <label className="editor">
          <span>Season data (JSON)</span>
          <textarea value={draft} spellCheck={false} onChange={(e) => applyDraft(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
      </aside>

      <main className="stage">
        <SeasonPoster ref={posterRef} event={event} fields={fields} />
      </main>
    </div>
  )
}
