import { useState } from 'react'
import type { CarClass } from '../types'
import { carClasses } from '../data/catalog'
import { IconButton } from './controls'

interface Props {
  classes: CarClass[]
  onChange: (classes: CarClass[]) => void
}

function ClassCard({
  cls,
  onChange,
  onRemove,
}: {
  cls: CarClass
  onChange: (cls: CarClass) => void
  onRemove: () => void
}) {
  const [custom, setCustom] = useState('')
  const known = carClasses[cls.name] ?? []
  const extra = cls.cars.filter((c) => !known.includes(c))

  function toggle(car: string, on: boolean) {
    const cars = on ? [...cls.cars, car] : cls.cars.filter((c) => c !== car)
    // Keep the catalogue order so the poster list looks tidy.
    const order = [...known, ...extra]
    cars.sort((a, b) => {
      const ia = order.indexOf(a)
      const ib = order.indexOf(b)
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
    })
    onChange({ ...cls, cars })
  }

  function addCustom() {
    const car = custom.trim()
    if (car && !cls.cars.includes(car)) onChange({ ...cls, cars: [...cls.cars, car] })
    setCustom('')
  }

  return (
    <div className="item-card">
      <div className="item-head">
        <input
          className="text"
          aria-label="Class name"
          value={cls.name}
          onChange={(e) => onChange({ ...cls, name: e.target.value })}
        />
        <IconButton label="Remove class" onClick={onRemove}>
          ✕
        </IconButton>
      </div>
      {known.length > 0 && (
        <div className="checks">
          {known.length > 1 && (
            <div className="checks-actions">
              <button type="button" className="link" onClick={() => onChange({ ...cls, cars: [...known, ...extra] })}>
                Select all
              </button>
              <button type="button" className="link" onClick={() => onChange({ ...cls, cars: extra })}>
                Clear
              </button>
            </div>
          )}
          {known.map((car) => (
            <label key={car} className="check">
              <input type="checkbox" checked={cls.cars.includes(car)} onChange={(e) => toggle(car, e.target.checked)} />
              {car}
            </label>
          ))}
        </div>
      )}
      {extra.map((car) => (
        <label key={car} className="check">
          <input type="checkbox" checked onChange={() => toggle(car, false)} />
          {car}
        </label>
      ))}
      <div className="inline">
        <input
          className="text"
          aria-label="Add a car"
          value={custom}
          placeholder="Add another car"
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
        />
        <button type="button" onClick={addCustom} disabled={!custom.trim()}>
          Add
        </button>
      </div>
    </div>
  )
}

export function ClassesEditor({ classes, onChange }: Props) {
  const [pick, setPick] = useState('')
  const unused = Object.keys(carClasses).filter((name) => !classes.some((c) => c.name === name))

  function addClass(name: string) {
    if (!name) return
    onChange([...classes, { name, cars: name in carClasses ? [...carClasses[name]] : [] }])
    setPick('')
  }

  return (
    <div className="stack">
      {classes.map((cls, i) => (
        <ClassCard
          key={i}
          cls={cls}
          onChange={(next) => onChange(classes.map((c, j) => (j === i ? next : c)))}
          onRemove={() => onChange(classes.filter((_, j) => j !== i))}
        />
      ))}
      <div className="inline">
        <select className="text" aria-label="Add a car class" value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">Add a car class…</option>
          {unused.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value="Custom class">Custom class</option>
        </select>
        <button type="button" onClick={() => addClass(pick)} disabled={!pick}>
          Add
        </button>
      </div>
    </div>
  )
}
