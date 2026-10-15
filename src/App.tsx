import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { get, set } from 'idb-keyval'
import { Poster } from './posters/Poster'
import { pageFormats } from './posters/formats'
import { sampleProject } from './data/sampleSeason'
import { newId, normalizeProject } from './normalize'
import { SeriesEditor } from './editor/SeriesEditor'
import { ClassesEditor } from './editor/ClassesEditor'
import { WeeksEditor } from './editor/WeeksEditor'
import { defaultToggles, type FieldToggles, type PageFormat, type Project, type RaceEvent } from './types'
import './App.css'
import './editor/editor.css'

const STORAGE_KEY = 'current-event'

const fieldLabels: Record<keyof FieldToggles, string> = {
  license: 'License class',
  setup: 'Setup',
  raceTimes: 'Race times',
  length: 'Race length',
  cars: 'Cars and classes',
  timeOfDay: 'Time of day',
  weather: 'Weather (temperature and rain)',
}

function blankSeries(weeks: number): RaceEvent {
  return {
    id: newId('event'),
    kind: 'season',
    name: 'New series',
    classes: [],
    races: Array.from({ length: weeks }, () => ({ id: newId('race'), track: '', skip: true })),
  }
}

const blankProject: Project = {
  version: 2,
  series: [blankSeries(0)],
  fields: { ...defaultToggles },
  format: 'fit',
}

function slug(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'poster'
  )
}

