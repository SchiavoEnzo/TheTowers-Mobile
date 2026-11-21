import { z } from 'zod'

export const obj = (fields) => z.object(fields).strict()
export const str = z.string().trim().min(1).max(8192)
export const num = z.number().finite()
export const optional = str.optional()
export const numbers = (names) =>
  Object.fromEntries(names.split(' ').map((name) => [name, num]))
export const id = z.string().regex(/^[a-f0-9]{24}$/)
export const ids = z
  .array(id)
  .max(500)
  .refine((a) => new Set(a).size === a.length, 'IDs repetidos')
export const extras = z.record(z.string(), z.unknown()).default({})
export const timestamp = z
  .string()
  .datetime({ offset: true })
  .transform((s) => new Date(s))
export const interval = (x) => !x.end || x.end >= x.start
export const description = { name: str, desc: str }
export const identity = {
  name: str,
  age: str,
  formation: str,
  origin: optional,
  personality: optional,
  history: optional,
}

export const skillNames =
  'acrobacy art currents training atlethics science crime diplomacy decieving fortitude furtivity initiative intimidating intuition fight medicine ocultism misticism perception piloting profession acuracy reflex religion surviving tatics technology force'

