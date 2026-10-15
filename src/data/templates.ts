// Ready-made iRacing series offered on the start screen. They live in
// series.json, which the admin page (#/admin) edits.
import data from './series.json'
import { normalizeEvent } from '../normalize'

export const seriesTemplates = (data as unknown[]).map(normalizeEvent)
