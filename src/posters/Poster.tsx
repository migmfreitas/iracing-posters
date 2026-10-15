import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import type { FieldToggles, License, PageFormat, RaceEvent } from '../types'
import { pageFormats } from './formats'
import { formatLength, weekLabels } from '../normalize'
import { RainIcon, TimeOfDayIcon } from './icons'
import './poster.css'

const licenseLabel: Record<License, string> = {
  R: 'Rookie',
  D: 'Class D',
  C: 'Class C',
  B: 'Class B',
  A: 'Class A',
  Pro: 'Pro',
}

const COLUMN_WIDTH = 660
const GAP = 16
const MARGIN = 48

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="label">{label}</span>
      <span className="value">{children}</span>
    </div>
  )
}

function SeriesCard({ event, fields, style }: { event: RaceEvent; fields: FieldToggles; style: React.CSSProperties }) {
  const rows: [string, React.ReactNode][] = []
  if (fields.license && event.license) {
    rows.push([
      'Class',
      <span key="license" className={`license license-${event.license.toLowerCase()}`}>
        {licenseLabel[event.license]}
      </span>,
    ])
  }
  if (fields.setup && event.setup) rows.push(['Setups', event.setup])
  if (fields.raceTimes && event.raceTimes)
    rows.push([
      'Races',
      <span key="times" className="multiline">
        {event.raceTimes}
      </span>,
    ])
  if (fields.length && event.length) rows.push(['Length', formatLength(event.length)])

  return (
    <section className="card" style={style}>
      <div className="info">
        <h2 className="title">{event.name || 'Untitled series'}</h2>
        <div className="rows">
          {rows.map(([label, value]) => (
            <InfoRow key={label} label={label}>
              {value}
            </InfoRow>
          ))}
        </div>
      </div>
      {fields.cars && event.classes.length > 0 && (
        <div className="cars">
          {event.classes.map((cls, i) => (
            <div className="row" key={i}>
              <span className="label">{cls.name}</span>
              <span className="value">
                {cls.cars.map((car) => (
                  <span className="car" key={car}>
                    {car}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function WeekList({ event, fields, style }: { event: RaceEvent; fields: FieldToggles; style: React.CSSProperties }) {
  const labels = weekLabels(event.races)
  const showChips = fields.timeOfDay || fields.weather
  return (
    <section className="weeks" style={style}>
      {event.races.map((race, i) =>
        race.skip ? (
          <div className="week blank" key={race.id}>
            <span className="week-label">-</span>
            <span className="track">
              <span>-</span>
              <span className="config">-</span>
            </span>
          </div>
        ) : (
          <div className="week" key={race.id}>
            <span className="week-label">Week {labels[i]}</span>
            <span className="track">
              <span>{race.track || '-'}</span>
              <span className="config">{race.config || '-'}</span>
            </span>
            {showChips && (race.timeOfDay || race.weather) && (
              <span className="chips">
                {((fields.timeOfDay && race.timeOfDay) || (fields.weather && race.weather)) && (
                  <span className="chip chip-tod">
                    {fields.timeOfDay && race.timeOfDay && <TimeOfDayIcon value={race.timeOfDay} />}
                    {fields.weather && race.weather && `${race.weather.tempC}º`}
                  </span>
                )}
                {fields.weather && race.weather && (
                  <span className={`chip chip-rain${race.weather.rainPct > 0 ? ' wet' : ''}`}>
                    <RainIcon />
                    {race.weather.rainPct}%
                  </span>
                )}
              </span>
            )}
          </div>
        ),
      )}
    </section>
  )
}

// All series side by side, wrapping into `columns` per row.
function Board({ series, fields, columns }: { series: RaceEvent[]; fields: FieldToggles; columns: number }) {
  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${columns}, ${COLUMN_WIDTH}px)` }}>
      {series.map((event, i) => {
        const col = (i % columns) + 1
        const block = Math.floor(i / columns)
        return [
          <SeriesCard
            key={`${event.id}-card`}
            event={event}
            fields={fields}
            style={{ gridColumn: col, gridRow: block * 2 + 1 }}
          />,
          <WeekList
            key={`${event.id}-weeks`}
            event={event}
            fields={fields}
            style={{ gridColumn: col, gridRow: block * 2 + 2 }}
          />,
        ]
      })}
    </div>
  )
}

interface PosterProps {
  series: RaceEvent[]
  fields: FieldToggles
  format: PageFormat
}

// The exportable page: a fixed-size canvas (or content-sized for "fit") with the
// board scaled and wrapped to make the best use of the space.
export const Poster = forwardRef<HTMLDivElement, PosterProps>(function Poster({ series, fields, format }, ref) {
  const boardRef = useRef<HTMLDivElement>(null)
  const size = pageFormats[format].size
  const n = Math.max(series.length, 1)
  const [layout, setLayout] = useState({ columns: n, scale: 1, w: 0, h: 0 })

  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    const measure = () => {
      const w = board.offsetWidth
      const h = board.offsetHeight
      if (!size) {
        setLayout((l) =>
          l.columns === n && l.scale === 1 && l.w === w && l.h === h ? l : { columns: n, scale: 1, w, h },
        )
        return
      }
      // Height of one block row, from the current layout.
      const rowsNow = Math.ceil(n / layout.columns)
      const blockH = (h - (rowsNow - 1) * GAP) / rowsNow
      const scaleFor = (k: number) => {
        const rows = Math.ceil(n / k)
        const bw = k * COLUMN_WIDTH + (k - 1) * GAP
        const bh = rows * blockH + (rows - 1) * GAP
        return Math.min((size[0] - 2 * MARGIN) / bw, (size[1] - 2 * MARGIN) / bh)
      }
      let best = { columns: n, scale: 0 }
      for (let k = 1; k <= n; k++) {
        const scale = scaleFor(k)
        if (scale > best.scale + 0.001) best = { columns: k, scale }
      }
      // Stick with the current wrap unless another is clearly better (avoids flip-flopping).
      const current = Math.min(layout.columns, n)
      if (scaleFor(current) >= best.scale * 0.97) best = { columns: current, scale: scaleFor(current) }
      // The real board width for this wrap, so the page never clips it.
      if (best.columns === current && w > 0 && h > 0) {
        best.scale = Math.min(best.scale, (size[0] - 2 * MARGIN) / w, (size[1] - 2 * MARGIN) / h)
      }
      setLayout((l) =>
        l.columns === best.columns && Math.abs(l.scale - best.scale) < 0.001 && l.w === w && l.h === h
          ? l
          : { columns: best.columns, scale: best.scale, w, h },
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(board)
    return () => ro.disconnect()
  }, [size, n, layout.columns])

  const board = <Board series={series} fields={fields} columns={size ? layout.columns : n} />

  if (!size) {
    return (
      <div className="poster page fit" ref={ref}>
        <div ref={boardRef}>{board}</div>
      </div>
    )
  }

  return (
    <div className="poster page" ref={ref} style={{ width: size[0], height: size[1] }}>
      <div style={{ width: layout.w * layout.scale, height: layout.h * layout.scale }}>
        <div
          ref={boardRef}
          style={{ transform: `scale(${layout.scale})`, transformOrigin: 'top left', width: 'max-content' }}
        >
          {board}
        </div>
      </div>
    </div>
  )
})
