import { useId, type ReactNode } from 'react'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <span className="field-label">
        {label}
        {hint && <span className="field-hint">{hint}</span>}
      </span>
      {children}
    </div>
  )
}

interface SegmentedProps<T extends string> {
  value: T | undefined
  options: { value: T; label: ReactNode; title?: string; className?: string }[]
  onChange: (value: T) => void
  label: string
}

export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          className={`${o.className ?? ''}${value === o.value ? ' on' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  suffix: string
  label: string
  onChange: (value: number) => void
}

export function Slider({ value, min, max, step = 1, suffix, label, onChange }: SliderProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className="slider">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <label className="slider-number">
        <input
          type="number"
          aria-label={`${label} value`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => e.target.value !== '' && onChange(clamp(Number(e.target.value)))}
        />
        <span>{suffix}</span>
      </label>
    </div>
  )
}

interface ComboProps {
  value: string
  options: string[]
  placeholder?: string
  label: string
  onChange: (value: string) => void
}

// A text box with suggestions: pick from the list or type anything.
export function Combo({ value, options, placeholder, label, onChange }: ComboProps) {
  const listId = useId()
  return (
    <>
      <input
        className="text"
        aria-label={label}
        list={listId}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  )
}

export function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button type="button" className="icon-btn" title={label} aria-label={label} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
