import { forwardRef } from 'react'
import type { FieldToggles, License, RaceEvent } from '../types'
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

interface Props {
  event: RaceEvent
  fields: FieldToggles
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="label">{label}</span>
      <span className="value">{children}</span>
    </div>
  )
}

export const SeasonPoster = forwardRef<HTMLDivElement, Props>(function SeasonPoster(
  { event, fields },
  ref,
) {
  const rows: [string, React.ReactNode][] = []
  if (fields.license && event.license) {
    rows.push([
      'Class',
      <span className={`license license-${event.license.toLowerCase()}`}>
        {licenseLabel[event.license]}
      </span>,
    ])
  }
  if (fields.setup && event.setup) rows.push(['Setups', event.setup])
  if (fields.raceTimes && event.raceTimes) rows.push(['Races', event.raceTimes])
  if (fields.length && event.length) rows.push(['Length', event.length])

  return (
    <div className="poster" ref={ref}>
      <section className="card">
        <div className="info">
          <h1 className="title">{event.name}</h1>
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
            {event.classes.map((cls) => (
              <div className="row" key={cls.name}>
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

      <section className="weeks">
        {event.races.map((race, i) => (
          <div className="week" key={race.id}>
            <span className="week-label">Week {race.round ?? i + 1}</span>
            <span className="track">
              <span>{race.track}</span>
              <span className="config">{race.config || '-'}</span>
            </span>
            {fields.weather && race.weather && (
              <span className="chips">
                <span className="chip chip-tod">
                  <TimeOfDayIcon value={race.weather.timeOfDay} />
                  {race.weather.tempC}º
                </span>
                <span className={`chip chip-rain${race.weather.rainPct > 0 ? ' wet' : ''}`}>
                  <RainIcon />
                  {race.weather.rainPct}%
                </span>
              </span>
            )}
          </div>
        ))}
      </section>
    </div>
  )
})
