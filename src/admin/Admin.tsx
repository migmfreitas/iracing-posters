import { useEffect, useState } from 'react'
import bundledCatalog from '../data/catalog.json'
import bundledSeries from '../data/series.json'
import type { Catalog } from '../data/catalog'
import { newId, normalizeEvent } from '../normalize'
import type { RaceEvent } from '../types'
import { SeriesEditor } from '../editor/SeriesEditor'
import { ClassesEditor } from '../editor/ClassesEditor'
import { WeeksEditor } from '../editor/WeeksEditor'
import { IconButton } from '../editor/controls'
import { checkAccess, FILES, loadToken, readJson, REPO, saveToken, writeJson } from './github'
import '../App.css'
import '../editor/editor.css'
import './admin.css'

// One editable row of a name → list map (car class → cars, track → layouts).
interface Entry {
  key: string
  name: string
  text: string
}

const toEntries = (map: Record<string, string[]>): Entry[] =>
  Object.entries(map).map(([name, list]) => ({ key: newId('entry'), name, text: list.join('\n') }))

const toMap = (entries: Entry[]) =>
  Object.fromEntries(
    entries
      .filter((e) => e.name.trim())
      .map((e) => [
        e.name.trim(),
        e.text
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      ]),
  )

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'series'

type Tab = 'classes' | 'tracks' | 'series'

