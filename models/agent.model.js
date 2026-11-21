import { being } from './being.model.js'
import { optional } from './shared.js'

export const agents = being.extend({ class: optional, rank: optional })
