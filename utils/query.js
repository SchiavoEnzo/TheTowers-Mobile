import { z } from 'zod'
import { id } from '../models/shared.js'

export function listQuery(kind, input) {
  const query = {}
  if (input.q) {
    const text = z.string().max(100).parse(input.q)
    const escaped = Array.from(text)
      .map((char) => ('.*+?^${}()|[]\\'.includes(char) ? '\\' + char : char))
      .join('')
    query['data.caractheristics.name'] = { $regex: escaped, $options: 'i' }
  }
  if (input.before) query._id = { $lt: id.parse(input.before) }
  return query
}
