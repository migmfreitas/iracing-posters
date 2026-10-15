// Lists that feed the editor's suggestions. They live in catalog.json, which the
// admin page (#/admin) edits; anything typed that isn't listed still works.
import data from './catalog.json'

export interface Catalog {
  carClasses: Record<string, string[]>
  tracks: Record<string, string[]>
  raceTimePresets: string[]
}

export const catalog: Catalog = data
export const { carClasses, tracks, raceTimePresets } = catalog
