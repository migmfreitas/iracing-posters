import type { PageFormat } from '../types'

// Page sizes in CSS pixels; PNG export doubles them (A4 ≈ 300 dpi, 16:9 = 4K).
export const pageFormats: Record<PageFormat, { label: string; size?: [number, number] }> = {
  fit: { label: 'Fit to content' },
  wide: { label: '16:9 desktop', size: [1920, 1080] },
  'a4-landscape': { label: 'A4 landscape', size: [1754, 1240] },
  'a4-portrait': { label: 'A4 portrait', size: [1240, 1754] },
  square: { label: 'Square (1:1)', size: [1080, 1080] },
  story: { label: 'Story (9:16)', size: [1080, 1920] },
}