function download(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

function cloneSeries(event: RaceEvent): RaceEvent {
  return {
    ...structuredClone(event),
    id: newId('event'),
    name: `${event.name} (copy)`,
    races: event.races.map((r) => ({ ...structuredClone(r), id: newId('race') })),
  }
}

// Scales the full-size poster down to fit the preview area.
function Preview({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState({ scale: 1, w: 0, h: 0 })

  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const measure = () => {
      const w = i.offsetWidth
      const h = i.offsetHeight
      const scale = Math.min(1, o.clientWidth / w)
      setFit((f) => (f.scale === scale && f.w === w && f.h === h ? f : { scale, w, h }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(o)
    ro.observe(i)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="preview" ref={outer}>
      <div style={{ width: fit.w * fit.scale, height: fit.h * fit.scale }}>
        <div ref={inner} className="preview-inner" style={{ transform: `scale(${fit.scale})` }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [project, setProject] = useState<Project>(sampleProject)
  const [active, setActive] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const posterRef = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)

  useEffect(() => {
    get(STORAGE_KEY)
      .then((saved) => {
        if (saved) setProject(normalizeProject(saved))
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true
      })
  }, [])

  useEffect(() => {
    if (loaded.current) set(STORAGE_KEY, project).catch(() => {})
  }, [project])

  const index = Math.min(active, project.series.length - 1)
  const event = project.series[index]
  const patch = (p: Partial<Project>) => setProject((pr) => ({ ...pr, ...p }))
  const updateSeries = (p: Partial<RaceEvent>) =>
    setProject((pr) => ({ ...pr, series: pr.series.map((s, i) => (i === index ? { ...s, ...p } : s)) }))

  function addSeries(copy: boolean) {
    const weeks = Math.max(...project.series.map((s) => s.races.length), 0)
    const next = copy ? cloneSeries(event) : blankSeries(weeks)
    patch({ series: [...project.series, next] })
    setActive(project.series.length)
  }

  function removeSeries() {
    if (project.series.length < 2) return
    if (!window.confirm(`Remove "${event.name}" from the poster?`)) return
    patch({ series: project.series.filter((_, i) => i !== index) })
    setActive(Math.max(0, index - 1))
  }

  function moveSeries(delta: number) {
    const series = [...project.series]
    const [item] = series.splice(index, 1)
    series.splice(index + delta, 0, item)
    patch({ series })
    setActive(index + delta)
  }

  async function exportPng() {
    if (!posterRef.current) return
    setExporting(true)
    try {
      await document.fonts.ready
      const url = await toPng(posterRef.current, { pixelRatio: 2 })
      const name = project.series.length === 1 ? project.series[0].name : 'season-calendar'
      download(url, `${slug(name)}-${project.format}.png`)
    } finally {
      setExporting(false)
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    download(url, `${slug(project.series[0]?.name ?? 'poster')}.json`)
    URL.revokeObjectURL(url)
  }

  async function importJson(file: File) {
    try {
      setProject(normalizeProject(JSON.parse(await file.text())))
      setActive(0)
      setError(null)
    } catch (e) {
      setError(`Couldn't read that file: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  function startOver(next: Project) {
    if (window.confirm('Replace the whole poster? Export it first if you want to keep it.')) {
      setProject(structuredClone(next))
      setActive(0)
    }
  }

  return (
    <div className="app">
      <aside className="panel">
        <header>
          <h1>iRacing Posters</h1>
          <p>Add one or more series, fill them in, pick a format and download.</p>
        </header>

        <div className="series-tabs" role="tablist" aria-label="Series on this poster">
          {project.series.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === index}
              className={i === index ? 'on' : ''}
              onClick={() => setActive(i)}
            >
              {s.name || 'Untitled'}
            </button>
          ))}
        </div>
        <div className="series-actions">
          <button onClick={() => addSeries(false)}>+ New series</button>
          <button onClick={() => addSeries(true)}>Duplicate</button>
          <button onClick={() => moveSeries(-1)} disabled={index === 0} title="Move left" aria-label="Move left">
            ←
          </button>
          <button
            onClick={() => moveSeries(1)}
            disabled={index === project.series.length - 1}
            title="Move right"
            aria-label="Move right"
          >
            →
          </button>
          <button className="danger" onClick={removeSeries} disabled={project.series.length < 2}>
            Remove
          </button>
        </div>

        <details className="section" open>
          <summary>Series</summary>
          <SeriesEditor key={event.id} event={event} onChange={updateSeries} />
        </details>

        <details className="section" open>
          <summary>
            Cars and classes <span className="count">{event.classes.length}</span>
          </summary>
          <ClassesEditor key={event.id} classes={event.classes} onChange={(classes) => updateSeries({ classes })} />
        </details>

        <details className="section" open>
          <summary>
            Weeks <span className="count">{event.races.filter((r) => !r.skip).length}</span>
          </summary>
          <WeeksEditor key={event.id} races={event.races} onChange={(races) => updateSeries({ races })} />
        </details>

        <details className="section">
          <summary>Show on poster</summary>
          <div className="toggles">
            {(Object.keys(fieldLabels) as (keyof FieldToggles)[]).map((key) => (
              <label key={key} className="check">
                <input
                  type="checkbox"
                  checked={project.fields[key]}
                  onChange={(e) => patch({ fields: { ...project.fields, [key]: e.target.checked } })}
                />
                {fieldLabels[key]}
              </label>
            ))}
          </div>
        </details>

        <details className="section">
          <summary>Save and share</summary>
          <div className="actions">
            <button onClick={exportJson}>Export poster file</button>
            <label className="button">
              Import poster file
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
            <button onClick={() => startOver(blankProject)}>Start from scratch</button>
            <button onClick={() => startOver(sampleProject)}>Load the sample</button>
          </div>
          {error && <p className="error">{error}</p>}
        </details>
      </aside>

      <main className="stage">
        <div className="stage-bar">
          <label className="format">
            <span>Format</span>
            <select
              className="text"
              value={project.format}
              onChange={(e) => patch({ format: e.target.value as PageFormat })}
            >
              {(Object.keys(pageFormats) as PageFormat[]).map((f) => (
                <option key={f} value={f}>
                  {pageFormats[f].label}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" onClick={exportPng} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Download PNG'}
          </button>
        </div>
        <Preview>
          <Poster ref={posterRef} series={project.series} fields={project.fields} format={project.format} />
        </Preview>
      </main>
    </div>
  )
}