function EntryList({
  entries,
  onChange,
  nameLabel,
  listLabel,
  addLabel,
}: {
  entries: Entry[]
  onChange: (entries: Entry[]) => void
  nameLabel: string
  listLabel: string
  addLabel: string
}) {
  const [filter, setFilter] = useState('')
  const shown = entries.filter((e) => e.name.toLowerCase().includes(filter.toLowerCase()))
  const update = (key: string, patch: Partial<Entry>) =>
    onChange(entries.map((e) => (e.key === key ? { ...e, ...patch } : e)))

  return (
    <div className="stack">
      <div className="inline">
        <input
          className="text"
          type="search"
          placeholder={`Find a ${nameLabel.toLowerCase()}`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className="add"
          onClick={() => {
            setFilter('')
            onChange([{ key: newId('entry'), name: '', text: '' }, ...entries])
          }}
        >
          {addLabel}
        </button>
      </div>
      <div className="entry-grid">
        {shown.map((e) => (
          <div className="item-card entry" key={e.key}>
            <div className="item-head">
              <input
                className="text"
                aria-label={nameLabel}
                placeholder={nameLabel}
                value={e.name}
                onChange={(ev) => update(e.key, { name: ev.target.value })}
              />
              <IconButton
                label={`Remove ${e.name || nameLabel.toLowerCase()}`}
                onClick={() =>
                  window.confirm(`Remove "${e.name || 'this entry'}"?`) && onChange(entries.filter((x) => x.key !== e.key))
                }
              >
                ✕
              </IconButton>
            </div>
            <label className="entry-list">
              <span className="field-hint">{listLabel}, one per line</span>
              <textarea
                className="text"
                rows={Math.max(3, e.text.split('\n').length + 1)}
                value={e.text}
                onChange={(ev) => update(e.key, { text: ev.target.value })}
              />
            </label>
          </div>
        ))}
        {shown.length === 0 && <p className="muted">Nothing matches.</p>}
      </div>
    </div>
  )
}

function SeriesTemplates({ series, onChange }: { series: RaceEvent[]; onChange: (s: RaceEvent[]) => void }) {
  const [active, setActive] = useState(0)
  const index = Math.min(active, series.length - 1)
  const current = series[index]
  const update = (patch: Partial<RaceEvent>) => onChange(series.map((s, i) => (i === index ? { ...s, ...patch } : s)))

  function add(copy: boolean) {
    const base: RaceEvent = copy
      ? { ...structuredClone(current), name: `${current.name} (copy)` }
      : { id: '', kind: 'season', name: 'New series', classes: [], races: [] }
    const ids = new Set(series.map((s) => s.id))
    let id = slug(base.name)
    for (let n = 2; ids.has(id); n++) id = `${slug(base.name)}-${n}`
    onChange([...series, { ...base, id }])
    setActive(series.length)
  }

  function move(delta: number) {
    const next = [...series]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    onChange(next)
    setActive(index + delta)
  }

  return (
    <div className="templates-admin">
      <nav className="template-list" aria-label="Series templates">
        {series.map((s, i) => (
          <button key={s.id} className={i === index ? 'on' : ''} onClick={() => setActive(i)}>
            {s.name || 'Untitled'}
          </button>
        ))}
        <button className="add" onClick={() => add(false)}>
          + New series
        </button>
      </nav>

      {current ? (
        <div className="stack template-edit">
          <div className="series-actions">
            <button onClick={() => add(true)}>Duplicate</button>
            <button onClick={() => move(-1)} disabled={index === 0} aria-label="Move up" title="Move up">
              ↑
            </button>
            <button
              onClick={() => move(1)}
              disabled={index === series.length - 1}
              aria-label="Move down"
              title="Move down"
            >
              ↓
            </button>
            <button
              className="danger"
              onClick={() =>
                window.confirm(`Delete the "${current.name}" template?`) &&
                onChange(series.filter((_, i) => i !== index))
              }
            >
              Delete
            </button>
          </div>
          <details className="section" open>
            <summary>Series</summary>
            <SeriesEditor key={current.id} event={current} onChange={update} />
          </details>
          <details className="section" open>
            <summary>
              Cars and classes <span className="count">{current.classes.length}</span>
            </summary>
            <ClassesEditor key={current.id} classes={current.classes} onChange={(classes) => update({ classes })} />
          </details>
          <details className="section" open>
            <summary>
              Weeks <span className="count">{current.races.filter((r) => !r.skip).length}</span>
            </summary>
            <WeeksEditor key={current.id} kind="season" races={current.races} onChange={(races) => update({ races })} />
          </details>
        </div>
      ) : (
        <p className="muted">No templates yet. Add one to offer it on the start screen.</p>
      )}
    </div>
  )
}

export default function Admin() {
  const [token, setToken] = useState(loadToken)
  const [tokenInput, setTokenInput] = useState('')
  const [tab, setTab] = useState<Tab>('classes')
  const [classes, setClasses] = useState(() => toEntries(bundledCatalog.carClasses))
  const [tracks, setTracks] = useState(() => toEntries(bundledCatalog.tracks))
  const [presets, setPresets] = useState<string[]>(bundledCatalog.raceTimePresets)
  const [series, setSeries] = useState<RaceEvent[]>(() => (bundledSeries as unknown[]).map(normalizeEvent))
  const [shas, setShas] = useState<{ catalog?: string; series?: string }>({})
  const [dirty, setDirty] = useState({ catalog: false, series: false })
  const [status, setStatus] = useState<{ kind: 'info' | 'error' | 'ok'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  // Load the latest files from GitHub, so edits start from what's in the repo
  // rather than what the site was last built with.
  async function load(t: string) {
    setBusy(true)
    setStatus({ kind: 'info', text: 'Loading the latest data from GitHub…' })
    try {
      const [cat, ser] = await Promise.all([readJson<Catalog>(t, FILES.catalog), readJson<unknown[]>(t, FILES.series)])
      setClasses(toEntries(cat.data.carClasses))
      setTracks(toEntries(cat.data.tracks))
      setPresets(cat.data.raceTimePresets)
      setSeries(ser.data.map(normalizeEvent))
      setShas({ catalog: cat.sha, series: ser.sha })
      setDirty({ catalog: false, series: false })
      setStatus(null)
    } catch (e) {
      setStatus({ kind: 'error', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const [initialToken] = useState(token)
  useEffect(() => {
    if (initialToken) void load(initialToken)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken])

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.catalog || dirty.series) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  async function connect() {
    const t = tokenInput.trim()
    if (!t) return
    setBusy(true)
    setStatus({ kind: 'info', text: 'Checking the token…' })
    try {
      await checkAccess(t)
      saveToken(t)
      setTokenInput('')
      setToken(t)
      await load(t)
    } catch (e) {
      setStatus({ kind: 'error', text: (e as Error).message })
      setBusy(false)
    }
  }

  function disconnect() {
    saveToken('')
    setToken('')
    setShas({})
    setStatus({ kind: 'info', text: 'Disconnected. The token was removed from this browser.' })
  }

  async function save() {
    if (!token || !shas.catalog || !shas.series) return
    setBusy(true)
    setStatus({ kind: 'info', text: 'Saving to GitHub…' })
    try {
      const next = { ...shas }
      if (dirty.catalog) {
        const data: Catalog = { carClasses: toMap(classes), tracks: toMap(tracks), raceTimePresets: presets }
        next.catalog = await writeJson(token, FILES.catalog, data, shas.catalog, 'Update car classes and tracks from the admin page')
      }
      if (dirty.series) {
        next.series = await writeJson(token, FILES.series, series, shas.series, 'Update series templates from the admin page')
      }
      setShas(next)
      setDirty({ catalog: false, series: false })
      setStatus({ kind: 'ok', text: 'Saved. The live site picks up the changes once it has rebuilt, usually within a few minutes.' })
    } catch (e) {
      setStatus({ kind: 'error', text: `Not saved. ${(e as Error).message}` })
    } finally {
      setBusy(false)
    }
  }

  const markCatalog = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setDirty((d) => ({ ...d, catalog: true }))
  }
  const changed = dirty.catalog || dirty.series

  return (
    <div className="admin">
      <header className="admin-head">
        <div>
          <h1>Admin</h1>
          <p className="muted">
            Car classes, tracks and series templates that everyone sees in the editor and on the start screen.
          </p>
        </div>
        <a className="button" href="#/">
          ← Back to the site
        </a>
      </header>

      {token ? (
        <div className="admin-bar">
          <span className="muted">
            Connected to {REPO.owner}/{REPO.repo}
          </span>
          <button className="link" onClick={disconnect}>
            Disconnect
          </button>
          <span className="spacer" />
          {changed && <span className="unsaved">Unsaved changes</span>}
          <button className="primary" onClick={save} disabled={!changed || busy || !shas.series}>
            Save to GitHub
          </button>
        </div>
      ) : (
        <section className="connect">
          <h2>Connect to GitHub to save</h2>
          <p className="muted">
            Saving commits the changes to the repo, and the site redeploys on its own. Create a{' '}
            <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
              fine-grained token
            </a>{' '}
            with access to only the {REPO.repo} repository and <strong>Contents: Read and write</strong>, then paste it
            here. It is kept in this browser only.
          </p>
          <div className="inline">
            <input
              className="text"
              type="password"
              placeholder="github_pat_…"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && connect()}
            />
            <button className="primary" onClick={connect} disabled={busy || !tokenInput.trim()}>
              Connect
            </button>
          </div>
          <p className="muted small">You can look around and edit below first; you'll need to connect before saving.</p>
        </section>
      )}

      {status && <p className={`status ${status.kind}`}>{status.text}</p>}

      <div className="series-tabs admin-tabs" role="tablist">
        {(
          [
            ['classes', `Car classes (${classes.length})`],
            ['tracks', `Tracks (${tracks.length})`],
            ['series', `Series templates (${series.length})`],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'classes' && (
        <EntryList
          entries={classes}
          onChange={markCatalog(setClasses)}
          nameLabel="Class name"
          listLabel="Cars"
          addLabel="+ Add car class"
        />
      )}
      {tab === 'tracks' && (
        <EntryList
          entries={tracks}
          onChange={markCatalog(setTracks)}
          nameLabel="Track name"
          listLabel="Layouts"
          addLabel="+ Add track"
        />
      )}
      {tab === 'series' && (
        <SeriesTemplates
          series={series}
          onChange={(s) => {
            setSeries(s)
            setDirty((d) => ({ ...d, series: true }))
          }}
        />
      )}
    </div>
  )
}
